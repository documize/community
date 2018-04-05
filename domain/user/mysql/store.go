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
	"strconv"
	"strings"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/model/user"
	"github.com/jmoiron/sqlx"
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

	_, err = ctx.Transaction.Exec("INSERT INTO user (refid, firstname, lastname, email, initials, password, salt, reset, lastversion, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		u.RefID, u.Firstname, u.Lastname, strings.ToLower(u.Email), u.Initials, u.Password, u.Salt, "", u.LastVersion, u.Created, u.Revised)

	if err != nil {
		err = errors.Wrap(err, "execute user insert")
	}

	return
}

// Get returns the user record for the given id.
func (s Scope) Get(ctx domain.RequestContext, id string) (u user.User, err error) {
	err = s.Runtime.Db.Get(&u, "SELECT id, refid, firstname, lastname, email, initials, global, password, salt, reset, lastversion, created, revised FROM user WHERE refid=?", id)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select for user %s", id))
	}

	return
}

// GetByDomain matches user by email and domain.
func (s Scope) GetByDomain(ctx domain.RequestContext, domain, email string) (u user.User, err error) {
	email = strings.TrimSpace(strings.ToLower(email))

	err = s.Runtime.Db.Get(&u, "SELECT u.id, u.refid, u.firstname, u.lastname, u.email, u.initials, u.global, u.password, u.salt, u.reset, u.lastversion,  u.created, u.revised FROM user u, account a, organization o WHERE TRIM(LOWER(u.email))=? AND u.refid=a.userid AND a.orgid=o.refid AND TRIM(LOWER(o.domain))=?",
		email, domain)

	if err != nil && err != sql.ErrNoRows {
		err = errors.Wrap(err, fmt.Sprintf("Unable to execute GetUserByDomain %s %s", domain, email))
	}

	return
}

// GetByEmail returns a single row match on email.
func (s Scope) GetByEmail(ctx domain.RequestContext, email string) (u user.User, err error) {
	email = strings.TrimSpace(strings.ToLower(email))

	err = s.Runtime.Db.Get(&u, "SELECT id, refid, firstname, lastname, email, initials, global, password, salt, reset, lastversion, created, revised FROM user WHERE TRIM(LOWER(email))=?", email)

	if err != nil && err != sql.ErrNoRows {
		err = errors.Wrap(err, fmt.Sprintf("execute select user by email %s", email))
	}

	return
}

// GetByToken returns a user record given a reset token value.
func (s Scope) GetByToken(ctx domain.RequestContext, token string) (u user.User, err error) {
	err = s.Runtime.Db.Get(&u, "SELECT id, refid, firstname, lastname, email, initials, global, password, salt, reset, lastversion, created, revised FROM user WHERE reset=?", token)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute user select by token %s", token))
	}

	return
}

// GetBySerial is used to retrieve a user via their temporary password salt value!
// This occurs when we you share a folder with a new user and they have to complete
// the onboarding process.
func (s Scope) GetBySerial(ctx domain.RequestContext, serial string) (u user.User, err error) {
	err = s.Runtime.Db.Get(&u, "SELECT id, refid, firstname, lastname, email, initials, global, password, salt, reset, lastversion, created, revised FROM user WHERE salt=?", serial)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute user select by serial %s", serial))
	}

	return
}

// GetActiveUsersForOrganization returns a slice containing of active user records for the organization
// identified in the Persister.
func (s Scope) GetActiveUsersForOrganization(ctx domain.RequestContext) (u []user.User, err error) {
	u = []user.User{}

	err = s.Runtime.Db.Select(&u,
		`SELECT u.id, u.refid, u.firstname, u.lastname, u.email, u.initials, u.password, u.salt, u.reset, u.lastversion, u.created, u.revised,
		u.global, a.active, a.editor, a.admin, a.users as viewusers
		FROM user u, account a
		WHERE u.refid=a.userid AND a.orgid=? AND a.active=1
		ORDER BY u.firstname,u.lastname`,
		ctx.OrgID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("get active users by org %s", ctx.OrgID))
	}

	return
}

// GetUsersForOrganization returns a slice containing all of the user records for the organizaiton
// identified in the Persister.
func (s Scope) GetUsersForOrganization(ctx domain.RequestContext, filter string) (u []user.User, err error) {
	u = []user.User{}

	filter = strings.TrimSpace(strings.ToLower(filter))
	likeQuery := ""
	if len(filter) > 0 {
		likeQuery = " AND (LOWER(u.firstname) LIKE '%" + filter + "%' OR LOWER(u.lastname) LIKE '%" + filter + "%' OR LOWER(u.email) LIKE '%" + filter + "%') "
	}

	err = s.Runtime.Db.Select(&u,
		`SELECT u.id, u.refid, u.firstname, u.lastname, u.email, u.initials, u.password, u.salt, u.reset, u.lastversion, u.created, u.revised,
		u.global, a.active, a.editor, a.admin, a.users as viewusers
		FROM user u, account a
		WHERE u.refid=a.userid AND a.orgid=? `+likeQuery+
			`ORDER BY u.firstname, u.lastname LIMIT 100`, ctx.OrgID)

	if err == sql.ErrNoRows {
		err = nil
	}

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf(" get users for org %s", ctx.OrgID))
	}

	return
}

