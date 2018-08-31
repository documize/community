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
	"fmt"
	"strings"
	"testing"

	lm "github.com/documize/community/model/auth"
	ld "gopkg.in/ldap.v2"
)

// Works against https://github.com/rroemhild/docker-test-openldap
// Use docker run --privileged -d -p 389:389 rroemhild/test-openldap

var testConfigLocalLDAP = lm.LDAPConfig{
	ServerType:               lm.ServerTypeLDAP,
	ServerHost:               "127.0.0.1",
	ServerPort:               389,
	EncryptionType:           "starttls",
	BaseDN:                   "ou=people,dc=planetexpress,dc=com",
	BindDN:                   "cn=admin,dc=planetexpress,dc=com",
	BindPassword:             "GoodNewsEveryone",
	UserFilter:               "",
	GroupFilter:              "",
	AttributeUserRDN:         "uid",
	AttributeUserFirstname:   "givenName",
	AttributeUserLastname:    "sn",
	AttributeUserEmail:       "mail",
	AttributeUserDisplayName: "",
	AttributeUserGroupName:   "",
	AttributeGroupMember:     "member",
}

func TestUserFilter_LocalLDAP(t *testing.T) {
	testConfigLocalLDAP.UserFilter = "(|(objectClass=person)(objectClass=user)(objectClass=inetOrgPerson))"

	e, err := executeUserFilter(testConfigLocalLDAP)
	if err != nil {
		t.Error("unable to exeucte user filter", err.Error())
		return
	}
	if len(e) == 0 {
		t.Error("Received ZERO LDAP search entries")
		return
	}

	t.Logf("LDAP search entries found: %d", len(e))

	for _, u := range e {
		t.Logf("[%s] %s (%s %s) @ %s\n",
			u.RemoteID, u.CN, u.Firstname, u.Lastname, u.Email)
	}
}

func TestLocalLDAPServer_UsersInGroup(t *testing.T) {
	testConfigLocalLDAP.UserFilter = ""
	testConfigLocalLDAP.GroupFilter = "(&(objectClass=group)(|(cn=ship_crew)(cn=admin_staff)))"
	groupAttrs := testConfigLocalLDAP.GetGroupFilterAttributes()
	userAttrs := testConfigLocalLDAP.GetUserFilterAttributes()

	l, err := connect(testConfigLocalLDAP)
	if err != nil {
		t.Error("Error: unable to dial LDAP server: ", err.Error())
		return
	}
	defer l.Close()

	// Authenticate with LDAP server using admin credentials.
	t.Log("Binding LDAP admin user")
	err = l.Bind(testConfigLocalLDAP.BindDN, testConfigLocalLDAP.BindPassword)
	if err != nil {
		t.Error("Error: unable to bind specified admin user to LDAP: ", err.Error())
		return
	}

	searchRequest := ld.NewSearchRequest(
		testConfigLocalLDAP.BaseDN,
		ld.ScopeWholeSubtree, ld.NeverDerefAliases, 0, 0, false,
		testConfigLocalLDAP.GroupFilter,
		groupAttrs,
		nil,
	)

	t.Log("LDAP search filter:", testConfigLocalLDAP.GroupFilter)
	sr, err := l.Search(searchRequest)
	if err != nil {
		t.Error("Error: unable to execute directory search: ", err.Error())
		return
	}

	t.Logf("LDAP search entries found: %d", len(sr.Entries))
	if len(sr.Entries) == 0 {
		t.Error("Received ZERO LDAP search entries")
		return
	}

	// Get list of group members per group found.
	for _, group := range sr.Entries {
		t.Log("Found group", group.DN)

		rawMembers := group.GetAttributeValues(testConfigLocalLDAP.AttributeGroupMember)
		if len(rawMembers) == 0 {
			t.Log("Error: group member attribute returned no users")
			continue
		}

		t.Logf("LDAP group contains %d members", len(rawMembers))

		for _, entry := range rawMembers {
			// get CN element from DN
			parts := strings.Split(entry, ",")
			if len(parts) == 0 {
				continue
			}
			filter := fmt.Sprintf("(%s)", parts[0])

			usr := ld.NewSearchRequest(
				testConfigLocalLDAP.BaseDN,
				ld.ScopeWholeSubtree, ld.NeverDerefAliases, 0, 0, false,
				filter,
				userAttrs,
				nil,
			)
			ue, err := l.Search(usr)
			if err != nil {
				t.Log("Error: unable to execute directory search for group member: ", err.Error())
				continue
			}

			if len(ue.Entries) > 0 {
				for _, ur := range ue.Entries {
					t.Logf("[%s] %s (%s %s) @ %s\n",
						ur.GetAttributeValue(testConfigLocalLDAP.AttributeUserRDN),
						ur.GetAttributeValue("cn"),
						ur.GetAttributeValue(testConfigLocalLDAP.AttributeUserFirstname),
						ur.GetAttributeValue(testConfigLocalLDAP.AttributeUserLastname),
						ur.GetAttributeValue(testConfigLocalLDAP.AttributeUserEmail))
				}
			} else {
				t.Log("group member search failed:", filter)
			}
		}
	}
}

func TestAuthenticate_LocalLDAP(t *testing.T) {
	l, err := connect(testConfigLocalLDAP)
	if err != nil {
		t.Error("Error: unable to dial LDAP server: ", err.Error())
		return
	}
	defer l.Close()

	ok, err := authenticate(l, testConfigLocalLDAP, "professor", "professor")
	if err != nil {
		t.Error("error during LDAP authentication: ", err.Error())
		return
	}
	if !ok {
		t.Error("failed LDAP authentication")
	}

	t.Log("Authenticated")
}

func TestNotAuthenticate_LocalLDAP(t *testing.T) {
	l, err := connect(testConfigLocalLDAP)
	if err != nil {
		t.Error("Error: unable to dial LDAP server: ", err.Error())
		return
	}
	defer l.Close()

	ok, err := authenticate(l, testConfigLocalLDAP, "junk", "junk")
	if err != nil {
		t.Error("error during LDAP authentication: ", err.Error())
		return
	}
	if ok {
		t.Error("incorrect LDAP authentication")
	}

	t.Log("Not authenticated")
}
