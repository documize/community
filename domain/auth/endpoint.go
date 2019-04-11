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

package auth

import (
	"database/sql"
	"errors"
	"net/http"
	"strings"

	"github.com/documize/community/core/request"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/organization"
	"github.com/documize/community/domain/section/provider"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/domain/user"
	"github.com/documize/community/model/auth"
	"github.com/documize/community/model/org"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Login user based up HTTP Authorization header.
// An encrypted authentication token is issued with an expiry date.
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	method := "auth.Login"
	ctx := domain.GetRequestContext(r)

	// check for http header
	authHeader := r.Header.Get("Authorization")
	if len(authHeader) == 0 {
		response.WriteBadRequestError(w, method, "Missing Authorization header")
		return
	}

	// decode what we received
	data := strings.Replace(authHeader, "Basic ", "", 1)

	decodedBytes, err := secrets.DecodeBase64([]byte(data))
	if err != nil {
		response.WriteBadRequestError(w, method, "Unable to decode authentication token")
		h.Runtime.Log.Error("decode auth header", err)
		return
	}

	decoded := string(decodedBytes)

	// check that we have domain:email:password (but allow for : in password field!)
	credentials := strings.SplitN(decoded, ":", 3)
	if len(credentials) != 3 {
		response.WriteBadRequestError(w, method, "Bad authentication token, expecting domain:email:password")
		h.Runtime.Log.Error("bad auth token", err)
		return
	}

	dom := strings.TrimSpace(strings.ToLower(credentials[0]))
	email := strings.TrimSpace(strings.ToLower(credentials[1]))
	password := credentials[2]

	dom = h.Store.Organization.CheckDomain(ctx, dom) // TODO optimize by removing this once js allows empty domains

	h.Runtime.Log.Info("logon attempt " + email + " @ " + dom)

	u, err := h.Store.User.GetByDomain(ctx, dom, email)
	if err == sql.ErrNoRows {
		response.WriteUnauthorizedError(w)
		return
	}
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error("unable to fetch user", err)
		return
	}
	if len(u.Reset) > 0 || len(u.Password) == 0 {
		response.WriteUnauthorizedError(w)
		return
	}

	// Password correct and active user
	if email != strings.TrimSpace(strings.ToLower(u.Email)) || !secrets.MatchPassword(u.Password, password, u.Salt) {
		response.WriteUnauthorizedError(w)
		return
	}

	org, err := h.Store.Organization.GetOrganizationByDomain(dom)
	if err != nil {
		response.WriteUnauthorizedError(w)
		h.Runtime.Log.Error("bad auth organization", err)
		return
	}

	// Attach user accounts and work out permissions
	user.AttachUserAccounts(ctx, *h.Store, org.RefID, &u)
	if len(u.Accounts) == 0 {
		response.WriteUnauthorizedError(w)
		h.Runtime.Log.Error("bad auth accounts", err)
		return
	}

	h.Runtime.Log.Info("logged in " + email + " @ " + dom)

	authModel := auth.AuthenticationModel{}
	authModel.Token = GenerateJWT(h.Runtime, u.RefID, org.RefID, dom)
	authModel.User = u

	response.WriteJSON(w, authModel)
}

// ValidateToken finds and validates authentication token.
// TODO: remove
func (h *Handler) ValidateToken(w http.ResponseWriter, r *http.Request) {
	// TODO should this go after token validation?
	if s := r.URL.Query().Get("section"); s != "" {
		if err := provider.Callback(s, h.Runtime, h.Store, w, r); err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			h.Runtime.Log.Error("section validation failure", err)
		}

		return
	}

	token := FindJWT(r)
	rc, _, tokenErr := DecodeJWT(h.Runtime, token)

	var org = org.Organization{}
	var err = errors.New("")

	// We always grab the org record regardless of token status.
	// Why? If bad token we might be OK to alow anonymous access
	// depending upon the domain in question.
	if len(rc.OrgID) == 0 {
		dom := organization.GetRequestSubdomain(r)
		org, err = h.Store.Organization.GetOrganizationByDomain(dom)
	} else {
		org, err = h.Store.Organization.GetOrganization(rc, rc.OrgID)
	}

	rc.Subdomain = org.Domain

	// Inability to find org record spells the end of this request.
	if err != nil {
		response.WriteUnauthorizedError(w)
		return
	}

	// If we have bad auth token and the domain does not allow anon access
	if !org.AllowAnonymousAccess && tokenErr != nil {
		response.WriteUnauthorizedError(w)
		return
	}

	dom := organization.GetSubdomainFromHost(r)
	dom2 := organization.GetRequestSubdomain(r)
	if org.Domain != dom && org.Domain != dom2 {
		response.WriteUnauthorizedError(w)
		return
	}

	// If we have bad auth token and the domain allows anon access
	// then we generate guest rc.
	if org.AllowAnonymousAccess {
		// So you have a bad token
		if len(token) > 1 {
			if tokenErr != nil {
				response.WriteUnauthorizedError(w)
				return
			}
		} else {
			// Just grant anon user guest access
			rc.UserID = "0"
			rc.OrgID = org.RefID
			rc.Authenticated = false
			rc.Guest = true
		}
	}

	rc.AllowAnonymousAccess = org.AllowAnonymousAccess
	rc.OrgName = org.Title
	rc.Administrator = false
	rc.Editor = false
	rc.GlobalAdmin = false
	rc.AppURL = r.Host
	rc.Subdomain = organization.GetSubdomainFromHost(r)
	rc.SSL = request.IsSSL(r)

	// Fetch user permissions for this org
	if !rc.Authenticated {
		response.WriteUnauthorizedError(w)
		return
	}

	u, err := user.GetSecuredUser(rc, *h.Store, org.RefID, rc.UserID)
	if err != nil {
		response.WriteUnauthorizedError(w)
		h.Runtime.Log.Error("ValidateToken", err)
		return
	}

	rc.Administrator = u.Admin
	rc.Editor = u.Editor
	rc.GlobalAdmin = u.GlobalAdmin

	response.WriteJSON(w, u)
}
