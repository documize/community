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

package page

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/document"
	"github.com/documize/community/domain/link"
	indexer "github.com/documize/community/domain/search"
	"github.com/documize/community/domain/section/provider"
	"github.com/documize/community/model/activity"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/page"
	htmldiff "github.com/documize/html-diff"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *domain.Store
	Indexer indexer.Indexer
}

// Add inserts new section into document.
func (h *Handler) Add(w http.ResponseWriter, r *http.Request) {
	method := "page.add"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	if !document.CanChangeDocument(ctx, *h.Store, documentID) {
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

	model := new(page.NewPage)
	err = json.Unmarshal(body, &model)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	if model.Page.DocumentID != documentID {
		response.WriteBadRequestError(w, method, "documentID mismatch")
		return
	}

	if model.Meta.DocumentID != documentID {
		response.WriteBadRequestError(w, method, "documentID mismatch")
		return
	}

	pageID := uniqueid.Generate()
	model.Page.RefID = pageID
	model.Meta.PageID = pageID
	model.Meta.OrgID = ctx.OrgID   // required for Render call below
	model.Meta.UserID = ctx.UserID // required for Render call below
	model.Page.SetDefaults()
	model.Meta.SetDefaults()
	// page.Title = template.HTMLEscapeString(page.Title)

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

	output, ok := provider.Render(model.Page.ContentType, provider.NewContext(model.Meta.OrgID, model.Meta.UserID, ctx), model.Meta.Config, model.Meta.RawBody)
	if !ok {
		h.Runtime.Log.Info("provider.Render could not find: " + model.Page.ContentType)
	}

	model.Page.Body = output

	err = h.Store.Page.Add(ctx, *model)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if len(model.Page.BlockID) > 0 {
		h.Store.Block.IncrementUsage(ctx, model.Page.BlockID)
	}

	h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		LabelID:      doc.LabelID,
		SourceID:     model.Page.DocumentID,
		SourceType:   activity.SourceTypeDocument,
		ActivityType: activity.TypeCreated})

	h.Store.Audit.Record(ctx, audit.EventTypeSectionAdd)

	ctx.Transaction.Commit()

	np, _ := h.Store.Page.Get(ctx, pageID)

	h.Indexer.Add(ctx, np, pageID)

	response.WriteJSON(w, np)
}

// GetPage gets specified page for document.
func (h *Handler) GetPage(w http.ResponseWriter, r *http.Request) {
	method := "page.GetPage"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	pageID := request.Param(r, "pageID")
	if len(pageID) == 0 {
		response.WriteMissingDataError(w, method, "pageID")
		return
	}

	if !document.CanViewDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	page, err := h.Store.Page.Get(ctx, pageID)
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, documentID)
		return
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if page.DocumentID != documentID {
		response.WriteBadRequestError(w, method, "documentID mismatch")
		return
	}

	response.WriteJSON(w, page)
}

// GetPages gets all pages for document.
func (h *Handler) GetPages(w http.ResponseWriter, r *http.Request) {
	method := "page.GetPage"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	if !document.CanViewDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	var pages []page.Page
	var err error
	content := request.Query(r, "content")

	if len(content) > 0 {
		pages, err = h.Store.Page.GetPagesWithoutContent(ctx, documentID)
	} else {
		pages, err = h.Store.Page.GetPages(ctx, documentID)
	}

	if len(pages) == 0 {
		pages = []page.Page{}
	}

	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
	}

	response.WriteJSON(w, pages)
}

// GetPagesBatch gets specified pages for document.
func (h *Handler) GetPagesBatch(w http.ResponseWriter, r *http.Request) {
	method := "page.batch"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	if !document.CanViewDocument(ctx, *h.Store, documentID) {
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

	requestedPages := string(body)

	pages, err := h.Store.Page.GetPagesWhereIn(ctx, documentID, requestedPages)
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, documentID)
		h.Runtime.Log.Error(method, err)
		return
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	response.WriteJSON(w, pages)
}

// Delete deletes a page.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	method := "page.delete"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	pageID := request.Param(r, "pageID")
	if len(pageID) == 0 {
		response.WriteMissingDataError(w, method, "pageID")
		return
	}

	if !document.CanChangeDocument(ctx, *h.Store, documentID) {
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

	page, err := h.Store.Page.Get(ctx, pageID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if len(page.BlockID) > 0 {
		h.Store.Block.DecrementUsage(ctx, page.BlockID)
	}

	_, err = h.Store.Page.Delete(ctx, documentID, pageID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		LabelID:      doc.LabelID,
		SourceID:     documentID,
		SourceType:   activity.SourceTypeDocument,
		ActivityType: activity.TypeDeleted})

	h.Store.Audit.Record(ctx, audit.EventTypeSectionDelete)

	h.Indexer.Delete(ctx, documentID, pageID)

	h.Store.Link.DeleteSourcePageLinks(ctx, pageID)

	h.Store.Link.MarkOrphanPageLink(ctx, pageID)

	h.Store.Page.DeletePageRevisions(ctx, pageID)

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}

