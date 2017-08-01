// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

package mysql

import (
	"fmt"
	"strings"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store/mysql"
	"github.com/documize/community/model/page"
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// Add inserts the given page into the page table, adds that page to the queue of pages to index and audits that the page has been added.
func (s Scope) Add(ctx domain.RequestContext, model page.NewPage) (err error) {
	model.Page.OrgID = ctx.OrgID
	model.Page.UserID = ctx.UserID
	model.Page.Created = time.Now().UTC()
	model.Page.Revised = time.Now().UTC()

	model.Meta.OrgID = ctx.OrgID
	model.Meta.UserID = ctx.UserID
	model.Meta.DocumentID = model.Page.DocumentID
	model.Meta.Created = time.Now().UTC()
	model.Meta.Revised = time.Now().UTC()

	if model.Page.Sequence == 0 {
		// Get maximum page sequence number and increment (used to be AND pagetype='section')
		row := s.Runtime.Db.QueryRow("SELECT max(sequence) FROM page WHERE orgid=? AND documentid=?", ctx.OrgID, model.Page.DocumentID)
		var maxSeq float64
		err = row.Scan(&maxSeq)

		if err != nil {
			maxSeq = 2048
		}

		model.Page.Sequence = maxSeq * 2
	}

	stmt, err := ctx.Transaction.Preparex("INSERT INTO page (refid, orgid, documentid, userid, contenttype, pagetype, level, title, body, revisions, sequence, blockid, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare page insert")
		return
	}

	_, err = stmt.Exec(model.Page.RefID, model.Page.OrgID, model.Page.DocumentID, model.Page.UserID, model.Page.ContentType, model.Page.PageType, model.Page.Level, model.Page.Title, model.Page.Body, model.Page.Revisions, model.Page.Sequence, model.Page.BlockID, model.Page.Created, model.Page.Revised)
	if err != nil {
		err = errors.Wrap(err, "execute page insert")
		return
	}

	stmt2, err := ctx.Transaction.Preparex("INSERT INTO pagemeta (pageid, orgid, userid, documentid, rawbody, config, externalsource, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt2)

	if err != nil {
		err = errors.Wrap(err, "prepare page meta insert")
		return
	}

	_, err = stmt2.Exec(model.Meta.PageID, model.Meta.OrgID, model.Meta.UserID, model.Meta.DocumentID, model.Meta.RawBody, model.Meta.Config, model.Meta.ExternalSource, model.Meta.Created, model.Meta.Revised)

	if err != nil {
		err = errors.Wrap(err, "execute page meta insert")
		return
	}

	return
}

// Get returns the pageID page record from the page table.
func (s Scope) Get(ctx domain.RequestContext, pageID string) (p page.Page, err error) {
	stmt, err := s.Runtime.Db.Preparex("SELECT a.id, a.refid, a.orgid, a.documentid, a.userid, a.contenttype, a.pagetype, a.level, a.sequence, a.title, a.body, a.revisions, a.blockid, a.created, a.revised FROM page a WHERE a.orgid=? AND a.refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare get page")
		return
	}

	err = stmt.Get(&p, ctx.OrgID, pageID)
	if err != nil {
		err = errors.Wrap(err, "execute get page")
		return
	}

	return
}

// GetPages returns a slice containing all the page records for a given documentID, in presentation sequence.
func (s Scope) GetPages(ctx domain.RequestContext, documentID string) (p []page.Page, err error) {
	err = s.Runtime.Db.Select(&p, "SELECT a.id, a.refid, a.orgid, a.documentid, a.userid, a.contenttype, a.pagetype, a.level, a.sequence, a.title, a.body, a.revisions, a.blockid, a.created, a.revised FROM page a WHERE a.orgid=? AND a.documentid=? ORDER BY a.sequence", ctx.OrgID, documentID)

	if err != nil {
		err = errors.Wrap(err, "execute get pages")
		return
	}

	return
}

