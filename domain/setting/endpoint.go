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

// Package setting manages both global and user level settings
package setting

import (
	"encoding/json"
	"encoding/xml"
	"io/ioutil"
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/event"
	"github.com/documize/community/core/response"
	"github.com/documize/community/domain"
	"github.com/documize/community/model/audit"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *domain.Store
}

// SMTP returns installation-wide SMTP settings
func (h *Handler) SMTP(w http.ResponseWriter, r *http.Request) {
	method := "setting.SMTP"
	ctx := domain.GetRequestContext(r)

	if !ctx.Global {
		response.WriteForbiddenError(w)
		return
	}

	config := h.Store.Setting.Get("SMTP", "")

	var y map[string]interface{}
	json.Unmarshal([]byte(config), &y)

	j, err := json.Marshal(y)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	response.WriteBytes(w, j)
}

// SetSMTP persists global SMTP configuration.
func (h *Handler) SetSMTP(w http.ResponseWriter, r *http.Request) {
	method := "setting.SetSMTP"
	ctx := domain.GetRequestContext(r)

	if !ctx.Global {
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

	var config string
	config = string(body)

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Setting.Set("SMTP", config)

	h.Store.Audit.Record(ctx, audit.EventTypeSystemSMTP)

	response.WriteEmpty(w)
}

// License returns product license
func (h *Handler) License(w http.ResponseWriter, r *http.Request) {
	ctx := domain.GetRequestContext(r)

	if !ctx.Global {
		response.WriteForbiddenError(w)
		return
	}

	config := h.Store.Setting.Get("EDITION-LICENSE", "")
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
		h.Runtime.Log.Error("failed to JSON unmarshal EDITION-LICENSE", err)
	}

	output, err := xml.Marshal(x)
	if err != nil {
		h.Runtime.Log.Error("failed to XML marshal EDITION-LICENSE", err)
	}

	response.WriteBytes(w, output)
}

// SetLicense persists product license
func (h *Handler) SetLicense(w http.ResponseWriter, r *http.Request) {
	method := "setting.SetLicense"
	ctx := domain.GetRequestContext(r)

	if !ctx.Global {
		response.WriteForbiddenError(w)
		return
	}

	defer r.Body.Close()

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
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
		h.Runtime.Log.Error("failed to XML unmarshal EDITION-LICENSE", err)
	}

	j, err := json.Marshal(lj)
	js := "{}"
	if err == nil {
		js = string(j)
	}

	h.Store.Setting.Set("EDITION-LICENSE", js)

	event.Handler().Publish(string(event.TypeSystemLicenseChange))

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	h.Store.Audit.Record(ctx, audit.EventTypeSystemLicense)
	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}

// AuthConfig returns installation-wide auth configuration
func (h *Handler) AuthConfig(w http.ResponseWriter, r *http.Request) {
	method := "global.auth"
	ctx := domain.GetRequestContext(r)

	if !ctx.Global {
		response.WriteForbiddenError(w)
		return
	}

	org, err := h.Store.Organization.GetOrganization(ctx, ctx.OrgID)
	if err != nil {
		response.WriteForbiddenError(w)
		h.Runtime.Log.Error(method, err)
		return
	}

	response.WriteJSON(w, org.AuthConfig)
}

// SetAuthConfig persists installation-wide authentication configuration
func (h *Handler) SetAuthConfig(w http.ResponseWriter, r *http.Request) {
	method := "global.auth.save"
	ctx := domain.GetRequestContext(r)

	if !ctx.Global {
		response.WriteForbiddenError(w)
		return
	}

	defer r.Body.Close()

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		return
	}

	var data authData
	err = json.Unmarshal(body, &data)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	org, err := h.Store.Organization.GetOrganization(ctx, ctx.OrgID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	org.AuthProvider = data.AuthProvider
	org.AuthConfig = data.AuthConfig

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Organization.UpdateAuthConfig(ctx, org)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Audit.Record(ctx, audit.EventTypeSystemAuth)

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}
