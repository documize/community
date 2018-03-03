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

// Package mysql handles data persistence for space and document permissions.
package mysql

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store/mysql"
	"github.com/documize/community/model/permission"
	"github.com/documize/community/model/user"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// AddPermission inserts the given record into the permisssion table.
func (s Scope) AddPermission(ctx domain.RequestContext, r permission.Permission) (err error) {
	r.Created = time.Now().UTC()

	_, err = ctx.Transaction.Exec("INSERT INTO permission (orgid, who, whoid, action, scope, location, refid, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		r.OrgID, string(r.Who), r.WhoID, string(r.Action), string(r.Scope), string(r.Location), r.RefID, r.Created)

	if err != nil {
		err = errors.Wrap(err, "unable to execute insert permission")
	}

	return
}

// AddPermissions inserts records into permission database table, one per action.
func (s Scope) AddPermissions(ctx domain.RequestContext, r permission.Permission, actions ...permission.Action) (err error) {
	for _, a := range actions {
		r.Action = a

		err := s.AddPermission(ctx, r)
		if err != nil {
			return err
		}
	}

	return
}

// GetUserSpacePermissions returns space permissions for user.
// Context is used to for userID because must match by userID
// or everyone ID of 0.
func (s Scope) GetUserSpacePermissions(ctx domain.RequestContext, spaceID string) (r []permission.Permission, err error) {
	err = s.Runtime.Db.Select(&r, `
		SELECT id, orgid, who, whoid, action, scope, location, refid
			FROM permission
			WHERE orgid=? AND location='space' AND refid=? AND who='user' AND (whoid=? OR whoid='0')
		UNION ALL
		SELECT p.id, p.orgid, p.who, p.whoid, p.action, p.scope, p.location, p.refid
			FROM permission p
			LEFT JOIN rolemember r ON p.whoid=r.roleid
			WHERE p.orgid=? AND p.location='space' AND refid=? AND p.who='role' AND (r.userid=? OR r.userid='0')`,
		ctx.OrgID, spaceID, ctx.UserID, ctx.OrgID, spaceID, ctx.UserID)

	if err == sql.ErrNoRows {
		err = nil
		r = []permission.Permission{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select user permissions %s", ctx.UserID))
	}

	return
}

// GetSpacePermissions returns space permissions for all users.
// We do not filter by userID because we return permissions for all users.
func (s Scope) GetSpacePermissions(ctx domain.RequestContext, spaceID string) (r []permission.Permission, err error) {
	err = s.Runtime.Db.Select(&r, `
		SELECT id, orgid, who, whoid, action, scope, location, refid
			FROM permission WHERE orgid=? AND location='space' AND refid=? AND who='user'
		UNION ALL
		SELECT p.id, p.orgid, p.who, p.whoid, p.action, p.scope, p.location, p.refid
			FROM permission p
			LEFT JOIN rolemember r ON p.whoid=r.roleid
			WHERE p.orgid=? AND p.location='space' AND p.refid=? AND p.who='role'`,
		ctx.OrgID, spaceID, ctx.OrgID, spaceID)

	if err == sql.ErrNoRows {
		err = nil
		r = []permission.Permission{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select space permissions %s", ctx.UserID))
	}

	return
}

// GetCategoryPermissions returns category permissions for all users.
func (s Scope) GetCategoryPermissions(ctx domain.RequestContext, catID string) (r []permission.Permission, err error) {
	err = s.Runtime.Db.Select(&r, `
		SELECT id, orgid, who, whoid, action, scope, location, refid
			FROM permission WHERE orgid=? AND location='category' AND refid=? AND who='user'
		UNION ALL
		SELECT p.id, p.orgid, p.who, p.whoid, p.action, p.scope, p.location, p.refid
			FROM permission p
			LEFT JOIN rolemember r ON p.whoid=r.roleid
			WHERE p.orgid=? AND p.location='space' AND p.refid=? AND p.who='role'`,
		ctx.OrgID, catID, ctx.OrgID, catID)

	if err == sql.ErrNoRows {
		err = nil
		r = []permission.Permission{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select category permissions %s", catID))
	}

	return
}

// GetCategoryUsers returns space permissions for all users.
func (s Scope) GetCategoryUsers(ctx domain.RequestContext, catID string) (u []user.User, err error) {
	err = s.Runtime.Db.Select(&u, `
		SELECT u.id, IFNULL(u.refid, '') AS refid, IFNULL(u.firstname, '') AS firstname, IFNULL(u.lastname, '') as lastname, u.email, u.initials, u.password, u.salt, u.reset, u.created, u.revised
		FROM user u LEFT JOIN account a ON u.refid = a.userid 
		WHERE a.orgid=? AND a.active=1 AND u.refid IN (
			SELECT whoid from permission WHERE orgid=? AND who='user' AND location='category' AND refid=?
			UNION ALL
			SELECT r.userid from rolemember r
				LEFT JOIN permission p ON p.whoid=r.roleid
				WHERE p.orgid=? AND p.who='role' AND p.location='category' AND p.refid=?
		)
		GROUP by u.id
		ORDER BY firstname, lastname`,
		ctx.OrgID, ctx.OrgID, catID, ctx.OrgID, catID)

	if err == sql.ErrNoRows {
		err = nil
		u = []user.User{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select users for category %s", catID))
	}

	return
}

// GetUserCategoryPermissions returns category permissions for given user.
func (s Scope) GetUserCategoryPermissions(ctx domain.RequestContext, userID string) (r []permission.Permission, err error) {
	err = s.Runtime.Db.Select(&r, `
		SELECT id, orgid, who, whoid, action, scope, location, refid
			FROM permission WHERE orgid=? AND location='category' AND who='user' AND (whoid=? OR whoid='0')
		UNION ALL
		SELECT p.id, p.orgid, p.who, p.whoid, p.action, p.scope, p.location, p.refid
			FROM permission p
			LEFT JOIN rolemember r ON p.whoid=r.roleid
			WHERE p.orgid=? AND p.location='category' AND p.who='role' AND (r.userid=? OR r.userid='0')`,
		ctx.OrgID, userID, ctx.OrgID, userID)

	if err == sql.ErrNoRows {
		err = nil
		r = []permission.Permission{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select category permissions for user %s", userID))
	}

	return
}

// GetUserDocumentPermissions returns document permissions for user.
// Context is used to for user ID.
func (s Scope) GetUserDocumentPermissions(ctx domain.RequestContext, documentID string) (r []permission.Permission, err error) {
	err = s.Runtime.Db.Select(&r, `
		SELECT id, orgid, who, whoid, action, scope, location, refid
			FROM permission WHERE orgid=? AND location='document' AND refid=? AND who='user' AND (whoid=? OR whoid='0')
		UNION ALL
		SELECT p.id, p.orgid, p.who, p.whoid, p.action, p.scope, p.location, p.refid
			FROM permission p
			LEFT JOIN rolemember r ON p.whoid=r.roleid
			WHERE p.orgid=? AND p.location='document' AND refid=? AND p.who='role' AND (r.userid=? OR r.userid='0')`,
		ctx.OrgID, documentID, ctx.UserID, ctx.OrgID, documentID, ctx.OrgID)

	if err == sql.ErrNoRows {
		err = nil
		r = []permission.Permission{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select user document permissions %s", ctx.UserID))
	}

	return
}

// GetDocumentPermissions returns documents permissions for all users.
// We do not filter by userID because we return permissions for all users.
func (s Scope) GetDocumentPermissions(ctx domain.RequestContext, documentID string) (r []permission.Permission, err error) {
	err = s.Runtime.Db.Select(&r, `
		SELECT id, orgid, who, whoid, action, scope, location, refid
			FROM permission WHERE orgid=? AND location='document' AND refid=? AND who='user'
		UNION ALL
		SELECT p.id, p.orgid, p.who, p.whoid, p.action, p.scope, p.location, p.refid
			FROM permission p
			LEFT JOIN rolemember r ON p.whoid=r.roleid
			WHERE p.orgid=? AND p.location='document' AND p.refid=? AND p.who='role'`,
		ctx.OrgID, documentID, ctx.OrgID, documentID)

	if err == sql.ErrNoRows {
		err = nil
		r = []permission.Permission{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select document permissions %s", ctx.UserID))
	}

	return
}

// DeleteDocumentPermissions removes records from permissions table for given document.
func (s Scope) DeleteDocumentPermissions(ctx domain.RequestContext, documentID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	sql := fmt.Sprintf("DELETE FROM permission WHERE orgid='%s' AND location='document' AND refid='%s'", ctx.OrgID, documentID)

	return b.DeleteWhere(ctx.Transaction, sql)
}

// DeleteSpacePermissions removes records from permissions table for given space ID.
func (s Scope) DeleteSpacePermissions(ctx domain.RequestContext, spaceID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	sql := fmt.Sprintf("DELETE FROM permission WHERE orgid='%s' AND location='space' AND refid='%s'", ctx.OrgID, spaceID)

	return b.DeleteWhere(ctx.Transaction, sql)
}

// DeleteUserSpacePermissions removes all roles for the specified user, for the specified space.
func (s Scope) DeleteUserSpacePermissions(ctx domain.RequestContext, spaceID, userID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	sql := fmt.Sprintf("DELETE FROM permission WHERE orgid='%s' AND location='space' AND refid='%s' who='user' AND whoid='%s'",
		ctx.OrgID, spaceID, userID)

	return b.DeleteWhere(ctx.Transaction, sql)
}

// DeleteUserPermissions removes all roles for the specified user, for the specified space.
func (s Scope) DeleteUserPermissions(ctx domain.RequestContext, userID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	sql := fmt.Sprintf("DELETE FROM permission WHERE orgid='%s' AND who='user' AND whoid='%s'",
		ctx.OrgID, userID)

	return b.DeleteWhere(ctx.Transaction, sql)
}

// DeleteCategoryPermissions removes records from permissions table for given category ID.
func (s Scope) DeleteCategoryPermissions(ctx domain.RequestContext, categoryID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	sql := fmt.Sprintf("DELETE FROM permission WHERE orgid='%s' AND location='category' AND refid='%s'", ctx.OrgID, categoryID)

	return b.DeleteWhere(ctx.Transaction, sql)
}

// DeleteSpaceCategoryPermissions removes all category permission for for given space.
func (s Scope) DeleteSpaceCategoryPermissions(ctx domain.RequestContext, spaceID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	sql := fmt.Sprintf(`
		DELETE FROM permission WHERE orgid='%s' AND location='category' 
			AND refid IN (SELECT refid FROM category WHERE orgid='%s' AND labelid='%s')`,
		ctx.OrgID, ctx.OrgID, spaceID)

	return b.DeleteWhere(ctx.Transaction, sql)
}
