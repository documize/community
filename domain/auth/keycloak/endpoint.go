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

package keycloak

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"sort"
	"strings"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/i18n"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/auth"
	"github.com/documize/community/domain/store"
	usr "github.com/documize/community/domain/user"
	ath "github.com/documize/community/model/auth"
	"github.com/documize/community/model/user"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Sync gets list of Keycloak users and inserts new users into Documize
// and marks Keycloak disabled users as inactive.
func (h *Handler) Sync(w http.ResponseWriter, r *http.Request) {
	ctx := domain.GetRequestContext(r)

	if !ctx.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	var result struct {
		Message string `json:"message"`
		IsError bool   `json:"isError"`
	}

	// Org contains raw auth provider config
	org, err := h.Store.Organization.GetOrganization(ctx, ctx.OrgID)
	if err != nil {
		result.Message = i18n.Localize(ctx.Locale, "server_err_org")
		result.IsError = true
		response.WriteJSON(w, result)
		h.Runtime.Log.Error(result.Message, err)
		return
	}

	// Exit if not using Keycloak
	if org.AuthProvider != ath.AuthProviderKeycloak {
		result.Message = i18n.Localize(ctx.Locale, "server_keycloak_error1")
		result.IsError = true
		response.WriteJSON(w, result)
		h.Runtime.Log.Info(result.Message)
		return
	}

	// Make Keycloak auth provider config
	c := ath.KeycloakConfig{}
	err = json.Unmarshal([]byte(org.AuthConfig), &c)
	if err != nil {
		result.Message = i18n.Localize(ctx.Locale, "server_keycloak_error2")
		result.IsError = true
		response.WriteJSON(w, result)
		h.Runtime.Log.Error(result.Message, err)
		return
	}

	// User list from Keycloak
	kcUsers, err := Fetch(c)
	if err != nil {
		result.Message = i18n.Localize(ctx.Locale, "server_keycloak_error3", err.Error())
		result.IsError = true
		response.WriteJSON(w, result)
		h.Runtime.Log.Error(result.Message, err)
		return
	}

	// User list from Documize
	dmzUsers, err := h.Store.User.GetUsersForOrganization(ctx, "", 99999)
	if err != nil {
		result.Message = i18n.Localize(ctx.Locale, "server_error_user")
		result.IsError = true
		response.WriteJSON(w, result)
		h.Runtime.Log.Error(result.Message, err)
		return
	}

	sort.Slice(kcUsers, func(i, j int) bool { return kcUsers[i].Email < kcUsers[j].Email })
	sort.Slice(dmzUsers, func(i, j int) bool { return dmzUsers[i].Email < dmzUsers[j].Email })

	insert := []user.User{}

	for _, k := range kcUsers {
		exists := false

		for _, d := range dmzUsers {
			if k.Email == d.Email {
				exists = true
			}
		}

		if !exists {
			insert = append(insert, k)
		}
	}

	// Track the number of Keycloak users with missing data.
	missing := 0

	// Insert new users into Documize
	for _, u := range insert {
		if len(u.Email) == 0 {
			missing++
		} else {
			_, err = auth.AddExternalUser(ctx, h.Runtime, h.Store, u, c.DefaultPermissionAddSpace)
		}
	}

	result.Message = i18n.Localize(ctx.Locale, "server_keycloak_summary",
		fmt.Sprintf("%d", len(kcUsers)), fmt.Sprintf("%d", len(insert)), fmt.Sprintf("%d", missing))

	response.WriteJSON(w, result)
	h.Runtime.Log.Info(result.Message)
}

