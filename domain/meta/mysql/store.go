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

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/model/page"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// GetDocumentsID returns every document ID value stored.
// The query runs at the instance level across all tenants.
func (s Scope) GetDocumentsID(ctx domain.RequestContext) (documents []string, err error) {
	err = s.Runtime.Db.Select(&documents, `SELECT refid FROM document WHERE lifecycle=1`)

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
func (s Scope) GetDocumentPages(ctx domain.RequestContext, documentID string) (p []page.Page, err error) {
	err = s.Runtime.Db.Select(&p,
		`SELECT
            a.id, a.refid, a.orgid, a.documentid, a.userid, a.contenttype,
            a.pagetype, a.level, a.sequence, a.title, a.body, a.revisions,
            a.blockid, a.status, a.relativeid, a.created, a.revised
        FROM page a
        WHERE a.documentid=? AND (a.status=0 OR ((a.status=4 OR a.status=2) AND a.relativeid=''))`,
		documentID)

	if err != nil {
		err = errors.Wrap(err, "failed to get instance document pages")
	}

	return
}

// SearchIndexCount returns the numnber of index entries.
func (s Scope) SearchIndexCount(ctx domain.RequestContext) (c int, err error) {
	row := s.Runtime.Db.QueryRow("SELECT count(*) FROM search")

	err = row.Scan(&c)
	if err != nil {
		err = errors.Wrap(err, "count search index entries")
		c = 0
	}

	return
}
