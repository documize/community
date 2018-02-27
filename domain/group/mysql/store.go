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
		`select id, refid, orgid, role as name, purpose, created, revised FROM role WHERE orgid=? ORDER BY role`,
		ctx.OrgID)

	if err == sql.ErrNoRows || len(groups) == 0 {
		groups = []group.Group{}
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