// DeletePages batch deletes pages.
func (h *Handler) DeletePages(w http.ResponseWriter, r *http.Request) {
	method := "page.delete.pages"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	if !document.CanChangeDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "Bad body")
		return
	}

	model := new([]page.PageLevelRequest)
	err = json.Unmarshal(body, &model)
	if err != nil {
		response.WriteBadRequestError(w, method, "JSON marshal")
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

	for _, page := range *model {
		pageData, err := h.Store.Page.Get(ctx, page.PageID)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		if len(pageData.BlockID) > 0 {
			h.Store.Block.DecrementUsage(ctx, pageData.BlockID)
		}

		_, err = h.Store.Page.Delete(ctx, documentID, page.PageID)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		h.Indexer.Delete(ctx, documentID, page.PageID)

		h.Store.Link.DeleteSourcePageLinks(ctx, page.PageID)

		h.Store.Link.MarkOrphanPageLink(ctx, page.PageID)

		h.Store.Page.DeletePageRevisions(ctx, page.PageID)
	}

	h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		LabelID:      doc.LabelID,
		SourceID:     documentID,
		SourceType:   activity.SourceTypeDocument,
		ActivityType: activity.TypeDeleted})

	h.Store.Audit.Record(ctx, audit.EventTypeSectionDelete)

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}

// Update will persist changed page and note the fact
// that this is a new revision. If the page is the first in a document
// then the corresponding document title will also be changed.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	method := "page.update"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	if !ctx.Editor {
		response.WriteForbiddenError(w)
		return
	}

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	pageID := request.Param(r, "pageID")
	if len(pageID) == 0 {
		response.WriteMissingDataError(w, method, "pageID")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "Bad request body")
		h.Runtime.Log.Error(method, err)
		return
	}

	model := new(page.NewPage)
	err = json.Unmarshal(body, &model)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	if model.Page.RefID != pageID || model.Page.DocumentID != documentID {
		response.WriteBadRequestError(w, method, err.Error())
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

	model.Page.SetDefaults()
	model.Meta.SetDefaults()

	oldPageMeta, err := h.Store.Page.GetPageMeta(ctx, pageID)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	output, ok := provider.Render(model.Page.ContentType, provider.NewContext(model.Meta.OrgID, oldPageMeta.UserID, ctx), model.Meta.Config, model.Meta.RawBody)
	if !ok {
		h.Runtime.Log.Info("provider.Render could not find: " + model.Page.ContentType)
	}

	model.Page.Body = output
	refID := uniqueid.Generate()
	skipRevision := false
	skipRevision, err = strconv.ParseBool(request.Query(r, "r"))

	err = h.Store.Page.Update(ctx, model.Page, refID, ctx.UserID, skipRevision)
	if err != nil {
		response.WriteServerError(w, method, err)
		ctx.Transaction.Rollback()
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Page.UpdateMeta(ctx, model.Meta, true) // change the UserID to the current one
	if err != nil {
		response.WriteServerError(w, method, err)
		ctx.Transaction.Rollback()
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		LabelID:      doc.LabelID,
		SourceID:     model.Page.DocumentID,
		SourceType:   activity.SourceTypeDocument,
		ActivityType: activity.TypeEdited})

	h.Store.Audit.Record(ctx, audit.EventTypeSectionUpdate)

	// find any content links in the HTML
	links := link.GetContentLinks(model.Page.Body)

	// get a copy of previously saved links
	previousLinks, _ := h.Store.Link.GetPageLinks(ctx, model.Page.DocumentID, model.Page.RefID)

	// delete previous content links for this page
	_, _ = h.Store.Link.DeleteSourcePageLinks(ctx, model.Page.RefID)

	// save latest content links for this page
	for _, link := range links {
		link.Orphan = false
		link.OrgID = ctx.OrgID
		link.UserID = ctx.UserID
		link.SourceDocumentID = model.Page.DocumentID
		link.SourcePageID = model.Page.RefID

		if link.LinkType == "document" {
			link.TargetID = ""
		}

		// We check if there was a previously saved version of this link.
		// If we find one, we carry forward the orphan flag.
		for _, p := range previousLinks {
			if link.TargetID == p.TargetID && link.LinkType == p.LinkType {
				link.Orphan = p.Orphan
				break
			}
		}

		// save
		err := h.Store.Link.Add(ctx, link)
		if err != nil {
			h.Runtime.Log.Error(fmt.Sprintf("Unable to insert content links for page %s", model.Page.RefID), err)
		}
	}

	ctx.Transaction.Commit()

	h.Indexer.Update(ctx, model.Page)

	updatedPage, err := h.Store.Page.Get(ctx, pageID)

	response.WriteJSON(w, updatedPage)
}

