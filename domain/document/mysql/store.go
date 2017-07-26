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

package document

import (
	"fmt"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/model/doc"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// Get fetches the document record with the given id fromt the document table and audits that it has been got.
func (s Scope) Get(ctx domain.RequestContext, id string) (document doc.Document, err error) {
	stmt, err := s.Runtime.Db.Preparex("SELECT id, refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, layout, created, revised FROM document WHERE orgid=? and refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare select document")
		return
	}

	err = stmt.Get(&document, ctx.OrgID, id)
	if err != nil {
		err = errors.Wrap(err, "execute select document")
		return
	}

	return
}

// MoveDocumentSpace changes the label for client's organization's documents which have space "id", to "move".
func (s Scope) MoveDocumentSpace(ctx domain.RequestContext, id, move string) (err error) {
	stmt, err := ctx.Transaction.Preparex("UPDATE document SET labelid=? WHERE orgid=? AND labelid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("prepare document space move %s", id))
		return
	}

	_, err = stmt.Exec(move, ctx.OrgID, id)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute document space move %s", id))
		return
	}

	return
}

// PublicDocuments returns a slice of SitemapDocument records, holding documents in folders of type 1 (entity.TemplateTypePublic).
func (s Scope) PublicDocuments(ctx domain.RequestContext, orgID string) (documents []doc.SitemapDocument, err error) {
	err = s.Runtime.Db.Select(&documents,
		`SELECT d.refid as documentid, d.title as document, d.revised as revised, l.refid as folderid, l.label as folder
FROM document d LEFT JOIN label l ON l.refid=d.labelid
WHERE d.orgid=?
AND l.type=1
AND d.template=0`, orgID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute GetPublicDocuments for org %s%s", orgID))
		return
	}

	return
}
