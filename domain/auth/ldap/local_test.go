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

// Works against https://github.com/rroemhild/docker-test-openldap
// Use docker run --privileged -d -p 389:389 rroemhild/test-openldap

var testConfigLocalLDAP = lm.LDAPConfig{
	ServerType:               lm.ServerTypeLDAP,
	ServerHost:               "127.0.0.1",
	ServerPort:               389,
	EncryptionType:           lm.EncryptionTypeStartTLS,
	BaseDN:                   "ou=people,dc=planetexpress,dc=com",
	BindDN:                   "cn=admin,dc=planetexpress,dc=com",
	BindPassword:             "GoodNewsEveryone",
	UserFilter:               "(|(objectClass=person)(objectClass=user)(objectClass=inetOrgPerson))",
	GroupFilter:              "(&(objectClass=group)(|(cn=ship_crew)(cn=admin_staff)))",
	AttributeUserRDN:         "uid",
	AttributeUserFirstname:   "givenName",
	AttributeUserLastname:    "sn",
	AttributeUserEmail:       "mail",
	AttributeUserDisplayName: "",
	AttributeUserGroupName:   "",
	AttributeGroupMember:     "member",
}

func TestUserFilter_LocalLDAP(t *testing.T) {
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

func TestDualFilters_LocalLDAP(t *testing.T) {
	e1, err := executeUserFilter(testConfigLocalLDAP)
	if err != nil {
		t.Error("unable to exeucte user filter", err.Error())
		return
	}

	e2, err := executeGroupFilter(testConfigLocalLDAP)
	if err != nil {
		t.Error("unable to exeucte group filter", err.Error())
		return
	}

	e3 := []lm.LDAPUser{}
	e3 = append(e3, e1...)
	e3 = append(e3, e2...)
	users := convertUsers(testConfigLocalLDAP, e3)

	for _, u := range users {
		t.Logf("(%s %s) @ %s\n",
			u.Firstname, u.Lastname, u.Email)
	}
}

func TestGroupFilter_LocalLDAP(t *testing.T) {
	e, err := executeGroupFilter(testConfigLocalLDAP)
	if err != nil {
		t.Error("unable to exeucte group filter", err.Error())
		return
	}
	if len(e) == 0 {
		t.Error("Received zero group LDAP search entries")
		return
	}

	t.Logf("LDAP group search entries found: %d", len(e))
}

func TestAuthenticate_LocalLDAP(t *testing.T) {
	l, err := connect(testConfigLocalLDAP)
	if err != nil {
		t.Error("Error: unable to dial LDAP server: ", err.Error())
		return
	}
	defer l.Close()

	user, ok, err := authenticate(l, testConfigLocalLDAP, "professor", "professor")
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

func TestNotAuthenticate_LocalLDAP(t *testing.T) {
	l, err := connect(testConfigLocalLDAP)
	if err != nil {
		t.Error("Error: unable to dial LDAP server: ", err.Error())
		return
	}
	defer l.Close()

	_, ok, err := authenticate(l, testConfigLocalLDAP, "junk", "junk")
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
