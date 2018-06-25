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
	"bytes"
	"database/sql"
	"fmt"
	"io"
	"mime"
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/organization"
	"github.com/documize/community/domain/permission"
	indexer "github.com/documize/community/domain/search"
	"github.com/documize/community/model/attachment"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/workflow"
	uuid "github.com/nu7hatch/gouuid"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *domain.Store
	Indexer indexer.Indexer
}

// Download sends requested file to the client/browser.
func (h *Handler) Download(w http.ResponseWriter, r *http.Request) {
	method := "attachment.Download"
	ctx := domain.GetRequestContext(r)
	ctx.Subdomain = organization.GetSubdomainFromHost(r)

	a, err := h.Store.Attachment.GetAttachment(ctx, request.Param(r, "orgID"), request.Param(r, "attachmentID"))

	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, request.Param(r, "fileID"))
		return
	}
	if err != nil {
		h.Runtime.Log.Error("get attachment", err)
		response.WriteServerError(w, method, err)
		return
	}

	typ := mime.TypeByExtension("." + a.Extension)
	if typ == "" {
		typ = "application/octet-stream"
	}

	w.Header().Set("Content-Type", typ)
	w.Header().Set("Content-Disposition", `Attachment; filename="`+a.Filename+`" ; `+`filename*="`+a.Filename+`"`)
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(a.Data)))
	w.WriteHeader(http.StatusOK)

	_, err = w.Write(a.Data)
	if err != nil {
		h.Runtime.Log.Error("write attachment", err)
		return
	}

	h.Store.Audit.Record(ctx, audit.EventTypeAttachmentDownload)
}

// Get is an end-point that returns all of the attachments of a particular documentID.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	method := "attachment.GetAttachments"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	if !permission.CanViewDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	a, err := h.Store.Attachment.GetAttachments(ctx, documentID)
	if err != nil && err != sql.ErrNoRows {
		h.Runtime.Log.Error("get attachment", err)
		response.WriteServerError(w, method, err)
		return
	}

	if len(a) == 0 {
		a = []attachment.Attachment{}
	}

	response.WriteJSON(w, a)
}

// Delete is an endpoint that deletes a particular document attachment.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	method := "attachment.DeleteAttachment"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	attachmentID := request.Param(r, "attachmentID")
	if len(attachmentID) == 0 {
		response.WriteMissingDataError(w, method, "attachmentID")
		return
	}

	if !permission.CanChangeDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	var err error
	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		h.Runtime.Log.Error("transaction", err)
		response.WriteServerError(w, method, err)
		return
	}

	_, err = h.Store.Attachment.Delete(ctx, attachmentID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error("delete attachment", err)
		return
	}

	// Mark references to this document as orphaned
	err = h.Store.Link.MarkOrphanAttachmentLink(ctx, attachmentID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error("delete attachment links", err)
		return
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeAttachmentDelete)

	a, _ := h.Store.Attachment.GetAttachments(ctx, documentID)
	d, _ := h.Store.Document.Get(ctx, documentID)

	if d.Lifecycle == workflow.LifecycleLive {
		go h.Indexer.IndexDocument(ctx, d, a)
	} else {
		go h.Indexer.DeleteDocument(ctx, d.RefID)
	}

	response.WriteEmpty(w)
}

// Add stores files against a document.
func (h *Handler) Add(w http.ResponseWriter, r *http.Request) {
	method := "attachment.Add"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	if !permission.CanChangeDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	filedata, filename, err := r.FormFile("attachment")
	if err != nil {
		response.WriteMissingDataError(w, method, "attachment")
		return
	}

	b := new(bytes.Buffer)
	_, err = io.Copy(b, filedata)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error("add attachment", err)
		return
	}

	var job = "some-uuid"
	newUUID, err := uuid.NewV4()
	if err != nil {
		h.Runtime.Log.Error("uuid", err)
		response.WriteServerError(w, method, err)
		return
	}
	job = newUUID.String()

	var a attachment.Attachment
	refID := uniqueid.Generate()
	a.RefID = refID
	a.DocumentID = documentID
	a.Job = job
	random := secrets.GenerateSalt()
	a.FileID = random[0:9]
	a.Filename = filename.Filename
	a.Data = b.Bytes()

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error("transaction", err)
		return
	}

	err = h.Store.Attachment.Add(ctx, a)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error("add attachment", err)
		return
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeAttachmentAdd)

	all, _ := h.Store.Attachment.GetAttachments(ctx, documentID)
	d, _ := h.Store.Document.Get(ctx, documentID)

	if d.Lifecycle == workflow.LifecycleLive {
		go h.Indexer.IndexDocument(ctx, d, all)
	} else {
		go h.Indexer.DeleteDocument(ctx, d.RefID)
	}

	response.WriteEmpty(w)
}
