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

// PublicSpaces returns folders that anyone can see.
func (s Scope) PublicSpaces(ctx domain.RequestContext, orgID string) (sp []space.Space, err error) {
	sql := "SELECT id,refid,label as name,orgid,userid,type,created,revised FROM label a where orgid=? AND type=1"

	err = s.Runtime.Db.Select(&sp, sql, orgID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("Unable to execute GetPublicFolders for org %s", orgID))
		return
	}

	return
}

// GetAll returns folders that the user can see.
// Also handles which folders can be seen by anonymous users.
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

// Viewers returns the list of people who can see shared folders.
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

// AddRole inserts the given record into the labelrole database table.
func (s Scope) AddRole(ctx domain.RequestContext, r space.Role) (err error) {
	r.Created = time.Now().UTC()
	r.Revised = time.Now().UTC()

	stmt, err := ctx.Transaction.Preparex("INSERT INTO labelrole (refid, labelid, orgid, userid, canview, canedit, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "unable to prepare insert for space role")
		return
	}

	_, err = stmt.Exec(r.RefID, r.LabelID, r.OrgID, r.UserID, r.CanView, r.CanEdit, r.Created, r.Revised)
	if err != nil {
		err = errors.Wrap(err, "unable to execute insert for space role")
		return
	}

	return
}

// GetRoles returns a slice of labelrole records, for the given labelID in the client's organization, grouped by user.
func (s Scope) GetRoles(ctx domain.RequestContext, labelID string) (r []space.Role, err error) {
	query := `SELECT id, refid, labelid, orgid, userid, canview, canedit, created, revised FROM labelrole WHERE orgid=? AND labelid=?` // was + "GROUP BY userid"

	err = s.Runtime.Db.Select(&r, query, ctx.OrgID, labelID)

	if err == sql.ErrNoRows {
		err = nil
	}

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select for space roles %s", labelID))
		return
	}

	return
}

// GetUserRoles returns a slice of role records, for both the client's user and organization, and
// those space roles that exist for all users in the client's organization.
func (s Scope) GetUserRoles(ctx domain.RequestContext) (r []space.Role, err error) {
	err = s.Runtime.Db.Select(&r, `
		SELECT id, refid, labelid, orgid, userid, canview, canedit, created, revised FROM labelrole WHERE orgid=? and userid=?
		UNION ALL
		SELECT id, refid, labelid, orgid, userid, canview, canedit, created, revised FROM labelrole WHERE orgid=? AND userid=''`,
		ctx.OrgID, ctx.UserID, ctx.OrgID)

	if err == sql.ErrNoRows {
		err = nil
	}

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select for user space roles %s", ctx.UserID))
		return
	}

	return
}

// DeleteRole deletes the labelRoleID record from the labelrole table.
func (s Scope) DeleteRole(ctx domain.RequestContext, roleID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	sql := fmt.Sprintf("DELETE FROM labelrole WHERE orgid='%s' AND refid='%s'", ctx.OrgID, roleID)

	return b.DeleteWhere(ctx.Transaction, sql)
}

// DeleteSpaceRoles deletes records from the labelrole table which have the given space ID.
func (s Scope) DeleteSpaceRoles(ctx domain.RequestContext, spaceID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	sql := fmt.Sprintf("DELETE FROM labelrole WHERE orgid='%s' AND labelid='%s'", ctx.OrgID, spaceID)

	return b.DeleteWhere(ctx.Transaction, sql)
}

// DeleteUserSpaceRoles removes all roles for the specified user, for the specified space.
func (s Scope) DeleteUserSpaceRoles(ctx domain.RequestContext, spaceID, userID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	sql := fmt.Sprintf("DELETE FROM labelrole WHERE orgid='%s' AND labelid='%s' AND userid='%s'",
		ctx.OrgID, spaceID, userID)

	return b.DeleteWhere(ctx.Transaction, sql)
}

// MoveSpaceRoles changes the space ID for space role records from previousLabel to newLabel.
func (s Scope) MoveSpaceRoles(ctx domain.RequestContext, previousLabel, newLabel string) (err error) {
	stmt, err := ctx.Transaction.Preparex("UPDATE labelrole SET labelid=? WHERE labelid=? AND orgid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to prepare move space roles for label  %s", previousLabel))
		return
	}

	_, err = stmt.Exec(newLabel, previousLabel, ctx.OrgID)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute move space roles for label  %s", previousLabel))
	}

	return
}