// ChangePageSequence will swap page sequence for a given number of pages.
func (h *Handler) ChangePageSequence(w http.ResponseWriter, r *http.Request) {
	method := "page.sequence"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	if !document.CanChangeDocument(ctx, *h.Store, documentID) {
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

	model := new([]page.PageSequenceRequest)
	err = json.Unmarshal(body, &model)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	for _, p := range *model {
		err = h.Store.Page.UpdateSequence(ctx, documentID, p.PageID, p.Sequence)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		h.Indexer.UpdateSequence(ctx, documentID, p.PageID, p.Sequence)
	}

	h.Store.Audit.Record(ctx, audit.EventTypeSectionResequence)

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}

// ChangePageLevel handles page indent/outdent changes.
func (h *Handler) ChangePageLevel(w http.ResponseWriter, r *http.Request) {
	method := "page.level"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	if !document.CanChangeDocument(ctx, *h.Store, documentID) {
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

	model := new([]page.PageLevelRequest)
	err = json.Unmarshal(body, &model)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	for _, p := range *model {
		err = h.Store.Page.UpdateLevel(ctx, documentID, p.PageID, p.Level)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		h.Indexer.UpdateLevel(ctx, documentID, p.PageID, p.Level)
	}

	h.Store.Audit.Record(ctx, audit.EventTypeSectionResequence)

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}

// GetMeta gets page meta data for specified document page.
func (h *Handler) GetMeta(w http.ResponseWriter, r *http.Request) {
	method := "page.meta"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	pageID := request.Param(r, "pageID")
	if len(pageID) == 0 {
		response.WriteMissingDataError(w, method, "pageID")
		return
	}

	if !document.CanViewDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	meta, err := h.Store.Page.GetPageMeta(ctx, pageID)
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, pageID)
		h.Runtime.Log.Info(method + " no record")
		meta = page.Meta{}
		response.WriteJSON(w, meta)
		return
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	if meta.DocumentID != documentID {
		response.WriteBadRequestError(w, method, "documentID mismatch")
		h.Runtime.Log.Error(method, err)
		return
	}

	response.WriteJSON(w, meta)
}

//**************************************************
// Copy Move Page
//**************************************************

// GetMoveCopyTargets returns available documents for page copy/move axction.
func (h *Handler) GetMoveCopyTargets(w http.ResponseWriter, r *http.Request) {
	method := "page.targets"
	ctx := domain.GetRequestContext(r)

	var d []doc.Document
	var err error

	d, err = h.Store.Document.DocumentList(ctx)
	if len(d) == 0 {
		d = []doc.Document{}
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	response.WriteJSON(w, d)
}

// Copy copies page to either same or different document.
func (h *Handler) Copy(w http.ResponseWriter, r *http.Request) {
	method := "page.targets"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	pageID := request.Param(r, "pageID")
	if len(pageID) == 0 {
		response.WriteMissingDataError(w, method, "pageID")
		return
	}

	targetID := request.Param(r, "targetID")
	if len(targetID) == 0 {
		response.WriteMissingDataError(w, method, "targetID")
		return
	}

	// permission
	if !document.CanViewDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	// fetch data
	doc, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	p, err := h.Store.Page.Get(ctx, pageID)
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, documentID)
		h.Runtime.Log.Error(method, err)
		return
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	pageMeta, err := h.Store.Page.GetPageMeta(ctx, pageID)
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, documentID)
		h.Runtime.Log.Error(method, err)
		return
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	newPageID := uniqueid.Generate()
	p.RefID = newPageID
	p.Level = 1
	p.Sequence = 0
	p.DocumentID = targetID
	p.UserID = ctx.UserID
	pageMeta.DocumentID = targetID
	pageMeta.PageID = newPageID
	pageMeta.UserID = ctx.UserID

	model := new(page.NewPage)
	model.Meta = pageMeta
	model.Page = p

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Page.Add(ctx, *model)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if len(model.Page.BlockID) > 0 {
		h.Store.Block.IncrementUsage(ctx, model.Page.BlockID)
	}

	// Log action against target document
	h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		LabelID:      doc.LabelID,
		SourceID:     targetID,
		SourceType:   activity.SourceTypeDocument,
		ActivityType: activity.TypeEdited})

	h.Store.Audit.Record(ctx, audit.EventTypeSectionCopy)

	ctx.Transaction.Commit()

	np, _ := h.Store.Page.Get(ctx, pageID)

	response.WriteJSON(w, np)
}

