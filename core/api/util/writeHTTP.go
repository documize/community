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

package util

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/documize/community/core/log"
)

func WritePayloadError(w http.ResponseWriter, method string, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err2 := w.Write([]byte("{Error: 'Bad payload'}"))
	log.IfErr(err2)
	log.Error(fmt.Sprintf("Unable to decode HTML request body for method %s", method), err)
}

func WriteTransactionError(w http.ResponseWriter, method string, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusInternalServerError)
	_, err2 := w.Write([]byte("{Error: 'No transaction'}"))
	log.IfErr(err2)
	log.Error(fmt.Sprintf("Unable to get database transaction  for method %s", method), err)
}

func WriteMissingDataError(w http.ResponseWriter, method, parameter string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err := w.Write([]byte("{Error: 'Missing data'}"))
	log.IfErr(err)
	log.Info(fmt.Sprintf("Missing data %s for method %s", parameter, method))
}

func WriteNotFoundError(w http.ResponseWriter, method string, id string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusNotFound)
	_, err := w.Write([]byte("{Error: 'Not found'}"))
	log.IfErr(err)
	log.Info(fmt.Sprintf("Not found ID %s for method %s", id, method))
}

func WriteGeneralSQLError(w http.ResponseWriter, method string, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err2 := w.Write([]byte("{Error: 'SQL error'}"))
	log.IfErr(err2)
	log.Error(fmt.Sprintf("General SQL error for method %s", method), err)
}

func WriteJSONMarshalError(w http.ResponseWriter, method, entity string, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err2 := w.Write([]byte("{Error: 'JSON marshal failed'}"))
	log.IfErr(err2)
	log.Error(fmt.Sprintf("Failed to JSON marshal %s for method %s", entity, method), err)
}

func WriteServerError(w http.ResponseWriter, method string, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err2 := w.Write([]byte("{Error: 'Internal server error'}"))
	log.IfErr(err2)
	log.Error(fmt.Sprintf("Internal server error for method %s", method), err)
}

func WriteDuplicateError(w http.ResponseWriter, method, entity string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusConflict)
	_, err := w.Write([]byte("{Error: 'Duplicate record'}"))
	log.IfErr(err)
	log.Info(fmt.Sprintf("Duplicate %s record detected for method %s", entity, method))
}

func WriteUnauthorizedError(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusUnauthorized)
	_, err := w.Write([]byte("{Error: 'Unauthorized'}"))
	log.IfErr(err)
}

func WriteForbiddenError(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusForbidden)
	_, err := w.Write([]byte("{Error: 'Forbidden'}"))
	log.IfErr(err)
}

func WriteBadRequestError(w http.ResponseWriter, method, message string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err := w.Write([]byte("{Error: 'Bad Request'}"))
	log.IfErr(err)
	log.Info(fmt.Sprintf("Bad Request %s for method %s", message, method))
}

func WriteSuccessBytes(w http.ResponseWriter, data []byte) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, err := w.Write(data)
	log.IfErr(err)
}

func WriteSuccessString(w http.ResponseWriter, data string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, err := w.Write([]byte(data))
	log.IfErr(err)
}

func WriteSuccessEmptyJSON(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, err := w.Write([]byte("{}"))
	log.IfErr(err)
}

func WriteMarshalError(w http.ResponseWriter, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err2 := w.Write([]byte("{Error: 'JSON marshal failed'}"))
	log.IfErr(err2)
	log.Error("Failed to JSON marshal", err)
}

// WriteJSON serializes data as JSON to HTTP response.
func WriteJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)

	j, err := json.Marshal(v)

	if err != nil {
		WriteMarshalError(w, err)
		return
	}

	_, err = w.Write(j)
	log.IfErr(err)
}
