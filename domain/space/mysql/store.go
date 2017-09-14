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

// Package mysql handles data persistence for spaces.
package mysql

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store/mysql"
	"github.com/documize/community/model/space"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// Add adds new folder into the store.
func (s Scope) Add(ctx domain.RequestContext, sp space.Space) (err error) {
	sp.UserID = ctx.UserID
	sp.Created = time.Now().UTC()
	sp.Revised = time.Now().UTC()

	stmt, err := ctx.Transaction.Preparex("INSERT INTO label (refid, label, orgid, userid, type, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "unable to prepare insert for label")
		return
	}

	_, err = stmt.Exec(sp.RefID, sp.Name, sp.OrgID, sp.UserID, sp.Type, sp.Created, sp.Revised)
	if err != nil {
		err = errors.Wrap(err, "unable to execute insert for label")
		return
	}

	return
}

// Get returns a space from the store.
func (s Scope) Get(ctx domain.RequestContext, id string) (sp space.Space, err error) {
	stmt, err := s.Runtime.Db.Preparex("SELECT id,refid,label as name,orgid,userid,type,created,revised FROM label WHERE orgid=? and refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to prepare select for label %s", id))
		return
	}

	err = stmt.Get(&sp, ctx.OrgID, id)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select for label %s", id))
		return
	}

	return
}

// PublicSpaces returns spaces that anyone can see.
func (s Scope) PublicSpaces(ctx domain.RequestContext, orgID string) (sp []space.Space, err error) {
	sql := "SELECT id,refid,label as name,orgid,userid,type,created,revised FROM label a where orgid=? AND type=1"

	err = s.Runtime.Db.Select(&sp, sql, orgID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("Unable to execute GetPublicFolders for org %s", orgID))
		return
	}

	return
}

// GetAll returns spaces that the user can see.
// Also handles which spaces can be seen by anonymous users.
func (s Scope) GetAll(ctx domain.RequestContext) (sp []space.Space, err error) {
	sql := `
	(SELECT id,refid,label as name,orgid,userid,type,created,revised from label WHERE orgid=? AND type=2 AND userid=?)
	UNION ALL
	(SELECT id,refid,label as name,orgid,userid,type,created,revised FROM label a where orgid=? AND type=1 AND refid in
		(SELECT labelid from labelrole WHERE orgid=? AND userid='' AND (canedit=1 OR canview=1)))
	UNION ALL
	(SELECT id,refid,label as name,orgid,userid,type,created,revised FROM label a where orgid=? AND type=3 AND refid in
		(SELECT labelid from labelrole WHERE orgid=? AND userid=? AND (canedit=1 OR canview=1)))
	ORDER BY name`

	err = s.Runtime.Db.Select(&sp, sql,
		ctx.OrgID,
		ctx.UserID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.UserID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("Unable to execute select labels for org %s", ctx.OrgID))
		return
	}

	return
}

// Update saves space changes.
func (s Scope) Update(ctx domain.RequestContext, sp space.Space) (err error) {
	sp.Revised = time.Now().UTC()

	stmt, err := ctx.Transaction.PrepareNamed("UPDATE label SET label=:name, type=:type, userid=:userid, revised=:revised WHERE orgid=:orgid AND refid=:refid")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to prepare update for label %s", sp.RefID))
		return
	}

	_, err = stmt.Exec(&sp)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute update for label %s", sp.RefID))
		return
	}

	return
}

// ChangeOwner transfer space ownership.
func (s Scope) ChangeOwner(ctx domain.RequestContext, currentOwner, newOwner string) (err error) {
	stmt, err := ctx.Transaction.Preparex("UPDATE label SET userid=? WHERE userid=? AND orgid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to prepare change space owner for  %s", currentOwner))
		return
	}

	_, err = stmt.Exec(newOwner, currentOwner, ctx.OrgID)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute change space owner for  %s", currentOwner))
		return
	}

	return
}

// Viewers returns the list of people who can see shared spaces.
func (s Scope) Viewers(ctx domain.RequestContext) (v []space.Viewer, err error) {
	sql := `
	SELECT a.userid,
		COALESCE(u.firstname, '') as firstname,
		COALESCE(u.lastname, '') as lastname,
		COALESCE(u.email, '') as email,
		a.labelid,
		b.label as name,
		b.type
	FROM labelrole a
	LEFT JOIN label b ON b.refid=a.labelid
	LEFT JOIN user u ON u.refid=a.userid
	WHERE a.orgid=? AND b.type != 2
	GROUP BY a.labelid,a.userid
	ORDER BY u.firstname,u.lastname`

	err = s.Runtime.Db.Select(&v, sql, ctx.OrgID)

	return
}

// Delete removes space from the store.
func (s Scope) Delete(ctx domain.RequestContext, id string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	return b.DeleteConstrained(ctx.Transaction, "label", ctx.OrgID, id)
}

// AddPermission inserts the given record into the labelrole database table.
func (s Scope) AddPermission(ctx domain.RequestContext, r space.Permission) (err error) {
	r.Created = time.Now().UTC()

	stmt, err := ctx.Transaction.Preparex("INSERT INTO labelrole (orgid, who, whoid, action, scope, location, refid, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "unable to prepare insert for space permission")
		return
	}

	_, err = stmt.Exec(r.OrgID, r.Who, r.WhoID, r.Action, r.Scope, r.Location, r.RefID, r.Created)
	if err != nil {
		err = errors.Wrap(err, "unable to execute insert for space permission")
		return
	}

	return
}

// AddPermissions inserts records into permission database table, one per action.
func (s Scope) AddPermissions(ctx domain.RequestContext, r space.Permission, actions ...space.PermissionAction) (err error) {
	for _, a := range actions {
		r.Action = a
		s.AddPermission(ctx, r)
	}

	return
}

// GetUserPermissions returns space permissions for user.
// Context is used to for user ID.
func (s Scope) GetUserPermissions(ctx domain.RequestContext, spaceID string) (r []space.Permission, err error) {
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

// GetPermissions returns space permissions for all users.
func (s Scope) GetPermissions(ctx domain.RequestContext, spaceID string) (r []space.Permission, err error) {
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

// DeletePermissions removes records from permissions table for given space ID.
func (s Scope) DeletePermissions(ctx domain.RequestContext, spaceID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	sql := fmt.Sprintf("DELETE FROM permission WHERE orgid='%s' AND location='space' AND refid='%s'",
		ctx.OrgID, spaceID)

	return b.DeleteWhere(ctx.Transaction, sql)
}

// DeleteUserPermissions removes all roles for the specified user, for the specified space.
func (s Scope) DeleteUserPermissions(ctx domain.RequestContext, spaceID, userID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	sql := fmt.Sprintf("DELETE FROM permission WHERE orgid='%s' AND location='space' AND refid='%s' who='user' AND whoid='%s'",
		ctx.OrgID, spaceID, userID)

	return b.DeleteWhere(ctx.Transaction, sql)
}
