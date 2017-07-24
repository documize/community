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

	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/eventing"
)

// Add saves pinned item.
func (h *Handler) Add(w http.ResponseWriter, r *http.Request) {
	method := "pin.Add"
	s := domain.NewContext(h.Runtime, r)

	userID := request.Param(r, "userID")
	if len(userID) == 0 {
		response.WriteMissingDataError(w, method, "userID")
		return
	}

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	if !s.Context.Authenticated {
		response.WriteForbiddenError(w)
		return
	}

	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "body")
		return
	}

	var pin Pin
	err = json.Unmarshal(body, &pin)
	if err != nil {
		response.WriteBadRequestError(w, method, "pin")
		return
	}

	pin.RefID = uniqueid.Generate()
	pin.OrgID = s.Context.OrgID
	pin.UserID = s.Context.UserID
	pin.Pin = strings.TrimSpace(pin.Pin)
	if len(pin.Pin) > 20 {
		pin.Pin = pin.Pin[0:20]
	}

	s.Context.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	err = Add(s, pin)
	if err != nil {
		s.Context.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	eventing.Record(s, eventing.EventTypePinAdd)

	s.Context.Transaction.Commit()

	newPin, err := GetPin(s, pin.RefID)
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	response.WriteJSON(w, newPin)
}

// GetUserPins returns users' pins.
func (h *Handler) GetUserPins(w http.ResponseWriter, r *http.Request) {
	method := "pin.GetUserPins"
	s := domain.NewContext(h.Runtime, r)

	userID := request.Param(r, "userID")
	if len(userID) == 0 {
		response.WriteMissingDataError(w, method, "userID")
		return
	}

	if !s.Context.Authenticated {
		response.WriteForbiddenError(w)
		return
	}

	pins, err := GetUserPins(s, userID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}

	if err == sql.ErrNoRows {
		pins = []Pin{}
	}

	response.WriteJSON(w, pins)
}

// DeleteUserPin removes saved user pin.
func (h *Handler) DeleteUserPin(w http.ResponseWriter, r *http.Request) {
	method := "pin.DeleteUserPin"
	s := domain.NewContext(h.Runtime, r)

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

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	if s.Context.UserID != userID {
		response.WriteForbiddenError(w)
		return
	}

	var err error
	s.Context.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	_, err = DeletePin(s, pinID)
	if err != nil && err != sql.ErrNoRows {
		s.Context.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	eventing.Record(s, eventing.EventTypePinDelete)

	s.Context.Transaction.Commit()

	response.WriteEmpty(w)
}

// UpdatePinSequence records order of pinned items.
func (h *Handler) UpdatePinSequence(w http.ResponseWriter, r *http.Request) {
	method := "pin.DeleteUserPin"
	s := domain.NewContext(h.Runtime, r)

	userID := request.Param(r, "userID")
	if len(userID) == 0 {
		response.WriteMissingDataError(w, method, "userID")
		return
	}

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	if !s.Context.Authenticated {
		response.WriteForbiddenError(w)
		return
	}

	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		return
	}

	var pins []string

	err = json.Unmarshal(body, &pins)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		return
	}

	s.Context.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	for k, v := range pins {
		err = UpdatePinSequence(s, v, k+1)
		if err != nil {
			s.Context.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			return
		}
	}

	eventing.Record(s, eventing.EventTypePinResequence)

	s.Context.Transaction.Commit()

	newPins, err := GetUserPins(s, userID)
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	response.WriteJSON(w, newPins)
}
