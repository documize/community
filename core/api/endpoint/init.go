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
	"fmt"
	"net/http"

	"github.com/documize/community/core/api/request"
	"github.com/documize/community/core/api/store"
	"github.com/documize/community/core/log"
)

var storageProvider store.StorageProvider

func init() {
	storageProvider = new(store.LocalStorageProvider)
}

//getAppURL returns full HTTP url for the app
func getAppURL(c request.Context, endpoint string) string {

	scheme := "http://"

	if c.SSL {
		scheme = "https://"
	}

	return fmt.Sprintf("%s%s/%s", scheme, c.AppURL, endpoint)
}

func writePayloadError(w http.ResponseWriter, method string, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err2 := w.Write([]byte("{Error: 'Bad payload'}"))
	log.IfErr(err2)
	log.Error(fmt.Sprintf("Unable to decode HTML request body for method %s", method), err)
}

func writeTransactionError(w http.ResponseWriter, method string, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusInternalServerError)
	_, err2 := w.Write([]byte("{Error: 'No transaction'}"))
	log.IfErr(err2)
	log.Error(fmt.Sprintf("Unable to get database transaction  for method %s", method), err)
}

/*
func WriteAddRecordError(w http.ResponseWriter, method string, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusInternalServerError)
	_, err2 := w.Write([]byte("{Error: 'Add error'}"))
	log.IfErr(err2)
	log.Error(fmt.Sprintf("Unable to insert new database record for method %s", method), err)
}

func WriteGetRecordError(w http.ResponseWriter, method, entity string, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusInternalServerError)
	_, err2 := w.Write([]byte("{Error: 'Get error'}"))
	log.IfErr(err2)
	log.Error(fmt.Sprintf("Unable to get %s record for method %s", entity, method), err)
}

func WriteUpdateRecordError(w http.ResponseWriter, method string, id string, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusInternalServerError)
	_, err2 := w.Write([]byte("{Error: 'Add error'}"))
	log.IfErr(err2)
	log.Error(fmt.Sprintf("Unable to update database record ID %s for method %s", id, method), err)
}

func WriteParameterParsingError(w http.ResponseWriter, method, parameter string, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err2 := w.Write([]byte("{Error: 'Bad parameter'}"))
	log.IfErr(err2)
	log.Error(fmt.Sprintf("Unable to parse API parameter %s for method %s", parameter, method), err)
}
*/

func writeMissingDataError(w http.ResponseWriter, method, parameter string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err := w.Write([]byte("{Error: 'Missing data'}"))
	log.IfErr(err)
	log.Info(fmt.Sprintf("Missing data %s for method %s", parameter, method))
}

func writeNotFoundError(w http.ResponseWriter, method string, id string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusNotFound)
	_, err := w.Write([]byte("{Error: 'Not found'}"))
	log.IfErr(err)
	log.Info(fmt.Sprintf("Not found ID %s for method %s", id, method))
}

func writeGeneralSQLError(w http.ResponseWriter, method string, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err2 := w.Write([]byte("{Error: 'SQL error'}"))
	log.IfErr(err2)
	log.Error(fmt.Sprintf("General SQL error for method %s", method), err)
}

func writeJSONMarshalError(w http.ResponseWriter, method, entity string, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err2 := w.Write([]byte("{Error: 'JSON marshal failed'}"))
	log.IfErr(err2)
	log.Error(fmt.Sprintf("Failed to JSON marshal %s for method %s", entity, method), err)
}

func writeServerError(w http.ResponseWriter, method string, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err2 := w.Write([]byte("{Error: 'Internal server error'}"))
	log.IfErr(err2)
	log.Error(fmt.Sprintf("Internal server error for method %s", method), err)
}

func writeDuplicateError(w http.ResponseWriter, method, entity string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusConflict)
	_, err := w.Write([]byte("{Error: 'Duplicate record'}"))
	log.IfErr(err)
	log.Info(fmt.Sprintf("Duplicate %s record detected for method %s", entity, method))
}

func writeUnauthorizedError(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusUnauthorized)
	_, err := w.Write([]byte("{Error: 'Unauthorized'}"))
	log.IfErr(err)
}

func writeForbiddenError(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusForbidden)
	_, err := w.Write([]byte("{Error: 'Forbidden'}"))
	log.IfErr(err)
}

func writeBadRequestError(w http.ResponseWriter, method, message string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err := w.Write([]byte("{Error: 'Bad Request'}"))
	log.IfErr(err)
	log.Info(fmt.Sprintf("Bad Request %s for method %s", message, method))
}

func writeSuccessBytes(w http.ResponseWriter, data []byte) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, err := w.Write(data)
	log.IfErr(err)
}

func writeSuccessString(w http.ResponseWriter, data string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, err := w.Write([]byte(data))
	log.IfErr(err)
}

func writeSuccessEmptyJSON(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, err := w.Write([]byte("{}"))
	log.IfErr(err)
}
