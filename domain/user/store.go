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
	"database/sql"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/user"
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
)

// Store provides data access to space information.
type Store struct {
	store.Context
	store.UserStorer
}

// Add adds the given user record to the user table.
func (s Store) Add(ctx domain.RequestContext, u user.User) (err error) {
	u.Created = time.Now().UTC()
	u.Revised = time.Now().UTC()

	_, err = ctx.Transaction.Exec(s.Bind("INSERT INTO dmz_user (c_refid, c_firstname, c_lastname, c_email, c_initials, c_password, c_salt, c_reset, c_lastversion, c_locale, c_created, c_revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"),
		u.RefID, u.Firstname, u.Lastname, strings.TrimSpace(strings.ToLower(u.Email)), u.Initials, u.Password, u.Salt, "", u.LastVersion, u.Locale, u.Created, u.Revised)

	if err != nil {
		err = errors.Wrap(err, "execute user insert")
	}

	return
}

// Get returns the user record for the given id.
func (s Store) Get(ctx domain.RequestContext, id string) (u user.User, err error) {
	err = s.Runtime.Db.Get(&u, s.Bind(`
        SELECT id, c_refid AS refid, c_firstname AS firstname, c_lastname AS lastname, c_email AS email,
        c_initials AS initials, c_globaladmin AS globaladmin, c_password AS password, c_salt AS salt, c_reset AS reset,
        c_lastversion AS lastversion, c_locale as locale, c_created AS created, c_revised AS revised
        FROM dmz_user
        WHERE c_refid=?`),
		id)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select for user %s", id))
	}

	return
}

// GetByDomain matches user by email and domain.
func (s Store) GetByDomain(ctx domain.RequestContext, domain, email string) (u user.User, err error) {
	email = strings.TrimSpace(strings.ToLower(email))

	err = s.Runtime.Db.Get(&u, s.Bind(`SELECT u.id, u.c_refid AS refid,
        u.c_firstname AS firstname, u.c_lastname AS lastname, u.c_email AS email,
        u.c_initials AS initials, u.c_globaladmin AS globaladmin,
        u.c_password AS password, u.c_salt AS salt, u.c_reset AS reset, u.c_lastversion AS lastversion, u.c_locale as locale,
        u.c_created AS created, u.c_revised AS revised
        FROM dmz_user u, dmz_user_account a, dmz_org o
        WHERE LOWER(u.c_email)=? AND u.c_refid=a.c_userid AND a.c_orgid=o.c_refid AND LOWER(o.c_domain)=?`),
		email, domain)

	if err != nil && err != sql.ErrNoRows {
		err = errors.Wrap(err, fmt.Sprintf("Unable to execute GetUserByDomain %s %s", domain, email))
	}

	return
}

// GetByEmail returns a single row match on email.
func (s Store) GetByEmail(ctx domain.RequestContext, email string) (u user.User, err error) {
	email = strings.TrimSpace(strings.ToLower(email))

	err = s.Runtime.Db.Get(&u, s.Bind(`SELECT u.id, u.c_refid AS refid,
        u.c_firstname AS firstname, u.c_lastname AS lastname, u.c_email AS email,
        u.c_initials AS initials, u.c_globaladmin AS globaladmin,
        u.c_password AS password, u.c_salt AS salt, u.c_reset AS reset, u.c_lastversion AS lastversion, u.c_locale as locale,
        u.c_created AS created, u.c_revised AS revised
        FROM dmz_user u
        WHERE LOWER(u.c_email)=?`),
		email)

	if err != nil && err != sql.ErrNoRows {
		err = errors.Wrap(err, fmt.Sprintf("execute select user by email %s", email))
	}

	return
}

// GetByToken returns a user record given a reset token value.
func (s Store) GetByToken(ctx domain.RequestContext, token string) (u user.User, err error) {
	err = s.Runtime.Db.Get(&u, s.Bind(`SELECT u.id, u.c_refid AS refid,
        u.c_firstname AS firstname, u.c_lastname AS lastname, u.c_email AS email,
        u.c_initials AS initials, u.c_globaladmin AS globaladmin,
        u.c_password AS password, u.c_salt AS salt, u.c_reset AS reset, u.c_lastversion AS lastversion, u.c_locale as locale,
        u.c_created AS created, u.c_revised AS revised
        FROM dmz_user u
        WHERE u.c_reset=?`),
		token)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute user select by token %s", token))
	}

	return
}

