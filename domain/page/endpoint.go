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
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/link"
	"github.com/documize/community/domain/permission"
	indexer "github.com/documize/community/domain/search"
	"github.com/documize/community/domain/section/provider"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/activity"
	"github.com/documize/community/model/audit"
	dm "github.com/documize/community/model/doc"
	"github.com/documize/community/model/page"
	pm "github.com/documize/community/model/permission"
	"github.com/documize/community/model/user"
	"github.com/documize/community/model/workflow"
	htmldiff "github.com/documize/html-diff"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
	Indexer indexer.Indexer
}

// Add inserts new section into document.
func (h *Handler) Add(w http.ResponseWriter, r *http.Request) {
	method := "page.add"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.IsValid(ctx) {
		response.WriteBadLicense(w)
		return
	}

	// check param
	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	// read payload
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

	// Check protection and approval process
	document, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	// Protect locked
	if document.Protection == workflow.ProtectionLock {
		response.WriteForbiddenError(w)
		h.Runtime.Log.Info("attempted write to locked document")
		return
	}

	// Check edit permission
	if !permission.CanChangeDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	// if document review process then we must mark page as pending
	if document.Protection == workflow.ProtectionReview {
		if model.Page.RelativeID == "" {
			model.Page.Status = workflow.ChangePendingNew
		} else {
			model.Page.Status = workflow.ChangePending
		}
	} else {
		model.Page.RelativeID = ""
		model.Page.Status = workflow.ChangePublished
	}

	pageID := uniqueid.Generate()
	model.Page.RefID = pageID
	model.Meta.SectionID = pageID
	model.Meta.OrgID = ctx.OrgID   // required for Render call below
	model.Meta.UserID = ctx.UserID // required for Render call below
	model.Page.SetDefaults()
	model.Meta.SetDefaults()

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

	if len(model.Page.TemplateID) > 0 {
		h.Store.Block.IncrementUsage(ctx, model.Page.TemplateID)
	}

	// Draft actions are not logged
	if doc.Lifecycle == workflow.LifecycleLive {
		h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
			SpaceID:      doc.SpaceID,
			DocumentID:   model.Page.DocumentID,
			SectionID:    model.Page.RefID,
			SourceType:   activity.SourceTypePage,
			ActivityType: activity.TypeCreated})
	}

	// Update doc revised.
	h.Store.Document.UpdateRevised(ctx, doc.RefID)

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeSectionAdd)

	np, _ := h.Store.Page.Get(ctx, pageID)

	if doc.Lifecycle == workflow.LifecycleLive {
		go h.Indexer.IndexContent(ctx, np)
	} else {
		go h.Indexer.DeleteDocument(ctx, doc.RefID)
	}

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

	if !permission.CanViewDocument(ctx, *h.Store, documentID) {
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
	method := "page.GetPages"
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

	page.Numberize(pages)

	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
	}

	response.WriteJSON(w, pages)
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

	if !permission.CanViewDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	meta, err := h.Store.Page.GetPageMeta(ctx, pageID)
	if err == sql.ErrNoRows {
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

// Update will persist changed page and note the fact
// that this is a new revision. If the page is the first in a document
// then the corresponding document title will also be changed.
// Draft documents do not get revision entry.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	method := "page.update"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.IsValid(ctx) {
		response.WriteBadLicense(w)
		return
	}

	// Check params
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

	// Read payload
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

	// Check protection and approval process
	doc, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	if doc.Protection == workflow.ProtectionLock {
		response.WriteForbiddenError(w)
		h.Runtime.Log.Info("attempted write to locked document")
		return
	}

	// Check edit permission
	if !permission.CanChangeDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
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
		ctx.Transaction.Rollback()
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

	// We don't track revisions for non-published pages
	if model.Page.Status != workflow.ChangePublished {
		skipRevision = true
	}

	// We only track revisions for live documents
	if doc.Lifecycle != workflow.LifecycleLive {
		skipRevision = true
	}

	err = h.Store.Page.Update(ctx, model.Page, refID, ctx.UserID, skipRevision)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Page.UpdateMeta(ctx, model.Meta, true) // change the UserID to the current one
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Draft edits are not logged
	if doc.Lifecycle == workflow.LifecycleLive {
		h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
			SpaceID:      doc.SpaceID,
			DocumentID:   model.Page.DocumentID,
			SectionID:    model.Page.RefID,
			SourceType:   activity.SourceTypePage,
			ActivityType: activity.TypeEdited})
	}

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
		link.SourceSectionID = model.Page.RefID

		if link.LinkType == "document" || link.LinkType == "network" {
			link.TargetID = ""
		}
		if link.LinkType != "network" {
			link.ExternalID = ""
		}

		// We check if there was a previously saved version of this link.
		// If we find one, we carry forward the orphan flag.
		for _, p := range previousLinks {
			if link.LinkType == p.LinkType && link.TargetID == p.TargetID && link.LinkType != "network" {
				link.Orphan = p.Orphan
				break
			}
			if link.LinkType == p.LinkType && link.ExternalID == p.ExternalID && link.LinkType == "network" {
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

	// Update doc revised.
	h.Store.Document.UpdateRevised(ctx, model.Page.DocumentID)

	ctx.Transaction.Commit()

	if doc.Lifecycle == workflow.LifecycleLive {
		go h.Indexer.IndexContent(ctx, model.Page)
	} else {
		go h.Indexer.DeleteDocument(ctx, doc.RefID)
	}

	updatedPage, err := h.Store.Page.Get(ctx, pageID)

	response.WriteJSON(w, updatedPage)
}

// Delete a page.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	method := "page.delete"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.IsValid(ctx) {
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

	doc, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	p, err := h.Store.Page.Get(ctx, pageID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// you can delete your own pending page
	ownPending := false
	if (p.Status == workflow.ChangePending || p.Status == workflow.ChangePendingNew) && p.UserID == ctx.UserID {
		ownPending = true
	}

	// if not own page then check permission
	if !ownPending {
		ok, _ := h.workflowPermitsChange(doc, ctx)
		if !ok {
			response.WriteForbiddenError(w)
			h.Runtime.Log.Info("attempted delete section on locked document")
			return
		}
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if len(p.TemplateID) > 0 {
		h.Store.Block.DecrementUsage(ctx, p.TemplateID)
	}

	_, err = h.Store.Page.Delete(ctx, documentID, pageID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Draft actions are not logged
	if doc.Lifecycle == workflow.LifecycleLive {
		h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
			SpaceID:      doc.SpaceID,
			DocumentID:   documentID,
			SectionID:    pageID,
			SourceType:   activity.SourceTypePage,
			ActivityType: activity.TypeDeleted})
	}

	go h.Indexer.DeleteContent(ctx, pageID)

	h.Store.Link.DeleteSourcePageLinks(ctx, pageID)

	h.Store.Link.MarkOrphanPageLink(ctx, pageID)

	h.Store.Page.DeletePageRevisions(ctx, pageID)

	h.Store.Attachment.DeleteSection(ctx, pageID)

	// Update doc revised.
	h.Store.Document.UpdateRevised(ctx, doc.RefID)

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeSectionDelete)

	// Re-level all pages in document
	h.LevelizeDocument(ctx, documentID)

	response.WriteEmpty(w)
}

