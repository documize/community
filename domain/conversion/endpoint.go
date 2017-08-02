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

package conversion

import (
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/response"
	"github.com/documize/community/domain"
	"github.com/documize/community/model/template"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *domain.Store
}

// SavedList returns all templates saved by the user
func (h *Handler) SavedList(w http.ResponseWriter, r *http.Request) {
	method := "template.saved"
	ctx := domain.GetRequestContext(r)

	documents, err := h.Store.Document.Templates(ctx)
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	templates := []template.Template{}

	for _, d := range documents {
		var t = template.Template{}
		t.ID = d.RefID
		t.Title = d.Title
		t.Description = d.Excerpt
		t.Author = ""
		t.Dated = d.Created
		t.Type = template.TypePrivate

		templates = append(templates, t)
	}

	response.WriteJSON(w, templates)
}
