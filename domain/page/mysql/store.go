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

//**************************************************
// Page Revisions
//**************************************************

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
		row := s.Runtime.Db.QueryRow("SELECT max(c_sequence) FROM dmz_section WHERE c_orgid=? AND c_docid=?", ctx.OrgID, model.Page.DocumentID)
		var maxSeq float64
		err = row.Scan(&maxSeq)
		if err != nil {
			maxSeq = 2048
		}

		model.Page.Sequence = maxSeq * 2
	}

	_, err = ctx.Transaction.Exec("INSERT INTO dmz_section (c_refid, c_orgid, c_docid, c_userid, c_contenttype, c_type, c_level, c_name, c_body, c_revisions, c_sequence, c_templateid, c_status, c_relativeid, c_created, c_revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		model.Page.RefID, model.Page.OrgID, model.Page.DocumentID, model.Page.UserID, model.Page.ContentType, model.Page.PageType, model.Page.Level, model.Page.Title, model.Page.Body, model.Page.Revisions, model.Page.Sequence, model.Page.BlockID, model.Page.Status, model.Page.RelativeID, model.Page.Created, model.Page.Revised)

	_, err = ctx.Transaction.Exec("INSERT INTO dmz_section_meta (c_sectionid, c_orgid, c_userid, c_docid, c_rawbody, c_config, c_external, c_created, c_revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
		model.Meta.PageID, model.Meta.OrgID, model.Meta.UserID, model.Meta.DocumentID, model.Meta.RawBody, model.Meta.Config, model.Meta.ExternalSource, model.Meta.Created, model.Meta.Revised)

	if err != nil {
		err = errors.Wrap(err, "execute page meta insert")
	}

	return
}

// Get returns the pageID page record from the page table.
func (s Scope) Get(ctx domain.RequestContext, pageID string) (p page.Page, err error) {
	err = s.Runtime.Db.Get(&p, `
        SELECT c_id, c_refid, c_orgid, c_docid, c_userid, c_contenttype, c_type, c_level, c_sequence, c_name, c_body, c_revisions, c_templateid, c_status, c_relativeid, c_created, c_revised
        FROM dmz_section
        WHERE c_orgid=? AND c_refid=?`,
		ctx.OrgID, pageID)

	if err != nil {
		err = errors.Wrap(err, "execute get page")
	}

	return
}

// GetPages returns a slice containing all published page records for a given documentID, in presentation sequence.
func (s Scope) GetPages(ctx domain.RequestContext, documentID string) (p []page.Page, err error) {
	err = s.Runtime.Db.Select(&p, `
        SELECT c_id, c_refid, c_orgid, c_docid, c_userid, c_contenttype, c_type, c_level, c_sequence, c_name, c_body, c_revisions, c_templateid, c_status, c_relativeid, c_created, c_revised
        FROM dmz_section
        WHERE c_orgid=? AND c_docid=? AND (c_status=0 OR ((c_status=4 OR c_status=2) AND c_relativeid=''))
        ORDER BY c_sequence`,
		ctx.OrgID, documentID)

	if err != nil {
		err = errors.Wrap(err, "execute get pages")
	}

	return
}

// GetUnpublishedPages returns a slice containing all published page records for a given documentID, in presentation sequence.
func (s Scope) GetUnpublishedPages(ctx domain.RequestContext, documentID string) (p []page.Page, err error) {
	err = s.Runtime.Db.Select(&p, `
        SELECT c_id, c_refid, c_orgid, c_docid, c_userid, c_contenttype, c_type, c_level, c_sequence, c_name, c_body, c_revisions, c_templateid, c_status, c_relativeid, c_created, c_revised
        FROM dmz_section
        WHERE c_orgid=? AND c_docid=? AND c_status!=0 AND c_relativeid!=''
        ORDER BY c_sequence`,
		ctx.OrgID, documentID)

	if err != nil {
		err = errors.Wrap(err, "execute get unpublished pages")
	}

	return
}

