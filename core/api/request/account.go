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

package request

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/streamutil"
	"github.com/pkg/errors"
)

// AddAccount inserts the given record into the datbase account table.
func (p *Persister) AddAccount(account entity.Account) (err error) {
	account.Created = time.Now().UTC()
	account.Revised = time.Now().UTC()

	stmt, err := p.Context.Transaction.Preparex("INSERT INTO account (refid, orgid, userid, admin, editor, active, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		errors.Wrap(err, "Unable to prepare insert for account")
		return
	}

	_, err = stmt.Exec(account.RefID, account.OrgID, account.UserID, account.Admin, account.Editor, account.Active, account.Created, account.Revised)

	if err != nil {
		errors.Wrap(err, "Unable to execute insert for account")
		return
	}

	return
}

// GetUserAccount returns the database account record corresponding to the given userID, using the client's current organizaion.
func (p *Persister) GetUserAccount(userID string) (account entity.Account, err error) {
	stmt, err := Db.Preparex("SELECT a.*, b.company, b.title, b.message, b.domain FROM account a, organization b WHERE b.refid=a.orgid and a.orgid=? and a.userid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare select for account by user %s", userID), err)
		return
	}

	err = stmt.Get(&account, p.Context.OrgID, userID)

	if err != sql.ErrNoRows && err != nil {
		log.Error(fmt.Sprintf("Unable to execute select for account by user %s", userID), err)
		return
	}

	return
}

// GetUserAccounts returns a slice of database account records, for all organizations that the userID is a member of, in organization title order.
func (p *Persister) GetUserAccounts(userID string) (t []entity.Account, err error) {
	err = Db.Select(&t, "SELECT a.*, b.company, b.title, b.message, b.domain FROM account a, organization b WHERE a.userid=? AND a.orgid=b.refid AND a.active=1 ORDER BY b.title", userID)

	if err != sql.ErrNoRows && err != nil {
		log.Error(fmt.Sprintf("Unable to execute select account for user %s", userID), err)
	}

	return
}

// GetAccountsByOrg returns a slice of database account records, for all users in the client's organization.
func (p *Persister) GetAccountsByOrg() (t []entity.Account, err error) {
	err = Db.Select(&t, "SELECT a.*, b.company, b.title, b.message, b.domain FROM account a, organization b WHERE a.orgid=b.refid AND a.orgid=? AND a.active=1", p.Context.OrgID)

	if err != sql.ErrNoRows && err != nil {
		log.Error(fmt.Sprintf("Unable to execute select account for org %s", p.Context.OrgID), err)
	}

	return
}

// CountOrgAccounts returns the numnber of active user accounts for specified organization.
func (p *Persister) CountOrgAccounts() (c int) {
	row := Db.QueryRow("SELECT count(*) FROM account WHERE orgid=? AND active=1", p.Context.OrgID)

	err := row.Scan(&c)
	if err != nil && err != sql.ErrNoRows {
		log.Error(p.Base.SQLSelectError("CountOrgAccounts", p.Context.OrgID), err)
		return 0
	}

	if err == sql.ErrNoRows {
		return 0
	}

	return
}

// UpdateAccount updates the database record for the given account to the given values.
func (p *Persister) UpdateAccount(account entity.Account) (err error) {
	account.Revised = time.Now().UTC()

	stmt, err := p.Context.Transaction.PrepareNamed("UPDATE account SET userid=:userid, admin=:admin, editor=:editor, active=:active, revised=:revised WHERE orgid=:orgid AND refid=:refid")
	defer streamutil.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update for account %s", account.RefID), err)
		return
	}

	_, err = stmt.Exec(&account)

	if err != sql.ErrNoRows && err != nil {
		log.Error(fmt.Sprintf("Unable to execute update for account %s", account.RefID), err)
		return
	}

	return
}

// HasOrgAccount returns if the given orgID has valid userID.
func (p *Persister) HasOrgAccount(orgID, userID string) bool {
	row := Db.QueryRow("SELECT count(*) FROM account WHERE orgid=? and userid=?", orgID, userID)

	var count int
	err := row.Scan(&count)

	if err != nil && err != sql.ErrNoRows {
		log.Error(p.Base.SQLSelectError("HasOrgAccount", userID), err)
		return false
	}

	if err == sql.ErrNoRows {
		return false
	}

	if count == 0 {
		return false
	}

	return true
}

// DeleteAccount deletes the database record in the account table for user ID.
func (p *Persister) DeleteAccount(ID string) (rows int64, err error) {
	return p.Base.DeleteConstrained(p.Context.Transaction, "account", p.Context.OrgID, ID)
}
