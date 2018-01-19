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
	"sort"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/permission"
	indexer "github.com/documize/community/domain/search"
	"github.com/documize/community/model/activity"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/link"
	pm "github.com/documize/community/model/permission"
	"github.com/documize/community/model/search"
	"github.com/documize/community/model/space"
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
		h.Runtime.Log.Error(method, err)
		return
	}

	if !permission.CanViewSpaceDocument(ctx, *h.Store, document.LabelID) {
		response.WriteForbiddenError(w)
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		LabelID:      document.LabelID,
		DocumentID:   document.RefID,
		SourceType:   activity.SourceTypeDocument,
		ActivityType: activity.TypeRead})

	if err != nil {
		h.Runtime.Log.Error(method, err)
	}

	h.Store.Audit.Record(ctx, audit.EventTypeDocumentView)

	ctx.Transaction.Commit()

	response.WriteJSON(w, document)
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
		h.Runtime.Log.Error(method, err)
		return
	}

	response.WriteJSON(w, l)
}

// BySpace is an endpoint that returns the documents for given space.
func (h *Handler) BySpace(w http.ResponseWriter, r *http.Request) {
	method := "document.BySpace"
	ctx := domain.GetRequestContext(r)

	spaceID := request.Query(r, "space")
	if len(spaceID) == 0 {
		response.WriteMissingDataError(w, method, "space")
		return
	}

	if !permission.CanViewSpace(ctx, *h.Store, spaceID) {
		response.WriteForbiddenError(w)
		return
	}

	// get complete list of documents
	documents, err := h.Store.Document.GetBySpace(ctx, spaceID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	if len(documents) == 0 {
		documents = []doc.Document{}
	}

	sort.Sort(doc.ByTitle(documents))

	// remove documents that cannot be seen due to lack of
	// category view/access permission
	filtered := []doc.Document{}
	cats, err := h.Store.Category.GetBySpace(ctx, spaceID)
	members, err := h.Store.Category.GetSpaceCategoryMembership(ctx, spaceID)

	for _, doc := range documents {
		hasCategory := false
		canSeeCategory := false

	OUTER:

		for _, m := range members {
			if m.DocumentID == doc.RefID {
				hasCategory = true
				for _, cat := range cats {
					if cat.RefID == m.CategoryID {
						canSeeCategory = true
						continue OUTER
					}
				}
			}
		}

		if !hasCategory || canSeeCategory {
			filtered = append(filtered, doc)
		}
	}

	response.WriteJSON(w, filtered)
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

	if !permission.CanChangeDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	d := doc.Document{}
	err = json.Unmarshal(body, &d)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	d.RefID = documentID

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// if space changed for document, remove document categories
	oldDoc, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if oldDoc.LabelID != d.LabelID {
		h.Store.Category.RemoveDocumentCategories(ctx, d.RefID)
	}

	err = h.Store.Document.Update(ctx, d)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Audit.Record(ctx, audit.EventTypeDocumentUpdate)

	ctx.Transaction.Commit()

	a, _ := h.Store.Attachment.GetAttachments(ctx, documentID)
	go h.Indexer.IndexDocument(ctx, d, a)

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

	if !permission.CanDeleteDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	doc, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	_, err = h.Store.Document.Delete(ctx, documentID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	_, err = h.Store.Pin.DeletePinnedDocument(ctx, documentID)
	if err != nil && err != sql.ErrNoRows {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Link.MarkOrphanDocumentLink(ctx, documentID)
	h.Store.Link.DeleteSourceDocumentLinks(ctx, documentID)

	h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		LabelID:      doc.LabelID,
		DocumentID:   documentID,
		SourceType:   activity.SourceTypeDocument,
		ActivityType: activity.TypeDeleted})

	h.Store.Audit.Record(ctx, audit.EventTypeDocumentDelete)

	ctx.Transaction.Commit()

	go h.Indexer.DeleteDocument(ctx, documentID)

	response.WriteEmpty(w)
}

// SearchDocuments endpoint takes a list of keywords and returns a list of document references matching those keywords.
func (h *Handler) SearchDocuments(w http.ResponseWriter, r *http.Request) {
	method := "document.search"
	ctx := domain.GetRequestContext(r)

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	options := search.QueryOptions{}
	err = json.Unmarshal(body, &options)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	results, err := h.Store.Search.Documents(ctx, options)
	if err != nil {
		h.Runtime.Log.Error(method, err)
	}

	// Put in slugs for easy UI display of search URL
	for key, result := range results {
		result.DocumentSlug = stringutil.MakeSlug(result.Document)
		result.SpaceSlug = stringutil.MakeSlug(result.Space)
		results[key] = result
	}

	if len(results) == 0 {
		results = []search.QueryResult{}
	}

	h.Store.Audit.Record(ctx, audit.EventTypeSearch)

	response.WriteJSON(w, results)
}

// FetchDocumentData returns all document data in single API call.
func (h *Handler) FetchDocumentData(w http.ResponseWriter, r *http.Request) {
	method := "document.FetchDocumentData"
	ctx := domain.GetRequestContext(r)

	id := request.Param(r, "documentID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	// document
	document, err := h.Store.Document.Get(ctx, id)
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, id)
		return
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if !permission.CanViewSpaceDocument(ctx, *h.Store, document.LabelID) {
		response.WriteForbiddenError(w)
		return
	}

	// permissions
	perms, err := h.Store.Permission.GetUserSpacePermissions(ctx, document.LabelID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}
	if len(perms) == 0 {
		perms = []pm.Permission{}
	}
	record := pm.DecodeUserPermissions(perms)

	roles, err := h.Store.Permission.GetUserDocumentPermissions(ctx, document.RefID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}
	if len(roles) == 0 {
		roles = []pm.Permission{}
	}
	rolesRecord := pm.DecodeUserDocumentPermissions(roles)

	// links
	l, err := h.Store.Link.GetDocumentOutboundLinks(ctx, id)
	if len(l) == 0 {
		l = []link.Link{}
	}
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// spaces
	sp, err := h.Store.Space.GetViewable(ctx)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	if len(sp) == 0 {
		sp = []space.Space{}
	}

	data := documentData{}
	data.Document = document
	data.Permissions = record
	data.Roles = rolesRecord
	data.Links = l
	data.Spaces = sp

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		LabelID:      document.LabelID,
		DocumentID:   document.RefID,
		SourceType:   activity.SourceTypeDocument,
		ActivityType: activity.TypeRead})

	if err != nil {
		h.Runtime.Log.Error(method, err)
	}

	h.Store.Audit.Record(ctx, audit.EventTypeDocumentView)

	ctx.Transaction.Commit()

	response.WriteJSON(w, data)
}

// documentData represents all data associated for a single document.
// Used by FetchDocumentData() bulk data load call.
type documentData struct {
	Document    doc.Document      `json:"document"`
	Permissions pm.Record         `json:"permissions"`
	Roles       pm.DocumentRecord `json:"roles"`
	Spaces      []space.Space     `json:"folders"`
	Links       []link.Link       `json:"link"`
}
