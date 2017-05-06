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

package endpoint

import (
	"database/sql"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/api/request"
	"github.com/documize/community/core/api/util"
	"github.com/documize/community/core/log"

	"github.com/gorilla/mux"
)

// AddPin saves pinned item.
func AddPin(w http.ResponseWriter, r *http.Request) {
	if IsInvalidLicense() {
		util.WriteBadLicense(w)
		return
	}

	method := "AddPin"
	p := request.GetPersister(r)
	params := mux.Vars(r)
	userID := params["userID"]

	if !p.Context.Authenticated {
		writeForbiddenError(w)
		return
	}

	if len(userID) == 0 {
		writeMissingDataError(w, method, "userID")
		return
	}

	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	var pin entity.Pin
	err = json.Unmarshal(body, &pin)
	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	pin.RefID = util.UniqueID()
	pin.OrgID = p.Context.OrgID
	pin.UserID = p.Context.UserID
	pin.Pin = strings.TrimSpace(pin.Pin)
	if len(pin.Pin) > 20 {
		pin.Pin = pin.Pin[0:20]
	}

	tx, err := request.Db.Beginx()
	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	err = p.AddPin(pin)
	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	p.RecordEvent(entity.EventTypePinAdd)

	log.IfErr(tx.Commit())

	newPin, err := p.GetPin(pin.RefID)
	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	util.WriteJSON(w, newPin)
}

// GetUserPins returns users' pins.
func GetUserPins(w http.ResponseWriter, r *http.Request) {
	method := "GetUserPins"
	p := request.GetPersister(r)
	params := mux.Vars(r)
	userID := params["userID"]

	if len(userID) == 0 {
		writeMissingDataError(w, method, "userID")
		return
	}

	if p.Context.UserID != userID {
		writeForbiddenError(w)
		return
	}

	pins, err := p.GetUserPins(userID)

	if err != nil && err != sql.ErrNoRows {
		writeGeneralSQLError(w, method, err)
		return
	}

	if err == sql.ErrNoRows {
		pins = []entity.Pin{}
	}

	json, err := json.Marshal(pins)

	if err != nil {
		writeJSONMarshalError(w, method, "pin", err)
		return
	}

	writeSuccessBytes(w, json)
}

// DeleteUserPin removes saved user pin.
func DeleteUserPin(w http.ResponseWriter, r *http.Request) {
	if IsInvalidLicense() {
		util.WriteBadLicense(w)
		return
	}

	method := "DeleteUserPin"
	p := request.GetPersister(r)
	params := mux.Vars(r)
	userID := params["userID"]
	pinID := params["pinID"]

	if len(userID) == 0 {
		writeMissingDataError(w, method, "userID")
		return
	}

	if len(pinID) == 0 {
		writeMissingDataError(w, method, "pinID")
		return
	}

	if p.Context.UserID != userID {
		writeForbiddenError(w)
		return
	}

	tx, err := request.Db.Beginx()
	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	_, err = p.DeletePin(pinID)

	if err != nil && err != sql.ErrNoRows {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	p.RecordEvent(entity.EventTypePinDelete)

	log.IfErr(tx.Commit())

	util.WriteSuccessEmptyJSON(w)
}

// UpdatePinSequence records order of pinned items.
func UpdatePinSequence(w http.ResponseWriter, r *http.Request) {
	if IsInvalidLicense() {
		util.WriteBadLicense(w)
		return
	}

	method := "UpdatePinSequence"
	p := request.GetPersister(r)
	params := mux.Vars(r)
	userID := params["userID"]

	if !p.Context.Authenticated {
		writeForbiddenError(w)
		return
	}

	if len(userID) == 0 {
		writeMissingDataError(w, method, "userID")
		return
	}

	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	var pins []string

	err = json.Unmarshal(body, &pins)
	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	tx, err := request.Db.Beginx()
	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	for k, v := range pins {
		err = p.UpdatePinSequence(v, k+1)

		if err != nil {
			log.IfErr(tx.Rollback())
			writeGeneralSQLError(w, method, err)
			return
		}
	}

	p.RecordEvent(entity.EventTypePinResequence)

	log.IfErr(tx.Commit())

	newPins, err := p.GetUserPins(userID)
	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	util.WriteJSON(w, newPins)
}
