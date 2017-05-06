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

	"encoding/xml"
	"fmt"
	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/api/request"
	"github.com/documize/community/core/api/util"
	"github.com/documize/community/core/event"
	"github.com/documize/community/core/log"
)

// GetSMTPConfig returns installation-wide SMTP settings
func GetSMTPConfig(w http.ResponseWriter, r *http.Request) {
	method := "GetSMTPConfig"
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
		writeJSONMarshalError(w, method, "SMTP", err)
		return
	}

	util.WriteSuccessBytes(w, json)
}

// SaveSMTPConfig persists global SMTP configuration.
func SaveSMTPConfig(w http.ResponseWriter, r *http.Request) {
	method := "SaveSMTPConfig"
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

	p.RecordEvent(entity.EventTypeSystemSMTP)
}

// GetLicense returns product license
func GetLicense(w http.ResponseWriter, r *http.Request) {
	// method := "GetLicense"
	p := request.GetPersister(r)

	if !p.Context.Global {
		writeForbiddenError(w)
		return
	}

	// SMTP settings
	config := request.ConfigString("EDITION-LICENSE", "")
	if len(config) == 0 {
		config = "{}"
	}

	x := &licenseXML{Key: "", Signature: ""}
	lj := licenseJSON{}

	err := json.Unmarshal([]byte(config), &lj)
	if err == nil {
		x.Key = lj.Key
		x.Signature = lj.Signature
	} else {
		fmt.Println(err)
	}

	output, err := xml.Marshal(x)
	if err != nil {
		fmt.Printf("error: %v\n", err)
	}

	w.WriteHeader(http.StatusOK)
	w.Write(output)
}

// SaveLicense persists product license
func SaveLicense(w http.ResponseWriter, r *http.Request) {
	method := "SaveLicense"
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
	lj := licenseJSON{}
	x := licenseXML{Key: "", Signature: ""}

	err = xml.Unmarshal([]byte(config), &x)
	if err == nil {
		lj.Key = x.Key
		lj.Signature = x.Signature
	} else {
		fmt.Println(err)
	}

	j, err := json.Marshal(lj)
	js := "{}"
	if err == nil {
		js = string(j)
	}

	request.ConfigSet("EDITION-LICENSE", js)

	event.Handler().Publish(string(event.TypeSystemLicenseChange))

	p.Context.Transaction, err = request.Db.Beginx()
	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.RecordEvent(entity.EventTypeSystemLicense)
	log.IfErr(p.Context.Transaction.Commit())

	util.WriteSuccessEmptyJSON(w)
}

type licenseXML struct {
	XMLName   xml.Name `xml:"DocumizeLicense"`
	Key       string
	Signature string
}
type licenseJSON struct {
	Key       string `json:"key"`
	Signature string `json:"signature"`
}

/*
<DocumizeLicense>
  <Key>some key</Key>
  <Signature>some signature</Signature>
</DocumizeLicense>
*/

// SaveAuthConfig returns installation-wide authentication configuration
func SaveAuthConfig(w http.ResponseWriter, r *http.Request) {
	method := "SaveAuthConfig"
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

	var data authData
	err = json.Unmarshal(body, &data)
	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	org, err := p.GetOrganization(p.Context.OrgID)
	if err != nil {
		util.WriteGeneralSQLError(w, method, err)
		return
	}

	org.AuthProvider = data.AuthProvider
	org.AuthConfig = data.AuthConfig

	p.Context.Transaction, err = request.Db.Beginx()
	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	err = p.UpdateAuthConfig(org)
	if err != nil {
		util.WriteGeneralSQLError(w, method, err)
		p.Context.Transaction.Rollback()
		return
	}

	p.RecordEvent(entity.EventTypeSystemAuth)

	p.Context.Transaction.Commit()

	util.WriteSuccessEmptyJSON(w)
}

type authData struct {
	AuthProvider string `json:"authProvider"`
	AuthConfig   string `json:"authConfig"`
}

// GetAuthConfig returns installation-wide auth configuration
func GetAuthConfig(w http.ResponseWriter, r *http.Request) {
	p := request.GetPersister(r)

	if !p.Context.Global {
		writeForbiddenError(w)
		return
	}

	org, err := p.GetOrganization(p.Context.OrgID)
	if err != nil {
		writeForbiddenError(w)
		return
	}

	util.WriteJSON(w, org.AuthConfig)
}
