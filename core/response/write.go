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
	"net/http"
)

// Helper for writing consistent headers back to HTTP client
func writeStatus(w http.ResponseWriter, status int) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
}

// WriteMissingDataError notifies HTTP client of missing data in request.
func WriteMissingDataError(w http.ResponseWriter, method, parameter string) {
	writeStatus(w, http.StatusBadRequest)
	w.Write([]byte("{Error: 'Missing data'}"))
}

// WriteNotFoundError notifies HTTP client of 'record not found' error.
func WriteNotFoundError(w http.ResponseWriter, method string, id string) {
	writeStatus(w, http.StatusNotFound)
	w.Write([]byte("{Error: 'Not found'}"))
}

// WriteServerError notifies HTTP client of general application error.
func WriteServerError(w http.ResponseWriter, method string, err error) {
	writeStatus(w, http.StatusBadRequest)
	w.Write([]byte("{Error: 'Internal server error'}"))
}

// WriteDuplicateError notifies HTTP client of duplicate data that has been rejected.
func WriteDuplicateError(w http.ResponseWriter, method, entity string) {
	writeStatus(w, http.StatusConflict)
	w.Write([]byte("{Error: 'Duplicate record'}"))
}

// WriteUnauthorizedError notifies HTTP client of rejected unauthorized request.
func WriteUnauthorizedError(w http.ResponseWriter) {
	writeStatus(w, http.StatusUnauthorized)
	w.Write([]byte("{Error: 'Unauthorized'}"))
}

// WriteForbiddenError notifies HTTP client of request that is not allowed.
func WriteForbiddenError(w http.ResponseWriter) {
	writeStatus(w, http.StatusForbidden)
	w.Write([]byte("{Error: 'Forbidden'}"))
}

// WriteBadRequestError notifies HTTP client of rejected request due to bad data within request.
func WriteBadRequestError(w http.ResponseWriter, method, message string) {
	writeStatus(w, http.StatusBadRequest)
	w.Write([]byte("{Error: 'Bad Request'}"))
}

// WriteBadLicense notifies HTTP client of invalid license (402)
func WriteBadLicense(w http.ResponseWriter) {
	writeStatus(w, http.StatusPaymentRequired)

	var e struct {
		Reason string
	}

	e.Reason = "invalid or expired Documize license"

	j, _ := json.Marshal(e)
	w.Write(j)
}

// WriteBytes dumps bytes to HTTP response
func WriteBytes(w http.ResponseWriter, data []byte) {
	writeStatus(w, http.StatusOK)
	w.Write(data)
}

// WriteString writes string to HTTP response
func WriteString(w http.ResponseWriter, data string) {
	writeStatus(w, http.StatusOK)
	w.Write([]byte(data))
}

// WriteEmpty writes empty JSON HTTP response
func WriteEmpty(w http.ResponseWriter) {
	writeStatus(w, http.StatusOK)
	w.Write([]byte("{}"))
}

// WriteJSON serializes data as JSON to HTTP response.
func WriteJSON(w http.ResponseWriter, v interface{}) {
	writeStatus(w, http.StatusOK)
	j, _ := json.Marshal(v)
	w.Write(j)
}
