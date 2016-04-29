package request

import (
	"database/sql"
	"fmt"
	"github.com/documize/community/documize/api/entity"
	"github.com/documize/community/wordsmith/log"
	"github.com/documize/community/wordsmith/utility"
	"time"
)

// AddAccount inserts the given record into the datbase account table.
func (p *Persister) AddAccount(account entity.Account) (err error) {
	account.Created = time.Now().UTC()
	account.Revised = time.Now().UTC()

	stmt, err := p.Context.Transaction.Preparex("INSERT INTO account (refid, orgid, userid, admin, editor, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?)")
	defer utility.Close(stmt)

	if err != nil {
		log.Error("Unable to prepare insert for account", err)
		return
	}

	_, err = stmt.Exec(account.RefID, account.OrgID, account.UserID, account.Admin, account.Editor, account.Created, account.Revised)

	if err != nil {
		log.Error("Unable to execute insert for account", err)
		return
	}

	return
}

// GetUserAccount returns the databse account record corresponding to the given userID, using the client's current organizaion.
func (p *Persister) GetUserAccount(userID string) (account entity.Account, err error) {
	err = nil

	stmt, err := Db.Preparex("SELECT a.*, b.company, b.title, b.message, b.domain FROM account a, organization b WHERE b.refid=a.orgid and a.orgid=? and a.userid=? AND b.active=1")
	defer utility.Close(stmt)

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

	err = nil

	err = Db.Select(&t, "SELECT a.*, b.company, b.title, b.message, b.domain FROM account a, organization b WHERE a.userid=? AND a.orgid=b.refid AND b.active=1 ORDER BY b.title", userID)

	if err != sql.ErrNoRows && err != nil {
		log.Error(fmt.Sprintf("Unable to execute select account for user %s", userID), err)
	}

	return
}

// GetAccountsByOrg returns a slice of database account records, for all users in the client's organization.
func (p *Persister) GetAccountsByOrg() (t []entity.Account, err error) {

	err = nil

	err = Db.Select(&t, "SELECT a.*, b.company, b.title, b.message, b.domain FROM account a, organization b WHERE a.orgid=b.refid AND a.orgid=? AND b.active=1", p.Context.OrgID)

	if err != sql.ErrNoRows && err != nil {
		log.Error(fmt.Sprintf("Unable to execute select account for org %s", p.Context.OrgID), err)
	}

	return
}

// UpdateAccount updates the database record for the given account to the given values.
func (p *Persister) UpdateAccount(account entity.Account) (err error) {

	err = nil

	account.Revised = time.Now().UTC()

	stmt, err := p.Context.Transaction.PrepareNamed("UPDATE account SET userid=:userid, admin=:admin, editor=:editor, revised=:revised WHERE orgid=:orgid AND refid=:refid")
	defer utility.Close(stmt)

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
