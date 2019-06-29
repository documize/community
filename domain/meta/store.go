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

package meta

import (
	"database/sql"
	"fmt"

	"github.com/documize/community/model/doc"

	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/attachment"
	"github.com/documize/community/model/page"
	"github.com/pkg/errors"
)

// Store provides data access to space category information.
type Store struct {
	store.Context
	store.MetaStorer
}

// Documents returns every document ID value stored.
// For global admins, the query runs at the instance level across all tenants.
// For tenant admins, the query is restricted to the tenant.
func (s Store) Documents(ctx domain.RequestContext) (documents []string, err error) {
	qry := "SELECT c_refid FROM dmz_doc WHERE c_lifecycle=1"
	if !ctx.GlobalAdmin {
		qry = fmt.Sprintf("%s AND c_orgid='%s'", qry, ctx.OrgID)
	}
	err = s.Runtime.Db.Select(&documents, qry)

	if err == sql.ErrNoRows {
		err = nil
		documents = []string{}
	}
	if err != nil {
		err = errors.Wrap(err, "failed to get instance document ID values")
	}

	return
}

// Document fetches the document record with the given id fromt the document table and audits that it has been got.
func (s Store) Document(ctx domain.RequestContext, id string) (document doc.Document, err error) {
	err = s.Runtime.Db.Get(&document, s.Bind(`
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_userid AS userid,
        c_job AS job, c_location AS location, c_name AS name, c_desc AS excerpt, c_slug AS slug,
        c_tags AS tags, c_template AS template, c_protection AS protection, c_approval AS approval,
        c_lifecycle AS lifecycle, c_versioned AS versioned, c_versionid AS versionid,
        c_versionorder AS versionorder, c_groupid AS groupid, c_created AS created, c_revised AS revised
        FROM dmz_doc
        WHERE c_refid=?`),
		id)

	if err != nil {
		err = errors.Wrap(err, "execute select document")
	}

	return
}

// Pages returns a slice containing all published page records for a given documentID, in presentation sequence.
func (s Store) Pages(ctx domain.RequestContext, documentID string) (p []page.Page, err error) {
	err = s.Runtime.Db.Select(&p, s.Bind(`
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_docid AS documentid,
            c_userid AS userid, c_contenttype AS contenttype,
            c_type AS type, c_level AS level, c_sequence AS sequence, c_name AS name,
            c_body AS body, c_revisions AS revisions, c_templateid AS templateid,
            c_status AS status, c_relativeid AS relativeid, c_created AS created, c_revised AS revised
        FROM dmz_section
        WHERE c_docid=? AND (c_status=0 OR ((c_status=4 OR c_status=2) AND c_relativeid=''))`),
		documentID)

	if err == sql.ErrNoRows {
		err = nil
		p = []page.Page{}
	}
	if err != nil {
		err = errors.Wrap(err, "failed to get instance document pages")
	}

	return
}

// Attachments returns a slice containing the attachment records (excluding their data) for document docID, ordered by filename.
func (s Store) Attachments(ctx domain.RequestContext, docID string) (a []attachment.Attachment, err error) {
	err = s.Runtime.Db.Select(&a, s.Bind(`
        SELECT id, c_refid AS refid,
        c_orgid AS orgid, c_docid AS documentid, c_job AS job, c_fileid AS fileid,
        c_filename AS filename, c_extension AS extension,
        c_created AS created, c_revised AS revised
        FROM dmz_doc_attachment
        WHERE c_docid=?
        ORDER BY c_filename`),
		docID)

	if err == sql.ErrNoRows {
		err = nil
		a = []attachment.Attachment{}
	}
	if err != nil {
		err = errors.Wrap(err, "execute select attachments")
		return
	}

	return
}

// SearchIndexCount returns the numnber of index entries.
func (s Store) SearchIndexCount(ctx domain.RequestContext) (c int, err error) {
	row := s.Runtime.Db.QueryRow("SELECT count(*) FROM dmz_search")
	err = row.Scan(&c)
	if err != nil {
		err = errors.Wrap(err, "count search index entries")
		c = 0
	}

	return
}
