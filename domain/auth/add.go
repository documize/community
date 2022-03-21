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

package auth

import (
	"database/sql"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	usr "github.com/documize/community/domain/user"
	"github.com/documize/community/model/account"
	"github.com/documize/community/model/user"
)

// AddExternalUser method to setup user account in Documize using Keycloak/LDAP provided user data.
func AddExternalUser(ctx domain.RequestContext, rt *env.Runtime, store *store.Store, u user.User, addSpace bool) (nu user.User, err error) {
	// only create account if not dupe
	addUser := true
	addAccount := true
	var userID string

	userDupe, err := store.User.GetByEmail(ctx, u.Email)
	if err != nil && err != sql.ErrNoRows {
		return
	}

	if u.Email == userDupe.Email {
		addUser = false
		userID = userDupe.RefID
	}

	ctx.Transaction, err = rt.Db.Beginx()
	if err != nil {
		return
	}

	if addUser {
		userID = uniqueid.Generate()
		u.RefID = userID
		u.Locale = ctx.OrgLocale

		err = store.User.Add(ctx, u)
		if err != nil {
			ctx.Transaction.Rollback()
			return
		}
	} else {
		usr.AttachUserAccounts(ctx, *store, ctx.OrgID, &userDupe)

		for _, a := range userDupe.Accounts {
			if a.OrgID == ctx.OrgID {
				addAccount = false
				break
			}
		}
	}

	// set up user account for the org
	if addAccount {
		var a account.Account
		a.UserID = userID
		a.OrgID = ctx.OrgID
		a.Editor = addSpace
		a.Admin = false
		accountID := uniqueid.Generate()
		a.RefID = accountID
		a.Active = true

		err = store.Account.Add(ctx, a)
		if err != nil {
			ctx.Transaction.Rollback()
			return
		}
	}

	ctx.Transaction.Commit()

	nu, err = store.User.Get(ctx, userID)

	return
}