// DeletePages batch deletes pages.
func (h *Handler) DeletePages(w http.ResponseWriter, r *http.Request) {
	method := "page.delete.pages"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.IsValid(ctx) {
		response.WriteBadLicense(w)
		return
	}

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "Bad body")
		return
	}

	model := new([]page.LevelRequest)
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
		pageData, err := h.Store.Page.Get(ctx, page.SectionID)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		ownPending := false
		if (pageData.Status == workflow.ChangePending || pageData.Status == workflow.ChangePendingNew) && pageData.UserID == ctx.UserID {
			ownPending = true
		}

		// if not own page then check permission
		if !ownPending {
			ok, _ := h.workflowPermitsChange(doc, ctx)
			if !ok {
				ctx.Transaction.Rollback()
				response.WriteForbiddenError(w)
				h.Runtime.Log.Info("attempted delete section on locked document")
				return
			}
		}
		if len(pageData.TemplateID) > 0 {
			h.Store.Block.DecrementUsage(ctx, pageData.TemplateID)
		}

		_, err = h.Store.Page.Delete(ctx, documentID, page.SectionID)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		go h.Indexer.DeleteContent(ctx, page.SectionID)

		h.Store.Link.DeleteSourcePageLinks(ctx, page.SectionID)

		h.Store.Link.MarkOrphanPageLink(ctx, page.SectionID)

		h.Store.Page.DeletePageRevisions(ctx, page.SectionID)

		h.Store.Attachment.DeleteSection(ctx, page.SectionID)

		// Draft actions are not logged
		if doc.Lifecycle == workflow.LifecycleLive {
			h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
				SpaceID:      doc.SpaceID,
				DocumentID:   documentID,
				SectionID:    page.SectionID,
				SourceType:   activity.SourceTypePage,
				ActivityType: activity.TypeDeleted})
		}
	}

	// Update doc revised.
	h.Store.Document.UpdateRevised(ctx, doc.RefID)

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeSectionDelete)

	// Re-level all pages in document
	h.LevelizeDocument(ctx, documentID)

	response.WriteEmpty(w)
}

