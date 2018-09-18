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
func (s Scope) Add(ctx domain.RequestContext, d doc.Document) (err error) {
	d.OrgID = ctx.OrgID
	d.Created = time.Now().UTC()
	d.Revised = d.Created // put same time in both fields

	_, err = ctx.Transaction.Exec(`
        INSERT INTO dmz_doc (c_refid, c_orgid, c_spaceid, c_userid, c_job, c_location, c_name, c_desc as excerpt, c_slug, c_tags, c_template, c_protection, c_approval, c_lifecycle, c_versioned, c_versionid, c_versionorder, c_groupid, c_created, c_revised)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		d.RefID, d.OrgID, d.SpaceID, d.UserID, d.Job, d.Location, d.Name, d.Excerpt, d.Slug, d.Tags,
		d.Template, d.Protection, d.Approval, d.Lifecycle, d.Versioned, d.VersionID, d.VersionOrder, d.GroupID, d.Created, d.Revised)

	if err != nil {
		err = errors.Wrap(err, "execute insert document")
	}

	return
}

// Get fetches the document record with the given id fromt the document table and audits that it has been got.
func (s Scope) Get(ctx domain.RequestContext, id string) (document doc.Document, err error) {
	err = s.Runtime.Db.Get(&document, `
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_userid AS userid,
        c_job AS job, c_location AS location, c_name AS name, c_desc AS excerpt, c_slug AS slug,
        c_tags AS tags, c_template AS template, c_protection AS protection, c_approval AS approval,
        c_lifecycle AS lifecycle, c_versioned AS versioned, c_versionid AS versionid,
        c_versionorder AS versionorder, c_groupid AS groupid, c_created AS created, c_revised AS revised
        FROM dmz_doc
        WHERE c_orgid=? and c_refid=?`,
		ctx.OrgID, id)

	if err != nil {
		err = errors.Wrap(err, "execute select document")
	}

	return
}

// // DocumentMeta returns the metadata for a specified document.
// func (s Scope) DocumentMeta(ctx domain.RequestContext, id string) (meta doc.DocumentMeta, err error) {
// 	sqlViewers := `
//         SELECT MAX(a.c_created) as created,
//         IFNULL(a.c_userid, '') AS userid, IFNULL(u.c_firstname, 'Anonymous') AS firstname,
//         IFNULL(u.c_lastname, 'Viewer') AS lastname
// 		FROM dmz_audit_log a LEFT JOIN dmz_user u ON a.c_userid=u.c_refid
// 		WHERE a.c_orgid=? AND a.documentid=?
// 		AND a.userid != '0' AND a.userid != ''
// 		AND action='get-document'
// 		GROUP BY a.userid ORDER BY MAX(a.created) DESC`

// 	err = s.Runtime.Db.Select(&meta.Viewers, sqlViewers, ctx.OrgID, id)

// 	if err != nil {
// 		err = errors.Wrap(err, fmt.Sprintf("select document viewers %s", id))
// 		return
// 	}

// 	sqlEdits := `SELECT a.created,
// 		IFNULL(a.action, '') AS action, IFNULL(a.userid, '') AS userid, IFNULL(u.firstname, 'Anonymous') AS firstname, IFNULL(u.lastname, 'Viewer') AS lastname, IFNULL(a.pageid, '') AS pageid
// 		FROM audit a LEFT JOIN user u ON a.userid=u.refid
// 		WHERE a.orgid=? AND a.documentid=? AND a.userid != '0' AND a.userid != ''
// 		AND (a.action='update-page' OR a.action='add-page' OR a.action='remove-page')
// 		ORDER BY a.created DESC;`

// 	err = s.Runtime.Db.Select(&meta.Editors, sqlEdits, ctx.OrgID, id)

// 	if err != nil {
// 		err = errors.Wrap(err, fmt.Sprintf("select document editors %s", id))
// 		return
// 	}

// 	return
// }

// GetBySpace returns a slice containing the documents for a given space.
//
// No attempt is made to hide documents that are protected by category
// permissions hence caller must filter as required.
//
// All versions of a document are returned, hence caller must
// decide what to do with them.
func (s Scope) GetBySpace(ctx domain.RequestContext, spaceID string) (documents []doc.Document, err error) {
	documents = []doc.Document{}

	err = s.Runtime.Db.Select(&documents, `
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_userid AS userid,
        c_job AS job, c_location AS location, c_name AS name, c_desc AS excerpt, c_slug AS slug,
        c_tags AS tags, c_template AS template, c_protection AS protection, c_approval AS approval,
        c_lifecycle AS lifecycle, c_versioned AS versioned, c_versionid AS versionid,
        c_versionorder AS versionorder, c_groupid AS groupid, c_created AS created, c_revised AS revised
        FROM dmz_doc
        WHERE c_orgid=? AND c_template=0 AND c_spaceid IN (
			(SELECT c_refid FROM dmz_space WHERE c_orgid=? AND c_refid IN
                (SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_location='space' AND c_refid=? AND c_refid IN
                    (SELECT c_refid from dmz_permission WHERE c_orgid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0') AND c_location='space' AND c_action='view'
                    UNION ALL
                    SELECT p.c_refid from permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid WHERE p.c_orgid=?
                    AND p.c_who='role' AND p.c_location='space' AND p.c_refid=? AND p.c_action='view' AND (r.c_userid=? OR r.c_userid='0'))
                )
		    )
        ORDER BY c_name, c_versionorder`,
		ctx.OrgID, ctx.OrgID, ctx.OrgID, spaceID, ctx.OrgID, ctx.UserID, ctx.OrgID, spaceID, ctx.UserID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, "select documents by space")
	}

	return
}

// TemplatesBySpace returns a slice containing the documents available as templates for given space.
func (s Scope) TemplatesBySpace(ctx domain.RequestContext, spaceID string) (documents []doc.Document, err error) {
	err = s.Runtime.Db.Select(&documents, `
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_userid AS userid,
        c_job AS job, c_location AS location, c_name AS name, c_desc AS excerpt, c_slug AS slug,
        c_tags AS tags, c_template AS template, c_protection AS protection, c_approval AS approval,
        c_lifecycle AS lifecycle, c_versioned AS versioned, c_versionid AS versionid,
        c_versionorder AS versionorder, c_groupid AS groupid, c_created AS created, c_revised AS revised
        FROM dmz_doc
        WHERE c_orgid=? AND c_spaceid=? AND c_template=1 AND c_lifecycle=1
		AND c_spaceid IN
			(SELECT c_refid FROM dmz_space WHERE c_orgid=? AND c_refid IN
                (SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_location='space' AND c_refid IN
                    (SELECT c_refid from dmz_permission WHERE c_orgid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0') AND c_location='space' AND c_action='view'
					UNION ALL
                	SELECT p.refid from permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid WHERE p.c_orgid=? AND p.c_who='role' AND p.c_location='space' AND p.c_action='view' AND (r.c_userid=? OR r.c_userid='0'))
				)
			)
		ORDER BY c_name`, ctx.OrgID, spaceID, ctx.OrgID, ctx.OrgID, ctx.OrgID, ctx.UserID, ctx.OrgID, ctx.UserID)

	if err == sql.ErrNoRows {
		err = nil
		documents = []doc.Document{}
	}
	if err != nil {
		err = errors.Wrap(err, "select space document templates")
	}

	return
}

// PublicDocuments returns a slice of SitemapDocument records
// linking to documents in public spaces.
// These documents can then be seen by search crawlers.
func (s Scope) PublicDocuments(ctx domain.RequestContext, orgID string) (documents []doc.SitemapDocument, err error) {
	err = s.Runtime.Db.Select(&documents, `
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_userid AS userid,
        c_job AS job, c_location AS location, c_name AS name, c_desc AS excerpt, c_slug AS slug,
        c_tags AS tags, c_template AS template, c_protection AS protection, c_approval AS approval,
        c_lifecycle AS lifecycle, c_versioned AS versioned, c_versionid AS versionid,
        c_versionorder AS versionorder, c_groupid AS groupid, c_created AS created, c_revised AS revised
        FROM dmz_doc
        LEFT JOIN dmz_space l ON l.c_refid=d.c_spaceid
		WHERE d.c_orgid=? AND l.c_type=1 AND d.c_lifecycle=1 AND d.c_template=0`, orgID)

	if err == sql.ErrNoRows {
		err = nil
		documents = []doc.SitemapDocument{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute GetPublicDocuments for org %s%s", orgID))
	}

	return
}

// Update changes the given document record to the new values, updates search information and audits the action.
func (s Scope) Update(ctx domain.RequestContext, document doc.Document) (err error) {
	document.Revised = time.Now().UTC()

	_, err = ctx.Transaction.NamedExec(`
        UPDATE dmz_doc SET
            c_spaceid=:spaceid, c_userid=:userid, c_job=:job, c_location=:location, c_name=:name,
            c_desc=:excerpt, c_slug=:slug, c_tags=:tags, c_template=:template,
            c_protection=:protection, c_approval=:approval, c_lifecycle=:lifecycle,
            c_versioned=:versioned, c_versionid=:versionid, c_versionorder=:versionorder,
            c_groupid=:groupid, c_revised=:revised
        WHERE c_orgid=:orgid AND c_refid=:refid`,
		&document)

	if err != nil {
		err = errors.Wrap(err, "document.store.Update")
	}

	return
}

// UpdateGroup applies same values to all documents with the same group ID.
func (s Scope) UpdateGroup(ctx domain.RequestContext, d doc.Document) (err error) {
	_, err = ctx.Transaction.Exec(`UPDATE dmz_doc SET c_name=?, c_desc? WHERE c_orgid=? AND c_groupid=?`,
		d.Name, d.Excerpt, ctx.OrgID, d.GroupID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, "document.store.UpdateTitle")
	}

	return
}

// ChangeDocumentSpace assigns the specified space to the document.
func (s Scope) ChangeDocumentSpace(ctx domain.RequestContext, document, space string) (err error) {
	revised := time.Now().UTC()

	_, err = ctx.Transaction.Exec("UPDATE dmz_doc SET c_spaceid=?, c_revised=? WHERE c_orgid=? AND c_refid=?",
		space, revised, ctx.OrgID, document)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute change document space %s", document))
	}

	return
}

