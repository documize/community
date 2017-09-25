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
	"strings"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/model/user"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// Add adds the given user record to the user table.
func (s Scope) Add(ctx domain.RequestContext, u user.User) (err error) {
	u.Created = time.Now().UTC()
	u.Revised = time.Now().UTC()

	stmt, err := ctx.Transaction.Preparex("INSERT INTO user (refid, firstname, lastname, email, initials, password, salt, reset, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare user insert")
		return
	}

	_, err = stmt.Exec(u.RefID, u.Firstname, u.Lastname, strings.ToLower(u.Email), u.Initials, u.Password, u.Salt, "", u.Created, u.Revised)
	if err != nil {
		err = errors.Wrap(err, "execute user insert")
		return
	}

	return
}

// Get returns the user record for the given id.
func (s Scope) Get(ctx domain.RequestContext, id string) (u user.User, err error) {
	stmt, err := s.Runtime.Db.Preparex("SELECT id, refid, firstname, lastname, email, initials, global, password, salt, reset, created, revised FROM user WHERE refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to prepare select for user %s", id))
		return
	}

	err = stmt.Get(&u, id)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select for user %s", id))
		return
	}

	return
}

// GetByDomain matches user by email and domain.
func (s Scope) GetByDomain(ctx domain.RequestContext, domain, email string) (u user.User, err error) {
	email = strings.TrimSpace(strings.ToLower(email))

	stmt, err := s.Runtime.Db.Preparex("SELECT u.id, u.refid, u.firstname, u.lastname, u.email, u.initials, u.global, u.password, u.salt, u.reset, u.created, u.revised FROM user u, account a, organization o WHERE TRIM(LOWER(u.email))=? AND u.refid=a.userid AND a.orgid=o.refid AND TRIM(LOWER(o.domain))=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("Unable to prepare GetUserByDomain %s %s", domain, email))
		return
	}

	err = stmt.Get(&u, email, domain)
	if err != nil && err != sql.ErrNoRows {
		err = errors.Wrap(err, fmt.Sprintf("Unable to execute GetUserByDomain %s %s", domain, email))
		return
	}

	return
}

// GetByEmail returns a single row match on email.
func (s Scope) GetByEmail(ctx domain.RequestContext, email string) (u user.User, err error) {
	email = strings.TrimSpace(strings.ToLower(email))

	stmt, err := s.Runtime.Db.Preparex("SELECT id, refid, firstname, lastname, email, initials, global, password, salt, reset, created, revised FROM user WHERE TRIM(LOWER(email))=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("prepare select user by email %s", email))
		return
	}

	err = stmt.Get(&u, email)
	if err != nil && err != sql.ErrNoRows {
		err = errors.Wrap(err, fmt.Sprintf("execute select user by email %s", email))
		return
	}

	return
}

// GetByToken returns a user record given a reset token value.
func (s Scope) GetByToken(ctx domain.RequestContext, token string) (u user.User, err error) {
	stmt, err := s.Runtime.Db.Preparex("SELECT  id, refid, firstname, lastname, email, initials, global, password, salt, reset, created, revised FROM user WHERE reset=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("prepare user select by token %s", token))
		return
	}

	err = stmt.Get(&u, token)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute user select by token %s", token))
		return
	}

	return
}

// GetBySerial is used to retrieve a user via their temporary password salt value!
// This occurs when we you share a folder with a new user and they have to complete
// the onboarding process.
func (s Scope) GetBySerial(ctx domain.RequestContext, serial string) (u user.User, err error) {
	stmt, err := s.Runtime.Db.Preparex("SELECT id, refid, firstname, lastname, email, initials, global, password, salt, reset, created, revised FROM user WHERE salt=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("prepare user select by serial %s", serial))
		return
	}

	err = stmt.Get(&u, serial)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute user select by serial %s", serial))
		return
	}

	return
}

// GetActiveUsersForOrganization returns a slice containing of active user records for the organization
// identified in the Persister.
func (s Scope) GetActiveUsersForOrganization(ctx domain.RequestContext) (u []user.User, err error) {
	err = s.Runtime.Db.Select(&u,
		`SELECT u.id, u.refid, u.firstname, u.lastname, u.email, u.initials, u.password, u.salt, u.reset, u.created, u.revised
		FROM user u
		WHERE u.refid IN (SELECT userid FROM account WHERE orgid = ? AND active=1) ORDER BY u.firstname,u.lastname`,
		ctx.OrgID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("get active users by org %s", ctx.OrgID))
		return
	}

	return
}

// GetUsersForOrganization returns a slice containing all of the user records for the organizaiton
// identified in the Persister.
func (s Scope) GetUsersForOrganization(ctx domain.RequestContext) (u []user.User, err error) {
	err = s.Runtime.Db.Select(&u,
		`SELECT id, refid, firstname, lastname, email, initials, password, salt, reset, created, revised 
		FROM user WHERE refid IN (SELECT userid FROM account where orgid = ?)
		ORDER BY firstname,lastname`, ctx.OrgID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf(" get users for org %s", ctx.OrgID))
		return
	}

	return
}

