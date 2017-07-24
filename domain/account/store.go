package account

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store/mysql"
	"github.com/pkg/errors"
)

// Add inserts the given record into the datbase account table.
func Add(s domain.StoreContext, account Account) (err error) {
	account.Created = time.Now().UTC()
	account.Revised = time.Now().UTC()

	stmt, err := s.Context.Transaction.Preparex("INSERT INTO account (refid, orgid, userid, admin, editor, active, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "unable to prepare insert for account")
		return
	}

	_, err = stmt.Exec(account.RefID, account.OrgID, account.UserID, account.Admin, account.Editor, account.Active, account.Created, account.Revised)

	if err != nil {
		err = errors.Wrap(err, "unable to execute insert for account")
		return
	}

	return
}

// GetUserAccount returns the database account record corresponding to the given userID, using the client's current organizaion.
func GetUserAccount(s domain.StoreContext, userID string) (account Account, err error) {
	stmt, err := s.Runtime.Db.Preparex("SELECT a.*, b.company, b.title, b.message, b.domain FROM account a, organization b WHERE b.refid=a.orgid and a.orgid=? and a.userid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("prepare select for account by user %s", userID))
		return
	}

	err = stmt.Get(&account, s.Context.OrgID, userID)
	if err != sql.ErrNoRows && err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute select for account by user %s", userID))
		return
	}

	return
}

// GetUserAccounts returns a slice of database account records, for all organizations that the userID is a member of, in organization title order.
func GetUserAccounts(s domain.StoreContext, userID string) (t []Account, err error) {
	err = s.Runtime.Db.Select(&t, "SELECT a.*, b.company, b.title, b.message, b.domain FROM account a, organization b WHERE a.userid=? AND a.orgid=b.refid AND a.active=1 ORDER BY b.title", userID)

	if err != sql.ErrNoRows && err != nil {
		err = errors.Wrap(err, fmt.Sprintf("Unable to execute select account for user %s", userID))
	}

	return
}

// GetAccountsByOrg returns a slice of database account records, for all users in the client's organization.
func GetAccountsByOrg(s domain.StoreContext) (t []Account, err error) {
	err = s.Runtime.Db.Select(&t, "SELECT a.*, b.company, b.title, b.message, b.domain FROM account a, organization b WHERE a.orgid=b.refid AND a.orgid=? AND a.active=1", s.Context.OrgID)

	if err != sql.ErrNoRows && err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute select account for org %s", s.Context.OrgID))
	}

	return
}

// CountOrgAccounts returns the numnber of active user accounts for specified organization.
func CountOrgAccounts(s domain.StoreContext) (c int) {
	row := s.Runtime.Db.QueryRow("SELECT count(*) FROM account WHERE orgid=? AND active=1", s.Context.OrgID)

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
func UpdateAccount(s domain.StoreContext, account Account) (err error) {
	account.Revised = time.Now().UTC()

	stmt, err := s.Context.Transaction.PrepareNamed("UPDATE account SET userid=:userid, admin=:admin, editor=:editor, active=:active, revised=:revised WHERE orgid=:orgid AND refid=:refid")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("prepare update for account %s", account.RefID))
		return
	}

	_, err = stmt.Exec(&account)
	if err != sql.ErrNoRows && err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute update for account %s", account.RefID))
		return
	}

	return
}

// HasOrgAccount returns if the given orgID has valid userID.
func HasOrgAccount(s domain.StoreContext, orgID, userID string) bool {
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
func DeleteAccount(s domain.StoreContext, ID string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	return b.DeleteConstrained(s.Context.Transaction, "account", s.Context.OrgID, ID)
}
