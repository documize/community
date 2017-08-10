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

package convapi

import (
	"encoding/json"
	"net/http"
)

// apiJSONResponse is the structure of a JSON response to a Documize client.
type apiJSONResponse struct {
	Code    int
	Success bool
	Message string
	Data    interface{}
}

// SetJSONResponse sets the response type to "application/json" in the HTTP header.
func SetJSONResponse(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
}

// WriteError to the http.ResponseWriter, taking care to provide the correct
// response error code within the JSON response.
func WriteError(w http.ResponseWriter, err error) {
	response := apiJSONResponse{}
	response.Message = err.Error()
	response.Success = false
	response.Data = nil

	switch err.Error() {
	case "BadRequest":
		response.Code = 400
		w.WriteHeader(http.StatusBadRequest)
	case "Unauthorized":
		response.Code = 401
		w.WriteHeader(http.StatusUnauthorized)
	case "Forbidden":
		response.Code = 403
		w.WriteHeader(http.StatusForbidden)
	case "NotFound":
		response.Code = 404
		w.WriteHeader(http.StatusNotFound)
	default:
		response.Code = 500
		w.WriteHeader(http.StatusInternalServerError)
	}

	json, _ := json.Marshal(response)
	w.Write(json)
}

// WriteErrorBadRequest provides feedback to a Documize client on an error,
// where that error is described in a string.
func WriteErrorBadRequest(w http.ResponseWriter, message string) {
	response := apiJSONResponse{}
	response.Message = message
	response.Success = false
	response.Data = nil

	response.Code = 400
	w.WriteHeader(http.StatusBadRequest)

	json, _ := json.Marshal(response)

	w.Write(json)
}
