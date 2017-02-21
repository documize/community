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
	"fmt"
	"strings"
	"time"

	"database/sql"

	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/utility"
)

// AddUser adds the given user record to the user table.
func (p *Persister) AddUser(user entity.User) (err error) {
	user.Created = time.Now().UTC()
	user.Revised = time.Now().UTC()

	stmt, err := p.Context.Transaction.Preparex("INSERT INTO user (refid, firstname, lastname, email, initials, password, salt, reset, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer utility.Close(stmt)

	if err != nil {
		log.Error("Unable to prepare insert for user", err)
		return
	}

	res, err := stmt.Exec(user.RefID, user.Firstname, user.Lastname, strings.ToLower(user.Email), user.Initials, user.Password, user.Salt, "", user.Created, user.Revised)
	if err != nil {
		log.Error("Unable insert for user", err)
		return
	}

	if num, e := res.RowsAffected(); e == nil && num != 1 {
		er := fmt.Errorf("expected to insert 1 record, but inserted %d", num)
		log.Error("AddUser", er)
		return er
	}

	return
}

// GetUser returns the user record for the given id.
func (p *Persister) GetUser(id string) (user entity.User, err error) {
	stmt, err := Db.Preparex("SELECT id, refid, firstname, lastname, email, initials, global, password, salt, reset, created, revised FROM user WHERE refid=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare select for user %s", id), err)
		return
	}

	err = stmt.Get(&user, id)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select for user %s", id), err)
		return
	}

	return
}

// GetUserByEmail returns a single row match on email.
func (p *Persister) GetUserByEmail(email string) (user entity.User, err error) {
	email = strings.TrimSpace(strings.ToLower(email))

	stmt, err := Db.Preparex("SELECT id, refid, firstname, lastname, email, initials, global, password, salt, reset, created, revised FROM user WHERE TRIM(LOWER(email))=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare select for user by email %s", email), err)
		return
	}

	err = stmt.Get(&user, email)

	if err != nil && err != sql.ErrNoRows {
		log.Error(fmt.Sprintf("Unable to execute select for user by email %s", email), err)
		return
	}

	return
}

// GetUserByDomain matches user by email and domain.
func (p *Persister) GetUserByDomain(domain, email string) (user entity.User, err error) {
	email = strings.TrimSpace(strings.ToLower(email))

	stmt, err := Db.Preparex("SELECT u.id, u.refid, u.firstname, u.lastname, u.email, u.initials, u.global, u.password, u.salt, u.reset, u.created, u.revised FROM user u, account a, organization o WHERE TRIM(LOWER(u.email))=? AND u.refid=a.userid AND a.orgid=o.refid AND TRIM(LOWER(o.domain))=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare GetUserByDomain %s %s", domain, email), err)
		return
	}

	err = stmt.Get(&user, email, domain)

	if err != nil && err != sql.ErrNoRows {
		log.Error(fmt.Sprintf("Unable to execute GetUserByDomain %s %s", domain, email), err)
		return
	}

	return
}

// GetUserByToken returns a user record given a reset token value.
func (p *Persister) GetUserByToken(token string) (user entity.User, err error) {
	stmt, err := Db.Preparex("SELECT  id, refid, firstname, lastname, email, initials, global, password, salt, reset, created, revised FROM user WHERE reset=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare select for user by token %s", token), err)
		return
	}

	err = stmt.Get(&user, token)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select for user by token %s", token), err)
		return
	}

	return
}

// GetUserBySerial is used to retrieve a user via their temporary password salt value!
// This occurs when we you share a folder with a new user and they have to complete
// the onboarding process.
func (p *Persister) GetUserBySerial(serial string) (user entity.User, err error) {
	stmt, err := Db.Preparex("SELECT id, refid, firstname, lastname, email, initials, global, password, salt, reset, created, revised FROM user WHERE salt=?")
	defer utility.Close(stmt)

	if err != nil {
		return
	}

	err = stmt.Get(&user, serial)

	if err != nil {
		return
	}

	return
}

// GetUsersForOrganization returns a slice containing all of the user records for the organizaiton
// identified in the Persister.
func (p *Persister) GetUsersForOrganization() (users []entity.User, err error) {
	err = Db.Select(&users,
		"SELECT id, refid, firstname, lastname, email, initials, password, salt, reset, created, revised FROM user WHERE refid IN (SELECT userid FROM account where orgid = ?) ORDER BY firstname,lastname", p.Context.OrgID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to get all users for org %s", p.Context.OrgID), err)
		return
	}

	return
}

// GetFolderUsers returns a slice containing all user records for given folder.
func (p *Persister) GetFolderUsers(folderID string) (users []entity.User, err error) {
	err = Db.Select(&users,
		"SELECT id, refid, firstname, lastname, email, initials, password, salt, reset, created, revised FROM user WHERE refid IN (SELECT userid from labelrole WHERE orgid=? AND labelid=?) ORDER BY firstname,lastname", p.Context.OrgID, folderID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to get all users for org %s", p.Context.OrgID), err)
		return
	}

	return
}

// UpdateUser updates the user table using the given replacement user record.
func (p *Persister) UpdateUser(user entity.User) (err error) {
	user.Revised = time.Now().UTC()
	user.Email = strings.ToLower(user.Email)

	stmt, err := p.Context.Transaction.PrepareNamed(
		"UPDATE user SET firstname=:firstname, lastname=:lastname, email=:email, revised=:revised, initials=:initials WHERE refid=:refid")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update for user %s", user.RefID), err)
		return
	}

	_, err = stmt.Exec(&user)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update for user %s", user.RefID), err)
		return
	}

	return
}

// UpdateUserPassword updates a user record with new password and salt values.
func (p *Persister) UpdateUserPassword(userID, salt, password string) (err error) {
	stmt, err := p.Context.Transaction.Preparex("UPDATE user SET salt=?, password=?, reset='' WHERE refid=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error("Unable to prepare update for user", err)
		return
	}

	res, err := stmt.Exec(salt, password, userID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to update password for user %s", userID), err)
		return
	}

	if num, e := res.RowsAffected(); e == nil && num != 1 {
		er := fmt.Errorf("expected to update 1 record, but updated %d", num)
		log.Error("UpdateUserPassword", er)
		return er
	}

	return
}

// DeactiveUser deletes the account record for the given userID and persister.Context.OrgID.
func (p *Persister) DeactiveUser(userID string) (err error) {
	stmt, err := p.Context.Transaction.Preparex("DELETE FROM account WHERE userid=? and orgid=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error("Unable to prepare update for user", err)
		return
	}

	_ /* deleting 0 records is OK */, err = stmt.Exec(userID, p.Context.OrgID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to deactivate user %s", userID), err)
		return
	}

	return
}

// ForgotUserPassword sets the password to '' and the reset field to token, for a user identified by email.
func (p *Persister) ForgotUserPassword(email, token string) (err error) {
	stmt, err := p.Context.Transaction.Preparex("UPDATE user SET reset=?, password='' WHERE LOWER(email)=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error("Unable to prepare update for reset password", err)
		return
	}

	result, err := stmt.Exec(token, strings.ToLower(email))

	if err != nil {
		log.Error(fmt.Sprintf("Unable to update password for reset password %s", email), err)
		return
	}

	rows, err := result.RowsAffected()
	log.IfErr(err)

	if rows == 0 {
		err = sql.ErrNoRows
		return
	}

	return
}
