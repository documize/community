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

// Works against AD server in Azure configured using:
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

func TestUserFilter_PublicAD(t *testing.T) {
	testConfigPublicAD.UserFilter = "(|(objectCategory=person)(objectClass=user)(objectClass=inetOrgPerson))"

	e, err := executeUserFilter(testConfigPublicAD)
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

func TestADServer_Groups(t *testing.T) {
	testConfigPublicAD.UserFilter = ""
	testConfigPublicAD.GroupFilter = "(|(cn=Accounting)(cn=IT))"
	groupAttrs := testConfigPublicAD.GetGroupFilterAttributes()
	userAttrs := testConfigPublicAD.GetUserFilterAttributes()

	l, err := connect(testConfigPublicAD)
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

func TestAuthenticate_PublicAD(t *testing.T) {
	l, err := connect(testConfigPublicAD)
	if err != nil {
		t.Error("Error: unable to dial LDAP server: ", err.Error())
		return
	}
	defer l.Close()

	ok, err := authenticate(l, testConfigPublicAD, "bob.johnson", "Pass@word1!")
	if err != nil {
		t.Error("error during LDAP authentication: ", err.Error())
		return
	}
	if !ok {
		t.Error("failed LDAP authentication")
	}

	t.Log("Authenticated")
}

func TestNotAuthenticate_PublicAD(t *testing.T) {
	l, err := connect(testConfigPublicAD)
	if err != nil {
		t.Error("Error: unable to dial LDAP server: ", err.Error())
		return
	}
	defer l.Close()

	ok, err := authenticate(l, testConfigPublicAD, "junk", "junk")
	if err != nil {
		t.Error("error during LDAP authentication: ", err.Error())
		return
	}
	if ok {
		t.Error("incorrect LDAP authentication")
	}

	t.Log("Not authenticated")
}
