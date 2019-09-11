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

package search

import (
	"fmt"
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/response"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
	Indexer Indexer
}

// Reindex indexes all documents and attachments.
func (h *Handler) Reindex(w http.ResponseWriter, r *http.Request) {
	ctx := domain.GetRequestContext(r)

	if !ctx.GlobalAdmin {
		response.WriteForbiddenError(w)
		h.Runtime.Log.Info(fmt.Sprintf("%s attempted search reindex", ctx.UserID))
		return
	}

	if h.Runtime.StoreProvider.Type() != env.StoreTypeSQLServer {
		h.Runtime.Log.Info("Building search index")
		go h.Indexer.Rebuild(ctx)
	}

	response.WriteEmpty(w)
}

// Status returns state of search index
func (h *Handler) Status(w http.ResponseWriter, r *http.Request) {
	method := "meta.SearchStatus"
	ctx := domain.GetRequestContext(r)

	if !ctx.GlobalAdmin {
		response.WriteForbiddenError(w)
		h.Runtime.Log.Info(fmt.Sprintf("%s attempted get of search status", ctx.UserID))
		return
	}

	count, err := h.Store.Meta.SearchIndexCount(ctx)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	var ss = searchStatus{Entries: count}

	response.WriteJSON(w, ss)
}

type searchStatus struct {
	Entries int `json:"entries"`
}
