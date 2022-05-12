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
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/i18n"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/smtp"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/audit"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// SMTP returns installation-wide SMTP settings
func (h *Handler) SMTP(w http.ResponseWriter, r *http.Request) {
	method := "setting.SMTP"
	ctx := domain.GetRequestContext(r)

	if !ctx.GlobalAdmin {
		response.WriteForbiddenError(w)
		return
	}

	config, _ := h.Store.Setting.Get("SMTP", "")

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

	if !ctx.GlobalAdmin {
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

	// ctx.Transaction, err = h.Runtime.Db.Beginx()
	// if err != nil {
	// 	response.WriteServerError(w, method, err)
	// 	h.Runtime.Log.Error(method, err)
	// 	return
	// }

	h.Store.Setting.Set("SMTP", config)

	// ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeSystemSMTP)

	// test connection
	var result struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
	}

	result.Message = i18n.Localize(ctx.Locale, "server_smtp_success")

	u, err := h.Store.User.Get(ctx, ctx.UserID)
	if err != nil {
		result.Success = false
		result.Message = err.Error()
		h.Runtime.Log.Error(method, err)
		response.WriteJSON(w, result)
		return
	}

	cfg := GetSMTPConfig(h.Store)
	// h.Runtime.Log.Infof("%v", cfg)
	dialer, err := smtp.Connect(cfg)
	em := smtp.EmailMessage{}
	em.Subject = i18n.Localize(ctx.Locale, "server_smtp_test_subject")
	em.BodyHTML = "<p>" + i18n.Localize(ctx.Locale, "server_smtp_test_body") + "</p>"
	em.ToEmail = u.Email
	em.ToName = u.Fullname()

	result.Success, err = smtp.SendMessage(dialer, cfg, em)
	if !result.Success {
		result.Message = fmt.Sprintf("Unable to send test email: %s", err.Error())
	}

	response.WriteJSON(w, result)
}

// AuthConfig returns installation-wide auth configuration
func (h *Handler) AuthConfig(w http.ResponseWriter, r *http.Request) {
	method := "global.auth"
	ctx := domain.GetRequestContext(r)

	if !ctx.GlobalAdmin {
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

	if !ctx.GlobalAdmin {
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

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeSystemAuth)

	response.WriteEmpty(w)
}

// GetInstanceSetting returns the requested organization level setting.
func (h *Handler) GetInstanceSetting(w http.ResponseWriter, r *http.Request) {
	ctx := domain.GetRequestContext(r)

	orgID := request.Param(r, "orgID")
	if orgID != ctx.OrgID {
		response.WriteForbiddenError(w)
		return
	}

	key := request.Query(r, "key")
	setting, _ := h.Store.Setting.GetUser(orgID, "", key, "")
	if len(setting) == 0 {
		if key == "flowchart" {
			setting = fmt.Sprintf(`{ "url": "%s" }`, "https://embed.diagrams.net/?embed=1&ui=Kennedy&spin=0&proto=json&splash=0")
		} else {
			setting = "{}"
		}
	}

	response.WriteJSON(w, setting)
}

// SaveInstanceSetting saves org level setting.
func (h *Handler) SaveInstanceSetting(w http.ResponseWriter, r *http.Request) {
	method := "org.SaveInstanceSetting"
	ctx := domain.GetRequestContext(r)

	orgID := request.Param(r, "orgID")
	if orgID != ctx.OrgID || !ctx.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	key := request.Query(r, "key")

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	config := string(body)
	h.Store.Setting.SetUser(orgID, "", key, config)

	response.WriteEmpty(w)
}

// GetGlobalSetting returns the requested organization level setting.
func (h *Handler) GetGlobalSetting(w http.ResponseWriter, r *http.Request) {
	ctx := domain.GetRequestContext(r)

	if !ctx.GlobalAdmin {
		response.WriteForbiddenError(w)
		return
	}

	key := request.Query(r, "key")
	setting, _ := h.Store.Setting.Get(key, "")

	response.WriteJSON(w, setting)
}

// SaveGlobalSetting saves org level setting.
func (h *Handler) SaveGlobalSetting(w http.ResponseWriter, r *http.Request) {
	method := "org.SaveGlobalSetting"
	ctx := domain.GetRequestContext(r)

	if !ctx.GlobalAdmin {
		response.WriteForbiddenError(w)
		return
	}

	key := request.Query(r, "key")

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	config := string(body)
	h.Store.Setting.Set(key, config)

	response.WriteEmpty(w)
}
