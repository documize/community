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

	_, err = ctx.Transaction.Exec("INSERT INTO account (refid, orgid, userid, `admin`, editor, users, analytics, active, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		account.RefID, account.OrgID, account.UserID, account.Admin, account.Editor, account.Users, account.Analytics, account.Active, account.Created, account.Revised)

	if err != nil {
		err = errors.Wrap(err, "unable to execute insert for account")
	}

	return
}

// GetUserAccount returns the database account record corresponding to the given userID, using the client's current organizaion.
func (s Scope) GetUserAccount(ctx domain.RequestContext, userID string) (account account.Account, err error) {
	err = s.Runtime.Db.Get(&account, `
		SELECT a.id, a.refid, a.orgid, a.userid, a.editor, `+"a.`admin`"+`, a.users, a.analytics, a.active, a.created, a.revised,
		b.company, b.title, b.message, b.domain
		FROM account a, organization b
		WHERE b.refid=a.orgid AND a.orgid=? AND a.userid=?`, ctx.OrgID, userID)

	if err != sql.ErrNoRows && err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute select for account by user %s", userID))
	}

	return
}

// GetUserAccounts returns a slice of database account records, for all organizations that the userID is a member of, in organization title order.
func (s Scope) GetUserAccounts(ctx domain.RequestContext, userID string) (t []account.Account, err error) {
	err = s.Runtime.Db.Select(&t, `
		SELECT a.id, a.refid, a.orgid, a.userid, a.editor, `+"a.`admin`"+`, a.users, a.analytics, a.active, a.created, a.revised,
		b.company, b.title, b.message, b.domain
		FROM account a, organization b
		WHERE a.userid=? AND a.orgid=b.refid AND a.active=1 ORDER BY b.title`, userID)

	if err != sql.ErrNoRows && err != nil {
		err = errors.Wrap(err, fmt.Sprintf("Unable to execute select account for user %s", userID))
	}

	return
}

// GetAccountsByOrg returns a slice of database account records, for all users in the client's organization.
func (s Scope) GetAccountsByOrg(ctx domain.RequestContext) (t []account.Account, err error) {
	err = s.Runtime.Db.Select(&t,
		`SELECT a.id, a.refid, a.orgid, a.userid, a.editor, `+"a.`admin`"+`, a.users, a.analytics, a.active, a.created, a.revised,
		b.company, b.title, b.message, b.domain
		FROM account a, organization b
		WHERE a.orgid=b.refid AND a.orgid=? AND a.active=1`, ctx.OrgID)

	if err != sql.ErrNoRows && err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute select account for org %s", ctx.OrgID))
	}

	return
}

// CountOrgAccounts returns the numnber of active user accounts for specified organization.
func (s Scope) CountOrgAccounts(ctx domain.RequestContext) (c int) {
	row := s.Runtime.Db.QueryRow("SELECT count(*) FROM account WHERE orgid=? AND active=1", ctx.OrgID)

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

	_, err = ctx.Transaction.NamedExec("UPDATE account SET userid=:userid, `admin`=:admin, editor=:editor, users=:users, analytics=:analytics, active=:active, revised=:revised WHERE orgid=:orgid AND refid=:refid", &account)

	if err != sql.ErrNoRows && err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute update for account %s", account.RefID))
	}

	return
}

// HasOrgAccount returns if the given orgID has valid userID.
func (s Scope) HasOrgAccount(ctx domain.RequestContext, orgID, userID string) bool {
	row := s.Runtime.Db.QueryRow("SELECT count(*) FROM account WHERE orgid=? and userid=?", orgID, userID)

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
	return b.DeleteConstrained(ctx.Transaction, "account", ctx.OrgID, ID)
}