//**************************************************
// Revisions
//**************************************************

// GetDocumentRevisions returns all changes for a document.
func (h *Handler) GetDocumentRevisions(w http.ResponseWriter, r *http.Request) {
	method := "page.document.revisions"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	if !document.CanViewDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	revisions, _ := h.Store.Page.GetDocumentRevisions(ctx, documentID)
	if len(revisions) == 0 {
		revisions = []page.Revision{}
	}

	h.Store.Audit.Record(ctx, audit.EventTypeDocumentRevisions)

	response.WriteJSON(w, revisions)
}

// GetRevisions returns all changes for a given page.
func (h *Handler) GetRevisions(w http.ResponseWriter, r *http.Request) {
	method := "page.revisions"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	if !document.CanViewDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	pageID := request.Param(r, "pageID")
	if len(pageID) == 0 {
		response.WriteMissingDataError(w, method, "pageID")
		return
	}

	revisions, _ := h.Store.Page.GetPageRevisions(ctx, pageID)
	if len(revisions) == 0 {
		revisions = []page.Revision{}
	}

	response.WriteJSON(w, revisions)
}

// GetDiff returns HTML diff between two revisions of a given page.
func (h *Handler) GetDiff(w http.ResponseWriter, r *http.Request) {
	method := "page.diff"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	pageID := request.Param(r, "pageID")
	if len(pageID) == 0 {
		response.WriteMissingDataError(w, method, "pageID")
		return
	}

	revisionID := request.Param(r, "revisionID")
	if len(revisionID) == 0 {
		response.WriteMissingDataError(w, method, "revisionID")
		return
	}

	if !document.CanViewDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	p, err := h.Store.Page.Get(ctx, pageID)
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, pageID)
		h.Runtime.Log.Error(method, err)
		return
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	revision, _ := h.Store.Page.GetPageRevision(ctx, revisionID)

	latestHTML := p.Body
	previousHTML := revision.Body
	var result []byte

	var cfg = &htmldiff.Config{
		Granularity:  5,
		InsertedSpan: []htmldiff.Attribute{{Key: "style", Val: "background-color: palegreen;"}},
		DeletedSpan:  []htmldiff.Attribute{{Key: "style", Val: "background-color: lightpink; text-decoration: line-through;"}},
		ReplacedSpan: []htmldiff.Attribute{{Key: "style", Val: "background-color: lightskyblue;"}},
		CleanTags:    []string{"documize"},
	}

	res, err := cfg.HTMLdiff([]string{latestHTML, previousHTML})
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	result = []byte(res[0])
	w.Write(result)
}

// Rollback rolls back to a specific page revision.
func (h *Handler) Rollback(w http.ResponseWriter, r *http.Request) {
	method := "page.rollback"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	pageID := request.Param(r, "pageID")
	if len(pageID) == 0 {
		response.WriteMissingDataError(w, method, "pageID")
		return
	}

	revisionID := request.Param(r, "revisionID")
	if len(revisionID) == 0 {
		response.WriteMissingDataError(w, method, "revisionID")
		return
	}

	if !document.CanChangeDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	var err error
	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	p, err := h.Store.Page.Get(ctx, pageID)
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	meta, err := h.Store.Page.GetPageMeta(ctx, pageID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	revision, err := h.Store.Page.GetPageRevision(ctx, revisionID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	doc, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// roll back page
	p.Body = revision.Body
	refID := uniqueid.Generate()

	err = h.Store.Page.Update(ctx, p, refID, ctx.UserID, false)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// roll back page meta
	meta.Config = revision.Config
	meta.RawBody = revision.RawBody

	err = h.Store.Page.UpdateMeta(ctx, meta, false)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		LabelID:      doc.LabelID,
		SourceID:     p.DocumentID,
		SourceType:   activity.SourceTypeDocument,
		ActivityType: activity.TypeReverted})

	h.Store.Audit.Record(ctx, audit.EventTypeSectionRollback)

	ctx.Transaction.Commit()

	response.WriteJSON(w, p)
}