// GetPagesWhereIn returns a slice, in presentation sequence, containing those page records for a given documentID
// where their refid is in the comma-separated list passed as inPages.
func (s Scope) GetPagesWhereIn(ctx domain.RequestContext, documentID, inPages string) (p []page.Page, err error) {
	args := []interface{}{ctx.OrgID, documentID}
	tempValues := strings.Split(inPages, ",")

	sql := "SELECT a.id, a.refid, a.orgid, a.documentid, a.userid, a.contenttype, a.pagetype, a.level, a.sequence, a.title, a.body, a.blockid, a.revisions, a.created, a.revised FROM page a WHERE a.orgid=? AND a.documentid=? AND a.refid IN (?" + strings.Repeat(",?", len(tempValues)-1) + ") ORDER BY sequence"

	inValues := make([]interface{}, len(tempValues))

	for i, v := range tempValues {
		inValues[i] = interface{}(v)
	}

	args = append(args, inValues...)

	stmt, err := s.Runtime.Db.Preparex(sql)
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, err.Error())
		return
	}

	rows, err := stmt.Queryx(args...)
	defer streamutil.Close(rows)

	if err != nil {
		err = errors.Wrap(err, err.Error())
		return
	}

	for rows.Next() {
		page := page.Page{}

		err = rows.StructScan(&page)
		if err != nil {
			err = errors.Wrap(err, err.Error())
			return
		}

		p = append(p, page)
	}

	if err != nil {
		err = errors.Wrap(err, err.Error())
		return
	}

	return
}

// GetPagesWithoutContent returns a slice containing all the page records for a given documentID, in presentation sequence,
// but without the body field (which holds the HTML content).
func (s Scope) GetPagesWithoutContent(ctx domain.RequestContext, documentID string) (pages []page.Page, err error) {
	err = s.Runtime.Db.Select(&pages, "SELECT id, refid, orgid, documentid, userid, contenttype, pagetype, sequence, level, title, revisions, blockid, created, revised FROM page WHERE orgid=? AND documentid=? ORDER BY sequence", ctx.OrgID, documentID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("Unable to execute select pages for org %s and document %s", ctx.OrgID, documentID))
		return
	}

	return
}

// Update saves changes to the database and handles recording of revisions.
// Not all updates result in a revision being recorded hence the parameter.
func (s Scope) Update(ctx domain.RequestContext, page page.Page, refID, userID string, skipRevision bool) (err error) {
	page.Revised = time.Now().UTC()

	// Store revision history
	if !skipRevision {
		var stmt *sqlx.Stmt
		stmt, err = ctx.Transaction.Preparex("INSERT INTO revision (refid, orgid, documentid, ownerid, pageid, userid, contenttype, pagetype, title, body, rawbody, config, created, revised) SELECT ? as refid, a.orgid, a.documentid, a.userid as ownerid, a.refid as pageid, ? as userid, a.contenttype, a.pagetype, a.title, a.body, b.rawbody, b.config, ? as created, ? as revised FROM page a, pagemeta b WHERE a.refid=? AND a.refid=b.pageid")

		defer streamutil.Close(stmt)

		if err != nil {
			err = errors.Wrap(err, "prepare page revision insert")
			return err
		}

		_, err = stmt.Exec(refID, userID, time.Now().UTC(), time.Now().UTC(), page.RefID)
		if err != nil {
			err = errors.Wrap(err, "execute page revision insert")
			return err
		}
	}

	// Update page
	var stmt2 *sqlx.NamedStmt
	stmt2, err = ctx.Transaction.PrepareNamed("UPDATE page SET documentid=:documentid, level=:level, title=:title, body=:body, revisions=:revisions, sequence=:sequence, revised=:revised WHERE orgid=:orgid AND refid=:refid")
	defer streamutil.Close(stmt2)

	if err != nil {
		err = errors.Wrap(err, "prepare page insert")
		return
	}

	_, err = stmt2.Exec(&page)
	if err != nil {
		err = errors.Wrap(err, "execute page insert")
		return
	}

	// Update revisions counter
	if !skipRevision {
		stmt3, err := ctx.Transaction.Preparex("UPDATE page SET revisions=revisions+1 WHERE orgid=? AND refid=?")
		defer streamutil.Close(stmt3)

		if err != nil {
			err = errors.Wrap(err, "prepare page revision counter")
			return err
		}

		_, err = stmt3.Exec(ctx.OrgID, page.RefID)
		if err != nil {
			err = errors.Wrap(err, "execute page revision counter")
			return err
		}
	}

	return
}

