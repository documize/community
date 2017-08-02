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
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/auth"
	usr "github.com/documize/community/domain/user"
	ath "github.com/documize/community/model/auth"
	"github.com/documize/community/model/user"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *domain.Store
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
		result.Message = "Error: unable to get organization record"
		result.IsError = true
		h.Runtime.Log.Error(result.Message, err)
		response.WriteJSON(w, result)
		return
	}

	// Exit if not using Keycloak
	if org.AuthProvider != "keycloak" {
		result.Message = "Error: skipping user sync with Keycloak as it is not the configured option"
		result.IsError = true
		h.Runtime.Log.Info(result.Message)
		response.WriteJSON(w, result)
		return
	}

	// Make Keycloak auth provider config
	c := keycloakConfig{}
	err = json.Unmarshal([]byte(org.AuthConfig), &c)
	if err != nil {
		result.Message = "Error: unable read Keycloak configuration data"
		result.IsError = true
		h.Runtime.Log.Error(result.Message, err)
		response.WriteJSON(w, result)
		return
	}

	// User list from Keycloak
	kcUsers, err := Fetch(c)
	if err != nil {
		result.Message = "Error: unable to fetch Keycloak users: " + err.Error()
		result.IsError = true
		h.Runtime.Log.Error(result.Message, err)
		response.WriteJSON(w, result)
		return
	}

	// User list from Documize
	dmzUsers, err := h.Store.User.GetUsersForOrganization(ctx)
	if err != nil {
		result.Message = "Error: unable to fetch Documize users"
		result.IsError = true
		h.Runtime.Log.Error(result.Message, err)
		response.WriteJSON(w, result)
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

	// Insert new users into Documize
	for _, u := range insert {
		err = addUser(ctx, h.Runtime, h.Store, u, c.DefaultPermissionAddSpace)
	}

	result.Message = fmt.Sprintf("Keycloak sync'ed %d users, %d new additions", len(kcUsers), len(insert))
	h.Runtime.Log.Info(result.Message)
	response.WriteJSON(w, result)
}

// Authenticate checks Keycloak authentication credentials.
func (h *Handler) Authenticate(w http.ResponseWriter, r *http.Request) {
	method := "authenticate"
	ctx := domain.GetRequestContext(r)

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "Bad payload")
		return
	}

	a := keycloakAuthRequest{}
	err = json.Unmarshal(body, &a)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
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
		return
	}

	ctx.OrgID = org.RefID

	// Fetch Keycloak auth provider config
	ac := keycloakConfig{}
	err = json.Unmarshal([]byte(org.AuthConfig), &ac)
	if err != nil {
		response.WriteBadRequestError(w, method, "Unable to unmarshall Keycloak Public Key")
		return
	}

	// Decode and prepare RSA Public Key used by keycloak to sign JWT.
	pkb, err := secrets.DecodeBase64([]byte(ac.PublicKey))
	if err != nil {
		response.WriteBadRequestError(w, method, "Unable to base64 decode Keycloak Public Key")
		return
	}
	pk := string(pkb)
	pk = fmt.Sprintf("-----BEGIN PUBLIC KEY-----\n%s\n-----END PUBLIC KEY-----", pk)

	// Decode and verify Keycloak JWT
	claims, err := auth.DecodeKeycloakJWT(a.Token, pk)
	if err != nil {
		h.Runtime.Log.Info("decodeKeycloakJWT failed")
		response.WriteBadRequestError(w, method, err.Error())
		return
	}

	// Compare the contents from JWT with what we have.
	// Guards against MITM token tampering.
	if a.Email != claims["email"].(string) || claims["sub"].(string) != a.RemoteID {
		response.WriteUnauthorizedError(w)
		return
	}

	h.Runtime.Log.Info("keycloak logon attempt " + a.Email + " @ " + a.Domain)

	u, err := h.Store.User.GetByDomain(ctx, a.Domain, a.Email)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
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

		err = addUser(ctx, h.Runtime, h.Store, u, ac.DefaultPermissionAddSpace)
		if err != nil {
			response.WriteServerError(w, method, err)
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
		return
	}

	// Abort login request if account is disabled.
	for _, ac := range u.Accounts {
		if ac.OrgID == org.RefID {
			if ac.Active == false {
				response.WriteUnauthorizedError(w)
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
