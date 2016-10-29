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

package request

import (
	"fmt"
	"strings"
	"time"

	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/utility"
)

// AddAttachment inserts the given record into the database attachement table.
func (p *Persister) AddAttachment(a entity.Attachment) (err error) {
	a.OrgID = p.Context.OrgID
	a.Created = time.Now().UTC()
	a.Revised = time.Now().UTC()
	bits := strings.Split(a.Filename, ".")
	a.Extension = bits[len(bits)-1]

	stmt, err := p.Context.Transaction.Preparex("INSERT INTO attachment (refid, orgid, documentid, job, fileid, filename, data, extension, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer utility.Close(stmt)

	if err != nil {
		log.Error("Unable to prepare insert for attachment", err)
		return
	}

	_, err = stmt.Exec(a.RefID, a.OrgID, a.DocumentID, a.Job, a.FileID, a.Filename, a.Data, a.Extension, a.Created, a.Revised)

	if err != nil {
		log.Error("Unable to execute insert for attachment", err)
		return
	}

	return
}

// GetAttachment returns the database attachment record specified by the parameters.
func (p *Persister) GetAttachment(orgID, attachmentID string) (attachment entity.Attachment, err error) {

	err = nil

	stmt, err := Db.Preparex("SELECT id, refid, orgid, documentid, job, fileid, filename, data, extension, created, revised FROM attachment WHERE orgid=? and refid=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare select for attachment %s", attachmentID), err)
		return
	}

	err = stmt.Get(&attachment, orgID, attachmentID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select for attachment %s", attachmentID), err)
		return
	}

	return
}

// GetAttachments returns a slice containing the attachement records (excluding their data) for document docID, ordered by filename.
func (p *Persister) GetAttachments(docID string) (attachments []entity.Attachment, err error) {

	err = nil

	err = Db.Select(&attachments, "SELECT id, refid, orgid, documentid, job, fileid, filename, extension, created, revised FROM attachment WHERE orgid=? and documentid=? order by filename", p.Context.OrgID, docID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select attachments for org %s docID %s", p.Context.OrgID, docID), err)
		return
	}

	return
}

// GetAttachmentsWithData returns a slice containing the attachement records (including their data) for document docID, ordered by filename.
func (p *Persister) GetAttachmentsWithData(docID string) (attachments []entity.Attachment, err error) {

	err = nil

	err = Db.Select(&attachments, "SELECT id, refid, orgid, documentid, job, fileid, filename, extension, data, created, revised FROM attachment WHERE orgid=? and documentid=? order by filename", p.Context.OrgID, docID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select attachments for org %s docID %s", p.Context.OrgID, docID), err)
		return
	}

	return
}

// DeleteAttachment deletes the id record from the database attachment table.
func (p *Persister) DeleteAttachment(id string) (rows int64, err error) {
	rows, err = p.Base.DeleteConstrained(p.Context.Transaction, "attachment", p.Context.OrgID, id)

	// Mark references to this document as orphaned
	err = p.MarkOrphanAttachmentLink(id)

	return
}