// GetSpaceUsers returns a slice containing all user records for given folder.
func (s Scope) GetSpaceUsers(ctx domain.RequestContext, spaceID string) (u []user.User, err error) {
	err = s.Runtime.Db.Select(&u, `
		SELECT u.id, u.refid, u.firstname, u.lastname, u.email, u.initials, u.password, u.salt, u.reset, u.created, u.revised, u.global,
		a.active, a.users AS viewusers, a.editor, a.admin
		FROM user u, account a
		WHERE a.orgid=? AND u.refid = a.userid AND a.active=1 AND u.refid IN (
			SELECT whoid from permission WHERE orgid=? AND who='user' AND scope='object' AND location='space' AND refid=? UNION ALL
			SELECT r.userid from rolemember r LEFT JOIN permission p ON p.whoid=r.roleid WHERE p.orgid=? AND p.who='role' AND p.scope='object' AND p.location='space' AND p.refid=?
		)
		ORDER BY u.firstname, u.lastname;
		`, ctx.OrgID, ctx.OrgID, spaceID, ctx.OrgID, spaceID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("get space users for org %s", ctx.OrgID))
		return
	}

	return
}

// GetVisibleUsers returns all users that can be "seen" by a user.
// "Seen" means users who share at least one space in common.
// Explicit access must be provided to a user in order to associate them
// as having access to a space. Simply marking a space as vieewable by "everyone" is not enough.
func (s Scope) GetVisibleUsers(ctx domain.RequestContext) (u []user.User, err error) {
	err = s.Runtime.Db.Select(&u,
		`SELECT id, refid, firstname, lastname, email, initials, password, salt, reset, created, revised
		FROM user 
		WHERE 
			refid IN (SELECT userid FROM account WHERE orgid = ?)
			AND refid IN 
				(SELECT userid FROM labelrole where userid != '' AND orgid=?
					AND labelid IN (
						SELECT refid FROM label WHERE orgid=? AND type=2 AND userid=?
						UNION ALL
						SELECT refid FROM label a WHERE orgid=? AND type=1 AND refid IN (SELECT labelid FROM labelrole WHERE orgid=? AND userid='' AND (canedit=1 OR canview=1))
						UNION ALL
						SELECT refid FROM label a WHERE orgid=? AND type=3 AND refid IN (SELECT labelid FROM labelrole WHERE orgid=? AND userid=? AND (canedit=1 OR canview=1))
					)
				GROUP BY userid)
		ORDER BY firstname, lastname`,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.UserID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.UserID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("get visible users for org %s user %s", ctx.OrgID, ctx.UserID))
		return
	}

	return
}

// UpdateUser updates the user table using the given replacement user record.
func (s Scope) UpdateUser(ctx domain.RequestContext, u user.User) (err error) {
	u.Revised = time.Now().UTC()
	u.Email = strings.ToLower(u.Email)

	stmt, err := ctx.Transaction.PrepareNamed(
		"UPDATE user SET firstname=:firstname, lastname=:lastname, email=:email, revised=:revised, initials=:initials WHERE refid=:refid")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("prepare user update %s", u.RefID))
		return
	}

	_, err = stmt.Exec(&u)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute user update %s", u.RefID))
		return
	}

	return
}

// UpdateUserPassword updates a user record with new password and salt values.
func (s Scope) UpdateUserPassword(ctx domain.RequestContext, userID, salt, password string) (err error) {
	stmt, err := ctx.Transaction.Preparex("UPDATE user SET salt=?, password=?, reset='' WHERE refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare user update")
		return
	}

	_, err = stmt.Exec(salt, password, userID)
	if err != nil {
		err = errors.Wrap(err, "execute user update")
		return
	}

	return
}

// DeactiveUser deletes the account record for the given userID and persister.Context.OrgID.
func (s Scope) DeactiveUser(ctx domain.RequestContext, userID string) (err error) {
	stmt, err := ctx.Transaction.Preparex("DELETE FROM account WHERE userid=? and orgid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare user deactivation")
		return
	}

	_, err = stmt.Exec(userID, ctx.OrgID)

	if err != nil {
		err = errors.Wrap(err, "execute user deactivation")
		return
	}

	return
}

// ForgotUserPassword sets the password to '' and the reset field to token, for a user identified by email.
func (s Scope) ForgotUserPassword(ctx domain.RequestContext, email, token string) (err error) {
	stmt, err := ctx.Transaction.Preparex("UPDATE user SET reset=?, password='' WHERE LOWER(email)=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare password reset")
		return
	}

	_, err = stmt.Exec(token, strings.ToLower(email))
	if err != nil {
		err = errors.Wrap(err, "execute password reset")
		return
	}

	return
}

// CountActiveUsers returns the number of active users in the system.
func (s Scope) CountActiveUsers() (c int) {
	row := s.Runtime.Db.QueryRow("SELECT count(*) FROM user u WHERE u.refid IN (SELECT userid FROM account WHERE active=1)")

	err := row.Scan(&c)

	if err == sql.ErrNoRows {
		return 0
	}

	if err != nil && err != sql.ErrNoRows {
		s.Runtime.Log.Error("CountActiveUsers", err)
		return 0
	}

	return
}
