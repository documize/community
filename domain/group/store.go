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

package group

import (
	"database/sql"
	"time"

	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/group"
	"github.com/pkg/errors"
)

// Store provides data access to space category information.
type Store struct {
	store.Context
	store.DocumentStorer
}

// Add inserts new user group into store.
func (s Store) Add(ctx domain.RequestContext, g group.Group) (err error) {
	g.Created = time.Now().UTC()
	g.Revised = time.Now().UTC()

	_, err = ctx.Transaction.Exec(s.Bind("INSERT INTO dmz_group (c_refid, c_orgid, c_name, c_desc, c_created, c_revised) VALUES (?, ?, ?, ?, ?, ?)"),
		g.RefID, g.OrgID, g.Name, g.Purpose, g.Created, g.Revised)

	if err != nil {
		err = errors.Wrap(err, "insert group")
	}

	return
}

// Get returns requested group.
func (s Store) Get(ctx domain.RequestContext, refID string) (g group.Group, err error) {
	err = s.Runtime.Db.Get(&g, s.Bind(`
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_name AS name, c_desc AS purpose, c_created AS created, c_revised AS revised
        FROM dmz_group
        WHERE c_orgid=? AND c_refid=?`),
		ctx.OrgID, refID)

	if err != nil {
		err = errors.Wrap(err, "select group")
	}

	return
}

// GetAll returns all user groups for current orgID.
func (s Store) GetAll(ctx domain.RequestContext) (groups []group.Group, err error) {
	groups = []group.Group{}

	err = s.Runtime.Db.Select(&groups, s.Bind(`
        SELECT a.id, a.c_refid AS refid, a.c_orgid AS orgid, a.c_name AS name, a.c_desc AS purpose, a.c_created AS created, a.c_revised AS revised,
        COUNT(b.c_groupid) AS members
		FROM dmz_group a
		LEFT JOIN dmz_group_member b ON a.c_refid=b.c_groupid
		WHERE a.c_orgid=?
		GROUP BY a.id, a.c_refid, a.c_orgid, a.c_name, a.c_desc, a.c_created, a.c_revised
		ORDER BY a.c_name`),
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
func (s Store) Update(ctx domain.RequestContext, g group.Group) (err error) {
	g.Revised = time.Now().UTC()

	_, err = ctx.Transaction.Exec(s.Bind(`UPDATE dmz_group SET
        c_name=?, c_desc=?, c_revised=?
        WHERE c_orgid=? AND c_refid=?`),
		g.Name, g.Purpose, g.Revised, ctx.OrgID, g.RefID)

	if err != nil {
		err = errors.Wrap(err, "update group")
	}

	return
}

// Delete removes group from store.
func (s Store) Delete(ctx domain.RequestContext, refID string) (rows int64, err error) {
	_, err = s.DeleteConstrained(ctx.Transaction, "dmz_group", ctx.OrgID, refID)
	if err != nil {
		return
	}

	ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_group_member WHERE c_orgid=? AND c_groupid=?"), ctx.OrgID, refID)

	return
}

// GetGroupMembers returns all user associated with given group.
func (s Store) GetGroupMembers(ctx domain.RequestContext, groupID string) (members []group.Member, err error) {
	members = []group.Member{}

	err = s.Runtime.Db.Select(&members, s.Bind(`
		SELECT a.id, a.c_orgid AS orgid, a.c_groupid AS groupid, a.c_userid AS userid,
		COALESCE(b.c_firstname, '') as firstname, COALESCE(b.c_lastname, '') as lastname
		FROM dmz_group_member a
		LEFT JOIN dmz_user b ON b.c_refid=a.c_userid
		WHERE a.c_orgid=? AND a.c_groupid=?
		ORDER BY b.c_firstname, b.c_lastname`),
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
func (s Store) JoinGroup(ctx domain.RequestContext, groupID, userID string) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind("INSERT INTO dmz_group_member (c_orgid, c_groupid, c_userid) VALUES (?, ?, ?)"),
		ctx.OrgID, groupID, userID)
	if err != nil {
		err = errors.Wrap(err, "insert group member")
	}

	return
}

// LeaveGroup removes user from group.
func (s Store) LeaveGroup(ctx domain.RequestContext, groupID, userID string) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_group_member WHERE c_orgid=? AND c_groupid=? AND c_userid=?"),
		ctx.OrgID, groupID, userID)

	return
}

// GetMembers returns members for every group.
// Useful when you need to bulk fetch membership records
// for subsequent processing.
func (s Store) GetMembers(ctx domain.RequestContext) (r []group.Record, err error) {
	r = []group.Record{}

	err = s.Runtime.Db.Select(&r, s.Bind(`
        SELECT a.id, a.c_orgid AS orgid, a.c_groupid AS groupid, a.c_userid AS userid,
        b.c_name As name, b.c_desc AS purpose
		FROM dmz_group_member a, dmz_group b
		WHERE a.c_orgid=? AND a.c_groupid=b.c_refid
		ORDER BY a.c_userid`),
		ctx.OrgID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, "select group members")
	}

	return
}

// RemoveUserGroups remove user from all group.
func (s Store) RemoveUserGroups(ctx domain.RequestContext, userID string) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_group_member WHERE c_orgid=? AND c_userid=?"),
		ctx.OrgID, userID)

	return
}
