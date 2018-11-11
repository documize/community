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

package pin

import (
	"database/sql"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/pin"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Add saves pinned item.
func (h *Handler) Add(w http.ResponseWriter, r *http.Request) {
	method := "pin.Add"
	ctx := domain.GetRequestContext(r)

	userID := request.Param(r, "userID")
	if len(userID) == 0 {
		response.WriteMissingDataError(w, method, "userID")
		return
	}

	if !h.Runtime.Product.IsValid(ctx) {
		response.WriteBadLicense(w)
		return
	}

	if !ctx.Authenticated {
		response.WriteForbiddenError(w)
		return
	}

	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "body")
		h.Runtime.Log.Error(method, err)
		return
	}

	var pin pin.Pin
	err = json.Unmarshal(body, &pin)
	if err != nil {
		response.WriteBadRequestError(w, method, "pin")
		h.Runtime.Log.Error(method, err)
		return
	}

	pin.RefID = uniqueid.Generate()
	pin.OrgID = ctx.OrgID
	pin.UserID = ctx.UserID
	pin.Name = strings.TrimSpace(pin.Name)
	if len(pin.Name) > 20 {
		pin.Name = pin.Name[0:20]
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Pin.Add(ctx, pin)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypePinAdd)

	newPin, err := h.Store.Pin.GetPin(ctx, pin.RefID)
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	response.WriteJSON(w, newPin)
}

// GetUserPins returns users' pins.
func (h *Handler) GetUserPins(w http.ResponseWriter, r *http.Request) {
	method := "pin.GetUserPins"
	ctx := domain.GetRequestContext(r)

	userID := request.Param(r, "userID")
	if len(userID) == 0 {
		response.WriteMissingDataError(w, method, "userID")
		return
	}

	if !ctx.Authenticated {
		response.WriteForbiddenError(w)
		return
	}

	pins, err := h.Store.Pin.GetUserPins(ctx, userID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if err == sql.ErrNoRows {
		pins = []pin.Pin{}
	}

	response.WriteJSON(w, pins)
}

// DeleteUserPin removes saved user pin.
func (h *Handler) DeleteUserPin(w http.ResponseWriter, r *http.Request) {
	method := "pin.DeleteUserPin"
	ctx := domain.GetRequestContext(r)

	userID := request.Param(r, "userID")
	if len(userID) == 0 {
		response.WriteMissingDataError(w, method, "userID")
		return
	}

	pinID := request.Param(r, "pinID")
	if len(pinID) == 0 {
		response.WriteMissingDataError(w, method, "pinID")
		return
	}

	if !h.Runtime.Product.IsValid(ctx) {
		response.WriteBadLicense(w)
		return
	}

	if ctx.UserID != userID {
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

	_, err = h.Store.Pin.DeletePin(ctx, pinID)
	if err != nil && err != sql.ErrNoRows {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypePinDelete)

	response.WriteEmpty(w)
}

// UpdatePinSequence records order of pinned items.
func (h *Handler) UpdatePinSequence(w http.ResponseWriter, r *http.Request) {
	method := "pin.DeleteUserPin"
	ctx := domain.GetRequestContext(r)

	userID := request.Param(r, "userID")
	if len(userID) == 0 {
		response.WriteMissingDataError(w, method, "userID")
		return
	}

	if !h.Runtime.Product.IsValid(ctx) {
		response.WriteBadLicense(w)
		return
	}

	if !ctx.Authenticated {
		response.WriteForbiddenError(w)
		return
	}

	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	var pins []string

	err = json.Unmarshal(body, &pins)
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

	for k, v := range pins {
		err = h.Store.Pin.UpdatePinSequence(ctx, v, k+1)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypePinResequence)

	newPins, err := h.Store.Pin.GetUserPins(ctx, userID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	response.WriteJSON(w, newPins)
}
