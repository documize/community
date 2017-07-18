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

// Package response provides functions to write HTTP response.
package response

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/documize/community/core/log"
)

// Helper for writing consistent headers back to HTTP client
func writeStatus(w http.ResponseWriter, status int) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
}

// WriteMissingDataError notifies HTTP client of missing data in request.
func WriteMissingDataError(w http.ResponseWriter, method, parameter string) {
	writeStatus(w, http.StatusBadRequest)
	_, err := w.Write([]byte("{Error: 'Missing data'}"))
	log.IfErr(err)
	log.Info(fmt.Sprintf("Missing data %s for method %s", parameter, method))
}

// WriteNotFoundError notifies HTTP client of 'record not found' error.
func WriteNotFoundError(w http.ResponseWriter, method string, id string) {
	writeStatus(w, http.StatusNotFound)
	_, err := w.Write([]byte("{Error: 'Not found'}"))
	log.IfErr(err)
	log.Info(fmt.Sprintf("Not found ID %s for method %s", id, method))
}

// WriteServerError notifies HTTP client of general application error.
func WriteServerError(w http.ResponseWriter, method string, err error) {
	writeStatus(w, http.StatusBadRequest)
	_, err2 := w.Write([]byte("{Error: 'Internal server error'}"))
	log.IfErr(err2)
	log.Error(fmt.Sprintf("Internal server error for method %s", method), err)
}

// WriteDuplicateError notifies HTTP client of duplicate data that has been rejected.
func WriteDuplicateError(w http.ResponseWriter, method, entity string) {
	writeStatus(w, http.StatusConflict)
	_, err := w.Write([]byte("{Error: 'Duplicate record'}"))
	log.IfErr(err)
	log.Info(fmt.Sprintf("Duplicate %s record detected for method %s", entity, method))
}

// WriteUnauthorizedError notifies HTTP client of rejected unauthorized request.
func WriteUnauthorizedError(w http.ResponseWriter) {
	writeStatus(w, http.StatusUnauthorized)
	_, err := w.Write([]byte("{Error: 'Unauthorized'}"))
	log.IfErr(err)
}

// WriteForbiddenError notifies HTTP client of request that is not allowed.
func WriteForbiddenError(w http.ResponseWriter) {
	writeStatus(w, http.StatusForbidden)
	_, err := w.Write([]byte("{Error: 'Forbidden'}"))
	log.IfErr(err)
}

// WriteBadRequestError notifies HTTP client of rejected request due to bad data within request.
func WriteBadRequestError(w http.ResponseWriter, method, message string) {
	writeStatus(w, http.StatusBadRequest)
	_, err := w.Write([]byte("{Error: 'Bad Request'}"))
	log.IfErr(err)
	log.Info(fmt.Sprintf("Bad Request %s for method %s", message, method))
}

// WriteBadLicense notifies HTTP client of invalid license (402)
func WriteBadLicense(w http.ResponseWriter) {
	writeStatus(w, http.StatusPaymentRequired)

	var e struct {
		Reason string
	}
	e.Reason = "invalid or expired Documize license"

	j, _ := json.Marshal(e)
	_, err := w.Write(j)
	log.IfErr(err)
}

// WriteBytes dumps bytes to HTTP response
func WriteBytes(w http.ResponseWriter, data []byte) {
	writeStatus(w, http.StatusOK)
	_, err := w.Write(data)
	log.IfErr(err)
}

// WriteString writes string to HTTP response
func WriteString(w http.ResponseWriter, data string) {
	writeStatus(w, http.StatusOK)
	_, err := w.Write([]byte(data))
	log.IfErr(err)
}

// WriteEmpty writes empty JSON HTTP response
func WriteEmpty(w http.ResponseWriter) {
	writeStatus(w, http.StatusOK)
	_, err := w.Write([]byte("{}"))
	log.IfErr(err)
}

// WriteJSON serializes data as JSON to HTTP response.
func WriteJSON(w http.ResponseWriter, v interface{}) {
	writeStatus(w, http.StatusOK)

	j, err := json.Marshal(v)

	if err != nil {
		log.IfErr(err)
	}

	_, err = w.Write(j)
	log.IfErr(err)
}
