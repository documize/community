// Copyright 2018 Documize Inc. <legal@documize.com>. All rights reserved.
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
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store/mysql"
	"github.com/documize/community/model/group"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// Add inserts new user group into store.
func (s Scope) Add(ctx domain.RequestContext, g group.Group) (err error) {
	g.Created = time.Now().UTC()
	g.Revised = time.Now().UTC()

	_, err = ctx.Transaction.Exec("INSERT INTO dmz_group (c_refid, c_orgid, c_name, c_desc, c_created, c_revised) VALUES (?, ?, ?, ?, ?, ?)",
		g.RefID, g.OrgID, g.Name, g.Purpose, g.Created, g.Revised)

	if err != nil {
		err = errors.Wrap(err, "insert group")
	}

	return
}

// Get returns requested group.
func (s Scope) Get(ctx domain.RequestContext, refID string) (g group.Group, err error) {
	err = s.Runtime.Db.Get(&g, `
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_name AS name, c_desc AS purpose, c_created, c_revised
        FROM dmz_group
        WHERE c_orgid=? AND c_refid=?`,
		ctx.OrgID, refID)

	if err != nil {
		err = errors.Wrap(err, "select group")
	}

	return
}

// GetAll returns all user groups for current orgID.
func (s Scope) GetAll(ctx domain.RequestContext) (groups []group.Group, err error) {
	groups = []group.Group{}

	err = s.Runtime.Db.Select(&groups, `
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_name AS name, c_desc AS purpose, c_created, c_revised
        COUNT(b.groupid) AS members
		FROM dmz_group a
		LEFT JOIN dmz_group_member b ON a.c_refid=b.c_groupid
		WHERE a.c_orgid=?
		GROUP BY a.id, a.c_refid, a.c_orgid, a.c_name, a.c_desc, a.c_created, a.c_revised
		ORDER BY a.c_name`,
		ctx.OrgID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, "select groups")
	}

	return
}

// Update group name and description.
func (s Scope) Update(ctx domain.RequestContext, g group.Group) (err error) {
	g.Revised = time.Now().UTC()

	_, err = ctx.Transaction.Exec(`UPDATE dmz_group SET
        c_name=?, c_desc=?, c_revised=?
        WHERE c_orgid=? AND c_refid=?`,
		g.Name, g.Purpose, g.Revised, ctx.OrgID, g.RefID)

	if err != nil {
		err = errors.Wrap(err, "update group")
	}

	return
}

// Delete removes group from store.
func (s Scope) Delete(ctx domain.RequestContext, refID string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	b.DeleteConstrained(ctx.Transaction, "role", ctx.OrgID, refID)
	return b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM dmz_group_member WHERE c_orgid=\"%s\" AND c_groupid=\"%s\"", ctx.OrgID, refID))
}

// GetGroupMembers returns all user associated with given group.
func (s Scope) GetGroupMembers(ctx domain.RequestContext, groupID string) (members []group.Member, err error) {
	members = []group.Member{}

	err = s.Runtime.Db.Select(&members, `
		SELECT a.id, a.c_orgid AS orgid, a.c_groupid AS groupid, a.c_userid AS userid,
		IFNULL(b.c_firstname, '') as firstname, IFNULL(b.c_lastname, '') as lastname
		FROM dmz_group_member a
		LEFT JOIN dmz_user b ON b.c_refid=a.c_userid
		WHERE a.c_orgid=? AND a.c_groupid=?
		ORDER BY b.c_firstname, b.c_lastname`,
		ctx.OrgID, groupID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, "select members")
	}

	return
}

// JoinGroup adds user to group.
func (s Scope) JoinGroup(ctx domain.RequestContext, groupID, userID string) (err error) {
	_, err = ctx.Transaction.Exec("INSERT INTO dmz_group_member (orgid, groupid, userid) VALUES (?, ?, ?)", ctx.OrgID, groupID, userID)
	if err != nil {
		err = errors.Wrap(err, "insert group member")
	}

	return
}

// LeaveGroup removes user from group.
func (s Scope) LeaveGroup(ctx domain.RequestContext, groupID, userID string) (err error) {
	b := mysql.BaseQuery{}
	_, err = b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM dmz_group_member WHERE c_orgid=\"%s\" AND c_groupid=\"%s\" AND c_userid=\"%s\"", ctx.OrgID, groupID, userID))
	if err != nil {
		err = errors.Wrap(err, "clear group member")
	}

	return
}

// GetMembers returns members for every group.
// Useful when you need to bulk fetch membership records
// for subsequent processing.
func (s Scope) GetMembers(ctx domain.RequestContext) (r []group.Record, err error) {
	r = []group.Record{}

	err = s.Runtime.Db.Select(&r, `
        SELECT a.id, a.c_orgid AS orgid, a.c_groupid AS groupid, a.c_userid AS userid,
        b.c_name As name, b.c_desc AS purpose
		FROM dmz_group_member a, dmz_group b
		WHERE a.c_orgid=? AND a.c_groupid=b.refid
		ORDER BY a.c_userid`,
		ctx.OrgID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, "select group members")
	}

	return
}
