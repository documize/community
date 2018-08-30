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

// Works against AD server in Azure confgiured using:
//
//      https://auth0.com/docs/connector/test-dc
//
// Ensure VM network settings open up ports 389 and 636.

var testConfigPublicAD = lm.LDAPConfig{
	ServerType:               lm.ServerTypeAD,
	ServerHost:               "documize-ad.eastus.cloudapp.azure.com",
	ServerPort:               389,
	EncryptionType:           "none",
	BaseDN:                   "DC=mycompany,DC=local",
	BindDN:                   "CN=ad-admin,CN=Users,DC=mycompany,DC=local",
	BindPassword:             "8B5tNRLvbk8K",
	UserFilter:               "",
	GroupFilter:              "",
	AttributeUserRDN:         "sAMAccountName",
	AttributeUserFirstname:   "givenName",
	AttributeUserLastname:    "sn",
	AttributeUserEmail:       "mail",
	AttributeUserDisplayName: "",
	AttributeUserGroupName:   "",
	AttributeGroupMember:     "member",
}

func TestADServer_UserList(t *testing.T) {
	testConfigPublicAD.UserFilter = "(|(objectCategory=person)(objectClass=user)(objectClass=inetOrgPerson))"
	testConfigPublicAD.GroupFilter = ""
	userAttrs := testConfigPublicAD.GetUserFilterAttributes()

	l, err := Connect(testConfigPublicAD)
	if err != nil {
		t.Error("Error: unable to dial LDAP server: ", err.Error())
		return
	}
	defer l.Close()

	// Authenticate with AD server using admin credentials.
	t.Log("Binding LDAP admin user")
	err = l.Bind(testConfigPublicAD.BindDN, testConfigPublicAD.BindPassword)
	if err != nil {
		t.Error("Error: unable to bind specified admin user to AD: ", err.Error())
		return
	}

	searchRequest := ld.NewSearchRequest(
		testConfigPublicAD.BaseDN,
		ld.ScopeWholeSubtree, ld.NeverDerefAliases, 0, 0, false,
		testConfigPublicAD.UserFilter,
		userAttrs,
		nil,
	)

	sr, err := l.Search(searchRequest)
	if err != nil {
		t.Error("Error: unable to execute directory search: ", err.Error())
		return
	}

	t.Logf("AD search entries found: %d", len(sr.Entries))
	if len(sr.Entries) == 0 {
		t.Error("Received ZERO AD search entries")
		return
	}

	for _, entry := range sr.Entries {
		t.Logf("[%s] %s (%s %s) @ %s\n",
			entry.GetAttributeValue(testConfigPublicAD.AttributeUserRDN),
			entry.GetAttributeValue("cn"),
			entry.GetAttributeValue(testConfigPublicAD.AttributeUserFirstname),
			entry.GetAttributeValue(testConfigPublicAD.AttributeUserLastname),
			entry.GetAttributeValue(testConfigPublicAD.AttributeUserEmail))
	}
}

func TestADServer_Groups(t *testing.T) {
	testConfigPublicAD.UserFilter = ""
	testConfigPublicAD.GroupFilter = "(|(cn=Accounting)(cn=IT))"
	groupAttrs := testConfigPublicAD.GetGroupFilterAttributes()
	userAttrs := testConfigPublicAD.GetUserFilterAttributes()

	l, err := Connect(testConfigPublicAD)
	if err != nil {
		t.Error("Error: unable to dial AD server: ", err.Error())
		return
	}
	defer l.Close()

	// Authenticate with LDAP server using admin credentials.
	t.Log("Binding LDAP admin user")
	err = l.Bind(testConfigPublicAD.BindDN, testConfigPublicAD.BindPassword)
	if err != nil {
		t.Error("Error: unable to bind specified admin user to AD: ", err.Error())
		return
	}

	searchRequest := ld.NewSearchRequest(
		testConfigPublicAD.BaseDN,
		ld.ScopeWholeSubtree, ld.NeverDerefAliases, 0, 0, false,
		testConfigPublicAD.GroupFilter,
		groupAttrs,
		nil,
	)

	t.Log("AD search filter:", testConfigPublicAD.GroupFilter)
	sr, err := l.Search(searchRequest)
	if err != nil {
		t.Error("Error: unable to execute directory search: ", err.Error())
		return
	}

	t.Logf("AD search entries found: %d", len(sr.Entries))
	if len(sr.Entries) == 0 {
		t.Error("Received ZERO AD search entries")
		return
	}

	// Get list of group members for each group found.
	for _, group := range sr.Entries {
		t.Log("Found group", group.DN)

		rawMembers := group.GetAttributeValues(testConfigPublicAD.AttributeGroupMember)
		fmt.Printf("%s", group.DN)

		if len(rawMembers) == 0 {
			t.Log("Error: group member attribute returned no users")
			continue
		}

		t.Logf("AD group contains %d members", len(rawMembers))

		for _, entry := range rawMembers {
			// get CN element from DN
			parts := strings.Split(entry, ",")
			if len(parts) == 0 {
				continue
			}
			filter := fmt.Sprintf("(%s)", parts[0])

			usr := ld.NewSearchRequest(
				testConfigPublicAD.BaseDN,
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
						ur.GetAttributeValue(testConfigPublicAD.AttributeUserRDN),
						ur.GetAttributeValue("cn"),
						ur.GetAttributeValue(testConfigPublicAD.AttributeUserFirstname),
						ur.GetAttributeValue(testConfigPublicAD.AttributeUserLastname),
						ur.GetAttributeValue(testConfigPublicAD.AttributeUserEmail))
				}
			} else {
				t.Log("group member search failed:", filter)
			}
		}
	}
}
func TestADServer_Authenticate(t *testing.T) {
	testConfigPublicAD.UserFilter = ""
	testConfigPublicAD.GroupFilter = ""
	userAttrs := testConfigPublicAD.GetUserFilterAttributes()

	l, err := Connect(testConfigPublicAD)
	if err != nil {
		t.Error("Error: unable to dial LDAP server: ", err.Error())
		return
	}
	defer l.Close()

	// Authenticate with AD server using admin credentials.
	t.Log("Binding AD admin user")
	err = l.Bind(testConfigPublicAD.BindDN, testConfigPublicAD.BindPassword)
	if err != nil {
		t.Error("Error: unable to bind specified admin user to AD: ", err.Error())
		return
	}
	username := `bob.johnson`
	password := "Pass@word1!"
	filter := fmt.Sprintf("(%s=%s)", testConfigPublicAD.AttributeUserRDN, username)

	searchRequest := ld.NewSearchRequest(
		testConfigPublicAD.BaseDN,
		ld.ScopeWholeSubtree, ld.NeverDerefAliases, 0, 0, false,
		filter,
		userAttrs,
		nil,
	)

	t.Log("AD search filter:", filter)
	sr, err := l.Search(searchRequest)
	if err != nil {
		t.Error("Error: unable to execute directory search: ", err.Error())
		return
	}

	if len(sr.Entries) == 0 {
		t.Error("Error: user not found")
		return
	}
	if len(sr.Entries) != 1 {
		t.Error("Error: too many users found during authentication")
		return
	}

	userdn := sr.Entries[0].DN

	// Bind as the user to verify their password
	err = l.Bind(userdn, password)
	if err != nil {
		t.Error("Error: invalid credentials", err.Error())
		return
	}

	t.Log("Authenticated", username)
}
