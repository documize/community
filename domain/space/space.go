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

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/mail"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/account"
	"github.com/documize/community/model/permission"
	"github.com/documize/community/model/space"
	"github.com/documize/community/model/user"
)

// Invite new user to a space that someone has shared with them.
// We create the user account with default values and then take them
// through a welcome process designed to capture profile data.
// We add them to the organization and grant them view-only space access.
func inviteNewUserToSharedSpace(ctx domain.RequestContext, rt *env.Runtime, s *store.Store, email string, invitedBy user.User,
	baseURL string, sp space.Space, invitationMessage string) (err error) {

	var u = user.User{}
	u.Email = email
	u.Firstname = email
	u.Lastname = ""
	u.Salt = secrets.GenerateSalt()
	requestedPassword := secrets.GenerateRandomPassword()
	u.Password = secrets.GeneratePassword(requestedPassword, u.Salt)
	userID := uniqueid.Generate()
	u.RefID = userID
	u.Locale = ctx.OrgLocale

	err = s.User.Add(ctx, u)
	if err != nil {
		return
	}

	// Let's give this user access to the organization
	var a account.Account
	a.UserID = userID
	a.OrgID = ctx.OrgID
	a.Admin = false
	a.Editor = false
	a.Users = false
	a.Active = true
	a.RefID = uniqueid.Generate()

	err = s.Account.Add(ctx, a)
	if err != nil {
		return
	}

	perm := permission.Permission{}
	perm.OrgID = sp.OrgID
	perm.Who = permission.UserPermission
	perm.WhoID = userID
	perm.Scope = permission.ScopeRow
	perm.Location = permission.LocationSpace
	perm.RefID = sp.RefID
	perm.Action = "" // we send array for actions below

	err = s.Permission.AddPermissions(ctx, perm, permission.SpaceView)
	if err != nil {
		return
	}

	mailer := mail.Mailer{Runtime: rt, Store: s, Context: ctx}

	url := fmt.Sprintf("%s/%s", baseURL, u.Salt)
	go mailer.ShareSpaceNewUser(u.Email, invitedBy.Fullname(), invitedBy.Email, url, sp.Name, invitationMessage)

	return
}
