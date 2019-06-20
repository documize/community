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

package block

import (
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/permission"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/block"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Add inserts new reusable content block into database.
func (h *Handler) Add(w http.ResponseWriter, r *http.Request) {
	method := "block.add"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.IsValid(ctx) {
		response.WriteBadLicense(w)
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		return
	}

	b := block.Block{}
	err = json.Unmarshal(body, &b)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	if !permission.CanUploadDocument(ctx, *h.Store, b.SpaceID) {
		response.WriteForbiddenError(w)
		return
	}

	b.RefID = uniqueid.Generate()

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Block.Add(ctx, b)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeBlockAdd)

	b, err = h.Store.Block.Get(ctx, b.RefID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	response.WriteJSON(w, b)
}

// Get returns requested reusable content block.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	method := "block.get"
	ctx := domain.GetRequestContext(r)

	blockID := request.Param(r, "blockID")
	if len(blockID) == 0 {
		response.WriteMissingDataError(w, method, "blockID")
		return
	}

	b, err := h.Store.Block.Get(ctx, blockID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	response.WriteJSON(w, b)
}

// GetBySpace returns available reusable content blocks for the space.
func (h *Handler) GetBySpace(w http.ResponseWriter, r *http.Request) {
	method := "block.space"
	ctx := domain.GetRequestContext(r)

	spaceID := request.Param(r, "spaceID")
	if len(spaceID) == 0 {
		response.WriteMissingDataError(w, method, "spaceID")
		return
	}

	var b []block.Block
	var err error

	b, err = h.Store.Block.GetBySpace(ctx, spaceID)

	if len(b) == 0 {
		b = []block.Block{}
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	response.WriteJSON(w, b)
}

// Update inserts new reusable content block into database.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	method := "block.update"
	ctx := domain.GetRequestContext(r)

	blockID := request.Param(r, "blockID")
	if len(blockID) == 0 {
		response.WriteMissingDataError(w, method, "blockID")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "Bad payload")
		return
	}

	b := block.Block{}
	err = json.Unmarshal(body, &b)
	if err != nil {
		response.WriteBadRequestError(w, method, "Bad payload")
		return
	}

	b.RefID = blockID

	if !permission.CanUploadDocument(ctx, *h.Store, b.SpaceID) {
		response.WriteForbiddenError(w)
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Block.Update(ctx, b)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeBlockUpdate)

	response.WriteEmpty(w)
}

// Delete removes requested reusable content block.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	method := "block.update"
	ctx := domain.GetRequestContext(r)

	blockID := request.Param(r, "blockID")
	if len(blockID) == 0 {
		response.WriteMissingDataError(w, method, "blockID")
		return
	}

	var err error
	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	_, err = h.Store.Block.Delete(ctx, blockID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Block.RemoveReference(ctx, blockID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeBlockDelete)

	response.WriteEmpty(w)
}
