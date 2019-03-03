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

package label

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
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/label"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Add space label to the store.
func (h *Handler) Add(w http.ResponseWriter, r *http.Request) {
	method := "label.Add"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.IsValid(ctx) {
		response.WriteBadLicense(w)
		return
	}

	if !ctx.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		return
	}

	l := label.Label{}
	err = json.Unmarshal(body, &l)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}
	l.RefID = uniqueid.Generate()
	l.OrgID = ctx.OrgID

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Label.Add(ctx, l)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeLabelAdd)

	response.WriteJSON(w, l)
}

// Get returns all space labels.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	method := "label.Get"
	ctx := domain.GetRequestContext(r)

	l, err := h.Store.Label.Get(ctx)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	if len(l) == 0 {
		l = []label.Label{}
	}

	response.WriteJSON(w, l)
}

// Update persists label name/color changes.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	method := "label.Update"
	ctx := domain.GetRequestContext(r)

	if !ctx.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	labelID := request.Param(r, "labelID")
	if len(labelID) == 0 {
		response.WriteMissingDataError(w, method, "labelID")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "Bad payload")
		return
	}

	l := label.Label{}
	err = json.Unmarshal(body, &l)
	if err != nil {
		response.WriteBadRequestError(w, method, "Bad payload")
		return
	}

	l.RefID = labelID

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Label.Update(ctx, l)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeLabelUpdate)

	response.WriteJSON(w, l)
}

// Delete removes space label from store and
// removes label association from spaces.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	method := "label.Delete"
	ctx := domain.GetRequestContext(r)

	labelID := request.Param(r, "labelID")
	if len(labelID) == 0 {
		response.WriteMissingDataError(w, method, "labelID")
		return
	}

	var err error
	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	_, err = h.Store.Label.Delete(ctx, labelID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Label.RemoveReference(ctx, labelID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeLabelDelete)

	response.WriteEmpty(w)
}
