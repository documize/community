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
	"database/sql"
	"fmt"
	"time"

	"github.com/pkg/errors"

	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/doc"
)

// Store provides data access to space category information.
type Store struct {
	store.Context
	store.DocumentStorer
}

// Add inserts the given document record into the document table and audits that it has been done.
func (s Store) Add(ctx domain.RequestContext, d doc.Document) (err error) {
	d.OrgID = ctx.OrgID
	d.Created = time.Now().UTC()
	d.Revised = d.Created // put same time in both fields

	_, err = ctx.Transaction.Exec(s.Bind(`
	    INSERT INTO dmz_doc (c_refid, c_orgid, c_spaceid, c_userid, c_job, c_location, c_name, c_desc, c_slug, c_tags,
			c_template, c_protection, c_approval, c_lifecycle, c_versioned, c_versionid, c_versionorder, c_seq, c_groupid,
			c_created, c_revised)
	    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
		d.RefID, d.OrgID, d.SpaceID, d.UserID, d.Job, d.Location, d.Name, d.Excerpt, d.Slug, d.Tags,
		d.Template, d.Protection, d.Approval, d.Lifecycle, d.Versioned, d.VersionID, d.VersionOrder, d.Sequence,
		d.GroupID, d.Created, d.Revised)

	if err != nil {
		err = errors.Wrap(err, "execute insert document")
	}

	return
}

// Get fetches the document record with the given id fromt the document table and audits that it has been got.
func (s Store) Get(ctx domain.RequestContext, id string) (document doc.Document, err error) {
	err = s.Runtime.Db.Get(&document, s.Bind(`
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_userid AS userid,
        c_job AS job, c_location AS location, c_name AS name, c_desc AS excerpt, c_slug AS slug,
        c_tags AS tags, c_template AS template, c_protection AS protection, c_approval AS approval,
        c_lifecycle AS lifecycle, c_versioned AS versioned, c_versionid AS versionid,
        c_versionorder AS versionorder, c_seq AS sequence, c_groupid AS groupid, c_created AS created, c_revised AS revised
        FROM dmz_doc
        WHERE c_orgid=? AND c_refid=?`),
		ctx.OrgID, id)

	return
}

// GetBySpace returns a slice containing the documents for a given space.
//
// No attempt is made to hide documents that are protected by category
// permissions hence caller must filter as required.
//
// All versions of a document are returned, hence caller must
// decide what to do with them.
func (s Store) GetBySpace(ctx domain.RequestContext, spaceID string) (documents []doc.Document, err error) {
	documents = []doc.Document{}

	err = s.Runtime.Db.Select(&documents, s.Bind(`
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_userid AS userid,
        c_job AS job, c_location AS location, c_name AS name, c_desc AS excerpt, c_slug AS slug,
        c_tags AS tags, c_template AS template, c_protection AS protection, c_approval AS approval,
        c_lifecycle AS lifecycle, c_versioned AS versioned, c_versionid AS versionid,
        c_versionorder AS versionorder, c_seq AS sequence, c_groupid AS groupid, c_created AS created, c_revised AS revised
        FROM dmz_doc
        WHERE c_orgid=? AND c_template=`+s.IsFalse()+` AND c_spaceid IN
            (SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_location='space' AND c_refid=? AND c_refid IN
                (SELECT c_refid from dmz_permission WHERE c_orgid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0') AND c_location='space' AND c_action='view'
                UNION ALL
                SELECT p.c_refid from dmz_permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid WHERE p.c_orgid=?
                AND p.c_who='role' AND p.c_location='space' AND p.c_refid=? AND p.c_action='view' AND (r.c_userid=? OR r.c_userid='0')
                )
            )
        ORDER BY c_name, c_versionorder`),
		ctx.OrgID, ctx.OrgID, spaceID, ctx.OrgID, ctx.UserID, ctx.OrgID, spaceID, ctx.UserID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, "select documents by space")
	}

	// (SELECT c_refid FROM dmz_space WHERE c_orgid=? AND c_refid IN
	// )

	return
}

// TemplatesBySpace returns a slice containing the documents available as templates for given space.
func (s Store) TemplatesBySpace(ctx domain.RequestContext, spaceID string) (documents []doc.Document, err error) {
	err = s.Runtime.Db.Select(&documents, s.Bind(`
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_userid AS userid,
        c_job AS job, c_location AS location, c_name AS name, c_desc AS excerpt, c_slug AS slug,
        c_tags AS tags, c_template AS template, c_protection AS protection, c_approval AS approval,
        c_lifecycle AS lifecycle, c_versioned AS versioned, c_versionid AS versionid,
        c_versionorder AS versionorder, c_seq AS sequence, c_groupid AS groupid, c_created AS created, c_revised AS revised
        FROM dmz_doc
        WHERE c_orgid=? AND c_spaceid=? AND c_template=`+s.IsTrue()+` AND c_lifecycle=1
		AND c_spaceid IN
			(SELECT c_refid FROM dmz_space WHERE c_orgid=? AND c_refid IN
                (SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_location='space' AND c_refid IN
                    (SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0') AND c_location='space' AND c_action='view'
					UNION ALL
                	SELECT p.c_refid FROM dmz_permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid WHERE p.c_orgid=? AND p.c_who='role' AND p.c_location='space' AND p.c_action='view' AND (r.c_userid=? OR r.c_userid='0'))
				)
			)
        ORDER BY c_name`),
		ctx.OrgID, spaceID, ctx.OrgID, ctx.OrgID, ctx.OrgID, ctx.UserID, ctx.OrgID, ctx.UserID)

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
func (s Store) PublicDocuments(ctx domain.RequestContext, orgID string) (documents []doc.SitemapDocument, err error) {
	err = s.Runtime.Db.Select(&documents, s.Bind(`
        SELECT d.c_refid AS documentid, d.c_name AS document, d.c_revised as revised, l.c_refid AS spaceid, l.c_name AS space
        FROM dmz_doc d
        LEFT JOIN dmz_space l ON l.c_refid=d.c_spaceid
        WHERE d.c_orgid=? AND l.c_type=1 AND d.c_lifecycle=1 AND d.c_template=`+s.IsFalse()),
		orgID)

	if err == sql.ErrNoRows {
		err = nil
		documents = []doc.SitemapDocument{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute GetPublicDocuments for org %s", orgID))
	}

	return
}

// Update changes the given document record to the new values, updates search information and audits the action.
func (s Store) Update(ctx domain.RequestContext, document doc.Document) (err error) {
	document.Revised = time.Now().UTC()

	_, err = ctx.Transaction.NamedExec(s.Bind(`
        UPDATE dmz_doc SET
            c_spaceid=:spaceid, c_userid=:userid, c_job=:job, c_location=:location, c_name=:name,
            c_desc=:excerpt, c_slug=:slug, c_tags=:tags, c_template=:template,
            c_protection=:protection, c_approval=:approval, c_lifecycle=:lifecycle,
			c_versioned=:versioned, c_versionid=:versionid, c_versionorder=:versionorder,
			c_seq=:sequence,
            c_groupid=:groupid, c_revised=:revised
        WHERE c_orgid=:orgid AND c_refid=:refid`),
		&document)

	if err != nil {
		err = errors.Wrap(err, "document.store.Update")
	}

	return
}

// UpdateRevised sets document revision date to UTC now.
func (s Store) UpdateRevised(ctx domain.RequestContext, docID string) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind(`UPDATE dmz_doc SET c_revised=? WHERE c_orgid=? AND c_refid=?`),
		time.Now().UTC(), ctx.OrgID, docID)

	if err != nil {
		err = errors.Wrap(err, "document.store.UpdateRevised")
	}

	return
}

// UpdateGroup applies same values to all documents with the same group ID.
func (s Store) UpdateGroup(ctx domain.RequestContext, d doc.Document) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind(`UPDATE dmz_doc SET c_name=?, c_desc=? WHERE c_orgid=? AND c_groupid=?`),
		d.Name, d.Excerpt, ctx.OrgID, d.GroupID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, "document.store.UpdateGroup")
	}

	return
}

// ChangeDocumentSpace assigns the specified space to the document.
func (s Store) ChangeDocumentSpace(ctx domain.RequestContext, document, space string) (err error) {
	revised := time.Now().UTC()

	_, err = ctx.Transaction.Exec(s.Bind("UPDATE dmz_doc SET c_spaceid=?, c_revised=? WHERE c_orgid=? AND c_refid=?"),
		space, revised, ctx.OrgID, document)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute change document space %s", document))
	}

	return
}

// MoveDocumentSpace changes the space for client's organization's documents which have space "id", to "move".
func (s Store) MoveDocumentSpace(ctx domain.RequestContext, id, move string) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind("UPDATE dmz_doc SET c_spaceid=? WHERE c_orgid=? AND c_spaceid=?"),
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
func (s Store) MoveActivity(ctx domain.RequestContext, documentID, oldSpaceID, newSpaceID string) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind("UPDATE dmz_user_activity SET c_spaceid=? WHERE c_orgid=? AND c_spaceid=? AND c_docid=?"),
		newSpaceID, ctx.OrgID, oldSpaceID, documentID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute document activity move %s", documentID))
	}

	return
}

// Delete removes the specified document.
// Remove document pages, revisions, attachments, updates the search subsystem.
func (s Store) Delete(ctx domain.RequestContext, documentID string) (rows int64, err error) {
	ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_section WHERE c_orgid=? AND c_docid=?"), ctx.OrgID, documentID)
	ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_section_revision WHERE c_orgid=? AND c_docid=?"), ctx.OrgID, documentID)
	ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_doc_attachment WHERE c_orgid=? AND c_docid=?"), ctx.OrgID, documentID)
	ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_category_member WHERE c_orgid=? AND c_docid=?"), ctx.OrgID, documentID)
	ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_doc_vote WHERE c_orgid=? AND c_docid=?"), ctx.OrgID, documentID)

	return s.DeleteConstrained(ctx.Transaction, "dmz_doc", ctx.OrgID, documentID)
}

// DeleteBySpace removes all documents for given space.
// Remove document pages, revisions, attachments, updates the search subsystem.
func (s Store) DeleteBySpace(ctx domain.RequestContext, spaceID string) (rows int64, err error) {
	ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_section WHERE c_docid IN (SELECT c_refid FROM dmz_doc WHERE c_spaceid=? AND c_orgid=?)"), spaceID, ctx.OrgID)
	ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_section_revision WHERE c_docid IN (SELECT c_refid FROM dmz_doc WHERE c_spaceid=? AND c_orgid=?)"), spaceID, ctx.OrgID)
	ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_doc_attachment WHERE c_docid IN (SELECT c_refid FROM dmz_doc WHERE c_spaceid=? AND c_orgid=?)"), spaceID, ctx.OrgID)
	ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_doc_vote WHERE c_docid IN (SELECT c_refid FROM dmz_doc WHERE c_spaceid=? AND c_orgid=?)"), spaceID, ctx.OrgID)

	return s.DeleteConstrained(ctx.Transaction, "dmz_doc", ctx.OrgID, spaceID)
}

// GetVersions returns a slice containing the documents for a given space.
//
// No attempt is made to hide documents that are protected by category
// permissions hence caller must filter as required.
//
// All versions of a document are returned, hence caller must
// decide what to do with them.
func (s Store) GetVersions(ctx domain.RequestContext, groupID string) (v []doc.Version, err error) {
	v = []doc.Version{}

	err = s.Runtime.Db.Select(&v, s.Bind(`
        SELECT c_versionid AS versionid, c_refid As documentid, c_lifecycle AS lifecycle
		FROM dmz_doc
		WHERE c_orgid=? AND c_groupid=?
        ORDER BY c_versionorder`),
		ctx.OrgID, groupID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, "document.store.GetVersions")
	}

	return
}

// Pin allocates sequence number to specified document so that it appears
// at the documents list.
func (s Store) Pin(ctx domain.RequestContext, documentID string, seq int) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind("UPDATE dmz_doc SET c_seq=? WHERE c_orgid=? AND c_refid=?"),
		seq, ctx.OrgID, documentID)

	if err != nil {
		err = errors.Wrap(err, "document.store.Pin")
	}

	return
}

// Unpin resets sequence number for given document.
func (s Store) Unpin(ctx domain.RequestContext, documentID string) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind("UPDATE dmz_doc SET c_seq=? WHERE c_orgid=? AND c_refid=?"),
		doc.Unsequenced, ctx.OrgID, documentID)

	if err != nil {
		err = errors.Wrap(err, "document.store.Unpin")
	}

	return
}

// PinSequence fectches pinned documents and returns current
// maximum sequence value.
func (s Store) PinSequence(ctx domain.RequestContext, spaceID string) (max int, err error) {
	max = 0

	err = s.Runtime.Db.Get(&max, s.Bind(`
        SELECT COALESCE(MAX(c_seq), 0)
		FROM dmz_doc
		WHERE c_orgid=? AND c_spaceid=?
        AND c_seq != 99999`),
		ctx.OrgID, spaceID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		max = doc.Unsequenced
		err = errors.Wrap(err, "document.store.PinSequence")
	}

	return
}

// Pinned documents for space are fetched.
func (s Store) Pinned(ctx domain.RequestContext, spaceID string) (d []doc.Document, err error) {
	d = []doc.Document{}

	err = s.Runtime.Db.Select(&d, s.Bind(`
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_userid AS userid,
        c_job AS job, c_location AS location, c_name AS name, c_desc AS excerpt, c_slug AS slug,
        c_tags AS tags, c_template AS template, c_protection AS protection, c_approval AS approval,
        c_lifecycle AS lifecycle, c_versioned AS versioned, c_versionid AS versionid,
        c_versionorder AS versionorder, c_seq AS sequence, c_groupid AS groupid,
	    c_created AS created, c_revised AS revised
        FROM dmz_doc
		WHERE c_orgid=? AND c_spaceid=?
        AND c_seq != 99999
	    ORDER BY c_seq`),
		ctx.OrgID, spaceID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, "document.store.Pinned")
	}

	return
}
