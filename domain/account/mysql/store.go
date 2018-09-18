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

package mysql

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store/mysql"
	"github.com/documize/community/model/account"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// Add inserts the given record into the datbase account table.
func (s Scope) Add(ctx domain.RequestContext, account account.Account) (err error) {
	account.Created = time.Now().UTC()
	account.Revised = time.Now().UTC()

	_, err = ctx.Transaction.Exec("INSERT INTO dmz_user_account (c_refid, c_orgid, c_userid, c_admin, c_editor, c_users, c_analytics, c_active, c_created, c_revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		account.RefID, account.OrgID, account.UserID, account.Admin, account.Editor, account.Users, account.Analytics, account.Active, account.Created, account.Revised)

	if err != nil {
		err = errors.Wrap(err, "unable to execute insert for account")
	}

	return
}

// GetUserAccount returns the database account record corresponding to the given userID, using the client's current organizaion.
func (s Scope) GetUserAccount(ctx domain.RequestContext, userID string) (account account.Account, err error) {
	err = s.Runtime.Db.Get(&account, `
        SELECT a.id, a.c_refid AS refid, a.c_orgid AS orgid, a.c_userid AS userid,
        a.c_editor AS editor, a.c_admin AS admin, a.c_users AS users, a.c_analytics AS analytics,
        a.c_active AS active, a.c_created AS created, a.c_revised AS revised,
		b.c_company AS company, b.c_title AS title, b.c_message AS message, b.c_domain as domain
		FROM dmz_user_account a, dmz_org b
        WHERE b.c_refid=a.c_orgid AND a.c_orgid=? AND a.c_userid=?`,
		ctx.OrgID, userID)

	if err != sql.ErrNoRows && err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute select for account by user %s", userID))
	}

	return
}

// GetUserAccounts returns a slice of database account records, for all organizations that the userID is a member of, in organization title order.
func (s Scope) GetUserAccounts(ctx domain.RequestContext, userID string) (t []account.Account, err error) {
	err = s.Runtime.Db.Select(&t, `
        SELECT a.id, a.c_refid AS refid, a.c_orgid AS orgid, a.c_userid AS userid,
        a.c_editor AS editor, a.c_admin AS admin, a.c_users AS users, a.c_analytics AS analytics,
        a.c_active AS active, a.c_created AS created, a.c_revised AS revised,
        b.c_company AS company, b.c_title AS title, b.c_message AS message, b.c_domain as domain
        FROM dmz_user_account a, dmz_org b
        WHERE a.c_userid=? AND a.c_orgid=b.c_refid AND a.c_active=1
        ORDER BY b.c_title`,
		userID)

	if err != sql.ErrNoRows && err != nil {
		err = errors.Wrap(err, fmt.Sprintf("Unable to execute select account for user %s", userID))
	}

	return
}

// GetAccountsByOrg returns a slice of database account records, for all users in the client's organization.
func (s Scope) GetAccountsByOrg(ctx domain.RequestContext) (t []account.Account, err error) {
	err = s.Runtime.Db.Select(&t, `
        SELECT a.id, a.c_refid AS refid, a.c_orgid AS orgid, a.c_userid AS userid,
        a.c_editor AS editor, a.c_admin AS admin, a.c_users AS users, a.c_analytics AS analytics,
        a.c_active AS active, a.c_created AS created, a.c_revised AS revised,
        b.c_company AS company, b.c_title AS title, b.c_message AS message, b.c_domain as domain
        FROM dmz_user_account a, dmz_org b
        WHERE a.c_orgid=b.c_refid AND a.c_orgid=? AND a.c_active=1`,
		ctx.OrgID)

	if err != sql.ErrNoRows && err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute select account for org %s", ctx.OrgID))
	}

	return
}

// CountOrgAccounts returns the numnber of active user accounts for specified organization.
func (s Scope) CountOrgAccounts(ctx domain.RequestContext) (c int) {
	row := s.Runtime.Db.QueryRow("SELECT count(*) FROM dmz_user_account WHERE c_orgid=? AND c_active=1", ctx.OrgID)
	err := row.Scan(&c)
	if err == sql.ErrNoRows {
		return 0
	}
	if err != nil {
		err = errors.Wrap(err, "count org accounts")
		return 0
	}

	return
}

// UpdateAccount updates the database record for the given account to the given values.
func (s Scope) UpdateAccount(ctx domain.RequestContext, account account.Account) (err error) {
	account.Revised = time.Now().UTC()

	_, err = ctx.Transaction.NamedExec(`
        UPDATE dmz_user_account SET
        c_userid=:userid, c_admin=:admin, c_editor=:editor, c_users=:users, c_analytics=:analytics,
        c_active=:active, c_revised=:revised WHERE c_orgid=:orgid AND c_refid=:refid`, &account)

	if err != sql.ErrNoRows && err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute update for account %s", account.RefID))
	}

	return
}

// HasOrgAccount returns if the given orgID has valid userID.
func (s Scope) HasOrgAccount(ctx domain.RequestContext, orgID, userID string) bool {
	row := s.Runtime.Db.QueryRow("SELECT count(*) FROM dmz_user_account WHERE c_orgid=? and c_userid=?", orgID, userID)

	var count int
	err := row.Scan(&count)

	if err == sql.ErrNoRows {
		return false
	}
	if err != nil && err != sql.ErrNoRows {
		err = errors.Wrap(err, "HasOrgAccount")
		return false
	}

	if count == 0 {
		return false
	}

	return true
}

// DeleteAccount deletes the database record in the account table for user ID.
func (s Scope) DeleteAccount(ctx domain.RequestContext, ID string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	return b.DeleteConstrained(ctx.Transaction, "dmz_user_account", ctx.OrgID, ID)
}
