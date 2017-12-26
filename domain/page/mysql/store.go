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
	"database/sql"
	"fmt"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store/mysql"
	"github.com/documize/community/model/page"
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

	_, err = ctx.Transaction.Exec("INSERT INTO page (refid, orgid, documentid, userid, contenttype, pagetype, level, title, body, revisions, sequence, blockid, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		model.Page.RefID, model.Page.OrgID, model.Page.DocumentID, model.Page.UserID, model.Page.ContentType, model.Page.PageType, model.Page.Level, model.Page.Title, model.Page.Body, model.Page.Revisions, model.Page.Sequence, model.Page.BlockID, model.Page.Created, model.Page.Revised)

	_, err = ctx.Transaction.Exec("INSERT INTO pagemeta (pageid, orgid, userid, documentid, rawbody, config, externalsource, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
		model.Meta.PageID, model.Meta.OrgID, model.Meta.UserID, model.Meta.DocumentID, model.Meta.RawBody, model.Meta.Config, model.Meta.ExternalSource, model.Meta.Created, model.Meta.Revised)

	if err != nil {
		err = errors.Wrap(err, "execute page meta insert")
	}

	return
}

// Get returns the pageID page record from the page table.
func (s Scope) Get(ctx domain.RequestContext, pageID string) (p page.Page, err error) {
	err = s.Runtime.Db.Get(&p, "SELECT a.id, a.refid, a.orgid, a.documentid, a.userid, a.contenttype, a.pagetype, a.level, a.sequence, a.title, a.body, a.revisions, a.blockid, a.created, a.revised FROM page a WHERE a.orgid=? AND a.refid=?",
		ctx.OrgID, pageID)

	if err != nil {
		err = errors.Wrap(err, "execute get page")
	}

	return
}

// GetPages returns a slice containing all the page records for a given documentID, in presentation sequence.
func (s Scope) GetPages(ctx domain.RequestContext, documentID string) (p []page.Page, err error) {
	err = s.Runtime.Db.Select(&p, "SELECT a.id, a.refid, a.orgid, a.documentid, a.userid, a.contenttype, a.pagetype, a.level, a.sequence, a.title, a.body, a.revisions, a.blockid, a.created, a.revised FROM page a WHERE a.orgid=? AND a.documentid=? ORDER BY a.sequence", ctx.OrgID, documentID)

	if err != nil {
		err = errors.Wrap(err, "execute get pages")
	}

	return
}

// GetPagesWithoutContent returns a slice containing all the page records for a given documentID, in presentation sequence,
// but without the body field (which holds the HTML content).
func (s Scope) GetPagesWithoutContent(ctx domain.RequestContext, documentID string) (pages []page.Page, err error) {
	err = s.Runtime.Db.Select(&pages, "SELECT id, refid, orgid, documentid, userid, contenttype, pagetype, sequence, level, title, revisions, blockid, created, revised FROM page WHERE orgid=? AND documentid=? ORDER BY sequence", ctx.OrgID, documentID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("Unable to execute select pages for org %s and document %s", ctx.OrgID, documentID))
	}

	return
}