//**************************************************
// Table of Contents
//**************************************************

// ChangePageSequence will swap page sequence for a given number of pages.
func (h *Handler) ChangePageSequence(w http.ResponseWriter, r *http.Request) {
	method := "page.sequence"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.IsValid(ctx) {
		response.WriteBadLicense(w)
		return
	}

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	doc, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ok, err := h.workflowPermitsChange(doc, ctx)
	if !ok {
		response.WriteForbiddenError(w)
		h.Runtime.Log.Info("attempted to chaneg page sequence on protected document")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	model := new([]page.SequenceRequest)
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
		err = h.Store.Page.UpdateSequence(ctx, documentID, p.SectionID, p.Sequence)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	// Update doc revised.
	h.Store.Document.UpdateRevised(ctx, doc.RefID)

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeSectionResequence)

	response.WriteEmpty(w)
}

// ChangePageLevel handles page indent/outdent changes.
func (h *Handler) ChangePageLevel(w http.ResponseWriter, r *http.Request) {
	method := "page.level"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.IsValid(ctx) {
		response.WriteBadLicense(w)
		return
	}

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}
	doc, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ok, err := h.workflowPermitsChange(doc, ctx)
	if !ok {
		response.WriteForbiddenError(w)
		h.Runtime.Log.Info("attempted to chaneg page level on protected document")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	model := new([]page.LevelRequest)
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
		err = h.Store.Page.UpdateLevel(ctx, documentID, p.SectionID, p.Level)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	// Update doc revised.
	h.Store.Document.UpdateRevised(ctx, doc.RefID)

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeSectionResequence)

	response.WriteEmpty(w)
}

