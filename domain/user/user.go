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

package user

import (
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/user"
	"github.com/pkg/errors"
)

// GetSecuredUser contain associated accounts but credentials are wiped.
func GetSecuredUser(ctx domain.RequestContext, s store.Store, orgID, id string) (u user.User, err error) {
	u, err = s.User.Get(ctx, id)
	AttachUserAccounts(ctx, s, orgID, &u)

	return
}

// AttachUserAccounts attachs user accounts to user object.
func AttachUserAccounts(ctx domain.RequestContext, s store.Store, orgID string, u *user.User) {
	u.ProtectSecrets()

	a, err := s.Account.GetUserAccounts(ctx, u.RefID)
	if err != nil {
		err = errors.Wrap(err, "fetch user accounts")
		return
	}

	u.Accounts = a
	u.Editor = false
	u.Admin = false
	u.Active = false
	u.ViewUsers = false
	u.Analytics = false
	u.Theme = ""

	for _, account := range u.Accounts {
		if account.OrgID == orgID {
			u.Admin = account.Admin
			u.Editor = account.Editor
			u.Active = account.Active
			u.ViewUsers = account.Users
			u.Analytics = account.Analytics
			u.Theme = account.Theme
			break
		}
	}
}
