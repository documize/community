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
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"

	"bytes"
	"errors"
	"github.com/documize/community/core/api/endpoint/models"
	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/api/request"
	"github.com/documize/community/core/api/util"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/utility"
	"strconv"
)

// AuthenticateKeycloak checks Keycloak authentication credentials.
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

	a.Domain = strings.TrimSpace(strings.ToLower(a.Domain))
	a.Domain = request.CheckDomain(a.Domain) // TODO optimize by removing this once js allows empty domains
	a.Email = strings.TrimSpace(strings.ToLower(a.Email))

	// Check for required fields.
	if len(a.Email) == 0 {
		writeUnauthorizedError(w)
		return
	}

	org, err := p.GetOrganizationByDomain(a.Domain)
	if err != nil {
		writeUnauthorizedError(w)
		return
	}

	p.Context.OrgID = org.RefID

	// Fetch Keycloak auth provider config
	ac := keycloakConfig{}
	err = json.Unmarshal([]byte(org.AuthConfig), &ac)
	if err != nil {
		writeBadRequestError(w, method, "Unable to unmarshall Keycloak Public Key")
		return
	}

	// Decode and prepare RSA Public Key used by keycloak to sign JWT.
	pkb, err := utility.DecodeBase64([]byte(ac.PublicKey))
	if err != nil {
		writeBadRequestError(w, method, "Unable to base64 decode Keycloak Public Key")
		return
	}
	pk := string(pkb)
	pk = fmt.Sprintf("-----BEGIN PUBLIC KEY-----\n%s\n-----END PUBLIC KEY-----", pk)

	// Decode and verify Keycloak JWT
	claims, err := decodeKeycloakJWT(a.Token, pk)
	if err != nil {
		writeServerError(w, method, err)
		return
	}

	// Compare the contents from JWT with what we have.
	// Guards against MITM token tampering.
	if a.Email != claims["email"].(string) || claims["sub"].(string) != a.RemoteID {
		writeUnauthorizedError(w)
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

		user, err = addUser(p, a)
		if err != nil {
			writeServerError(w, method, err)
			return
		}
	}

	// Password correct and active user
	if a.Email != strings.TrimSpace(strings.ToLower(user.Email)) {
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

	err = SyncUsers(ac)
	if err != nil {
		log.Error("su", err)
	}

	writeSuccessBytes(w, json)
}

// Helper method to setup user account in Documize using Keycloak provided user data.
func addUser(p request.Persister, a keycloakAuthRequest) (u entity.User, err error) {
	u.Firstname = a.Firstname
	u.Lastname = a.Lastname
	u.Email = a.Email
	u.Initials = utility.MakeInitials(a.Firstname, a.Lastname)
	u.Salt = util.GenerateSalt()
	u.Password = util.GeneratePassword(util.GenerateRandomPassword(), u.Salt)

	// only create account if not dupe
	addUser := true
	addAccount := true
	var userID string

	userDupe, err := p.GetUserByEmail(a.Email)

	if err != nil && err != sql.ErrNoRows {
		return u, err
	}

	if u.Email == userDupe.Email {
		addUser = false
		userID = userDupe.RefID
	}

	p.Context.Transaction, err = request.Db.Beginx()
	if err != nil {
		return u, err
	}

	if addUser {
		userID = util.UniqueID()
		u.RefID = userID
		err = p.AddUser(u)

		if err != nil {
			log.IfErr(p.Context.Transaction.Rollback())
			return u, err
		}
	} else {
		attachUserAccounts(p, p.Context.OrgID, &userDupe)

		for _, a := range userDupe.Accounts {
			if a.OrgID == p.Context.OrgID {
				addAccount = false
				break
			}
		}
	}

	// set up user account for the org
	if addAccount {
		var a entity.Account
		a.UserID = userID
		a.OrgID = p.Context.OrgID
		a.Editor = true
		a.Admin = false
		accountID := util.UniqueID()
		a.RefID = accountID
		a.Active = true

		err = p.AddAccount(a)
		if err != nil {
			log.IfErr(p.Context.Transaction.Rollback())
			return u, err
		}
	}

	log.IfErr(p.Context.Transaction.Commit())

	// If we did not add user or give them access (account) then we error back
	if !addUser && !addAccount {
		log.IfErr(p.Context.Transaction.Rollback())
		return u, err
	}

	return p.GetUser(userID)
}

// SyncUsers gets list of Keycloak users for specified Realm, Client Id
func SyncUsers(c keycloakConfig) (err error) {
	form := url.Values{}
	form.Add("username", c.AdminUser)
	form.Add("password", c.AdminPassword)
	form.Add("client_id", "admin-cli")
	form.Add("grant_type", "password")

	req, err := http.NewRequest("POST",
		fmt.Sprintf("%s/realms/master/protocol/openid-connect/token", c.URL),
		bytes.NewBufferString(form.Encode()))

	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Add("Content-Length", strconv.Itoa(len(form.Encode())))

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return err
	}

	defer res.Body.Close()
	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return err
	}

	ka := keycloakAPIAuth{}
	err = json.Unmarshal(body, &ka)
	if err != nil {
		return err
	}

	if res.StatusCode != http.StatusOK {
		return errors.New("Keycloak authentication failed " + res.Status)
	}

	req, err = http.NewRequest("GET",
		fmt.Sprintf("%s/admin/realms/%s/users?max=500", c.URL, c.Realm),
		nil)

	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", ka.AccessToken))

	client = &http.Client{}
	res, err = client.Do(req)
	if err != nil {
		return err
	}

	defer res.Body.Close()
	body, err = ioutil.ReadAll(res.Body)
	if err != nil {
		return err
	}

	u := []keycloakUser{}
	err = json.Unmarshal(body, &u)
	if err != nil {
		return err
	}

	if res.StatusCode != http.StatusOK {
		return errors.New("Keycloak /users call failed " + res.Status)
	}

	log.Info(fmt.Sprintf("%d", res.StatusCode))

	fmt.Println(fmt.Sprintf("%d len", len(u)))
	fmt.Println(u[0].Email)

	return nil
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
	URL           string `json:"url"`
	Realm         string `json:"realm"`
	ClientID      string `json:"clientId"`
	PublicKey     string `json:"publicKey"`
	AdminUser     string `json:"adminUser"`
	AdminPassword string `json:"adminPassword"`
}

// keycloakAPIAuth is returned when authenticating with Keycloak REST API.
type keycloakAPIAuth struct {
	AccessToken string `json:"access_token"`
}

// keycloakUser details user record returned by Keycloak
type keycloakUser struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Firstname string `json:"firstName"`
	Lastname  string `json:"lastName"`
	Enabled   bool   `json:"enabled"`
}