// MoveDocumentSpace changes the space for client's organization's documents which have space "id", to "move".
func (s Scope) MoveDocumentSpace(ctx domain.RequestContext, id, move string) (err error) {
	_, err = ctx.Transaction.Exec("UPDATE dmz_doc SET c_spaceid=? WHERE c_orgid=? AND c_spaceid=?",
		move, ctx.OrgID, id)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute document space move %s", id))
	}

	return
}

// MoveActivity changes the space for all document activity records.
func (s Scope) MoveActivity(ctx domain.RequestContext, documentID, oldSpaceID, newSpaceID string) (err error) {
	_, err = ctx.Transaction.Exec("UPDATE dmz_user_activity SET c_spaceid=? WHERE c_orgid=? AND c_spaceid=? AND c_docid=?",
		newSpaceID, ctx.OrgID, oldSpaceID, documentID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute document activity move %s", documentID))
	}

	return
}

// Delete removes the specified document.
// Remove document pages, revisions, attachments, updates the search subsystem.
func (s Scope) Delete(ctx domain.RequestContext, documentID string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	rows, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM dmz_section WHERE c_docid=\"%s\" AND c_orgid=\"%s\"", documentID, ctx.OrgID))

	if err != nil {
		return
	}

	_, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM dmz_section_revision WHERE c_docid=\"%s\" AND c_orgid=\"%s\"", documentID, ctx.OrgID))
	if err != nil {
		return
	}

	_, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM dmz_doc_attachment WHERE c_docid=\"%s\" AND c_orgid=\"%s\"", documentID, ctx.OrgID))
	if err != nil {
		return
	}

	_, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM dmz_category_member WHERE c_docid=\"%s\" AND c_orgid=\"%s\"", documentID, ctx.OrgID))
	if err != nil {
		return
	}

	_, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM dmz_doc_vote WHERE c_docid=\"%s\" AND c_orgid=\"%s\"", documentID, ctx.OrgID))
	if err != nil {
		return
	}

	return b.DeleteConstrained(ctx.Transaction, "document", ctx.OrgID, documentID)
}

