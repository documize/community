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
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/documize/community/core/api/endpoint/models"
	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/api/request"
	"github.com/documize/community/core/api/util"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/utility"
	"github.com/documize/community/core/web"
)

// Authenticate user based up HTTP Authorization header.
// An encrypted authentication token is issued with an expiry date.
func Authenticate(w http.ResponseWriter, r *http.Request) {
	method := "Authenticate"
	p := request.GetPersister(r)

	authHeader := r.Header.Get("Authorization")

	// check for http header
	if len(authHeader) == 0 {
		writeBadRequestError(w, method, "Missing Authorization header")
		return
	}

	// decode what we received
	data := strings.Replace(authHeader, "Basic ", "", 1)

	decodedBytes, err := utility.DecodeBase64([]byte(data))
	if err != nil {
		writeBadRequestError(w, method, "Unable to decode authentication token")
		return
	}
	decoded := string(decodedBytes)

	// check that we have domain:email:password (but allow for : in password field!)
	credentials := strings.SplitN(decoded, ":", 3)

	if len(credentials) != 3 {
		writeBadRequestError(w, method, "Bad authentication token, expecting domain:email:password")
		return
	}

	domain := strings.TrimSpace(strings.ToLower(credentials[0]))
	domain = request.CheckDomain(domain) // TODO optimize by removing this once js allows empty domains
	email := strings.TrimSpace(strings.ToLower(credentials[1]))
	password := credentials[2]
	log.Info("logon attempt " + email + " @ " + domain)

	user, err := p.GetUserByDomain(domain, email)

	if err == sql.ErrNoRows {
		writeUnauthorizedError(w)
		return
	}

	if err != nil {
		writeServerError(w, method, err)
		return
	}

	if len(user.Reset) > 0 || len(user.Password) == 0 {
		writeUnauthorizedError(w)
		return
	}

	// Password correct and active user
	if email != strings.TrimSpace(strings.ToLower(user.Email)) || !util.MatchPassword(user.Password, password, user.Salt) {
		writeUnauthorizedError(w)
		return
	}

	org, err := p.GetOrganizationByDomain(domain)

	if err != nil {
		writeUnauthorizedError(w)
		return
	}

	// Attach user accounts and work out permissions
	attachUserAccounts(p, org.RefID, &user)

	// active check

	if len(user.Accounts) == 0 {
		writeUnauthorizedError(w)
		return
	}

	authModel := models.AuthenticationModel{}
	authModel.Token = generateJWT(user.RefID, org.RefID, domain)
	authModel.User = user

	json, err := json.Marshal(authModel)

	if err != nil {
		writeJSONMarshalError(w, method, "user", err)
		return
	}

	writeSuccessBytes(w, json)
}

// Authorize secure API calls by inspecting authentication token.
// request.Context provides caller user information.
// Site meta sent back as HTTP custom headers.
func Authorize(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	method := "Authorize"

	// Let certain requests pass straight through
	authenticated := preAuthorizeStaticAssets(r)

	if !authenticated {
		token := findJWT(r)
		hasToken := len(token) > 1
		context, _, tokenErr := decodeJWT(token)

		var org = entity.Organization{}
		var err = errors.New("")

		// We always grab the org record regardless of token status.
		// Why? If bad token we might be OK to alow anonymous access
		// depending upon the domain in question.
		p := request.GetPersister(r)

		if len(context.OrgID) == 0 {
			org, err = p.GetOrganizationByDomain(request.GetRequestSubdomain(r))
		} else {
			org, err = p.GetOrganization(context.OrgID)
		}

		context.Subdomain = org.Domain

		// Inability to find org record spells the end of this request.
		if err != nil {
			writeForbiddenError(w)
			return
		}

		// If we have bad auth token and the domain does not allow anon access
		if !org.AllowAnonymousAccess && tokenErr != nil {
			writeUnauthorizedError(w)
			return
		}

		domain := request.GetSubdomainFromHost(r)
		domain2 := request.GetRequestSubdomain(r)
		if org.Domain != domain && org.Domain != domain2 {
			log.Info(fmt.Sprintf("domain mismatch %s vs. %s vs. %s", domain, domain2, org.Domain))

			writeUnauthorizedError(w)
			return
		}

		// If we have bad auth token and the domain allows anon access
		// then we generate guest context.
		if org.AllowAnonymousAccess {
			// So you have a bad token
			if hasToken {
				if tokenErr != nil {
					writeUnauthorizedError(w)
					return
				}
			} else {
				// Just grant anon user guest access
				context.UserID = "0"
				context.OrgID = org.RefID
				context.Authenticated = false
				context.Guest = true
			}
		}

		// Refresh context and persister
		request.SetContext(r, context)
		p = request.GetPersister(r)

		context.AllowAnonymousAccess = org.AllowAnonymousAccess
		context.OrgName = org.Title
		context.Administrator = false
		context.Editor = false
		context.Global = false

		// Fetch user permissions for this org
		if context.Authenticated {
			user, err := getSecuredUser(p, org.RefID, context.UserID)

			if err != nil {
				writeServerError(w, method, err)
				return
			}

			context.Administrator = user.Admin
			context.Editor = user.Editor
			context.Global = user.Global
		}

		request.SetContext(r, context)
		p = request.GetPersister(r)

		// Middleware moves on if we say 'yes' -- autheticated or allow anon access.
		authenticated = context.Authenticated || org.AllowAnonymousAccess
	}

	if authenticated {
		next(w, r)
	} else {
		w.WriteHeader(http.StatusUnauthorized)
	}
}

// Certain assets/URL do not require authentication.
// Just stops the log files being clogged up with failed auth errors.
func preAuthorizeStaticAssets(r *http.Request) bool {
	if strings.ToLower(r.URL.Path) == "/" ||
		strings.ToLower(r.URL.Path) == "/validate" ||
		strings.ToLower(r.URL.Path) == "/favicon.ico" ||
		strings.ToLower(r.URL.Path) == "/robots.txt" ||
		strings.ToLower(r.URL.Path) == "/version" ||
		strings.HasPrefix(strings.ToLower(r.URL.Path), "/api/public/") ||
		((web.SiteMode == web.SiteModeSetup) && (strings.ToLower(r.URL.Path) == "/api/setup")) {

		return true
	}

	return false
}