// Authenticate checks Keycloak authentication credentials.
func (h *Handler) Authenticate(w http.ResponseWriter, r *http.Request) {
	method := "authenticate"
	ctx := domain.GetRequestContext(r)

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "Bad payload")
		h.Runtime.Log.Error(method, err)
		return
	}

	a := ath.KeycloakAuthRequest{}
	err = json.Unmarshal(body, &a)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	a.Domain = strings.TrimSpace(strings.ToLower(a.Domain))
	a.Domain = h.Store.Organization.CheckDomain(ctx, a.Domain) // TODO optimize by removing this once js allows empty domains
	a.Email = strings.TrimSpace(strings.ToLower(a.Email))

	// Check for required fields.
	if len(a.Email) == 0 {
		response.WriteUnauthorizedError(w)
		return
	}

	org, err := h.Store.Organization.GetOrganizationByDomain(a.Domain)
	if err != nil {
		response.WriteUnauthorizedError(w)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.OrgID = org.RefID

	// Fetch Keycloak auth provider config
	ac := ath.KeycloakConfig{}
	err = json.Unmarshal([]byte(org.AuthConfig), &ac)
	if err != nil {
		response.WriteBadRequestError(w, method, "Unable to unmarshall Keycloak Public Key")
		h.Runtime.Log.Error(method, err)
		return
	}

	// Decode and prepare RSA Public Key used by keycloak to sign JWT.
	pkb, err := secrets.DecodeBase64([]byte(ac.PublicKey))
	if err != nil {
		response.WriteBadRequestError(w, method, "Unable to base64 decode Keycloak Public Key")
		h.Runtime.Log.Error(method, err)
		return
	}
	pk := string(pkb)
	pk = fmt.Sprintf("-----BEGIN PUBLIC KEY-----\n%s\n-----END PUBLIC KEY-----", pk)

	// Decode and verify Keycloak JWT
	claims, err := auth.DecodeKeycloakJWT(a.Token, pk)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Info("decodeKeycloakJWT failed")
		return
	}

	// Compare the contents from JWT with what we have.
	// Guards against MITM token tampering.
	if a.Email != claims["email"].(string) {
		response.WriteUnauthorizedError(w)
		h.Runtime.Log.Info(">> Start Keycloak debug")
		h.Runtime.Log.Info(a.Email)
		h.Runtime.Log.Info(claims["email"].(string))
		h.Runtime.Log.Info(">> End Keycloak debug")
		return
	}

	h.Runtime.Log.Info("keycloak logon attempt " + a.Email + " @ " + a.Domain)

	u, err := h.Store.User.GetByDomain(ctx, a.Domain, a.Email)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Create user account if not found
	if err == sql.ErrNoRows {
		h.Runtime.Log.Info("keycloak add user " + a.Email + " @ " + a.Domain)

		u = user.User{}
		u.Firstname = a.Firstname
		u.Lastname = a.Lastname
		u.Email = a.Email
		u.Initials = stringutil.MakeInitials(u.Firstname, u.Lastname)
		u.Salt = secrets.GenerateSalt()
		u.Password = secrets.GeneratePassword(secrets.GenerateRandomPassword(), u.Salt)

		u, err = auth.AddExternalUser(ctx, h.Runtime, h.Store, u, ac.DefaultPermissionAddSpace)
		if err != nil {
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	// Password correct and active user
	if a.Email != strings.TrimSpace(strings.ToLower(u.Email)) {
		response.WriteUnauthorizedError(w)
		return
	}

	// Attach user accounts and work out permissions.
	usr.AttachUserAccounts(ctx, *h.Store, org.RefID, &u)

	// No accounts signals data integrity problem
	// so we reject login request.
	if len(u.Accounts) == 0 {
		response.WriteUnauthorizedError(w)
		err = fmt.Errorf("no user accounts found for %s", u.Email)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Abort login request if account is disabled.
	for _, ac := range u.Accounts {
		if ac.OrgID == org.RefID {
			if ac.Active == false {
				response.WriteUnauthorizedError(w)
				err = fmt.Errorf("no ACTIVE user account found for %s", u.Email)
				h.Runtime.Log.Error(method, err)
				return
			}
			break
		}
	}

	// Generate JWT token
	authModel := ath.AuthenticationModel{}
	authModel.Token = auth.GenerateJWT(h.Runtime, u.RefID, org.RefID, a.Domain)
	authModel.User = u

	response.WriteJSON(w, authModel)
}