// GetPagesWithoutContent returns a slice containing all the page records for a given documentID, in presentation sequence,
// but without the body field (which holds the HTML content).
func (s Scope) GetPagesWithoutContent(ctx domain.RequestContext, documentID string) (pages []page.Page, err error) {
	err = s.Runtime.Db.Select(&pages, `
        SELECT c_id, c_refid, c_orgid, c_docid, c_userid, c_contenttype, c_type, c_level, c_sequence, c_name, c_body, c_revisions, c_templateid, c_status, c_relativeid, c_created, c_revised
        FROM dmz_section
        WHERE c_orgid=? AND c_docid=? AND c_status=0
        ORDER BY c_sequence`,
		ctx.OrgID, documentID)

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
		_, err = ctx.Transaction.Exec(`
            INSERT INTO dmz_section_revision
                (c_refid, c_orgid, c_docid, c_ownerid, c_sectionid, c_userid, c_contenttype, c_type,
                c_name, c_body, c_rawbody, c_config, c_created, c_revised)
            SELECT ? as refid, a.c_orgid, a.c_docid, a.c_userid as ownerid, a.c_refid as sectionid,
                ? as userid, a.c_contenttype, a.c_type, a.c_name, a.c_body,
                b.c_rawbody, b.c_config, ? as c_created, ? as c_revised
                FROM dmz_section a, dmz_section_meta b
                WHERE a.c_refid=? AND a.c_refid=b.c_sectionid`,
			refID, userID, time.Now().UTC(), time.Now().UTC(), page.RefID)

		if err != nil {
			err = errors.Wrap(err, "execute page revision insert")
			return err
		}
	}

	// Update page
	_, err = ctx.Transaction.NamedExec(`UPDATE dmz_section SET
        docid=:documentid, level=:level, c_name=:name, body=:body,
        c_revisions=:revisions, c_sequence=:sequence, c_status=:status,
        c_relativeid=:relativeid, c_revised=:revised
        WHERE orgid=:orgid AND refid=:refid`,
		&page)

	if err != nil {
		err = errors.Wrap(err, "execute page insert")
		return
	}

	// Update revisions counter
	if !skipRevision {
		_, err = ctx.Transaction.Exec(`UPDATE dmz_section SET c_revisions=c_revisions+1
            WHERE c_orgid=? AND c_refid=?`,
			ctx.OrgID, page.RefID)

		if err != nil {
			err = errors.Wrap(err, "execute page revision counter")
		}
	}

	return
}

// Delete deletes the pageID page in the document.
// It then propagates that change into the search table, adds a delete the page revisions history, and audits that the page has been removed.
func (s Scope) Delete(ctx domain.RequestContext, documentID, pageID string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	rows, err = b.DeleteConstrained(ctx.Transaction, "page", ctx.OrgID, pageID)

	if err == nil {
		_, _ = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM dmz_section_meta WHERE c_orgid='%s' AND c_sectionid='%s'", ctx.OrgID, pageID))
	}

	if err == nil {
		_, _ = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM dmz_action WHERE c_orgid='%s' AND c_reftypeid='%s' AND c_reftype='P'", ctx.OrgID, pageID))
	}

	return
}

//**************************************************
// Page Meta
//**************************************************

// UpdateMeta persists meta information associated with a document page.
func (s Scope) UpdateMeta(ctx domain.RequestContext, meta page.Meta, updateUserID bool) (err error) {
	meta.Revised = time.Now().UTC()

	if updateUserID {
		meta.UserID = ctx.UserID
	}

	_, err = ctx.Transaction.NamedExec(`UPDATE dmz_section_meta SET
        c_userid=:userid, c_docid=:documentid, c_rawbody=:rawbody, c_config=:config,
        c_external=:externalsource, c_revised=:revised
        WHERE c_orgid=:orgid AND c_sectionid=:sectionid`,
		&meta)

	if err != nil {
		err = errors.Wrap(err, "execute page meta update")
	}

	return
}

// GetPageMeta returns the meta information associated with the page.
func (s Scope) GetPageMeta(ctx domain.RequestContext, pageID string) (meta page.Meta, err error) {
	err = s.Runtime.Db.Get(&meta, `SELECT id, c_sectionid AS sectionid,
        c_orgid AS orgid, c_userid AS userid, c_docid AS documentid,
        c_rawbody AS rawbody, coalesce(c_config,JSON_UNQUOTE('{}')) as config,
        c_external AS externalsource, c_created AS created, c_revised AS revised
        FROM dmz_section_meta
        WHERE c_orgid=? AND c_sectionid=?`,
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
		filter = " AND c_external=1"
	}

	err = s.Runtime.Db.Select(&meta, `SELECT id, c_sectionid AS sectionid,
        c_orgid AS orgid, c_userid AS userid, c_docid AS documentid,
        c_rawbody AS rawbody, coalesce(c_config,JSON_UNQUOTE('{}')) as config,
        c_external AS externalsource, c_created AS created, c_revised AS revised
        FROM dmz_section_meta
        WHERE c_orgid=? AND c_docid=?`+filter,
		ctx.OrgID, documentID)

	if err != nil {
		err = errors.Wrap(err, "get document page meta")
	}

	return
}

//**************************************************
// Table of contents
//**************************************************

// UpdateSequence changes the presentation sequence of the pageID page in the document.
// It then propagates that change into the search table and audits that it has occurred.
func (s Scope) UpdateSequence(ctx domain.RequestContext, documentID, pageID string, sequence float64) (err error) {
	_, err = ctx.Transaction.Exec("UPDATE dmz_section SET c_sequence=? WHERE c_orgid=? AND c_refid=?",
		sequence, ctx.OrgID, pageID)

	if err != nil {
		err = errors.Wrap(err, "execute page sequence update")
	}

	return
}

