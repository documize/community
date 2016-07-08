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

package exttest

import (
	"testing"

	"github.com/documize/community/sdk"
	"github.com/documize/community/documize/api/entity"
)

func testUsers(t *testing.T, c *documize.Client) {

	usrs, err := c.GetUsers()
	if err != nil {
		t.Error(err)
	} else {
		t.Logf("INFO: users info %#v", usrs)
	}
	usr, err := c.GetUserInfo()
	if err != nil {
		t.Error(err)
	} else {
		t.Logf("INFO: this user info %#v", usr)
	}
	perms, err := c.GetUserFolderPermissions()
	if err != nil {
		t.Error(err)
	} else {
		t.Logf("INFO: testing user folder perms %#v", len(*perms))
	}

	testUser := &entity.User{
		Firstname: "TestFirstname",
		Lastname:  "TestLastname",
		Email:     "tt@a.b",
		Admin:     false,
	}
	err = c.AddUser(testUser)
	if err != nil {
		t.Error(err)
	} else {
		t.Logf("INFO: created test user %#v", *testUser)
		err = c.UpdateUser(testUser)
		if err != nil {
			t.Error(err)
		}
		err = c.DeleteUser(testUser.BaseEntity.RefID)
		if err != nil {
			t.Error(err)
		}
	}

}
