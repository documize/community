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

	_, err = ctx.Transaction.Exec("INSERT INTO document (refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, protection, approval, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		document.RefID, document.OrgID, document.LabelID, document.UserID, document.Job, document.Location, document.Title, document.Excerpt, document.Slug, document.Tags, document.Template, document.Protection, document.Approval, document.Created, document.Revised)

	if err != nil {
		err = errors.Wrap(err, "execuet insert document")
	}

	return
}

// Get fetches the document record with the given id fromt the document table and audits that it has been got.
func (s Scope) Get(ctx domain.RequestContext, id string) (document doc.Document, err error) {
	err = s.Runtime.Db.Get(&document, "SELECT id, refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, protection, approval, created, revised FROM document WHERE orgid=? and refid=?",
		ctx.OrgID, id)

	if err != nil {
		err = errors.Wrap(err, "execute select document")
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

// GetAll returns a slice containg all of the the documents for the client's organisation.
func (s Scope) GetAll() (ctx domain.RequestContext, documents []doc.Document, err error) {
	err = s.Runtime.Db.Select(&documents, "SELECT id, refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, protection, approval, created, revised FROM document WHERE orgid=? AND template=0 ORDER BY title", ctx.OrgID)

	if err != nil {
		err = errors.Wrap(err, "select documents")
	}

	return
}

// GetBySpace returns a slice containing the documents for a given space.
// No attempt is made to hide documents that are protected
// by category permissions -- caller must filter as required.
func (s Scope) GetBySpace(ctx domain.RequestContext, spaceID string) (documents []doc.Document, err error) {
	err = s.Runtime.Db.Select(&documents, `
		SELECT id, refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, protection, approval, created, revised
		FROM document
		WHERE orgid=? AND template=0 AND labelid IN (
			SELECT refid FROM label WHERE orgid=? AND refid IN 
				(SELECT refid FROM permission WHERE orgid=? AND location='space' AND refid=? AND refid IN (
						SELECT refid from permission WHERE orgid=? AND who='user' AND (whoid=? OR whoid='0') AND location='space' AND action='view' 
						UNION ALL
						SELECT p.refid from permission p LEFT JOIN rolemember r ON p.whoid=r.roleid WHERE p.orgid=? 
						AND p.who='role' AND p.location='space' AND p.refid=? AND p.action='view' AND (r.userid=? OR r.userid='0')
				))
		)
		ORDER BY title`, ctx.OrgID, ctx.OrgID, ctx.OrgID, spaceID, ctx.OrgID, ctx.UserID, ctx.OrgID, spaceID, ctx.UserID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, "select documents by space")
	}

	return
}

// Templates returns a slice containing the documents available as templates to the client's organisation, in title order.
func (s Scope) Templates(ctx domain.RequestContext) (documents []doc.Document, err error) {
	err = s.Runtime.Db.Select(&documents,
		`SELECT id, refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, protection, approval, created, revised FROM document WHERE orgid=? AND template=1
		AND labelid IN
			(
				SELECT refid FROM label WHERE orgid=?
            	AND refid IN (SELECT refid FROM permission WHERE orgid=? AND location='space' AND refid IN (
					SELECT refid from permission WHERE orgid=? AND who='user' AND (whoid=? OR whoid='0') AND location='space' AND action='view' 
					UNION ALL
                	SELECT p.refid from permission p LEFT JOIN rolemember r ON p.whoid=r.roleid WHERE p.orgid=? AND p.who='role' AND p.location='space' AND p.action='view' AND (r.userid=? OR r.userid='0')
				))
			)
		ORDER BY title`, ctx.OrgID, ctx.OrgID, ctx.OrgID, ctx.OrgID, ctx.UserID, ctx.OrgID, ctx.UserID)

	if err != nil {
		err = errors.Wrap(err, "select document templates")
	}

	return
}

// TemplatesBySpace returns a slice containing the documents available as templates for given space.
func (s Scope) TemplatesBySpace(ctx domain.RequestContext, spaceID string) (documents []doc.Document, err error) {
	err = s.Runtime.Db.Select(&documents,
		`SELECT id, refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, protection, approval, created, revised FROM document WHERE orgid=? AND labelid=? AND template=1
		AND labelid IN
			(
				SELECT refid FROM label WHERE orgid=?
            	AND refid IN (SELECT refid FROM permission WHERE orgid=? AND location='space' AND refid IN (
					SELECT refid from permission WHERE orgid=? AND who='user' AND (whoid=? OR whoid='0') AND location='space' AND action='view' 
					UNION ALL
                	SELECT p.refid from permission p LEFT JOIN rolemember r ON p.whoid=r.roleid WHERE p.orgid=? AND p.who='role' AND p.location='space' AND p.action='view' AND (r.userid=? OR r.userid='0')
				))
			)
		ORDER BY title`, ctx.OrgID, spaceID, ctx.OrgID, ctx.OrgID, ctx.OrgID, ctx.UserID, ctx.OrgID, ctx.UserID)

	if err == sql.ErrNoRows {
		err = nil
		documents = []doc.Document{}
	}

	if err != nil {
		err = errors.Wrap(err, "select space document templates")
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
	}

	return
}

// DocumentList returns a slice containing the documents available as templates to the client's organisation, in title order.
func (s Scope) DocumentList(ctx domain.RequestContext) (documents []doc.Document, err error) {
	err = s.Runtime.Db.Select(&documents,
		`SELECT id, refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, protection, approval, created, revised FROM document WHERE orgid=? AND template=0
		AND labelid IN
			(
				SELECT refid FROM label WHERE orgid=?
				AND refid IN (SELECT refid FROM permission WHERE orgid=? AND location='space' AND refid IN (
					SELECT refid from permission WHERE orgid=? AND who='user' AND (whoid=? OR whoid='0') AND location='space' AND action='view' 
					UNION ALL
					SELECT p.refid from permission p LEFT JOIN rolemember r ON p.whoid=r.roleid WHERE p.orgid=? AND p.who='role' AND p.location='space' AND p.action='view' AND (r.userid=? OR r.userid='0')
				))
			)
		ORDER BY title`, ctx.OrgID, ctx.OrgID, ctx.OrgID, ctx.OrgID, ctx.UserID, ctx.OrgID, ctx.UserID)

	if err == sql.ErrNoRows {
		err = nil
		documents = []doc.Document{}
	}

	if err != nil {
		err = errors.Wrap(err, "select documents list")
	}

	return
}

// Update changes the given document record to the new values, updates search information and audits the action.
func (s Scope) Update(ctx domain.RequestContext, document doc.Document) (err error) {
	document.Revised = time.Now().UTC()

	_, err = ctx.Transaction.NamedExec("UPDATE document SET labelid=:labelid, userid=:userid, job=:job, location=:location, title=:title, excerpt=:excerpt, slug=:slug, tags=:tags, template=:template, protection=:protection, approval=:approval, revised=:revised WHERE orgid=:orgid AND refid=:refid",
		&document)

	if err != nil {
		err = errors.Wrap(err, "execute update document")
	}

	return
}

// ChangeDocumentSpace assigns the specified space to the document.
func (s Scope) ChangeDocumentSpace(ctx domain.RequestContext, document, space string) (err error) {
	revised := time.Now().UTC()

	_, err = ctx.Transaction.Exec("UPDATE document SET labelid=?, revised=? WHERE orgid=? AND refid=?",
		space, revised, ctx.OrgID, document)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute change document space %s", document))
	}

	return
}

