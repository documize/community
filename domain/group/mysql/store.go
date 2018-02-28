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

	_, err = ctx.Transaction.Exec("INSERT INTO role (refid, orgid, role, purpose, created, revised) VALUES (?, ?, ?, ?, ?, ?)",
		g.RefID, g.OrgID, g.Name, g.Purpose, g.Created, g.Revised)

	if err != nil {
		err = errors.Wrap(err, "insert group")
	}

	return
}

// Get returns requested group.
func (s Scope) Get(ctx domain.RequestContext, refID string) (g group.Group, err error) {
	err = s.Runtime.Db.Get(&g,
		`SELECT id, refid, orgid, role as name, purpose, created, revised FROM role WHERE orgid=? AND refid=?`,
		ctx.OrgID, refID)

	if err != nil {
		err = errors.Wrap(err, "select group")
	}

	return
}

// GetAll returns all user groups for current orgID.
func (s Scope) GetAll(ctx domain.RequestContext) (groups []group.Group, err error) {
	err = s.Runtime.Db.Select(&groups,
		`SELECT a.id, a.refid, a.orgid, a.role as name, a.purpose, a.created, a.revised, COUNT(b.roleid) AS members
		FROM role a
		LEFT JOIN rolemember b ON a.refid=b.roleid
		WHERE a.orgid=?
		GROUP BY a.id, a.refid, a.orgid, a.role, a.purpose, a.created, a.revised
		ORDER BY a.role`,
		ctx.OrgID)

	if err == sql.ErrNoRows || len(groups) == 0 {
		err = nil
		groups = []group.Group{}
	}
	if err != nil {
		err = errors.Wrap(err, "select groups")
	}

	return
}

// Update group name and description.
func (s Scope) Update(ctx domain.RequestContext, g group.Group) (err error) {
	g.Revised = time.Now().UTC()

	_, err = ctx.Transaction.Exec("UPDATE role SET role=?, purpose=?, revised=? WHERE orgid=? AND refid=?",
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
	return b.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE FROM rolemember WHERE orgid=\"%s\" AND roleid=\"%s\"", ctx.OrgID, refID))
}

// GetGroupMembers returns all user associated with given group.
func (s Scope) GetGroupMembers(ctx domain.RequestContext, groupID string) (members []group.Member, err error) {
	err = s.Runtime.Db.Select(&members,
		`SELECT a.id, a.orgid, a.roleid, a.userid, 
		IFNULL(b.firstname, '') as firstname, IFNULL(b.lastname, '') as lastname
		FROM rolemember a
		LEFT JOIN user b ON b.refid=a.userid
		WHERE a.orgid=? AND a.roleid=?
		ORDER BY b.firstname, b.lastname`,
		ctx.OrgID, groupID)

	if err == sql.ErrNoRows || len(members) == 0 {
		err = nil
		members = []group.Member{}
	}
	if err != nil {
		err = errors.Wrap(err, "select members")
	}

	return
}