// UpdateLevel changes the heading level of the pageID page in the document.
// It then propagates that change into the search table and audits that it has occurred.
func (s Scope) UpdateLevel(ctx domain.RequestContext, documentID, pageID string, level int) (err error) {
	_, err = ctx.Transaction.Exec("UPDATE dmz_section SET c_level=? WHERE c_orgid=? AND c_refid=?",
		level, ctx.OrgID, pageID)

	if err != nil {
		err = errors.Wrap(err, "execute page level update")
	}

	return
}

// UpdateLevelSequence changes page level and sequence numbers.
func (s Scope) UpdateLevelSequence(ctx domain.RequestContext, documentID, pageID string, level int, sequence float64) (err error) {
	_, err = ctx.Transaction.Exec("UPDATE dmz_section SET c_level=?, c_sequence=? WHERE c_orgid=? AND c_refid=?",
		level, sequence, ctx.OrgID, pageID)

	if err != nil {
		err = errors.Wrap(err, "execute page level/sequence update")
	}

	return
}

// GetNextPageSequence returns the next sequence numbner to use for a page in given document.
func (s Scope) GetNextPageSequence(ctx domain.RequestContext, documentID string) (maxSeq float64, err error) {
	row := s.Runtime.Db.QueryRow("SELECT max(c_sequence) FROM dmz_section WHERE c_orgid=? AND c_docid=?",
		ctx.OrgID, documentID)

	err = row.Scan(&maxSeq)
	if err != nil {
		maxSeq = 2048
	}
	maxSeq = maxSeq * 2

	return
}

//**************************************************
// Page Revisions
//**************************************************

// GetPageRevision returns the revisionID page revision record.
func (s Scope) GetPageRevision(ctx domain.RequestContext, revisionID string) (revision page.Revision, err error) {
	err = s.Runtime.Db.Get(&revision, `SELECT id, c_refid AS refid,
        c_orgid AS orgid, c_docid AS documentid, c_ownerid AS  ownerid, c_sectionid AS sectionid,
        c_userid AS userid, c_contenttype AS contenttype, c_type AS type,
        c_name AS name, c_body AS body, coalesce(c_rawbody, '') as rawbody, coalesce(c_config,JSON_UNQUOTE('{}')) as config,
        c_created AS created, c_revised AS revised
        FROM dmz_section_revision
        WHERE c_orgid=? and c_refid=?`,
		ctx.OrgID, revisionID)

	if err != nil {
		err = errors.Wrap(err, "execute get page revisions")
	}

	return
}

// GetPageRevisions returns a slice of page revision records for a given pageID, in the order they were created.
// Then audits that the get-page-revisions action has occurred.
func (s Scope) GetPageRevisions(ctx domain.RequestContext, pageID string) (revisions []page.Revision, err error) {
	err = s.Runtime.Db.Select(&revisions, `SELECT a.c_id, a.c_refid AS refid,
        a.c_orgid AS orgid, a.c_docid AS documentid, a.c_ownerid AS ownerid, a.c_sectionid AS sectionid, a.c_userid AS userid,
        a.c_contenttype AS contenttype, a.c_type AS type, a.c_name AS name,
        a.c_created AS created, a.c_revised AS revised,
        coalesce(b.c_email,'') as email, coalesce(b.c_firstname,'') as firstname,
        coalesce(b.c_lastname,'') as lastname, coalesce(b.c_initials,'') as initials
        FROM dmz_section_revision a
        LEFT JOIN dmz_user b ON a.c_userid=b.c_refid
        WHERE a.c_orgid=? AND a.c_sectionid=? AND a.c_type='section'
        ORDER BY a.id DESC`,
		ctx.OrgID, pageID)

	if err != nil {
		err = errors.Wrap(err, "get page revisions")
	}

	return
}

// GetDocumentRevisions returns a slice of page revision records for a given document, in the order they were created.
// Then audits that the get-page-revisions action has occurred.
func (s Scope) GetDocumentRevisions(ctx domain.RequestContext, documentID string) (revisions []page.Revision, err error) {
	err = s.Runtime.Db.Select(&revisions, `SELECT a.id, a.c_refid AS refid,
        a.c_orgid AS orgid, a.c_docid AS documentid, a.c_ownerid AS ownerid, a.c_sectionid AS sectionid,
        a.c_userid AS userid, a.c_contenttype AS contenttype, a.c_type AS type, a.c_name AS name,
        a.c_created AS created, a.c_revised AS revised,
        coalesce(b.c_email,'') as email, coalesce(b.c_firstname,'') as firstname,
        coalesce(b.c_lastname,'') as lastname, coalesce(b.c_initials,'') as initials,
        coalesce(p.c_revisions, 0) as revisions
        FROM dmz_section_revision a
        LEFT JOIN dmz_user b ON a.c_userid=b.c_refid
        LEFT JOIN dmz_section p ON a.c_sectionid=p.c_refid
        WHERE a.c_orgid=? AND a.c_docid=? AND a.c_type='section'
        ORDER BY a.id DESC`,
		ctx.OrgID, documentID)

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
	rows, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM dmz_section_revision WHERE c_orgid='%s' AND c_sectionid='%s'",
		ctx.OrgID, pageID))

	return
}