// Update saves changes to the database and handles recording of revisions.
// Not all updates result in a revision being recorded hence the parameter.
func (s Scope) Update(ctx domain.RequestContext, page page.Page, refID, userID string, skipRevision bool) (err error) {
	page.Revised = time.Now().UTC()

	// Store revision history
	if !skipRevision {
		_, err = ctx.Transaction.Exec("INSERT INTO revision (refid, orgid, documentid, ownerid, pageid, userid, contenttype, pagetype, title, body, rawbody, config, created, revised) SELECT ? as refid, a.orgid, a.documentid, a.userid as ownerid, a.refid as pageid, ? as userid, a.contenttype, a.pagetype, a.title, a.body, b.rawbody, b.config, ? as created, ? as revised FROM page a, pagemeta b WHERE a.refid=? AND a.refid=b.pageid",
			refID, userID, time.Now().UTC(), time.Now().UTC(), page.RefID)

		if err != nil {
			err = errors.Wrap(err, "execute page revision insert")
			return err
		}
	}

	// Update page
	_, err = ctx.Transaction.NamedExec("UPDATE page SET documentid=:documentid, level=:level, title=:title, body=:body, revisions=:revisions, sequence=:sequence, revised=:revised WHERE orgid=:orgid AND refid=:refid",
		&page)

	if err != nil {
		err = errors.Wrap(err, "execute page insert")
		return
	}

	// Update revisions counter
	if !skipRevision {
		_, err = ctx.Transaction.Exec("UPDATE page SET revisions=revisions+1 WHERE orgid=? AND refid=?", ctx.OrgID, page.RefID)

		if err != nil {
			err = errors.Wrap(err, "execute page revision counter")
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

	_, err = ctx.Transaction.NamedExec("UPDATE pagemeta SET userid=:userid, documentid=:documentid, rawbody=:rawbody, config=:config, externalsource=:externalsource, revised=:revised WHERE orgid=:orgid AND pageid=:pageid",
		&meta)

	if err != nil {
		err = errors.Wrap(err, "execute page meta update")
	}

	return
}

// UpdateSequence changes the presentation sequence of the pageID page in the document.
// It then propagates that change into the search table and audits that it has occurred.
func (s Scope) UpdateSequence(ctx domain.RequestContext, documentID, pageID string, sequence float64) (err error) {
	_, err = ctx.Transaction.Exec("UPDATE page SET sequence=? WHERE orgid=? AND refid=?", sequence, ctx.OrgID, pageID)

	if err != nil {
		err = errors.Wrap(err, "execute page sequence update")
	}

	return
}

// UpdateLevel changes the heading level of the pageID page in the document.
// It then propagates that change into the search table and audits that it has occurred.
func (s Scope) UpdateLevel(ctx domain.RequestContext, documentID, pageID string, level int) (err error) {
	_, err = ctx.Transaction.Exec("UPDATE page SET level=? WHERE orgid=? AND refid=?", level, ctx.OrgID, pageID)

	if err != nil {
		err = errors.Wrap(err, "execute page level update")
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
	err = s.Runtime.Db.Get(&meta, "SELECT id, pageid, orgid, userid, documentid, rawbody, coalesce(config,JSON_UNQUOTE('{}')) as config, externalsource, created, revised FROM pagemeta WHERE orgid=? AND pageid=?",
		ctx.OrgID, pageID)

	if err != nil && err != sql.ErrNoRows {
		err = errors.Wrap(err, "execute get page meta")
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
	}

	return
}

/********************
* Page Revisions
********************/

// GetPageRevision returns the revisionID page revision record.
func (s Scope) GetPageRevision(ctx domain.RequestContext, revisionID string) (revision page.Revision, err error) {
	err = s.Runtime.Db.Get(&revision, "SELECT id, refid, orgid, documentid, ownerid, pageid, userid, contenttype, pagetype, title, body, coalesce(rawbody, '') as rawbody, coalesce(config,JSON_UNQUOTE('{}')) as config, created, revised FROM revision WHERE orgid=? and refid=?",
		ctx.OrgID, revisionID)

	if err != nil {
		err = errors.Wrap(err, "execute get page revisions")
	}

	return
}

// GetPageRevisions returns a slice of page revision records for a given pageID, in the order they were created.
// Then audits that the get-page-revisions action has occurred.
func (s Scope) GetPageRevisions(ctx domain.RequestContext, pageID string) (revisions []page.Revision, err error) {
	err = s.Runtime.Db.Select(&revisions, "SELECT a.id, a.refid, a.orgid, a.documentid, a.ownerid, a.pageid, a.userid, a.contenttype, a.pagetype, a.title, /*a.body, a.rawbody, a.config,*/ a.created, a.revised, coalesce(b.email,'') as email, coalesce(b.firstname,'') as firstname, coalesce(b.lastname,'') as lastname, coalesce(b.initials,'') as initials FROM revision a LEFT JOIN user b ON a.userid=b.refid WHERE a.orgid=? AND a.pageid=? AND a.pagetype='section' ORDER BY a.id DESC", ctx.OrgID, pageID)

	if err != nil {
		err = errors.Wrap(err, "get page revisions")
	}

	return
}

// GetDocumentRevisions returns a slice of page revision records for a given document, in the order they were created.
// Then audits that the get-page-revisions action has occurred.
func (s Scope) GetDocumentRevisions(ctx domain.RequestContext, documentID string) (revisions []page.Revision, err error) {
	err = s.Runtime.Db.Select(&revisions, "SELECT a.id, a.refid, a.orgid, a.documentid, a.ownerid, a.pageid, a.userid, a.contenttype, a.pagetype, a.title, /*a.body, a.rawbody, a.config,*/ a.created, a.revised, coalesce(b.email,'') as email, coalesce(b.firstname,'') as firstname, coalesce(b.lastname,'') as lastname, coalesce(b.initials,'') as initials, coalesce(p.revisions, 0) as revisions FROM revision a LEFT JOIN user b ON a.userid=b.refid LEFT JOIN page p ON a.pageid=p.refid WHERE a.orgid=? AND a.documentid=? AND a.pagetype='section' ORDER BY a.id DESC", ctx.OrgID, documentID)

	if len(revisions) == 0 {
		revisions = []page.Revision{}
	}

	if err != nil && err != sql.ErrNoRows {
		err = errors.Wrap(err, "get document revisions")
	}

	return
}

// DeletePageRevisions deletes all of the page revision records for a given pageID.
func (s Scope) DeletePageRevisions(ctx domain.RequestContext, pageID string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	rows, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM revision WHERE orgid='%s' AND pageid='%s'", ctx.OrgID, pageID))

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