// UpdateMeta persists meta information associated with a document page.
func (s Scope) UpdateMeta(ctx domain.RequestContext, meta page.Meta, updateUserID bool) (err error) {
	meta.Revised = time.Now().UTC()

	if updateUserID {
		meta.UserID = ctx.UserID
	}

	var stmt *sqlx.NamedStmt
	stmt, err = ctx.Transaction.PrepareNamed("UPDATE pagemeta SET userid=:userid, documentid=:documentid, rawbody=:rawbody, config=:config, externalsource=:externalsource, revised=:revised WHERE orgid=:orgid AND pageid=:pageid")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare page meta update")
		return
	}

	_, err = stmt.Exec(&meta)
	if err != nil {
		err = errors.Wrap(err, "execute page meta update")
		return
	}

	return
}

// UpdateSequence changes the presentation sequence of the pageID page in the document.
// It then propagates that change into the search table and audits that it has occurred.
func (s Scope) UpdateSequence(ctx domain.RequestContext, documentID, pageID string, sequence float64) (err error) {
	stmt, err := ctx.Transaction.Preparex("UPDATE page SET sequence=? WHERE orgid=? AND refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare page sequence update")
		return
	}

	_, err = stmt.Exec(sequence, ctx.OrgID, pageID)
	if err != nil {
		err = errors.Wrap(err, "execute page sequence update")
		return
	}

	return
}

// UpdateLevel changes the heading level of the pageID page in the document.
// It then propagates that change into the search table and audits that it has occurred.
func (s Scope) UpdateLevel(ctx domain.RequestContext, documentID, pageID string, level int) (err error) {
	stmt, err := ctx.Transaction.Preparex("UPDATE page SET level=? WHERE orgid=? AND refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare page level update")
		return
	}

	_, err = stmt.Exec(level, ctx.OrgID, pageID)
	if err != nil {
		err = errors.Wrap(err, "execute page level update")
		return
	}

	return
}

// Delete deletes the pageID page in the document.
// It then propagates that change into the search table, adds a delete the page revisions history, and audits that the page has been removed.
func (s Scope) Delete(ctx domain.RequestContext, documentID, pageID string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	rows, err = b.DeleteConstrained(ctx.Transaction, "page", ctx.OrgID, pageID)

	if err == nil {
		_, _ = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM pagemeta WHERE orgid='%s' AND pageid='%s'", ctx.OrgID, pageID))
	}

	return
}

// GetPageMeta returns the meta information associated with the page.
func (s Scope) GetPageMeta(ctx domain.RequestContext, pageID string) (meta page.Meta, err error) {
	stmt, err := s.Runtime.Db.Preparex("SELECT id, pageid, orgid, userid, documentid, rawbody, coalesce(config,JSON_UNQUOTE('{}')) as config, externalsource, created, revised FROM pagemeta WHERE orgid=? AND pageid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare get page meta")
		return
	}

	err = stmt.Get(&meta, ctx.OrgID, pageID)
	if err != nil {
		err = errors.Wrap(err, "execute get page meta")
		return
	}

	return
}

// GetDocumentPageMeta returns the meta information associated with a document.
func (s Scope) GetDocumentPageMeta(ctx domain.RequestContext, documentID string, externalSourceOnly bool) (meta []page.Meta, err error) {
	filter := ""
	if externalSourceOnly {
		filter = " AND externalsource=1"
	}

	err = s.Runtime.Db.Select(&meta, "SELECT id, pageid, orgid, userid, documentid, rawbody, coalesce(config,JSON_UNQUOTE('{}')) as config, externalsource, created, revised FROM pagemeta WHERE orgid=? AND documentid=?"+filter, ctx.OrgID, documentID)

	if err != nil {
		err = errors.Wrap(err, "get document page meta")
		return
	}

	return
}

