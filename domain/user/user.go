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
	"github.com/documize/community/domain/account"
	"github.com/pkg/errors"
)

// GetSecuredUser contain associated accounts but credentials are wiped.
func GetSecuredUser(s domain.StoreContext, orgID, q string) (u User, err error) {
	u, err = Get(s, q)
	AttachUserAccounts(s, orgID, &u)

	return
}

// AttachUserAccounts attachs user accounts to user object.
func AttachUserAccounts(s domain.StoreContext, orgID string, u *User) {
	u.ProtectSecrets()

	a, err := account.GetUserAccounts(s, u.RefID)
	if err != nil {
		err = errors.Wrap(err, "fetch user accounts")
		return
	}

	u.Accounts = a
	u.Editor = false
	u.Admin = false
	u.Active = false

	for _, account := range u.Accounts {
		if account.OrgID == orgID {
			u.Admin = account.Admin
			u.Editor = account.Editor
			u.Active = account.Active
			break
		}
	}
}
