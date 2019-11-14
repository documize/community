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
	"io"
	"mime"
	"net/http"
	"strings"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/auth"
	"github.com/documize/community/domain/organization"
	"github.com/documize/community/domain/permission"
	indexer "github.com/documize/community/domain/search"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/attachment"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/space"
	"github.com/documize/community/model/workflow"
	uuid "github.com/nu7hatch/gouuid"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
	Indexer indexer.Indexer
}

// Download sends requested file to the client/browser.
func (h *Handler) Download(w http.ResponseWriter, r *http.Request) {
	method := "attachment.Download"
	ctx := domain.GetRequestContext(r)
	ctx.Subdomain = organization.GetSubdomainFromHost(r)
	ctx.OrgID = request.Param(r, "orgID")

	// Is caller permitted to download this attachment?
	canDownload := false

	// Do e have user authentication token?
	authToken := strings.TrimSpace(request.Query(r, "token"))

	// Do we have secure sharing token (for external users)?
	secureToken := strings.TrimSpace(request.Query(r, "secure"))

	// We now fetch attachment, the document and space it lives inside.
	// Any data loading issue spells the end of this request.

	// Get attachment being requested.
	a, err := h.Store.Attachment.GetAttachment(ctx, ctx.OrgID, request.Param(r, "attachmentID"))
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, request.Param(r, "attachmentID"))
		return
	}
	if err != nil {
		h.Runtime.Log.Error("get attachment", err)
		response.WriteServerError(w, method, err)
		return
	}

	// Get the document for this attachment
	doc, err := h.Store.Document.Get(ctx, a.DocumentID)
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, a.DocumentID)
		return
	}
	if err != nil {
		h.Runtime.Log.Error("get attachment document", err)
		response.WriteServerError(w, method, err)
		return
	}

	// Get the space for this attachment.
	sp, err := h.Store.Space.Get(ctx, doc.SpaceID)
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, a.DocumentID)
		return
	}
	if err != nil {
		h.Runtime.Log.Error("get attachment document", err)
		response.WriteServerError(w, method, err)
		return
	}

	// Get the organization for this request.
	org, err := h.Store.Organization.GetOrganization(ctx, ctx.OrgID)
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, a.DocumentID)
		return
	}
	if err != nil {
		h.Runtime.Log.Error("get attachment org", err)
		response.WriteServerError(w, method, err)
		return
	}

	// At this point, all data associated data is loaded.
	// We now begin security checks based upon the request.

	// If attachment is in public space then anyone can download
	if org.AllowAnonymousAccess && sp.Type == space.ScopePublic {
		canDownload = true
	}

	// External users can be sent secure document viewing links.
	// Those documents may contain attachments that external viewers
	// can download as required.
	// Such secure document viewing links can have expiry dates.
	if !canDownload && len(secureToken) > 0 {
		canDownload = true
	}

	// If an user authentication token was provided we check to see
	// if user can view document.
	// This check only applies to attachments NOT in public spaces.
	if !canDownload && len(authToken) > 0 {
		// Decode and check incoming token.
		creds, _, err := auth.DecodeJWT(h.Runtime, authToken)
		if err != nil {
			h.Runtime.Log.Error("get attachment decode auth token", err)
			response.WriteForbiddenError(w)
			return
		}
		// Check for tampering.
		if ctx.OrgID != creds.OrgID {
			h.Runtime.Log.Error("get attachment org ID mismatch", err)
			response.WriteForbiddenError(w)
			return
		}

		// Use token-based user ID for subsequent processing.
		ctx.UserID = creds.UserID

		// Check to see if user can view BOTH space and document.
		if !permission.CanViewSpace(ctx, *h.Store, sp.RefID) || !permission.CanViewDocument(ctx, *h.Store, a.DocumentID) {
			h.Runtime.Log.Error("get attachment cannot view document", err)
			response.WriteServerError(w, method, err)
			return
		}

		// Authenticated user can view attachment.
		canDownload = true
	}

	if !canDownload && len(secureToken) == 0 && len(authToken) == 0 {
		h.Runtime.Log.Error("get attachment received no access token", err)
		response.WriteForbiddenError(w)
		return
	}

	// Send back error if caller unable view attachment
	if !canDownload {
		h.Runtime.Log.Error("get attachment refused", err)
		response.WriteForbiddenError(w)
		return
	}

	// At this point, user can view attachment so we send it back!
	typ := mime.TypeByExtension("." + a.Extension)
	if typ == "" {
		typ = "application/octet-stream"
	}

	dataSize := len(a.Data)

	// w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", typ)
	w.Header().Set("Content-Disposition", `Attachment; filename="`+a.Filename+`" ; `+`filename*="`+a.Filename+`"`)
	if dataSize != 0 {
		w.Header().Set("Content-Length", string(dataSize))
	}

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

	// File can be associated with a section as well.
	sectionID := request.Query(r, "page")

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
	a.SectionID = sectionID

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
