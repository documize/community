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
	"strings"
	"time"

	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store/mysql"
	"github.com/pkg/errors"

	"github.com/documize/community/core/env"
	"github.com/documize/community/model/attachment"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// Add inserts the given record into the database attachement table.
func (s Scope) Add(ctx domain.RequestContext, a attachment.Attachment) (err error) {
	a.OrgID = ctx.OrgID
	a.Created = time.Now().UTC()
	a.Revised = time.Now().UTC()
	bits := strings.Split(a.Filename, ".")
	a.Extension = bits[len(bits)-1]

	_, err = ctx.Transaction.Exec("INSERT INTO attachment (refid, orgid, documentid, job, fileid, filename, data, extension, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		a.RefID, a.OrgID, a.DocumentID, a.Job, a.FileID, a.Filename, a.Data, a.Extension, a.Created, a.Revised)

	if err != nil {
		err = errors.Wrap(err, "execute insert attachment")
	}

	return
}

// GetAttachment returns the database attachment record specified by the parameters.
func (s Scope) GetAttachment(ctx domain.RequestContext, orgID, attachmentID string) (a attachment.Attachment, err error) {
	err = s.Runtime.Db.Get(&a, "SELECT id, refid, orgid, documentid, job, fileid, filename, data, extension, created, revised FROM attachment WHERE orgid=? and refid=?",
		orgID, attachmentID)

	if err != nil {
		err = errors.Wrap(err, "execute select attachment")
	}

	return
}

// GetAttachments returns a slice containing the attachement records (excluding their data) for document docID, ordered by filename.
func (s Scope) GetAttachments(ctx domain.RequestContext, docID string) (a []attachment.Attachment, err error) {
	err = s.Runtime.Db.Select(&a, "SELECT id, refid, orgid, documentid, job, fileid, filename, extension, created, revised FROM attachment WHERE orgid=? and documentid=? order by filename", ctx.OrgID, docID)

	if err != nil {
		err = errors.Wrap(err, "execute select attachments")
	}

	return
}

// GetAttachmentsWithData returns a slice containing the attachement records (including their data) for document docID, ordered by filename.
func (s Scope) GetAttachmentsWithData(ctx domain.RequestContext, docID string) (a []attachment.Attachment, err error) {
	err = s.Runtime.Db.Select(&a, "SELECT id, refid, orgid, documentid, job, fileid, filename, extension, data, created, revised FROM attachment WHERE orgid=? and documentid=? order by filename", ctx.OrgID, docID)

	if err != nil {
		err = errors.Wrap(err, "execute select attachments with data")
	}

	return
}

// Delete deletes the id record from the database attachment table.
func (s Scope) Delete(ctx domain.RequestContext, id string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	return b.DeleteConstrained(ctx.Transaction, "attachment", ctx.OrgID, id)
}