// DeleteBySpace removes all documents for given space.
// Remove document pages, revisions, attachments, updates the search subsystem.
func (s Scope) DeleteBySpace(ctx domain.RequestContext, spaceID string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	rows, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM dmz_section WHERE docid IN (SELECT c_refid FROM dmz_doc WHERE c_spaceid=\"%s\" AND c_orgid=\"%s\")", spaceID, ctx.OrgID))

	if err != nil {
		return
	}

	_, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM dmz_section_revision WHERE docid IN (SELECT c_refid FROM dmz_doc WHERE c_spaceid=\"%s\" AND c_orgid=\"%s\")", spaceID, ctx.OrgID))
	if err != nil {
		return
	}

	_, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM dmz_doc_attachment WHERE docid IN (SELECT c_refid FROM dmz_doc WHERE c_spaceid=\"%s\" AND c_orgid=\"%s\")", spaceID, ctx.OrgID))
	if err != nil {
		return
	}

	_, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM dmz_doc_vote WHERE docid IN (SELECT c_refid FROM dmz_doc WHERE c_spaceid=\"%s\" AND c_orgid=\"%s\")", spaceID, ctx.OrgID))
	if err != nil {
		return
	}

	return b.DeleteConstrained(ctx.Transaction, "document", ctx.OrgID, spaceID)
}

// GetVersions returns a slice containing the documents for a given space.
//
// No attempt is made to hide documents that are protected by category
// permissions hence caller must filter as required.
//
// All versions of a document are returned, hence caller must
// decide what to do with them.
func (s Scope) GetVersions(ctx domain.RequestContext, groupID string) (v []doc.Version, err error) {
	v = []doc.Version{}

	err = s.Runtime.Db.Select(&v, `
        SELECT versionid, refid as documentid
		FROM dmz_doc
		WHERE c_orgid=? AND c_groupid=?
		ORDER BY c_versionorder`, ctx.OrgID, groupID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, "document.store.GetVersions")
	}

	return
}

// Vote records document content vote.
// Any existing vote by the user is replaced.
func (s Scope) Vote(ctx domain.RequestContext, refID, orgID, documentID, userID string, vote int) (err error) {
	b := mysql.BaseQuery{}

	_, err = b.DeleteWhere(ctx.Transaction,
		fmt.Sprintf("DELETE FROM dmz_doc_vote WHERE c_orgid=\"%s\" AND c_docid=\"%s\" AND c_voter=\"%s\"",
			orgID, documentID, userID))
	if err != nil {
		s.Runtime.Log.Error("store.Vote", err)
	}

	_, err = ctx.Transaction.Exec(`INSERT INTO dmz_doc_vote (c_refid, c_orgid, c_docid, c_voter, c_vote) VALUES (?, ?, ?, ?, ?)`,
		refID, orgID, documentID, userID, vote)
	if err != nil {
		err = errors.Wrap(err, "execute insert vote")
	}

	return
}
