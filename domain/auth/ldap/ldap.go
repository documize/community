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

package ldap

import (
	"crypto/tls"
	"fmt"

	lm "github.com/documize/community/model/auth"
	// "github.com/documize/community/model/user"
	"github.com/pkg/errors"
	ld "gopkg.in/ldap.v2"
)

// Connect establishes connection to LDAP server.
func connect(c lm.LDAPConfig) (l *ld.Conn, err error) {
	address := fmt.Sprintf("%s:%d", c.ServerHost, c.ServerPort)

	fmt.Println("Connecting to LDAP server", address)

	l, err = ld.Dial("tcp", address)
	if err != nil {
		err = errors.Wrap(err, "unable to dial LDAP server")
		return
	}

	if c.EncryptionType == "starttls" {
		fmt.Println("Using StartTLS with LDAP server")
		err = l.StartTLS(&tls.Config{InsecureSkipVerify: true})
		if err != nil {
			err = errors.Wrap(err, "unable to startTLS with LDAP server")
			return
		}
	}

	return
}

// Authenticate user against LDAP provider.
func authenticate(l *ld.Conn, c lm.LDAPConfig, username, pwd string) (success bool, err error) {
	success = false
	userAttrs := c.GetUserFilterAttributes()
	filter := fmt.Sprintf("(%s=%s)", c.AttributeUserRDN, username)

	searchRequest := ld.NewSearchRequest(
		c.BaseDN,
		ld.ScopeWholeSubtree, ld.NeverDerefAliases, 0, 0, false,
		filter,
		userAttrs,
		nil,
	)

	err = l.Bind(c.BindDN, c.BindPassword)
	if err != nil {
		errors.Wrap(err, "unable to bind admin user")
		return
	}

	sr, err := l.Search(searchRequest)
	if err != nil {
		err = errors.Wrap(err, "unable to execute LDAP search during authentication")
		return
	}

	if len(sr.Entries) == 0 {
		err = errors.Wrap(err, "user not found during LDAP authentication")
		return
	}
	if len(sr.Entries) != 1 {
		err = errors.Wrap(err, "dupe users found during LDAP authentication")
		return
	}

	userdn := sr.Entries[0].DN

	// Bind as the user to verify their password
	err = l.Bind(userdn, pwd)
	if err != nil {
		return false, nil
	}

	return true, nil
}

// ExecuteUserFilter returns all matching LDAP users.
func executeUserFilter(c lm.LDAPConfig) (u []lm.LDAPUser, err error) {
	l, err := connect(c)
	if err != nil {
		err = errors.Wrap(err, "unable to dial LDAP server")
		return
	}
	defer l.Close()

	// Authenticate with LDAP server using admin credentials.
	err = l.Bind(c.BindDN, c.BindPassword)
	if err != nil {
		errors.Wrap(err, "unable to bind admin user")
		return
	}

	searchRequest := ld.NewSearchRequest(
		c.BaseDN,
		ld.ScopeWholeSubtree, ld.NeverDerefAliases, 0, 0, false,
		c.UserFilter,
		c.GetUserFilterAttributes(),
		nil,
	)

	sr, err := l.Search(searchRequest)
	if err != nil {
		errors.Wrap(err, "unable to execute directory search for user filter "+c.UserFilter)
		return
	}

	for _, e := range sr.Entries {
		u = append(u, extractUser(c, e))
	}

	return
}

// extractUser build user record from LDAP result attributes.
func extractUser(c lm.LDAPConfig, e *ld.Entry) (u lm.LDAPUser) {
	u.Firstname = e.GetAttributeValue(c.AttributeUserFirstname)
	u.Lastname = e.GetAttributeValue(c.AttributeUserLastname)
	u.Email = e.GetAttributeValue(c.AttributeUserEmail)
	u.RemoteID = e.GetAttributeValue(c.AttributeUserRDN)
	u.CN = e.GetAttributeValue("cn")

	return
}