// GetBySerial is used to retrieve a user via their temporary password salt value!
// This occurs when we you share a folder with a new user and they have to complete
// the onboarding process.
func (s Store) GetBySerial(ctx domain.RequestContext, serial string) (u user.User, err error) {
	err = s.Runtime.Db.Get(&u, s.Bind(`SELECT u.id, u.c_refid AS refid,
        u.c_firstname AS firstname, u.c_lastname AS lastname, u.c_email AS email,
        u.c_initials AS initials, u.c_globaladmin AS globaladmin,
        u.c_password AS password, u.c_salt AS salt, u.c_reset AS reset, u.c_lastversion AS lastversion, u.c_locale as locale,
        u.c_created AS created, u.c_revised AS revised
        FROM dmz_user u
        WHERE u.c_salt=?`),
		serial)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute user select by serial %s", serial))
	}

	return
}

// GetActiveUsersForOrganization returns a slice containing of active user records for the organization
// identified in the Persister.
func (s Store) GetActiveUsersForOrganization(ctx domain.RequestContext) (u []user.User, err error) {
	u = []user.User{}

	err = s.Runtime.Db.Select(&u, s.Bind(`SELECT u.id, u.c_refid AS refid,
        u.c_firstname AS firstname, u.c_lastname AS lastname, u.c_email AS email,
        u.c_initials AS initials, u.c_globaladmin AS globaladmin,
        u.c_password AS password, u.c_salt AS salt, u.c_reset AS reset, u.c_lastversion AS lastversion, u.c_locale as locale,
        u.c_created AS created, u.c_revised AS revised,
        a.c_active AS active, a.c_editor AS editor, a.c_admin AS admin, a.c_users AS viewusers, a.c_analytics AS analytics
		FROM dmz_user u, dmz_user_account a
		WHERE u.c_refid=a.c_userid AND a.c_orgid=? AND a.c_active=`+s.IsTrue()+`
		ORDER BY u.c_firstname, u.c_lastname`),
		ctx.OrgID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("get active users by org %s", ctx.OrgID))
	}

	return
}

// GetSpaceUsers returns a slice containing all user records for given space.
func (s Store) GetSpaceUsers(ctx domain.RequestContext, spaceID string) (u []user.User, err error) {
	u = []user.User{}

	err = s.Runtime.Db.Select(&u, s.Bind(`SELECT u.id, u.c_refid AS refid,
        u.c_firstname AS firstname, u.c_lastname AS lastname, u.c_email AS email,
        u.c_initials AS initials, u.c_globaladmin AS globaladmin,
        u.c_password AS password, u.c_salt AS salt, u.c_reset AS reset, u.c_lastversion AS lastversion, u.c_locale as locale,
        u.c_created AS created, u.c_revised AS revised,
        a.c_active AS active, a.c_editor AS editor, a.c_admin AS admin, a.c_users AS viewusers, a.c_analytics AS analytics
        FROM dmz_user u, dmz_user_account a
		WHERE a.c_orgid=? AND u.c_refid = a.c_userid AND a.c_active=`+s.IsTrue()+` AND u.c_refid IN (
            SELECT c_whoid from dmz_permission WHERE c_orgid=? AND c_who='user' AND c_scope='object' AND c_location='space' AND c_refid=?
            UNION ALL
			SELECT r.c_userid from dmz_group_member r LEFT JOIN dmz_permission p ON p.c_whoid=r.c_groupid WHERE p.c_orgid=? AND p.c_who='role' AND p.c_scope='object' AND p.c_location='space' AND p.c_refid=?
		)
        ORDER BY u.c_firstname, u.c_lastname`),
		ctx.OrgID, ctx.OrgID, spaceID, ctx.OrgID, spaceID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("get space users for org %s", ctx.OrgID))
	}

	return
}