// GetSpaceUsers returns a slice containing all user records for given space.
func (s Scope) GetSpaceUsers(ctx domain.RequestContext, spaceID string) (u []user.User, err error) {
	u = []user.User{}

	err = s.Runtime.Db.Select(&u, `
		SELECT u.id, u.refid, u.firstname, u.lastname, u.email, u.initials, u.password, u.salt, u.reset, u.created, u.lastversion, u.revised, u.global,
		a.active, a.users AS viewusers, a.editor, a.admin
		FROM user u, account a
		WHERE a.orgid=? AND u.refid = a.userid AND a.active=1 AND u.refid IN (
			SELECT whoid from permission WHERE orgid=? AND who='user' AND scope='object' AND location='space' AND refid=? UNION ALL
			SELECT r.userid from rolemember r LEFT JOIN permission p ON p.whoid=r.roleid WHERE p.orgid=? AND p.who='role' AND p.scope='object' AND p.location='space' AND p.refid=?
		)
		ORDER BY u.firstname, u.lastname
		`, ctx.OrgID, ctx.OrgID, spaceID, ctx.OrgID, spaceID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("get space users for org %s", ctx.OrgID))
	}

	return
}

// GetUsersForSpaces returns users with access to specified spaces.
func (s Scope) GetUsersForSpaces(ctx domain.RequestContext, spaces []string) (u []user.User, err error) {
	u = []user.User{}

	if len(spaces) == 0 {
		return
	}

	query, args, err := sqlx.In(`
		SELECT u.id, u.refid, u.firstname, u.lastname, u.email, u.initials, u.password, u.salt, u.reset, u.lastversion, u.created, u.revised, u.global,
		a.active, a.users AS viewusers, a.editor, a.admin
		FROM user u, account a
		WHERE a.orgid=? AND u.refid = a.userid AND a.active=1 AND u.refid IN (
			SELECT whoid from permission WHERE orgid=? AND who='user' AND scope='object' AND location='space' AND refid IN(?) UNION ALL
			SELECT r.userid from rolemember r LEFT JOIN permission p ON p.whoid=r.roleid WHERE p.orgid=? AND p.who='role' AND p.scope='object' AND p.location='space' AND p.refid IN(?)
		)
		ORDER BY u.firstname, u.lastname
		`, ctx.OrgID, ctx.OrgID, spaces, ctx.OrgID, spaces)

	query = s.Runtime.Db.Rebind(query)
	err = s.Runtime.Db.Select(&u, query, args...)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("get users for spaces for user %s", ctx.UserID))
	}

	return
}

// UpdateUser updates the user table using the given replacement user record.
func (s Scope) UpdateUser(ctx domain.RequestContext, u user.User) (err error) {
	u.Revised = time.Now().UTC()
	u.Email = strings.ToLower(u.Email)

	_, err = ctx.Transaction.NamedExec(
		"UPDATE user SET firstname=:firstname, lastname=:lastname, email=:email, revised=:revised, initials=:initials, lastversion=:lastversion WHERE refid=:refid", &u)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute user update %s", u.RefID))
	}

	return
}

// UpdateUserPassword updates a user record with new password and salt values.
func (s Scope) UpdateUserPassword(ctx domain.RequestContext, userID, salt, password string) (err error) {
	_, err = ctx.Transaction.Exec("UPDATE user SET salt=?, password=?, reset='' WHERE refid=?",
		salt, password, userID)

	if err != nil {
		err = errors.Wrap(err, "execute user update")
	}

	return
}

// DeactiveUser deletes the account record for the given userID and persister.Context.OrgID.
func (s Scope) DeactiveUser(ctx domain.RequestContext, userID string) (err error) {
	_, err = ctx.Transaction.Exec("DELETE FROM account WHERE userid=? and orgid=?", userID, ctx.OrgID)

	if err != nil {
		err = errors.Wrap(err, "execute user deactivation")
	}

	return
}

// ForgotUserPassword sets the password to '' and the reset field to token, for a user identified by email.
func (s Scope) ForgotUserPassword(ctx domain.RequestContext, email, token string) (err error) {
	_, err = ctx.Transaction.Exec("UPDATE user SET reset=?, password='' WHERE LOWER(email)=?", token, strings.ToLower(email))

	if err != nil {
		err = errors.Wrap(err, "execute password reset")
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

// MatchUsers returns users that have match to either firstname, lastname or email.
func (s Scope) MatchUsers(ctx domain.RequestContext, text string, maxMatches int) (u []user.User, err error) {
	u = []user.User{}

	text = strings.TrimSpace(strings.ToLower(text))
	likeQuery := ""
	if len(text) > 0 {
		likeQuery = " AND (LOWER(firstname) LIKE '%" + text + "%' OR LOWER(lastname) LIKE '%" + text + "%' OR LOWER(email) LIKE '%" + text + "%') "
	}

	err = s.Runtime.Db.Select(&u,
		`SELECT u.id, u.refid, u.firstname, u.lastname, u.email, u.initials, u.password, u.salt, u.reset, u.lastversion, u.created, u.revised,
		u.global, a.active, a.editor, a.admin, a.users as viewusers
		FROM user u, account a
		WHERE a.orgid=? AND u.refid=a.userid AND a.active=1 `+likeQuery+
			`ORDER BY u.firstname,u.lastname LIMIT `+strconv.Itoa(maxMatches),
		ctx.OrgID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("matching users for org %s", ctx.OrgID))
	}

	return
}
