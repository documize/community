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
	"math"
	"strings"

	"github.com/documize/community/core/stringutil"
	lm "github.com/documize/community/model/auth"
	"github.com/documize/community/model/user"
	ld "github.com/go-ldap/ldap/v3"
	"github.com/pkg/errors"
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

	if c.EncryptionType == lm.EncryptionTypeStartTLS {
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
func authenticate(l *ld.Conn, c lm.LDAPConfig, username, pwd string) (lu lm.LDAPUser, success bool, err error) {
	success = false
	err = nil

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
		return
	}

	lu = extractUser(c, sr.Entries[0])
	success = true

	return
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
		ld.ScopeWholeSubtree, ld.NeverDerefAliases, math.MaxInt32, 0, false,
		c.UserFilter,
		c.GetUserFilterAttributes(),
		nil,
	)

	sr, err := l.SearchWithPaging(searchRequest, lm.MaxPageSize)
	if err != nil {
		errors.Wrap(err, "unable to execute directory search for user filter "+c.UserFilter)
		return
	}

	for _, e := range sr.Entries {
		u = append(u, extractUser(c, e))
	}

	return
}

// ExecuteGroupFilter returns all matching LDAP users that are paft of specified groups.
func executeGroupFilter(c lm.LDAPConfig) (u []lm.LDAPUser, err error) {
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
		ld.ScopeWholeSubtree, ld.NeverDerefAliases, math.MaxInt32, 0, false,
		c.GroupFilter,
		c.GetGroupFilterAttributes(),
		nil,
	)

	sr, err := l.SearchWithPaging(searchRequest, lm.MaxPageSize)
	if err != nil {
		errors.Wrap(err, "unable to execute directory search for user filter "+c.GroupFilter)
		return
	}

	for _, g := range sr.Entries {
		rawMembers := g.GetAttributeValues(c.AttributeGroupMember)
		if len(rawMembers) == 0 {
			continue
		}

		// Get CN element from DN.
		for _, entry := range rawMembers {
			parts := splitDN(entry)
			if len(parts) == 0 {
				continue
			}
			filter := fmt.Sprintf("(%s)", parts[0])

			usr := ld.NewSearchRequest(
				c.BaseDN,
				ld.ScopeWholeSubtree, ld.NeverDerefAliases, 0, 0, false,
				filter,
				c.GetUserFilterAttributes(),
				nil,
			)

			ue, err := l.Search(usr)
			if err != nil {
				continue
			}

			if len(ue.Entries) > 0 {
				for _, ur := range ue.Entries {
					u = append(u, extractUser(c, ur))
				}
			}
		}
	}

	return
}

// splitDN handles splitting of DN string whilst respecting
// escaped comma characters.
//
// DN values can contain escaped commas like in two ways:
//
// 		\,
// 		\5c,
//
// Relevant notes:
//
// 		https://docs.oracle.com/cd/E19424-01/820-4811/gdxpo/index.html#6ng8i269q
// 		https://devblogs.microsoft.com/scripting/how-can-i-work-with-a-cn-that-has-a-comma-in-it/
//
// Example:
//
//		CN=Surname\, Name,OU=Something,OU=AD-Example,OU=Examaple,DC=example,DC=example,DC=com
//
// When we split on comma, here is our logic:
//
// 1. Replace any escaped comma values with a special character sequence.
// 2. Split string on comma as per usual.
// 3. Put back the original escaped comma values.
func splitDN(dn string) []string {
	dn = strings.ReplaceAll(dn, `\5c,`, "!!1!!")
	dn = strings.ReplaceAll(dn, `\,`, "!!2!!")

	sp := strings.Split(dn, ",")

	for i := range sp {
		val := sp[i]
		val = strings.ReplaceAll(val, "!!1!!", `\5c,`)
		val = strings.ReplaceAll(val, "!!2!!", `\,`)
		sp[i] = val
	}

	return sp
}

// extractUser build user record from LDAP result attributes.
func extractUser(c lm.LDAPConfig, e *ld.Entry) (u lm.LDAPUser) {
	u.Firstname = e.GetAttributeValue(c.AttributeUserFirstname)
	u.Lastname = e.GetAttributeValue(c.AttributeUserLastname)
	u.Email = strings.ToLower(e.GetAttributeValue(c.AttributeUserEmail))
	u.RemoteID = e.GetAttributeValue(c.AttributeUserRDN)
	u.CN = e.GetAttributeValue("cn")

	if len(u.Firstname) == 0 {
		u.Firstname = "LDAP"
	}
	if len(u.Lastname) == 0 {
		u.Lastname = "User"
	}

	return
}

// ConvertUsers creates a unique list of users using email as primary key.
// The result is a collection of Documize user objects.
func convertUsers(c lm.LDAPConfig, lu []lm.LDAPUser) (du []user.User) {
	for _, i := range lu {
		add := true
		for _, j := range du {
			if len(j.Email) > 0 && i.Email == j.Email {
				add = false
				break
			}
		}
		// skip if empty email address
		add = len(i.Email) > 0
		if add {
			du = append(du, convertUser(c, i))
		}
	}

	return
}

// ConvertUser turns LDAP user into Documize user.
func convertUser(c lm.LDAPConfig, lu lm.LDAPUser) (du user.User) {
	du = user.User{}
	du.Active = true
	du.ViewUsers = false
	du.Analytics = false
	du.Admin = false
	du.GlobalAdmin = false
	du.Editor = c.DefaultPermissionAddSpace
	du.Email = lu.Email
	du.Firstname = lu.Firstname
	du.Lastname = lu.Lastname
	du.Initials = stringutil.MakeInitials(lu.Firstname, lu.Lastname)

	return
}

// FetchUsers from LDAP server using both User and Group filters.
func fetchUsers(c lm.LDAPConfig) (du []user.User, err error) {
	du = []user.User{}
	e1 := []lm.LDAPUser{}
	e2 := []lm.LDAPUser{}
	e3 := []lm.LDAPUser{}

	if len(c.UserFilter) > 0 {
		e1, err = executeUserFilter(c)
		if err != nil {
			err = errors.Wrap(err, "unable to execute user filter")
			return
		}
	}

	if len(c.GroupFilter) > 0 {
		e2, err = executeGroupFilter(c)
		if err != nil {
			err = errors.Wrap(err, "unable to execute group filter")
			return
		}
	}

	// convert users from LDAP format to Documize format.
	e3 = append(e3, e1...)
	e3 = append(e3, e2...)
	du = convertUsers(c, e3)

	return
}
