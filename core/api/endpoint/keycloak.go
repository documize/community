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
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/documize/community/core/api/endpoint/models"
	"github.com/documize/community/core/api/request"
	"github.com/documize/community/core/log"
	// "github.com/documize/community/core/section/provider"
	"github.com/documize/community/core/utility"
)

// AuthenticateKeycloak checks Keycloak authentication credentials.
//
// TODO:
// 1. validate keycloak token
// 2. implement new user additions: user & account with RefID
//
func AuthenticateKeycloak(w http.ResponseWriter, r *http.Request) {
	method := "AuthenticateKeycloak"
	p := request.GetPersister(r)

	defer utility.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		writeBadRequestError(w, method, "Bad payload")
		return
	}

	a := keycloakAuthRequest{}
	err = json.Unmarshal(body, &a)
	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	// Clean data.
	a.Domain = strings.TrimSpace(strings.ToLower(a.Domain))
	a.Domain = request.CheckDomain(a.Domain) // TODO optimize by removing this once js allows empty domains
	a.Email = strings.TrimSpace(strings.ToLower(a.Email))

	// Check for required fields.
	if len(a.Email) == 0 {
		writeUnauthorizedError(w)
		return
	}

	// Validate Keycloak credentials
	pks := "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS1NSUlCSWpBTkJna3Foa2lHOXcwQkFRRUZBQU9DQVE4QU1JSUJDZ0tDQVFFQTAwRzI3KzZYNzJFWllIY3NyY1pHekYwZzFsL1gzeVdLS20vZ3NnMCtjMWdXQ2R4ZmI4QmtkbFdCcXhXZVRoSEZCVUVETnorakFyTjBlL0dFMXorMmxnQzJlMkQwemFlcjdlSHZ6bzlBK1hkb0h4KzRNS3RUbkxZZS9aYUFpc3ExSHVURkRKZElKZFRJVUpTWUFXZlNrSmJtdGhIOUVPMmF3SVhEQzlMMWpDa2IwNHZmZ0xERFA3bVo1YzV6NHJPcGluTU45V3RkSm8xeC90VG0xVDlwRHQ3NDRIUHBoMENSbW5OcTRCdWo2SGpaQ3hCcFF1aUp5am0yT0lIdm4vWUJxVUlSUitMcFlJREV1d2FQRU04QkF1eWYvU3BBTGNNaG9oZndzR255QnFMV3QwVFBua3plZjl6ZWN3WEdsQXlYbUZCWlVkR1k3Z0hOdDRpVmdvMXp5d0lEQVFBQi0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQ=="
	pkb, err := utility.DecodeBase64([]byte(pks))
	if err != nil {
		log.Error("", err)
		writeBadRequestError(w, method, "Unable to decode authentication token")
		return
	}
	pk := string(pkb)
	pk = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA00G27+6X72EZYHcsrcZGzF0g1l/X3yWKKm/gsg0+c1gWCdxfb8BkdlWBqxWeThHFBUEDNz+jArN0e/GE1z+2lgC2e2D0zaer7eHvzo9A+XdoHx+4MKtTnLYe/ZaAisq1HuTFDJdIJdTIUJSYAWfSkJbmthH9EO2awIXDC9L1jCkb04vfgLDDP7mZ5c5z4rOpinMN9WtdJo1x/tTm1T9pDt744HPph0CRmnNq4Buj6HjZCxBpQuiJyjm2OIHvn/YBqUIRR+LpYIDEuwaPEM8BAuyf/SpALcMhohfwsGnyBqLWt0TPnkzef9zecwXGlAyXmFBZUdGY7gHNt4iVgo1zywIDAQAB
-----END PUBLIC KEY-----
	`

	err = decodeKeycloakJWT(a.Token, pk)
	if err != nil {
		writeServerError(w, method, err)
		return
	}

	log.Info("keycloak logon attempt " + a.Email + " @ " + a.Domain)

	user, err := p.GetUserByDomain(a.Domain, a.Email)
	if err != nil && err != sql.ErrNoRows {
		writeServerError(w, method, err)
		return
	}

	// Create user account if not found
	if err == sql.ErrNoRows {
		log.Info("keycloak add user " + a.Email + " @ " + a.Domain)

		p.Context.Transaction, err = request.Db.Beginx()
		if err != nil {
			writeTransactionError(w, method, err)
			return
		}

	}

	// Password correct and active user
	if a.Email != strings.TrimSpace(strings.ToLower(user.Email)) {
		writeUnauthorizedError(w)
		return
	}

	org, err := p.GetOrganizationByDomain(a.Domain)
	if err != nil {
		writeUnauthorizedError(w)
		return
	}

	// Attach user accounts and work out permissions.
	attachUserAccounts(p, org.RefID, &user)

	// No accounts signals data integrity problem
	// so we reject login request.
	if len(user.Accounts) == 0 {
		writeUnauthorizedError(w)
		return
	}

	// Abort login request if account is disabled.
	for _, ac := range user.Accounts {
		if ac.OrgID == org.RefID {
			if ac.Active == false {
				writeUnauthorizedError(w)
				return
			}
			break
		}
	}

	// Generate JWT token
	authModel := models.AuthenticationModel{}
	authModel.Token = generateJWT(user.RefID, org.RefID, a.Domain)
	authModel.User = user

	json, err := json.Marshal(authModel)
	if err != nil {
		writeJSONMarshalError(w, method, "user", err)
		return
	}

	writeSuccessBytes(w, json)
}

// Data received via Keycloak client library
type keycloakAuthRequest struct {
	Domain    string `json:"domain"`
	Token     string `json:"token"`
	RemoteID  string `json:"remoteId"`
	Email     string `json:"email"`
	Username  string `json:"username"`
	Firstname string `json:"firstname"`
	Lastname  string `json:"lastname"`
	Enabled   bool   `json:"enabled"`
}

// Keycloak server configuration
type keycloakConfig struct {
	URL       string `json:"url"`
	Realm     string `json:"realm"`
	ClientID  string `json:"clientId"`
	PublicKey string `json:"publicKey"`
}