// GetUsersForSpaces returns users with access to specified spaces.
func (s Store) GetUsersForSpaces(ctx domain.RequestContext, spaces []string) (u []user.User, err error) {
	u = []user.User{}

	if len(spaces) == 0 {
		return
	}

	query, args, err := sqlx.In(`
        SELECT u.id, u.c_refid AS refid,
        u.c_firstname AS firstname, u.c_lastname AS lastname, u.c_email AS email,
        u.c_initials AS initials, u.c_globaladmin AS globaladmin,
        u.c_password AS password, u.c_salt AS salt, u.c_reset AS reset, u.c_lastversion AS lastversion, u.c_locale as locale,
        u.c_created AS created, u.c_revised AS revised,
        a.c_active AS active, a.c_editor AS editor, a.c_admin AS admin, a.c_users AS viewusers, a.c_analytics AS analytics
        FROM dmz_user u, dmz_user_account a
        WHERE a.c_orgid=? AND u.c_refid = a.c_userid AND a.c_active=`+s.IsTrue()+` AND u.c_refid IN (
            SELECT c_whoid from dmz_permission WHERE c_orgid=? AND c_who='user' AND c_scope='object' AND c_location='space' AND c_refid IN(?)
            UNION ALL
			SELECT r.c_userid from dmz_group_member r LEFT JOIN dmz_permission p ON p.c_whoid=r.c_groupid WHERE p.c_orgid=? AND p.c_who='role' AND p.c_scope='object' AND p.c_location='space' AND p.c_refid IN(?)
		)
        ORDER BY u.c_firstname, u.c_lastname`,
		ctx.OrgID, ctx.OrgID, spaces, ctx.OrgID, spaces)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("GetUsersForSpaces IN query failed %s", ctx.UserID))
		return
	}

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
func (s Store) UpdateUser(ctx domain.RequestContext, u user.User) (err error) {
	u.Revised = time.Now().UTC()
	u.Email = strings.ToLower(u.Email)

	_, err = ctx.Transaction.NamedExec("UPDATE dmz_user SET c_firstname=:firstname, c_lastname=:lastname, c_email=:email, c_revised=:revised, c_initials=:initials, c_lastversion=:lastversion, c_locale=:locale WHERE c_refid=:refid", &u)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute user update %s", u.RefID))
	}

	return
}

// UpdateUserPassword updates a user record with new password and salt values.
func (s Store) UpdateUserPassword(ctx domain.RequestContext, userID, salt, password string) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind("UPDATE dmz_user SET c_salt=?, c_password=?, c_reset='' WHERE c_refid=?"),
		salt, password, userID)
	if err != nil {
		err = errors.Wrap(err, "execute user update")
	}

	return
}

// DeactiveUser deletes the account record for the given userID and persister.Context.OrgID.
func (s Store) DeactiveUser(ctx domain.RequestContext, userID string) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_user_account WHERE c_userid=? and c_orgid=?"),
		userID, ctx.OrgID)
	if err != nil {
		err = errors.Wrap(err, "execute user deactivation")
	}

	return
}

// ForgotUserPassword sets the password to '' and the reset field to token, for a user identified by email.
func (s Store) ForgotUserPassword(ctx domain.RequestContext, email, token string) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind("UPDATE dmz_user SET c_reset=?, c_password='' WHERE LOWER(c_email)=?"),
		token, strings.ToLower(email))
	if err != nil {
		err = errors.Wrap(err, "execute password reset")
	}

	return
}

// CountActiveUsers returns the number of active users in the system.
func (s Store) CountActiveUsers() (c []domain.SubscriptionUserAccount) {
	err := s.Runtime.Db.Select(&c, "SELECT c_orgid AS orgid, COUNT(*) AS users FROM dmz_user_account WHERE c_active="+s.IsTrue()+" GROUP BY c_orgid ORDER BY c_orgid")

	if err != nil && err != sql.ErrNoRows {
		s.Runtime.Log.Error("CountActiveUsers", err)
	}

	return
}

