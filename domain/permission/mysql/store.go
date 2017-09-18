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
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store/mysql"
	"github.com/documize/community/model/permission"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// AddPermission inserts the given record into the permisssion table.
func (s Scope) AddPermission(ctx domain.RequestContext, r permission.Permission) (err error) {
	r.Created = time.Now().UTC()

	stmt, err := ctx.Transaction.Preparex("INSERT INTO permission (orgid, who, whoid, action, scope, location, refid, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "unable to prepare insert permission")
		return
	}

	_, err = stmt.Exec(r.OrgID, r.Who, r.WhoID, string(r.Action), r.Scope, r.Location, r.RefID, r.Created)
	if err != nil {
		err = errors.Wrap(err, "unable to execute insert permission")
		return
	}

	return
}

// AddPermissions inserts records into permission database table, one per action.
func (s Scope) AddPermissions(ctx domain.RequestContext, r permission.Permission, actions ...permission.Action) (err error) {
	for _, a := range actions {
		r.Action = a
		s.AddPermission(ctx, r)
	}

	return
}

// GetUserSpacePermissions returns space permissions for user.
// Context is used to for user ID.
func (s Scope) GetUserSpacePermissions(ctx domain.RequestContext, spaceID string) (r []permission.Permission, err error) {
	err = s.Runtime.Db.Select(&r, `
		SELECT id, orgid, who, whoid, action, scope, location, refid
			FROM permission WHERE orgid=? AND location='space' AND refid=? AND who='user' AND (whoid=? OR whoid='')
		UNION ALL
		SELECT p.id, p.orgid, p.who, p.whoid, p.action, p.scope, p.location, p.refid
			FROM permission p LEFT JOIN rolemember r ON p.whoid=r.roleid WHERE p.orgid=? AND p.location='space' AND refid=?
			AND p.who='role' AND (r.userid=? OR r.userid='')`,
		ctx.OrgID, spaceID, ctx.UserID, ctx.OrgID, spaceID, ctx.OrgID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select user permissions %s", ctx.UserID))
		return
	}

	return
}

// GetSpacePermissions returns space permissions for all users.
func (s Scope) GetSpacePermissions(ctx domain.RequestContext, spaceID string) (r []permission.Permission, err error) {
	err = s.Runtime.Db.Select(&r, `
		SELECT id, orgid, who, whoid, action, scope, location, refid
			FROM permission WHERE orgid=? AND location='space' AND refid=? AND who='user'
		UNION ALL
		SELECT p.id, p.orgid, p.who, p.whoid, p.action, p.scope, p.location, p.refid
			FROM permission p LEFT JOIN rolemember r ON p.whoid=r.roleid WHERE p.orgid=? AND p.location='space' AND p.refid=? 
			AND p.who='role'`,
		ctx.OrgID, spaceID, ctx.OrgID, spaceID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select space permissions %s", ctx.UserID))
		return
	}

	return
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
