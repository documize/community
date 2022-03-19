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
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/i18n"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/auth"
	"github.com/documize/community/domain/organization"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/domain/user"
	"github.com/documize/community/model/org"
)

type middleware struct {
	Runtime *env.Runtime
	Store   *store.Store
}

func (m *middleware) cors(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS, PATCH")
	w.Header().Set("Access-Control-Allow-Headers", "host, content-type, accept, authorization, origin, referer, user-agent, cache-control, x-requested-with, range")
	w.Header().Set("Access-Control-Expose-Headers", "x-documize-version, x-documize-status, x-documize-filename, x-documize-subscription, Content-Disposition, Content-Length")

	w.Header().Add("X-Documize-Version", m.Runtime.Product.Version)
	w.Header().Add("Cache-Control", "no-cache")

	if r.Method == "OPTIONS" {
		w.Write([]byte(""))
		return
	}

	next(w, r)
}

// Authorize secure API calls by inspecting authentication token.
// request.Context provides caller user information.
// Site meta sent back as HTTP custom headers.
func (m *middleware) Authorize(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	method := "middleware.auth"

	// Let certain requests pass straight through
	authenticated, ctx := m.preAuthorizeStaticAssets(m.Runtime, r)
	if authenticated {
		ctx2 := context.WithValue(r.Context(), domain.DocumizeContextKey, ctx)
		r = r.WithContext(ctx2)
	} else {
		token := auth.FindJWT(r)
		rc, _, tokenErr := auth.DecodeJWT(m.Runtime, token)

		var org = org.Organization{}
		var err = errors.New("")
		var dom string

		if len(rc.OrgID) == 0 {
			dom = organization.GetRequestSubdomain(r)
			dom = m.Store.Organization.CheckDomain(rc, dom)
			org, err = m.Store.Organization.GetOrganizationByDomain(dom)
		} else {
			org, err = m.Store.Organization.GetOrganization(rc, rc.OrgID)
		}

		// Inability to find org record spells the end of this request.
		if err != nil {
			if err == sql.ErrNoRows {
				response.WriteForbiddenError(w)
				m.Runtime.Log.Info(fmt.Sprintf("unable to find org (domain: %s, orgID: %s)", dom, rc.OrgID))
				return
			}
			response.WriteForbiddenError(w)
			m.Runtime.Log.Error(method, err)
			return
		}

		// If we have bad auth token and the domain does not allow anon access
		if !org.AllowAnonymousAccess && tokenErr != nil {
			response.WriteUnauthorizedError(w)
			return
		}

		rc.Subdomain = org.Domain

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
		rc.Active = false
		rc.Administrator = false
		rc.Analytics = false
		rc.Editor = false
		rc.GlobalAdmin = false
		rc.ViewUsers = false
		rc.AppURL = r.Host
		rc.Subdomain = organization.GetSubdomainFromHost(r)
		rc.SSL = request.IsSSL(r)
		rc.OrgLocale = org.Locale
		if len(rc.OrgLocale) == 0 {
			rc.OrgLocale = i18n.DefaultLocale
		}

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

		// Product subscription checks for both product editions.
		weeks := 52
		if m.Runtime.Product.Edition == domain.CommunityEdition {
			// Subscription for Community edition is always valid.
			rc.Subscription = domain.Subscription{Edition: domain.CommunityEdition,
				Seats: domain.Seats6,
				Trial: false,
				Start: time.Now().UTC(),
				End:   time.Now().UTC().Add(time.Hour * 24 * 7 * time.Duration(weeks))}
		} else {
			// Enterprise edition requires valid subscription data.
			rc.Subscription = domain.Subscription{Edition: domain.EnterpriseEdition,
				Seats: domain.Seats6,
				Trial: false,
				Start: time.Now().UTC(),
				End:   time.Now().UTC().Add(time.Hour * 24 * 7 * time.Duration(weeks))}
			// if len(strings.TrimSpace(org.Subscription)) > 0 {
			// 	sd := domain.SubscriptionData{}
			// 	es1 := json.Unmarshal([]byte(org.Subscription), &sd)
			// 	if es1 == nil {
			// 		rc.Subscription, err = domain.DecodeSubscription(sd)
			// 		if err != nil {
			// 			m.Runtime.Log.Error("unable to decode subscription for org "+rc.OrgID, err)
			// 		}
			// 	} else {
			// 		m.Runtime.Log.Error("unable to load subscription for org "+rc.OrgID, es1)
			// 	}
			// }
		}

		// Tag all HTTP calls with subscription status
		subs := "false"
		if m.Runtime.Product.IsValid(rc) {
			subs = "true"
		}
		w.Header().Add("X-Documize-Subscription", subs)

		// Fetch user permissions for this org
		if rc.Authenticated {
			u, err := user.GetSecuredUser(rc, *m.Store, org.RefID, rc.UserID)
			if err != nil {
				m.Runtime.Log.Error("unable to secure API", err)
				response.WriteServerError(w, method, err)
				return
			}

			rc.Administrator = u.Admin
			rc.Active = u.Active
			rc.Analytics = u.Analytics
			rc.Editor = u.Editor
			rc.GlobalAdmin = u.GlobalAdmin
			rc.ViewUsers = u.ViewUsers
			rc.Fullname = u.Fullname()
			rc.Locale = u.Locale
			if len(rc.Locale) == 0 {
				rc.Locale = i18n.DefaultLocale
			}

			// We send back with every HTTP request/response cycle the latest
			// user state. This helps client-side applications to detect changes in
			// user state/privileges.
			var state struct {
				Active    bool `json:"active"`
				Admin     bool `json:"admin"`
				Editor    bool `json:"editor"`
				Analytics bool `json:"analytics"`
				ViewUsers bool `json:"viewUsers"`
			}

			state.Active = u.Active
			state.Admin = u.Admin
			state.Editor = u.Editor
			state.Analytics = u.Analytics
			state.ViewUsers = u.ViewUsers
			sb, err := json.Marshal(state)

			w.Header().Add("X-Documize-Status", string(sb))
		}

		// Debug context output
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
func (m *middleware) preAuthorizeStaticAssets(rt *env.Runtime, r *http.Request) (auth bool, ctx domain.RequestContext) {
	ctx = domain.RequestContext{}

	if strings.ToLower(r.URL.Path) == "/" ||
		strings.ToLower(r.URL.Path) == "/validate" ||
		strings.ToLower(r.URL.Path) == "/favicon.ico" ||
		strings.ToLower(r.URL.Path) == "/robots.txt" ||
		strings.ToLower(r.URL.Path) == "/version" ||
		strings.HasPrefix(strings.ToLower(r.URL.Path), "/api/public/") ||
		((rt.Flags.SiteMode == env.SiteModeSetup) && (strings.ToLower(r.URL.Path) == "/api/setup")) {

		return true, ctx
	}

	if strings.HasPrefix(strings.ToLower(r.URL.Path), "/api/public/") ||
		((rt.Flags.SiteMode == env.SiteModeSetup) && (strings.ToLower(r.URL.Path) == "/api/setup")) {

		dom := organization.GetRequestSubdomain(r)
		dom = m.Store.Organization.CheckDomain(ctx, dom)

		org, _ := m.Store.Organization.GetOrganizationByDomain(dom)
		ctx.Subdomain = organization.GetSubdomainFromHost(r)
		ctx.AllowAnonymousAccess = org.AllowAnonymousAccess
		ctx.OrgName = org.Title
		ctx.Administrator = false
		ctx.Editor = false
		ctx.Analytics = false
		ctx.GlobalAdmin = false
		ctx.AppURL = r.Host
		ctx.SSL = request.IsSSL(r)
		ctx.OrgID = org.RefID

		return true, ctx
	}

	return false, ctx
}
