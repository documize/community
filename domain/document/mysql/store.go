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
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store/mysql"
	"github.com/documize/community/model/doc"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// Add inserts the given document record into the document table and audits that it has been done.
func (s Scope) Add(ctx domain.RequestContext, document doc.Document) (err error) {
	document.OrgID = ctx.OrgID
	document.Created = time.Now().UTC()
	document.Revised = document.Created // put same time in both fields

	stmt, err := ctx.Transaction.Preparex("INSERT INTO document (refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare insert document")
		return
	}

	_, err = stmt.Exec(document.RefID, document.OrgID, document.LabelID, document.UserID, document.Job, document.Location, document.Title, document.Excerpt, document.Slug, document.Tags, document.Template, document.Created, document.Revised)

	if err != nil {
		err = errors.Wrap(err, "execuet insert document")
		return
	}

	return
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

// DocumentMeta returns the metadata for a specified document.
func (s Scope) DocumentMeta(ctx domain.RequestContext, id string) (meta doc.DocumentMeta, err error) {
	sqlViewers := `SELECT MAX(a.created) as created,
		IFNULL(a.userid, '') AS userid, IFNULL(u.firstname, 'Anonymous') AS firstname, IFNULL(u.lastname, 'Viewer') AS lastname
		FROM audit a LEFT JOIN user u ON a.userid=u.refid
		WHERE a.orgid=? AND a.documentid=?
		AND a.userid != '0' AND a.userid != ''
		AND action='get-document'
		GROUP BY a.userid ORDER BY MAX(a.created) DESC`

	err = s.Runtime.Db.Select(&meta.Viewers, sqlViewers, ctx.OrgID, id)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("select document viewers %s", id))
		return
	}

	sqlEdits := `SELECT a.created,
		IFNULL(a.action, '') AS action, IFNULL(a.userid, '') AS userid, IFNULL(u.firstname, 'Anonymous') AS firstname, IFNULL(u.lastname, 'Viewer') AS lastname, IFNULL(a.pageid, '') AS pageid
		FROM audit a LEFT JOIN user u ON a.userid=u.refid
		WHERE a.orgid=? AND a.documentid=? AND a.userid != '0' AND a.userid != ''
		AND (a.action='update-page' OR a.action='add-page' OR a.action='remove-page')
		ORDER BY a.created DESC;`

	err = s.Runtime.Db.Select(&meta.Editors, sqlEdits, ctx.OrgID, id)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("select document editors %s", id))
		return
	}

	return
}

// GetAll returns a slice containg all of the the documents for the client's organisation, with the most recient first.
func (s Scope) GetAll() (ctx domain.RequestContext, documents []doc.Document, err error) {
	err = s.Runtime.Db.Select(&documents, "SELECT id, refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, layout, created, revised FROM document WHERE orgid=? AND template=0 ORDER BY revised DESC", ctx.OrgID)

	if err != nil {
		err = errors.Wrap(err, "select documents")
		return
	}

	return
}

// GetBySpace returns a slice containing the documents for a given space, most recient first.
func (s Scope) GetBySpace(ctx domain.RequestContext, folderID string) (documents []doc.Document, err error) {
	err = s.Runtime.Db.Select(&documents, "SELECT id, refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, layout, created, revised FROM document WHERE orgid=? AND template=0 AND labelid=? ORDER BY revised DESC", ctx.OrgID, folderID)

	if err != nil {
		err = errors.Wrap(err, "select documents by space")
		return
	}

	return
}

// GetByTag returns a slice containing the documents with the specified tag, in title order.
func (s Scope) GetByTag(ctx domain.RequestContext, tag string) (documents []doc.Document, err error) {
	tagQuery := "tags LIKE '%#" + tag + "#%'"

	err = s.Runtime.Db.Select(&documents,
		`SELECT id, refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, layout, created, revised FROM document WHERE orgid=? AND template=0 AND `+tagQuery+` AND labelid IN
		(SELECT refid from label WHERE orgid=? AND type=2 AND userid=?
    	UNION ALL SELECT refid FROM label a where orgid=? AND type=1 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid='' AND (canedit=1 OR canview=1))
		UNION ALL SELECT refid FROM label a where orgid=? AND type=3 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid=? AND (canedit=1 OR canview=1)))
		ORDER BY title`,
		ctx.OrgID,
		ctx.OrgID,
		ctx.UserID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.UserID)

	if err != nil {
		err = errors.Wrap(err, "select documents by tag")
		return
	}

	return
}

