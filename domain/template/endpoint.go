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

package template

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/documize/community/model/category"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/event"
	"github.com/documize/community/core/i18n"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/permission"
	indexer "github.com/documize/community/domain/search"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/attachment"
	"github.com/documize/community/model/audit"
	cm "github.com/documize/community/model/category"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/page"
	pm "github.com/documize/community/model/permission"

	// "github.com/documize/community/model/template"
	"github.com/documize/community/model/workflow"
	uuid "github.com/nu7hatch/gouuid"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
	Indexer indexer.Indexer
}

// SavedList returns all templates saved by the user
func (h *Handler) SavedList(w http.ResponseWriter, r *http.Request) {
	method := "template.saved"
	ctx := domain.GetRequestContext(r)

	spaceID := request.Param(r, "spaceID")
	if len(spaceID) == 0 {
		response.WriteMissingDataError(w, method, "spaceID")
		return
	}

	documents, err := h.Store.Document.TemplatesBySpace(ctx, spaceID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// templates := []template.Template{}

	// for _, d := range documents {
	// 	var t = template.Template{}
	// 	t.ID = d.RefID
	// 	t.Title = d.Name
	// 	t.Description = d.Excerpt
	// 	t.Author = ""
	// 	t.Dated = d.Created
	// 	t.Type = template.TypePrivate

	// 	if d.SpaceID == spaceID {
	// 		templates = append(templates, t)
	// 	}
	// }

	response.WriteJSON(w, documents)
}

// SaveAs saves existing document as a template.
func (h *Handler) SaveAs(w http.ResponseWriter, r *http.Request) {
	method := "template.saved"
	ctx := domain.GetRequestContext(r)
	unseq := doc.Unsequenced

	if !h.Runtime.Product.IsValid(ctx) {
		response.WriteBadLicense(w)
		return
	}

	var model struct {
		DocumentID string
		Name       string
		Excerpt    string
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "Bad payload")
		h.Runtime.Log.Error(method, err)
		return
	}

	err = json.Unmarshal(body, &model)
	if err != nil {
		response.WriteBadRequestError(w, method, "unmarshal")
		h.Runtime.Log.Error(method, err)
		return
	}

	// Duplicate document
	doc, err := h.Store.Document.Get(ctx, model.DocumentID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if !permission.HasPermission(ctx, *h.Store, doc.SpaceID, pm.DocumentTemplate) {
		response.WriteForbiddenError(w)
		return
	}

	// DB transaction
	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	docID := uniqueid.Generate()
	doc.Template = true
	doc.Name = model.Name
	doc.Excerpt = model.Excerpt
	doc.RefID = docID
	doc.ID = 0
	doc.Template = true
	doc.Lifecycle = workflow.LifecycleLive
	doc.Sequence = unseq

	// Duplicate pages and associated meta
	pages, err := h.Store.Page.GetPages(ctx, model.DocumentID)
	var pageModel []page.NewPage

	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	for _, p := range pages {
		p.DocumentID = docID
		p.ID = 0

		meta, err2 := h.Store.Page.GetPageMeta(ctx, p.RefID)
		if err2 != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err2)
			h.Runtime.Log.Error(method, err)
			return
		}

		pageID := uniqueid.Generate()
		p.RefID = pageID
		meta.SectionID = pageID
		meta.DocumentID = docID

		m := page.NewPage{}
		m.Page = p
		m.Meta = meta

		pageModel = append(pageModel, m)
	}

	// Duplicate attachments
	attachments, _ := h.Store.Attachment.GetAttachments(ctx, model.DocumentID)
	for i, a := range attachments {
		a.DocumentID = docID
		a.RefID = uniqueid.Generate()
		a.ID = 0
		attachments[i] = a
	}

	// Now create the template: document, attachments, pages and their meta
	err = h.Store.Document.Add(ctx, doc)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Clone attachments.
	for _, a := range attachments {
		err = h.Store.Attachment.Add(ctx, a)

		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	// Clone sections.
	for _, m := range pageModel {
		err = h.Store.Page.Add(ctx, m)

		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	// Clone categories.
	cats, err := h.Store.Category.GetDocumentCategoryMembership(ctx, model.DocumentID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	for _, c := range cats {
		var cc category.Member
		cc.OrgID = c.OrgID
		cc.CategoryID = c.RefID
		cc.RefID = uniqueid.Generate()
		cc.DocumentID = docID
		cc.SpaceID = doc.SpaceID
		err = h.Store.Category.AssociateDocument(ctx, cc)
		if err != nil && err != sql.ErrNoRows {
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	// Commit and return new document template
	ctx.Transaction.Commit()

	h.Store.Space.SetStats(ctx, doc.SpaceID)
	h.Store.Audit.Record(ctx, audit.EventTypeTemplateAdd)

	doc, err = h.Store.Document.Get(ctx, docID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	response.WriteJSON(w, doc)
}

// Use creates new document using a saved document as a template.
// If template ID is ZERO then we provide an Empty Document as the new document.
func (h *Handler) Use(w http.ResponseWriter, r *http.Request) {
	method := "template.use"
	ctx := domain.GetRequestContext(r)

	spaceID := request.Param(r, "spaceID")
	if len(spaceID) == 0 {
		response.WriteMissingDataError(w, method, "spaceID")
		return
	}

	templateID := request.Param(r, "templateID")
	if len(templateID) == 0 {
		response.WriteMissingDataError(w, method, "templateID")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "Bad payload")
		h.Runtime.Log.Error(method, err)
		return
	}

	docTitle := string(body)

	// Define an empty document just in case user wanted one.
	var d = doc.Document{}
	d.Name = docTitle
	d.Location = fmt.Sprintf("template-%s", templateID)
	d.Excerpt = i18n.Localize(ctx.Locale, "description")
	d.Slug = stringutil.MakeSlug(d.Name)
	d.Tags = ""
	d.SpaceID = spaceID
	documentID := uniqueid.Generate()
	d.RefID = documentID

	var pages = []page.Page{}
	var attachments = []attachment.Attachment{}

	// Fetch document and associated pages, attachments if we have template ID
	if templateID != "0" {
		d, err = h.Store.Document.Get(ctx, templateID)

		if err == sql.ErrNoRows {
			response.WriteNotFoundError(w, method, templateID)
			return
		}
		if err != nil {
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		pages, _ = h.Store.Page.GetPages(ctx, templateID)
		attachments, _ = h.Store.Attachment.GetAttachmentsWithData(ctx, templateID)
	}

	// Fetch space where document resides.
	sp, err := h.Store.Space.Get(ctx, spaceID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction, _ = h.Runtime.StartTx(sql.LevelReadUncommitted)

	// Prepare new document
	documentID = uniqueid.Generate()
	d.RefID = documentID
	d.Template = false
	d.SpaceID = spaceID
	d.UserID = ctx.UserID
	d.Name = docTitle
	d.Sequence = doc.Unsequenced

	if h.Runtime.Product.Edition == domain.CommunityEdition {
		d.Lifecycle = workflow.LifecycleLive
	} else {
		d.Lifecycle = sp.Lifecycle
	}

	err = h.Store.Document.Add(ctx, d)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	for _, p := range pages {
		meta, err2 := h.Store.Page.GetPageMeta(ctx, p.RefID)
		if err2 != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		p.DocumentID = documentID
		pageID := uniqueid.Generate()
		p.RefID = pageID

		meta.SectionID = pageID
		meta.DocumentID = documentID

		model := page.NewPage{}
		model.Page = p
		model.Meta = meta

		err = h.Store.Page.Add(ctx, model)
		if err != nil {
			h.Runtime.Log.Error(method, err)
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			return
		}
	}

	newUUID, _ := uuid.NewV4()

	for _, a := range attachments {
		a.DocumentID = documentID
		a.Job = newUUID.String()
		random := secrets.GenerateSalt()
		a.FileID = random[0:9]
		attachmentID := uniqueid.Generate()
		a.RefID = attachmentID

		err = h.Store.Attachment.Add(ctx, a)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	// Clone categories.
	cats, err := h.Store.Category.GetDocumentCategoryMembership(ctx, templateID)
	if err != nil && err != sql.ErrNoRows {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	for _, c := range cats {
		var cc category.Member
		cc.OrgID = c.OrgID
		cc.CategoryID = c.RefID
		cc.RefID = uniqueid.Generate()
		cc.DocumentID = d.RefID
		cc.SpaceID = d.SpaceID
		err = h.Store.Category.AssociateDocument(ctx, cc)
		if err != nil && err != sql.ErrNoRows {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	// If document has no categories then we use
	// default categories for the space.
	if len(cats) == 0 {
		cats, err = h.Store.Category.GetBySpace(ctx, d.SpaceID)
		if err != nil {
			h.Runtime.Log.Error("fetch default categories for new document", err)
		}
		for ic := range cats {
			if cats[ic].IsDefault {
				c := cm.Member{}
				c.OrgID = ctx.OrgID
				c.SpaceID = d.SpaceID
				c.RefID = uniqueid.Generate()
				c.DocumentID = d.RefID
				c.CategoryID = cats[ic].RefID

				err = h.Store.Category.AssociateDocument(ctx, c)
				if err != nil {
					h.Runtime.Log.Error("apply default category to new document", err)
				}
			}
		}
	}

	ctx.Transaction.Commit()

	h.Store.Space.SetStats(ctx, d.SpaceID)
	h.Store.Audit.Record(ctx, audit.EventTypeTemplateUse)

	nd, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	event.Handler().Publish(string(event.TypeAddDocument), nd.Name)

	a, _ := h.Store.Attachment.GetAttachments(ctx, documentID)

	if nd.Lifecycle == workflow.LifecycleLive {
		go h.Indexer.IndexDocument(ctx, nd, a)
	} else {
		go h.Indexer.DeleteDocument(ctx, d.RefID)
	}

	response.WriteJSON(w, nd)
}
