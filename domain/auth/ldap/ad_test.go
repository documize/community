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
	"testing"

	lm "github.com/documize/community/model/auth"
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
	EncryptionType:           lm.EncryptionTypeNone,
	BaseDN:                   "DC=mycompany,DC=local",
	BindDN:                   "CN=Mr Manager,CN=Users,DC=mycompany,DC=local",
	BindPassword:             "Pass@word1!",
	UserFilter:               "(|(objectCategory=person)(objectClass=user)(objectClass=inetOrgPerson))",
	GroupFilter:              "(|(cn=Accounting)(cn=IT))",
	AttributeUserRDN:         "sAMAccountName",
	AttributeUserFirstname:   "givenName",
	AttributeUserLastname:    "sn",
	AttributeUserEmail:       "mail",
	AttributeUserDisplayName: "",
	AttributeUserGroupName:   "",
	AttributeGroupMember:     "member",
}

func TestUserFilter_PublicAD(t *testing.T) {
	e, err := executeUserFilter(testConfigPublicAD)
	if err != nil {
		t.Error("unable to exeucte user filter", err.Error())
		return
	}
	if len(e) == 0 {
		t.Error("Received zero user LDAP search entries")
		return
	}

	t.Logf("LDAP search entries found: %d", len(e))

	for _, u := range e {
		t.Logf("[%s] %s (%s %s) @ %s\n",
			u.RemoteID, u.CN, u.Firstname, u.Lastname, u.Email)
	}
}

func TestGroupFilter_PublicAD(t *testing.T) {
	e, err := executeGroupFilter(testConfigPublicAD)
	if err != nil {
		t.Error("unable to exeucte group filter", err.Error())
		return
	}
	if len(e) == 0 {
		t.Error("Received zero group LDAP search entries")
		return
	}

	t.Logf("LDAP group search entries found: %d", len(e))

	for _, u := range e {
		t.Logf("[%s] %s (%s %s) @ %s\n",
			u.RemoteID, u.CN, u.Firstname, u.Lastname, u.Email)
	}
}

func TestAuthenticate_PublicAD(t *testing.T) {
	l, err := connect(testConfigPublicAD)
	if err != nil {
		t.Error("Error: unable to dial LDAP server: ", err.Error())
		return
	}
	defer l.Close()

	user, ok, err := authenticate(l, testConfigPublicAD, "bob.johnson", "Pass@word1!")
	if err != nil {
		t.Error("error during LDAP authentication: ", err.Error())
		return
	}
	if !ok {
		t.Error("failed LDAP authentication")
		return
	}

	t.Log("Authenticated", user.Email)
}

func TestNotAuthenticate_PublicAD(t *testing.T) {
	l, err := connect(testConfigPublicAD)
	if err != nil {
		t.Error("Error: unable to dial LDAP server: ", err.Error())
		return
	}
	defer l.Close()

	_, ok, err := authenticate(l, testConfigPublicAD, "junk", "junk")
	if err != nil {
		t.Error("error during LDAP authentication: ", err.Error())
		return
	}
	if ok {
		t.Error("incorrect LDAP authentication")
		return
	}

	t.Log("Not authenticated")
}