// GetUsersForOrganization returns a slice containing all of the user records for the organizaiton
// identified in the context.
func (s Store) GetUsersForOrganization(ctx domain.RequestContext, filter string, limit int) (u []user.User, err error) {
	u = []user.User{}

	filter = strings.TrimSpace(strings.ToLower(filter))
	filter = stringutil.CleanDBValue(filter)

	likeQuery := ""
	if len(filter) > 0 {
		likeQuery = " AND (LOWER(u.c_firstname) LIKE '%" + filter + "%' OR LOWER(u.c_lastname) LIKE '%" + filter + "%' OR LOWER(u.c_email) LIKE '%" + filter + "%') "
	}

	if s.Runtime.StoreProvider.Type() == env.StoreTypeSQLServer {
		err = s.Runtime.Db.Select(&u, s.Bind(`SELECT TOP(`+strconv.Itoa(limit)+`) u.id, u.c_refid AS refid,
        u.c_firstname AS firstname, u.c_lastname AS lastname, u.c_email AS email,
        u.c_initials AS initials, u.c_globaladmin AS globaladmin,
        u.c_password AS password, u.c_salt AS salt, u.c_reset AS reset, u.c_lastversion AS lastversion, u.c_locale as locale,
        u.c_created AS created, u.c_revised AS revised,
        a.c_active AS active, a.c_editor AS editor, a.c_admin AS admin, a.c_users AS viewusers, a.c_analytics AS analytics
        FROM dmz_user u, dmz_user_account a
        WHERE u.c_refid=a.c_userid AND a.c_orgid=? `+likeQuery+
			`ORDER BY u.c_firstname, u.c_lastname`), ctx.OrgID)
	} else {
		err = s.Runtime.Db.Select(&u, s.Bind(`SELECT u.id, u.c_refid AS refid,
        u.c_firstname AS firstname, u.c_lastname AS lastname, u.c_email AS email,
        u.c_initials AS initials, u.c_globaladmin AS globaladmin,
        u.c_password AS password, u.c_salt AS salt, u.c_reset AS reset, u.c_lastversion AS lastversion, u.c_locale as locale,
        u.c_created AS created, u.c_revised AS revised,
        a.c_active AS active, a.c_editor AS editor, a.c_admin AS admin, a.c_users AS viewusers, a.c_analytics AS analytics
        FROM dmz_user u, dmz_user_account a
        WHERE u.c_refid=a.c_userid AND a.c_orgid=? `+likeQuery+
			`ORDER BY u.c_firstname, u.c_lastname LIMIT `+strconv.Itoa(limit)), ctx.OrgID)
	}

	if err == sql.ErrNoRows {
		err = nil
	}

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf(" get users for org %s", ctx.OrgID))
	}

	return
}

// MatchUsers returns users that have match to either firstname, lastname or email.
func (s Store) MatchUsers(ctx domain.RequestContext, text string, maxMatches int) (u []user.User, err error) {
	u = []user.User{}

	text = strings.TrimSpace(strings.ToLower(text))
	text = stringutil.CleanDBValue(text)
	likeQuery := ""
	if len(text) > 0 {
		likeQuery = " AND (LOWER(c_firstname) LIKE '%" + text + "%' OR LOWER(c_lastname) LIKE '%" + text + "%' OR LOWER(c_email) LIKE '%" + text + "%') "
	}

	if s.Runtime.StoreProvider.Type() == env.StoreTypeSQLServer {
		err = s.Runtime.Db.Select(&u, s.Bind(`SELECT TOP(`+strconv.Itoa(maxMatches)+`) u.id, u.c_refid AS refid,
        u.c_firstname AS firstname, u.c_lastname AS lastname, u.c_email AS email,
        u.c_initials AS initials, u.c_globaladmin AS globaladmin,
        u.c_password AS password, u.c_salt AS salt, u.c_reset AS reset, u.c_lastversion AS lastversion, u.c_locale as locale,
        u.c_created AS created, u.c_revised AS revised,
        a.c_active AS active, a.c_editor AS editor, a.c_admin AS admin, a.c_users AS viewusers, a.c_analytics AS analytics
        FROM dmz_user u, dmz_user_account a
		WHERE a.c_orgid=? AND u.c_refid=a.c_userid AND a.c_active=`+s.IsTrue()+likeQuery+` ORDER BY u.c_firstname, u.c_lastname`),
			ctx.OrgID)
	} else {
		err = s.Runtime.Db.Select(&u, s.Bind(`SELECT u.id, u.c_refid AS refid,
        u.c_firstname AS firstname, u.c_lastname AS lastname, u.c_email AS email,
        u.c_initials AS initials, u.c_globaladmin AS globaladmin,
        u.c_password AS password, u.c_salt AS salt, u.c_reset AS reset, u.c_lastversion AS lastversion, u.c_locale as locale,
        u.c_created AS created, u.c_revised AS revised,
        a.c_active AS active, a.c_editor AS editor, a.c_admin AS admin, a.c_users AS viewusers, a.c_analytics AS analytics
        FROM dmz_user u, dmz_user_account a
		WHERE a.c_orgid=? AND u.c_refid=a.c_userid AND a.c_active=`+s.IsTrue()+likeQuery+` ORDER BY u.c_firstname, u.c_lastname LIMIT `+strconv.Itoa(maxMatches)),
			ctx.OrgID)
	}

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("matching users for org %s", ctx.OrgID))
	}

	return
}
