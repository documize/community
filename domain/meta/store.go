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

	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/page"
	"github.com/pkg/errors"
)

// Store provides data access to space category information.
type Store struct {
	store.Context
	store.MetaStorer
}

// GetDocumentsID returns every document ID value stored.
// The query runs at the instance level across all tenants.
func (s Store) GetDocumentsID(ctx domain.RequestContext) (documents []string, err error) {
	err = s.Runtime.Db.Select(&documents, `SELECT c_refid FROM dmz_doc WHERE c_lifecycle=1`)

	if err == sql.ErrNoRows {
		err = nil
		documents = []string{}
	}
	if err != nil {
		err = errors.Wrap(err, "failed to get instance document ID values")
	}

	return
}

// GetDocumentPages returns a slice containing all published page records for a given documentID, in presentation sequence.
func (s Store) GetDocumentPages(ctx domain.RequestContext, documentID string) (p []page.Page, err error) {
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
