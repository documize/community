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

package organization

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/org"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Get returns the requested organization.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	method := "org.Get"
	ctx := domain.GetRequestContext(r)

	orgID := request.Param(r, "orgID")

	if orgID != ctx.OrgID {
		response.WriteForbiddenError(w)
		return
	}

	org, err := h.Store.Organization.GetOrganization(ctx, ctx.OrgID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	org.StripSecrets()

	response.WriteJSON(w, org)
}

// Update saves organization amends.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	method := "org.Update"
	ctx := domain.GetRequestContext(r)

	if !ctx.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	var org = org.Organization{}
	err = json.Unmarshal(body, &org)

	org.RefID = ctx.OrgID
	org.Domain = strings.ToLower(org.Domain)

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Organization.UpdateOrganization(ctx, org)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()

	response.WriteJSON(w, org)
}

// UploadLogo stores log for organization.
func (h *Handler) UploadLogo(w http.ResponseWriter, r *http.Request) {
	method := "organization.UploadLogo"
	ctx := domain.GetRequestContext(r)

	if !ctx.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	// We use default logo if body is empty.
	logo := []byte{}

	filedata, _, err := r.FormFile("attachment")
	if err == nil {
		b := new(bytes.Buffer)
		_, err = io.Copy(b, filedata)
		if err != nil {
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
		} else {
			logo = b.Bytes()
		}
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Organization.UploadLogo(ctx, logo)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeOrganizationLogo)

	response.WriteEmpty(w)
}
