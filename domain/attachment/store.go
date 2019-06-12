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

package attachment

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/attachment"
	"github.com/pkg/errors"
)

// Store provides data access to document/section attachments information.
type Store struct {
	store.Context
	store.AttachmentStorer
}

// Add inserts the given record into the database attachment table.
func (s Store) Add(ctx domain.RequestContext, a attachment.Attachment) (err error) {
	a.OrgID = ctx.OrgID
	a.Created = time.Now().UTC()
	a.Revised = time.Now().UTC()
	if len(a.Extension) == 0 {
		bits := strings.Split(a.Filename, ".")
		a.Extension = bits[len(bits)-1]
	}

	_, err = ctx.Transaction.Exec(s.Bind("INSERT INTO dmz_doc_attachment (c_refid, c_orgid, c_docid, c_sectionid, c_job, c_fileid, c_filename, c_data, c_extension, c_created, c_revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"),
		a.RefID, a.OrgID, a.DocumentID, a.SectionID, a.Job, a.FileID, a.Filename, a.Data, a.Extension, a.Created, a.Revised)

	if err != nil {
		err = errors.Wrap(err, "execute insert attachment")
	}

	return
}

// GetAttachment returns the database attachment record specified by the parameters.
func (s Store) GetAttachment(ctx domain.RequestContext, orgID, attachmentID string) (a attachment.Attachment, err error) {
	err = s.Runtime.Db.Get(&a, s.Bind(`
        SELECT id, c_refid AS refid,
        c_orgid AS orgid, c_docid AS documentid, c_sectionid AS sectionid, c_job AS job, c_fileid AS fileid,
        c_filename AS filename, c_data AS data, c_extension AS extension,
        c_created AS created, c_revised AS revised
        FROM dmz_doc_attachment
        WHERE c_orgid=? and c_refid=?`),
		orgID, attachmentID)

	if err != nil {
		err = errors.Wrap(err, "execute select attachment")
	}

	return
}

// GetAttachments returns a slice containing the attachment records (excluding their data) for document docID, ordered by filename.
func (s Store) GetAttachments(ctx domain.RequestContext, docID string) (a []attachment.Attachment, err error) {
	err = s.Runtime.Db.Select(&a, s.Bind(`
        SELECT id, c_refid AS refid,
        c_orgid AS orgid, c_docid AS documentid, c_sectionid AS sectionid, c_job AS job, c_fileid AS fileid,
        c_filename AS filename, c_extension AS extension,
        c_created AS created, c_revised AS revised
        FROM dmz_doc_attachment
        WHERE c_orgid=? AND c_docid=?
        ORDER BY c_filename`),
		ctx.OrgID, docID)

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

// GetSectionAttachments returns a slice containing the attachment records
// with file  data for specified document section.
func (s Store) GetSectionAttachments(ctx domain.RequestContext, sectionID string) (a []attachment.Attachment, err error) {
	err = s.Runtime.Db.Select(&a, s.Bind(`
        SELECT id, c_refid AS refid,
        c_orgid AS orgid, c_docid AS documentid, c_sectionid AS sectionid, c_job AS job, c_fileid AS fileid,
        c_filename AS filename, c_data AS data, c_extension AS extension,
        c_created AS created, c_revised AS revised
        FROM dmz_doc_attachment
        WHERE c_orgid=? AND c_sectionid=?
        ORDER BY c_filename`),
		ctx.OrgID, sectionID)

	if err == sql.ErrNoRows {
		err = nil
		a = []attachment.Attachment{}
	}
	if err != nil {
		err = errors.Wrap(err, "execute select section attachments")
		return
	}

	return
}

// GetAttachmentsWithData returns a slice containing the attachment records (including their data) for document docID, ordered by filename.
func (s Store) GetAttachmentsWithData(ctx domain.RequestContext, docID string) (a []attachment.Attachment, err error) {
	err = s.Runtime.Db.Select(&a, s.Bind(`
        SELECT id, c_refid AS refid,
        c_orgid AS orgid, c_docid AS documentid, c_sectionid AS sectionid, c_job AS job, c_fileid AS fileid,
        c_filename AS filename, c_data AS data, c_extension AS extension,
        c_created AS created, c_revised AS revised
        FROM dmz_doc_attachment
        WHERE c_orgid=? and c_docid=?
        ORDER BY c_filename`),
		ctx.OrgID, docID)

	if err == sql.ErrNoRows {
		err = nil
		a = []attachment.Attachment{}
	}

	if err != nil {
		err = errors.Wrap(err, "execute select attachments with data")
	}

	return
}

// Delete deletes the id record from the database attachment table.
func (s Store) Delete(ctx domain.RequestContext, id string) (rows int64, err error) {
	return s.DeleteConstrained(ctx.Transaction, "dmz_doc_attachment", ctx.OrgID, id)
}

// DeleteSection removes all attachments agasinst a section.
func (s Store) DeleteSection(ctx domain.RequestContext, sectionID string) (rows int64, err error) {
	rows, err = s.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM dmz_doc_attachment WHERE c_orgid='%s' AND c_sectionid='%s'",
		ctx.OrgID, sectionID))

	return
}