// Templates returns a slice containing the documents available as templates to the client's organisation, in title order.
func (s Scope) Templates(ctx domain.RequestContext) ( documents []doc.Document, err error) {
	err = s.Runtime.Db.Select(&documents,
		`SELECT id, refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, layout, created, revised FROM document WHERE orgid=? AND template=1 AND labelid IN
		(SELECT refid from label WHERE orgid=? AND type=2 AND userid=?
    	UNION ALL SELECT refid FROM label a where orgid=? AND type=1 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid='' AND (canedit=1 OR canview=1))
		UNION ALL SELECT refid FROM label a where orgid=? AND type=3 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid=? AND (canedit=1 OR canview=1)))
		ORDER BY title`,
		ctx.OrgID,
		ctx.OrgID,
		ctx.UserID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.UserID)

	if err != nil {
		err = errors.Wrap(err, "select documents templates")
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

// DocumentList returns a slice containing the documents available as templates to the client's organisation, in title order.
func (s Scope) DocumentList(ctx domain.RequestContext) (documents []doc.Document, err error) {
	err = s.Runtime.Db.Select(&documents,
		`SELECT id, refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, layout, created, revised FROM document WHERE orgid=? AND template=0 AND labelid IN
		(SELECT refid from label WHERE orgid=? AND type=2 AND userid=?
    	UNION ALL SELECT refid FROM label a where orgid=? AND type=1 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid='' AND (canedit=1 OR canview=1))
		UNION ALL SELECT refid FROM label a where orgid=? AND type=3 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid=? AND (canedit=1 OR canview=1)))
		ORDER BY title`,
		ctx.OrgID,
		ctx.OrgID,
		ctx.UserID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.UserID)

	if err != nil {
		err = errors.Wrap(err, "select documents list")
		return
	}

	return
}

// Update changes the given document record to the new values, updates search information and audits the action.
func (s Scope) Update(ctx domain.RequestContext, document doc.Document) (err error) {
	document.Revised = time.Now().UTC()

	stmt, err := ctx.Transaction.PrepareNamed("UPDATE document SET labelid=:labelid, userid=:userid, job=:job, location=:location, title=:title, excerpt=:excerpt, slug=:slug, tags=:tags, template=:template, layout=:layout, revised=:revised WHERE orgid=:orgid AND refid=:refid")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare update document")
		return
	}

	_, err = stmt.Exec(&document)

	if err != nil {
		err = errors.Wrap(err, "execute update document")
		return
	}

	return
}

// ChangeDocumentSpace assigns the specified space to the document.
func (s Scope) ChangeDocumentSpace(ctx domain.RequestContext, document, space string) (err error) {
	revised := time.Now().UTC()

	stmt, err := ctx.Transaction.Preparex("UPDATE document SET labelid=?, revised=? WHERE orgid=? AND refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("prepare change document space %s", document))
		return
	}

	_, err = stmt.Exec(space, revised, ctx.OrgID, document)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute change document space %s", document))
		return
	}

	return
}

// MoveDocumentSpace changes the space for client's organization's documents which have space "id", to "move".
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

// Delete delete the document pages in the database, updates the search subsystem, deletes the associated revisions and attachments,
// audits the deletion, then finally deletes the document itself.
func (s Scope) Delete(ctx domain.RequestContext, documentID string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	rows, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE from page WHERE documentid=\"%s\" AND orgid=\"%s\"", documentID, ctx.OrgID))

	if err != nil {
		return
	}

	_, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE from revision WHERE documentid=\"%s\" AND orgid=\"%s\"", documentID, ctx.OrgID))
	if err != nil {
		return
	}

	_, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE from attachment WHERE documentid=\"%s\" AND orgid=\"%s\"", documentID, ctx.OrgID))
	if err != nil {
		return
	}

	return b.DeleteConstrained(ctx.Transaction, "document", ctx.OrgID, documentID)
}