// MoveDocumentSpace changes the space for client's organization's documents which have space "id", to "move".
func (s Scope) MoveDocumentSpace(ctx domain.RequestContext, id, move string) (err error) {
	_, err = ctx.Transaction.Exec("UPDATE document SET labelid=? WHERE orgid=? AND labelid=?",
		move, ctx.OrgID, id)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute document space move %s", id))
	}

	return
}

// Delete removes the specified document.
// Remove document pages, revisions, attachments, updates the search subsystem.
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

	_, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE from categorymember WHERE documentid=\"%s\" AND orgid=\"%s\"", documentID, ctx.OrgID))
	if err != nil {
		return
	}

	return b.DeleteConstrained(ctx.Transaction, "document", ctx.OrgID, documentID)
}

// DeleteBySpace removes all documents for given space.
// Remove document pages, revisions, attachments, updates the search subsystem.
func (s Scope) DeleteBySpace(ctx domain.RequestContext, spaceID string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	rows, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE from page WHERE documentid IN (SELECT refid FROM document WHERE labelid=\"%s\" AND orgid=\"%s\")", spaceID, ctx.OrgID))

	if err != nil {
		return
	}

	_, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE from revision WHERE documentid IN (SELECT refid FROM document WHERE labelid=\"%s\" AND orgid=\"%s\")", spaceID, ctx.OrgID))
	if err != nil {
		return
	}

	_, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE from attachment WHERE documentid IN (SELECT refid FROM document WHERE labelid=\"%s\" AND orgid=\"%s\")", spaceID, ctx.OrgID))
	if err != nil {
		return
	}

	return b.DeleteConstrained(ctx.Transaction, "document", ctx.OrgID, spaceID)
}
