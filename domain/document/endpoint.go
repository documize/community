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
	"encoding/json"
	"io/ioutil"
	"net/http"
	"net/url"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/domain"
	indexer "github.com/documize/community/domain/search"
	"github.com/documize/community/domain/space"
	"github.com/documize/community/model/activity"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/link"
	"github.com/documize/community/model/search"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *domain.Store
	Indexer indexer.Indexer
}

// Get is an endpoint that returns the document-level information for a given documentID.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	method := "document.get"
	ctx := domain.GetRequestContext(r)

	id := request.Param(r, "documentID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	document, err := h.Store.Document.Get(ctx, id)
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, id)
		return
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	if CanViewDocumentInFolder(ctx, *h.Store, document.LabelID) {
		response.WriteForbiddenError(w)
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		LabelID:      document.LabelID,
		SourceID:     document.RefID,
		SourceType:   activity.SourceTypeDocument,
		ActivityType: activity.TypeRead})

	h.Store.Audit.Record(ctx, audit.EventTypeDocumentView)

	ctx.Transaction.Commit()

	response.WriteJSON(w, document)
}

// Activity is an endpoint returning the activity logs for specified document.
func (h *Handler) Activity(w http.ResponseWriter, r *http.Request) {
	method := "document.activity"
	ctx := domain.GetRequestContext(r)

	id := request.Param(r, "documentID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	a, err := h.Store.Activity.GetDocumentActivity(ctx, id)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}

	response.WriteJSON(w, a)
}

// DocumentLinks is an endpoint returning the links for a document.
func (h *Handler) DocumentLinks(w http.ResponseWriter, r *http.Request) {
	method := "document.links"
	ctx := domain.GetRequestContext(r)

	id := request.Param(r, "documentID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	l, err := h.Store.Link.GetDocumentOutboundLinks(ctx, id)

	if len(l) == 0 {
		l = []link.Link{}
	}

	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}

	response.WriteJSON(w, l)
}

// BySpace is an endpoint that returns the documents in a given folder.
func (h *Handler) BySpace(w http.ResponseWriter, r *http.Request) {
	method := "document.space"
	ctx := domain.GetRequestContext(r)

	folderID := request.Query(r, "folder")

	if len(folderID) == 0 {
		response.WriteMissingDataError(w, method, "folder")
		return
	}

	if !space.CanViewSpace(ctx, *h.Store, folderID) {
		response.WriteForbiddenError(w)
		return
	}

	documents, err := h.Store.Document.GetBySpace(ctx, folderID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}

	if len(documents) == 0 {
		documents = []doc.Document{}
	}

	response.WriteJSON(w, documents)
}

// ByTag is an endpoint that returns the documents with a given tag.
func (h *Handler) ByTag(w http.ResponseWriter, r *http.Request) {
	method := "document.space"
	ctx := domain.GetRequestContext(r)

	tag := request.Query(r, "tag")
	if len(tag) == 0 {
		response.WriteMissingDataError(w, method, "tag")
		return
	}

	documents, err := h.Store.Document.GetByTag(ctx, tag)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}

	if len(documents) == 0 {
		documents = []doc.Document{}
	}

	response.WriteJSON(w, documents)
}

// Update updates an existing document using the
// format described in NewDocumentModel() encoded as JSON in the request.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	method := "document.space"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	if !ctx.Editor {
		response.WriteForbiddenError(w)
		return
	}

	if !CanChangeDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		return
	}

	d := doc.Document{}
	err = json.Unmarshal(body, &d)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		return
	}

	d.RefID = documentID

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	err = h.Store.Document.Update(ctx, d)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	h.Store.Audit.Record(ctx, audit.EventTypeDocumentUpdate)

	ctx.Transaction.Commit()

	h.Indexer.UpdateDocument(ctx, d)

	response.WriteEmpty(w)
}

// Delete is an endpoint that deletes a document specified by documentID.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	method := "document.delete"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	if !CanChangeDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	doc, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	_, err = h.Store.Document.Delete(ctx, documentID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	_, err = h.Store.Pin.DeletePinnedDocument(ctx, documentID)
	if err != nil && err != sql.ErrNoRows {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	h.Store.Link.MarkOrphanDocumentLink(ctx, documentID)
	h.Store.Link.DeleteSourceDocumentLinks(ctx, documentID)

	h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		LabelID:      doc.LabelID,
		SourceID:     documentID,
		SourceType:   activity.SourceTypeDocument,
		ActivityType: activity.TypeDeleted})

	h.Store.Audit.Record(ctx, audit.EventTypeDocumentDelete)

	ctx.Transaction.Commit()

	h.Indexer.DeleteDocument(ctx, documentID)

	response.WriteEmpty(w)
}

// SearchDocuments endpoint takes a list of keywords and returns a list of document references matching those keywords.
func (h *Handler) SearchDocuments(w http.ResponseWriter, r *http.Request) {
	method := "document.search"
	ctx := domain.GetRequestContext(r)

	keywords := request.Query(r, "keywords")
	decoded, err := url.QueryUnescape(keywords)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		return
	}

	results, err := h.Store.Search.Documents(ctx, decoded)
	if err != nil {
		h.Runtime.Log.Error("search failed", err)
	}

	// Put in slugs for easy UI display of search URL
	for key, result := range results {
		result.DocumentSlug = stringutil.MakeSlug(result.DocumentTitle)
		result.FolderSlug = stringutil.MakeSlug(result.LabelName)
		results[key] = result
	}

	if len(results) == 0 {
		results = []search.DocumentSearch{}
	}

	h.Store.Audit.Record(ctx, audit.EventTypeSearch)

	response.WriteJSON(w, results)
}
