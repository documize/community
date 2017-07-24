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

package space

import (
	"fmt"

	"github.com/documize/community/core/api/mail"
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/account"
	"github.com/documize/community/domain/user"
)

// addSpace prepares and creates space record.
func addSpace(s domain.StoreContext, sp Space) (err error) {
	sp.Type = ScopePrivate
	sp.UserID = s.Context.UserID

	err = Add(s, sp)
	if err != nil {
		return
	}

	role := Role{}
	role.LabelID = sp.RefID
	role.OrgID = sp.OrgID
	role.UserID = s.Context.UserID
	role.CanEdit = true
	role.CanView = true
	role.RefID = uniqueid.Generate()

	err = AddRole(s, role)

	return
}

// Invite new user to a folder that someone has shared with them.
// We create the user account with default values and then take them
// through a welcome process designed to capture profile data.
// We add them to the organization and grant them view-only folder access.
func inviteNewUserToSharedSpace(s domain.StoreContext, email string, invitedBy user.User,
	baseURL string, sp Space, invitationMessage string) (err error) {

	var u = user.User{}
	u.Email = email
	u.Firstname = email
	u.Lastname = ""
	u.Salt = secrets.GenerateSalt()
	requestedPassword := secrets.GenerateRandomPassword()
	u.Password = secrets.GeneratePassword(requestedPassword, u.Salt)
	userID := uniqueid.Generate()
	u.RefID = userID

	err = user.Add(s, u)
	if err != nil {
		return
	}

	// Let's give this user access to the organization
	var a account.Account
	a.UserID = userID
	a.OrgID = s.Context.OrgID
	a.Admin = false
	a.Editor = false
	a.Active = true
	accountID := uniqueid.Generate()
	a.RefID = accountID

	err = account.Add(s, a)
	if err != nil {
		return
	}

	role := Role{}
	role.LabelID = sp.RefID
	role.OrgID = s.Context.OrgID
	role.UserID = userID
	role.CanEdit = false
	role.CanView = true
	roleID := uniqueid.Generate()
	role.RefID = roleID

	err = AddRole(s, role)
	if err != nil {
		return
	}

	url := fmt.Sprintf("%s/%s", baseURL, u.Salt)
	go mail.ShareFolderNewUser(u.Email, invitedBy.Fullname(), url, sp.Name, invitationMessage)

	return
}
