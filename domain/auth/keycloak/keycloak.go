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
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	usr "github.com/documize/community/domain/user"
	"github.com/documize/community/model/account"
	"github.com/documize/community/model/user"
	"github.com/pkg/errors"
)

// Fetch gets list of Keycloak users for specified Realm, Client Id
func Fetch(c keycloakConfig) (users []user.User, err error) {
	users = []user.User{}

	form := url.Values{}
	form.Add("username", c.AdminUser)
	form.Add("password", c.AdminPassword)
	form.Add("client_id", "admin-cli")
	form.Add("grant_type", "password")

	req, err := http.NewRequest("POST",
		fmt.Sprintf("%s/realms/master/protocol/openid-connect/token", c.URL),
		bytes.NewBufferString(form.Encode()))

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Content-Length", strconv.Itoa(len(form.Encode())))

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		err = errors.Wrap(err, "cannot connect to Keycloak auth URL")
		return users, err
	}

	defer res.Body.Close()
	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		err = errors.Wrap(err, "cannot read Keycloak response from auth request")
		return users, err
	}

	if res.StatusCode != http.StatusOK {
		if res.StatusCode == http.StatusUnauthorized {
			return users, errors.New("Check Keycloak username/password")
		}

		return users, errors.New("Keycloak authentication failed " + res.Status)
	}

	ka := keycloakAPIAuth{}
	err = json.Unmarshal(body, &ka)
	if err != nil {
		return users, err
	}

	url := fmt.Sprintf("%s/admin/realms/%s/users?max=500", c.URL, c.Realm)
	c.Group = strings.TrimSpace(c.Group)

	if len(c.Group) > 0 {
		url = fmt.Sprintf("%s/admin/realms/%s/groups/%s/members?max=500", c.URL, c.Realm, c.Group)
	}

	req, err = http.NewRequest("GET", url, nil)
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", ka.AccessToken))

	client = &http.Client{}
	res, err = client.Do(req)
	if err != nil {
		err = errors.Wrap(err, "cannot fetch Keycloak users")
		return users, err

	}

	defer res.Body.Close()
	body, err = ioutil.ReadAll(res.Body)
	if err != nil {
		err = errors.Wrap(err, "cannot read Keycloak user list response")
		return users, err
	}

	if res.StatusCode != http.StatusOK {
		if res.StatusCode == http.StatusNotFound {
			if c.Group != "" {
				return users, errors.New("Keycloak Realm/Client/Group ID not found")
			}

			return users, errors.New("Keycloak Realm/Client Id not found")
		}

		return users, errors.New("Keycloak users list call failed " + res.Status)
	}

	kcUsers := []keycloakUser{}
	err = json.Unmarshal(body, &kcUsers)
	if err != nil {
		err = errors.Wrap(err, "cannot unmarshal Keycloak user list response")
		return users, err
	}

	for _, kc := range kcUsers {
		u := user.User{}
		u.Email = kc.Email
		u.Firstname = kc.Firstname
		u.Lastname = kc.Lastname
		u.Initials = stringutil.MakeInitials(u.Firstname, u.Lastname)
		u.Active = kc.Enabled
		u.Editor = false

		users = append(users, u)
	}

	return users, nil
}

// Helper method to setup user account in Documize using Keycloak provided user data.
func addUser(ctx domain.RequestContext, rt *env.Runtime, store *domain.Store, u user.User, addSpace bool) (err error) {
	// only create account if not dupe
	addUser := true
	addAccount := true
	var userID string

	userDupe, err := store.User.GetByEmail(ctx, u.Email)
	if err != nil && err != sql.ErrNoRows {
		return err
	}

	if u.Email == userDupe.Email {
		addUser = false
		userID = userDupe.RefID
	}

	ctx.Transaction, err = rt.Db.Beginx()
	if err != nil {
		return err
	}

	if addUser {
		userID = uniqueid.Generate()
		u.RefID = userID

		err = store.User.Add(ctx, u)
		if err != nil {
			ctx.Transaction.Rollback()
			return err
		}
	} else {
		usr.AttachUserAccounts(ctx, *store, ctx.OrgID, &userDupe)

		for _, a := range userDupe.Accounts {
			if a.OrgID == ctx.OrgID {
				addAccount = false
				break
			}
		}
	}

	// set up user account for the org
	if addAccount {
		var a account.Account
		a.UserID = userID
		a.OrgID = ctx.OrgID
		a.Editor = addSpace
		a.Admin = false
		accountID := uniqueid.Generate()
		a.RefID = accountID
		a.Active = true

		err = store.Account.Add(ctx, a)
		if err != nil {
			ctx.Transaction.Rollback()
			return err
		}
	}

	ctx.Transaction.Commit()

	u, err = store.User.Get(ctx, userID)

	return err
}