/********************
* Page Revisions
********************/

// GetPageRevision returns the revisionID page revision record.
func (s Scope) GetPageRevision(ctx domain.RequestContext, revisionID string) (revision page.Revision, err error) {
	stmt, err := s.Runtime.Db.Preparex("SELECT id, refid, orgid, documentid, ownerid, pageid, userid, contenttype, pagetype, title, body, coalesce(rawbody, '') as rawbody, coalesce(config,JSON_UNQUOTE('{}')) as config, created, revised FROM revision WHERE orgid=? and refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare get page revisions")
		return
	}

	err = stmt.Get(&revision, ctx.OrgID, revisionID)
	if err != nil {
		err = errors.Wrap(err, "execute get page revisions")
		return
	}

	return
}

// GetPageRevisions returns a slice of page revision records for a given pageID, in the order they were created.
// Then audits that the get-page-revisions action has occurred.
func (s Scope) GetPageRevisions(ctx domain.RequestContext, pageID string) (revisions []page.Revision, err error) {
	err = s.Runtime.Db.Select(&revisions, "SELECT a.id, a.refid, a.orgid, a.documentid, a.ownerid, a.pageid, a.userid, a.contenttype, a.pagetype, a.title, /*a.body, a.rawbody, a.config,*/ a.created, a.revised, coalesce(b.email,'') as email, coalesce(b.firstname,'') as firstname, coalesce(b.lastname,'') as lastname, coalesce(b.initials,'') as initials FROM revision a LEFT JOIN user b ON a.userid=b.refid WHERE a.orgid=? AND a.pageid=? AND a.pagetype='section' ORDER BY a.id DESC", ctx.OrgID, pageID)

	if err != nil {
		err = errors.Wrap(err, "get page revisions")
		return
	}

	return
}

// GetDocumentRevisions returns a slice of page revision records for a given document, in the order they were created.
// Then audits that the get-page-revisions action has occurred.
func (s Scope) GetDocumentRevisions(ctx domain.RequestContext, documentID string) (revisions []page.Revision, err error) {
	err = s.Runtime.Db.Select(&revisions, "SELECT a.id, a.refid, a.orgid, a.documentid, a.ownerid, a.pageid, a.userid, a.contenttype, a.pagetype, a.title, /*a.body, a.rawbody, a.config,*/ a.created, a.revised, coalesce(b.email,'') as email, coalesce(b.firstname,'') as firstname, coalesce(b.lastname,'') as lastname, coalesce(b.initials,'') as initials, coalesce(p.revisions, 0) as revisions FROM revision a LEFT JOIN user b ON a.userid=b.refid LEFT JOIN page p ON a.pageid=p.refid WHERE a.orgid=? AND a.documentid=? AND a.pagetype='section' ORDER BY a.id DESC", ctx.OrgID, documentID)

	if err != nil {
		err = errors.Wrap(err, "get document revisions")
		return
	}

	if len(revisions) == 0 {
		revisions = []page.Revision{}
	}

	return
}

// DeletePageRevisions deletes all of the page revision records for a given pageID.
func (s Scope) DeletePageRevisions(ctx domain.RequestContext, pageID string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	rows, err =b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM revision WHERE orgid='%s' AND pageid='%s'", ctx.OrgID, pageID))

	return
}

// GetNextPageSequence returns the next sequence numbner to use for a page in given document.
func (s Scope) GetNextPageSequence(ctx domain.RequestContext, documentID string) (maxSeq float64, err error) {
	row := s.Runtime.Db.QueryRow("SELECT max(sequence) FROM page WHERE orgid=? AND documentid=?", ctx.OrgID, documentID)

	err = row.Scan(&maxSeq)
	if err != nil {
		maxSeq = 2048
	}

	maxSeq = maxSeq * 2

	return
}