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

package section

import (
	"database/sql"
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/permission"
	"github.com/documize/community/domain/section/provider"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/page"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// GetSections returns available smart sections.
func (h *Handler) GetSections(w http.ResponseWriter, r *http.Request) {
	s := provider.GetSectionMeta()

	response.WriteJSON(w, s)
}

// RunSectionCommand passes UI request to section handler.
func (h *Handler) RunSectionCommand(w http.ResponseWriter, r *http.Request) {
	method := "section.command"
	ctx := domain.GetRequestContext(r)

	documentID := request.Query(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	sectionName := request.Query(r, "section")
	if len(sectionName) == 0 {
		response.WriteMissingDataError(w, method, "section")
		return
	}

	// Note that targetMethod query item can be empty --
	// it's up to the section handler to parse if required.

	// Permission checks
	if !ctx.Editor && !permission.CanChangeDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	if !provider.Command(sectionName, provider.NewContext(ctx.OrgID, ctx.UserID, ctx), w, r) {
		h.Runtime.Log.Info("Unable to run provider.Command() for: " + sectionName)
		response.WriteNotFoundError(w, "RunSectionCommand", sectionName)
	}
}

// RefreshSections updates document sections where the data is externally sourced.
func (h *Handler) RefreshSections(w http.ResponseWriter, r *http.Request) {
	method := "section.refresh"
	ctx := domain.GetRequestContext(r)

	documentID := request.Query(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	if !permission.CanViewDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	// Return payload
	var p []page.Page

	// Let's see what sections are reliant on external sources
	meta, err := h.Store.Page.GetDocumentPageMeta(ctx, documentID, true)
	if err != nil {
		h.Runtime.Log.Error(method, err)
		response.WriteServerError(w, method, err)
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		h.Runtime.Log.Error(method, err)
		response.WriteServerError(w, method, err)
		return
	}

	for _, pm := range meta {
		// Grab the page because we need content type and
		page, err2 := h.Store.Page.Get(ctx, pm.SectionID)
		if err2 == sql.ErrNoRows {
			continue
		}
		if err2 != nil {
			ctx.Transaction.Rollback()
			h.Runtime.Log.Error(method, err)
			response.WriteServerError(w, method, err)
			return
		}

		pcontext := provider.NewContext(pm.OrgID, pm.UserID, ctx)

		// Ask for data refresh
		data, ok := provider.Refresh(page.ContentType, pcontext, pm.Config, pm.RawBody)
		if !ok {
			h.Runtime.Log.Info("provider.Refresh could not find: " + page.ContentType)
		}

		// Render again
		body, ok := provider.Render(page.ContentType, pcontext, pm.Config, data)
		if !ok {
			h.Runtime.Log.Info("provider.Render could not find: " + page.ContentType)
		}

		// Compare to stored render
		if body != page.Body {
			// Persist latest data
			page.Body = body
			p = append(p, page)

			refID := uniqueid.Generate()

			err = h.Store.Page.Update(ctx, page, refID, ctx.UserID, false)
			if err != nil {
				h.Runtime.Log.Error(method, err)
				response.WriteServerError(w, method, err)
				ctx.Transaction.Rollback()
				return
			}

			err = h.Store.Page.UpdateMeta(ctx, pm, false) // do not change the UserID on this PageMeta
			if err != nil {
				h.Runtime.Log.Error(method, err)
				response.WriteServerError(w, method, err)
				ctx.Transaction.Rollback()
				return
			}
		}
	}

	ctx.Transaction.Commit()

	response.WriteJSON(w, p)
}
