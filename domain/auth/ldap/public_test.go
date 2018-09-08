// Copyright 2016 Documize IntestConfigPublicLDAP. <legal@documize.com>. All rights reserved.
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

// Works against https://www.forumsys.com/tutorials/integration-how-to/ldap/online-ldap-test-server/

var testConfigPublicLDAP = lm.LDAPConfig{
	ServerType:               lm.ServerTypeLDAP,
	ServerHost:               "ldap.forumsys.com",
	ServerPort:               389,
	EncryptionType:           lm.EncryptionTypeNone,
	BaseDN:                   "dc=example,dc=com",
	BindDN:                   "cn=read-only-admin,dc=example,dc=com",
	BindPassword:             "password",
	UserFilter:               "",
	GroupFilter:              "",
	AttributeUserRDN:         "uid",
	AttributeUserFirstname:   "givenName",
	AttributeUserLastname:    "sn",
	AttributeUserEmail:       "mail",
	AttributeUserDisplayName: "",
	AttributeUserGroupName:   "",
	AttributeGroupMember:     "uniqueMember",
}

func TestUserFilter_PublicLDAP(t *testing.T) {
	testConfigPublicLDAP.UserFilter = "(|(objectClass=person)(objectClass=user)(objectClass=inetOrgPerson))"

	e, err := executeUserFilter(testConfigPublicLDAP)
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

func TestGroupFilter_PublicLDAP(t *testing.T) {
	testConfigPublicLDAP.GroupFilter = "(|(ou=mathematicians)(ou=chemists))"

	e, err := executeGroupFilter(testConfigPublicLDAP)
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

func TestAuthenticate_PublicLDAP(t *testing.T) {
	l, err := connect(testConfigPublicLDAP)
	if err != nil {
		t.Error("Error: unable to dial LDAP server: ", err.Error())
		return
	}
	defer l.Close()

	user, ok, err := authenticate(l, testConfigPublicLDAP, "newton", "password")
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

func TestNotAuthenticate_PublicLDAP(t *testing.T) {
	l, err := connect(testConfigPublicLDAP)
	if err != nil {
		t.Error("Error: unable to dial LDAP server: ", err.Error())
		return
	}
	defer l.Close()

	_, ok, err := authenticate(l, testConfigPublicLDAP, "junk", "junk")
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