//**************************************************
// Copy Move Page
//**************************************************

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
	if !permission.CanViewDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	// Get both source and target documents.
	doc, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	targetDoc, err := h.Store.Document.Get(ctx, targetID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Workflow check for target (receiving) doc.
	if targetDoc.Protection == workflow.ProtectionLock || targetDoc.Protection == workflow.ProtectionReview {
		response.WriteForbiddenError(w)
		return
	}

	// Check permissions for target document and copy permission.
	if !permission.CanChangeDocument(ctx, *h.Store, targetDoc.RefID) {
		response.WriteForbiddenError(w)
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
	p.Level = p.Level
	// p.Sequence = p.Sequence
	p.Sequence, _ = h.Store.Page.GetNextPageSequence(ctx, targetDoc.RefID)
	p.DocumentID = targetID
	p.UserID = ctx.UserID
	pageMeta.DocumentID = targetID
	pageMeta.SectionID = newPageID
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

	if len(model.Page.TemplateID) > 0 {
		h.Store.Block.IncrementUsage(ctx, model.Page.TemplateID)
	}

	// Copy section attachments.
	at, err := h.Store.Attachment.GetSectionAttachments(ctx, pageID)
	if err != nil {
		h.Runtime.Log.Error(method, err)
	}
	for i := range at {
		at[i].DocumentID = targetID
		at[i].SectionID = newPageID
		at[i].RefID = uniqueid.Generate()
		random := secrets.GenerateSalt()
		at[i].FileID = random[0:9]

		err1 := h.Store.Attachment.Add(ctx, at[i])
		if err1 != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err1)
			h.Runtime.Log.Error(method, err1)
			return
		}
	}

	// Copy section links.
	links, err := h.Store.Link.GetPageLinks(ctx, documentID, pageID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	for lindex := range links {
		links[lindex].RefID = uniqueid.Generate()
		links[lindex].SourceSectionID = newPageID
		links[lindex].SourceDocumentID = targetID

		err = h.Store.Link.Add(ctx, links[lindex])
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	// Update doc revised.
	h.Store.Document.UpdateRevised(ctx, targetID)

	// If document is published, we record activity and
	// index content for search.
	if doc.Lifecycle == workflow.LifecycleLive {
		h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
			SpaceID:      doc.SpaceID,
			DocumentID:   targetID,
			SectionID:    newPageID,
			SourceType:   activity.SourceTypePage,
			ActivityType: activity.TypeCreated})

		go h.Indexer.IndexContent(ctx, p)
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeSectionCopy)

	// Re-level all pages in document.
	h.LevelizeDocument(ctx, targetID)

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

	if !h.Runtime.Product.IsValid(ctx) {
		response.WriteBadLicense(w)
		return
	}

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	if !permission.CanViewDocument(ctx, *h.Store, documentID) {
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

	if !h.Runtime.Product.IsValid(ctx) {
		response.WriteBadLicense(w)
		return
	}

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	if !permission.CanViewDocument(ctx, *h.Store, documentID) {
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

	if !h.Runtime.Product.IsValid(ctx) {
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

	if !permission.CanViewDocument(ctx, *h.Store, documentID) {
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
		DeletedSpan:  []htmldiff.Attribute{{Key: "style", Val: "background-color: palegreen;"}},
		InsertedSpan: []htmldiff.Attribute{{Key: "style", Val: "background-color: lightpink; text-decoration: line-through;"}},
		ReplacedSpan: []htmldiff.Attribute{{Key: "style", Val: "background-color: lightskyblue;"}},
		CleanTags:    []string{"documize"},
	}
	// InsertedSpan: []htmldiff.Attribute{{Key: "style", Val: "background-color: palegreen;"}},
	// DeletedSpan:  []htmldiff.Attribute{{Key: "style", Val: "background-color: lightpink; text-decoration: line-through;"}},
	// ReplacedSpan: []htmldiff.Attribute{{Key: "style", Val: "background-color: lightskyblue;"}},

	// res, err := cfg.HTMLdiff([]string{latestHTML, previousHTML})
	res, err := cfg.HTMLdiff([]string{previousHTML, latestHTML})
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

	doc, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ok, err := h.workflowPermitsChange(doc, ctx)
	if !ok {
		response.WriteForbiddenError(w)
		h.Runtime.Log.Info("attempted to chaneg page sequence on protected document")
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	p, err := h.Store.Page.Get(ctx, pageID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	meta, err := h.Store.Page.GetPageMeta(ctx, pageID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	revision, err := h.Store.Page.GetPageRevision(ctx, revisionID)
	if err != nil {
		ctx.Transaction.Rollback()
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

	// Draft actions are not logged
	if doc.Lifecycle == workflow.LifecycleLive {
		h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
			SpaceID:      doc.SpaceID,
			DocumentID:   p.DocumentID,
			SectionID:    p.RefID,
			SourceType:   activity.SourceTypePage,
			ActivityType: activity.TypeReverted})
	}

	// Update doc revised.
	h.Store.Document.UpdateRevised(ctx, doc.RefID)

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeSectionRollback)

	response.WriteJSON(w, p)
}

//**************************************************
// Bulk data fetching (reduce network traffic)
//**************************************************

// FetchPages returns all page data for given document: page, meta data, pending changes.
func (h *Handler) FetchPages(w http.ResponseWriter, r *http.Request) {
	method := "page.FetchPages"
	ctx := domain.GetRequestContext(r)
	model := []page.BulkRequest{}

	// check params
	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		h.Runtime.Log.Infof("Document ID missing for org %s", ctx.OrgID)
		return
	}

	// Who referred user this document (e.g. search page).
	source := request.Query(r, "source")

	doc, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Infof("Document not found %s", documentID)
		return
	}

	// published pages and new pages awaiting approval
	pages, err := h.Store.Page.GetPages(ctx, documentID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	if len(pages) == 0 {
		pages = []page.Page{}
	}

	// unpublished pages
	unpublished, err := h.Store.Page.GetUnpublishedPages(ctx, documentID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	if len(unpublished) == 0 {
		unpublished = []page.Page{}
	}

	// meta for all pages
	meta, err := h.Store.Page.GetDocumentPageMeta(ctx, documentID, false)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	if len(meta) == 0 {
		meta = []page.Meta{}
	}

	// permissions
	perms, err := h.Store.Permission.GetUserSpacePermissions(ctx, doc.SpaceID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}
	if len(perms) == 0 {
		perms = []pm.Permission{}
	}
	permissions := pm.DecodeUserPermissions(perms)

	roles, err := h.Store.Permission.GetUserDocumentPermissions(ctx, doc.RefID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}
	if len(roles) == 0 {
		roles = []pm.Permission{}
	}
	docRoles := pm.DecodeUserDocumentPermissions(roles)

	// check document view permissions
	if !permissions.SpaceView && !permissions.SpaceManage && !permissions.SpaceOwner {
		response.WriteForbiddenError(w)
		return
	}

	// process published pages
	for _, p := range pages {
		// only send back pages that user can see
		process := false
		forcePending := false

		if process == false && p.Status == workflow.ChangePublished {
			process = true
		}
		if process == false && p.Status == workflow.ChangePendingNew && p.RelativeID == "" && p.UserID == ctx.UserID {
			process = true
			forcePending = true // user has newly created page which should be treated as pending
		}
		if process == false && p.Status == workflow.ChangeUnderReview && p.RelativeID == "" && p.UserID == ctx.UserID {
			process = true
			forcePending = true // user has newly created page which should be treated as pending
		}
		if process == false && p.Status == workflow.ChangeUnderReview && p.RelativeID == "" && (permissions.DocumentApprove || docRoles.DocumentRoleApprove) {
			process = true
			forcePending = true // user has newly created page which should be treated as pending
		}

		if process {
			d := page.BulkRequest{}
			d.ID = fmt.Sprintf("container-%s", p.RefID)
			d.Page = p

			for _, m := range meta {
				if p.RefID == m.SectionID {
					d.Meta = m
					break
				}
			}

			d.Pending = []page.PendingPage{}

			// process pending pages
			for _, up := range unpublished {
				if up.RelativeID == p.RefID {
					ud := page.PendingPage{}
					ud.Page = up

					for _, m := range meta {
						if up.RefID == m.SectionID {
							ud.Meta = m
							break
						}
					}

					owner, err := h.Store.User.Get(ctx, up.UserID)
					if err == nil {
						ud.Owner = owner.Fullname()
					}

					d.Pending = append(d.Pending, ud)
				}
			}

			// Handle situation where we need approval, and user has created new page
			if forcePending && len(d.Pending) == 0 && doc.Protection == workflow.ProtectionReview {
				ud := page.PendingPage{}
				ud.Page = d.Page
				ud.Meta = d.Meta

				owner, err := h.Store.User.Get(ctx, d.Page.UserID)
				if err == nil {
					ud.Owner = owner.Fullname()
				}

				d.Pending = append(d.Pending, ud)
			}

			model = append(model, d)
		}
	}

	// Attach numbers to pages, 1.1, 2.1.1 etc.
	t := []page.Page{}
	for _, i := range model {
		t = append(t, i.Page)
	}
	page.Numberize(t)
	for i, j := range t {
		model[i].Page = j
		// pending pages get same numbering
		for k := range model[i].Pending {
			model[i].Pending[k].Page.Numbering = j.Numbering
		}
	}

	// If we have source, record document access via source.
	if len(source) > 0 {
		ctx.Transaction, err = h.Runtime.Db.Beginx()
		if err != nil {
			h.Runtime.Log.Error(method, err)
		} else {
			h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
				SpaceID:      doc.SpaceID,
				DocumentID:   doc.RefID,
				Metadata:     source,                    // deliberate
				SourceType:   activity.SourceTypeSearch, // deliberate
				ActivityType: activity.TypeRead})

			ctx.Transaction.Commit()
		}
	}

	// deliver payload
	response.WriteJSON(w, model)
}

func (h *Handler) workflowPermitsChange(doc dm.Document, ctx domain.RequestContext) (ok bool, err error) {
	if doc.Protection == workflow.ProtectionNone {
		if !permission.CanChangeDocument(ctx, *h.Store, doc.RefID) {
			h.Runtime.Log.Info("attempted forbidden action on document")
			return false, nil
		}

		return true, nil
	}

	// If locked document then no can do
	if doc.Protection == workflow.ProtectionLock {
		h.Runtime.Log.Info("attempted action on locked document")
		return false, err
	}

	// If approval workflow then only approvers can delete page
	if doc.Protection == workflow.ProtectionReview {
		approvers, err := permission.GetUsersWithDocumentPermission(ctx, *h.Store, doc.SpaceID, doc.RefID, pm.DocumentApprove)
		if err != nil {
			h.Runtime.Log.Error("workflowAllowsChange", err)
			return false, err
		}

		if user.Exists(approvers, ctx.UserID) {
			h.Runtime.Log.Info("attempted action on document when not approver")
			return true, nil
		}

		return false, nil
	}

	return true, nil
}
