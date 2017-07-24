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

package server

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/response"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/auth"
	"github.com/documize/community/domain/organization"
	"github.com/documize/community/domain/user"
)

type middleware struct {
	Runtime env.Runtime
}

func (m *middleware) cors(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS, PATCH")
	w.Header().Set("Access-Control-Allow-Headers", "host, content-type, accept, authorization, origin, referer, user-agent, cache-control, x-requested-with")
	w.Header().Set("Access-Control-Expose-Headers", "x-documize-version, x-documize-status")

	if r.Method == "OPTIONS" {
		w.Header().Add("X-Documize-Version", m.Runtime.Product.Version)
		w.Header().Add("Cache-Control", "no-cache")

		w.Write([]byte(""))

		return
	}

	next(w, r)
}

func (m *middleware) metrics(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	w.Header().Add("X-Documize-Version", m.Runtime.Product.Version)
	w.Header().Add("Cache-Control", "no-cache")

	// Prevent page from being displayed in an iframe
	w.Header().Add("X-Frame-Options", "DENY")

	next(w, r)
}

// Authorize secure API calls by inspecting authentication token.
// request.Context provides caller user information.
// Site meta sent back as HTTP custom headers.
func (m *middleware) Authorize(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	method := "Authorize"

	s := domain.StoreContext{Runtime: m.Runtime, Context: domain.RequestContext{}}

	// Let certain requests pass straight through
	authenticated := preAuthorizeStaticAssets(m.Runtime, r)

	if !authenticated {
		token := auth.FindJWT(r)
		rc, _, tokenErr := auth.DecodeJWT(m.Runtime, token)

		var org = organization.Organization{}
		var err = errors.New("")

		if len(rc.OrgID) == 0 {
			org, err = organization.GetOrganizationByDomain(s, organization.GetRequestSubdomain(s, r))
		} else {
			org, err = organization.GetOrganization(s, rc.OrgID)
		}

		// Inability to find org record spells the end of this request.
		if err != nil {
			response.WriteForbiddenError(w)
			return
		}

		// If we have bad auth token and the domain does not allow anon access
		if !org.AllowAnonymousAccess && tokenErr != nil {
			response.WriteUnauthorizedError(w)
			return
		}

		rc.Subdomain = org.Domain
		dom := organization.GetSubdomainFromHost(s, r)
		dom2 := organization.GetRequestSubdomain(s, r)

		if org.Domain != dom && org.Domain != dom2 {
			m.Runtime.Log.Info(fmt.Sprintf("domain mismatch %s vs. %s vs. %s", dom, dom2, org.Domain))

			response.WriteUnauthorizedError(w)
			return
		}

		// If we have bad auth token and the domain allows anon access
		// then we generate guest context.
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
		rc.Global = false
		rc.AppURL = r.Host
		rc.Subdomain = organization.GetSubdomainFromHost(s, r)
		rc.SSL = r.TLS != nil

		// get user IP from request
		i := strings.LastIndex(r.RemoteAddr, ":")
		if i == -1 {
			rc.ClientIP = r.RemoteAddr
		} else {
			rc.ClientIP = r.RemoteAddr[:i]
		}

		fip := r.Header.Get("X-Forwarded-For")
		if len(fip) > 0 {
			rc.ClientIP = fip
		}

		// Fetch user permissions for this org
		if rc.Authenticated {
			u, err := user.GetSecuredUser(s, org.RefID, rc.UserID)

			if err != nil {
				response.WriteServerError(w, method, err)
				return
			}

			rc.Administrator = u.Admin
			rc.Editor = u.Editor
			rc.Global = u.Global
			rc.Fullname = u.Fullname()

			// We send back with every HTTP request/response cycle the latest
			// user state. This helps client-side applications to detect changes in
			// user state/privileges.
			var state struct {
				Active bool `json:"active"`
				Admin  bool `json:"admin"`
				Editor bool `json:"editor"`
			}

			state.Active = u.Active
			state.Admin = u.Admin
			state.Editor = u.Editor
			sb, err := json.Marshal(state)

			w.Header().Add("X-Documize-Status", string(sb))
		}

		// m.Runtime.Log.Info(fmt.Sprintf("%v", rc))
		ctx := context.WithValue(r.Context(), domain.DocumizeContextKey, rc)
		r = r.WithContext(ctx)

		// Middleware moves on if we say 'yes' -- authenticated or allow anon access.
		authenticated = rc.Authenticated || org.AllowAnonymousAccess
	}

	if authenticated {
		next(w, r)
	} else {
		w.WriteHeader(http.StatusUnauthorized)
	}
}

// Certain assets/URL do not require authentication.
// Just stops the log files being clogged up with failed auth errors.
func preAuthorizeStaticAssets(rt env.Runtime, r *http.Request) bool {
	if strings.ToLower(r.URL.Path) == "/" ||
		strings.ToLower(r.URL.Path) == "/validate" ||
		strings.ToLower(r.URL.Path) == "/favicon.ico" ||
		strings.ToLower(r.URL.Path) == "/robots.txt" ||
		strings.ToLower(r.URL.Path) == "/version" ||
		strings.HasPrefix(strings.ToLower(r.URL.Path), "/api/public/") ||
		((rt.Flags.SiteMode == env.SiteModeSetup) && (strings.ToLower(r.URL.Path) == "/api/setup")) {

		return true
	}

	return false
}
