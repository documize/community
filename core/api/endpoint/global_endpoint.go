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
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/documize/community/core/api/request"
	"github.com/documize/community/core/api/util"
)

// GetGlobalConfig returns installation-wide settings
func GetGlobalConfig(w http.ResponseWriter, r *http.Request) {
	method := "GetGlobalConfig"
	p := request.GetPersister(r)

	if !p.Context.Global {
		writeForbiddenError(w)
		return
	}

	// SMTP settings
	config := request.ConfigString("SMTP", "")

	// marshall as JSON
	var y map[string]interface{}
	json.Unmarshal([]byte(config), &y)

	json, err := json.Marshal(y)
	if err != nil {
		writeJSONMarshalError(w, method, "GetGlobalConfig", err)
		return
	}

	util.WriteSuccessBytes(w, json)
}

// SaveGlobalConfig persists global configuration.
func SaveGlobalConfig(w http.ResponseWriter, r *http.Request) {
	method := "SaveGlobalConfig"
	p := request.GetPersister(r)

	if !p.Context.Global {
		writeForbiddenError(w)
		return
	}

	defer r.Body.Close()

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	var config string
	config = string(body)

	tx, err := request.Db.Beginx()
	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	request.ConfigSet("SMTP", config)

	util.WriteSuccessEmptyJSON(w)
}
