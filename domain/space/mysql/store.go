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
	"fmt"
	"time"

	"github.com/documize/community/core/env"
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

	_, err = ctx.Transaction.Exec("INSERT INTO label (refid, label, orgid, userid, type, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?)",
		sp.RefID, sp.Name, sp.OrgID, sp.UserID, sp.Type, sp.Created, sp.Revised)

	if err != nil {
		err = errors.Wrap(err, "unable to execute insert for label")
	}

	return
}

// Get returns a space from the store.
func (s Scope) Get(ctx domain.RequestContext, id string) (sp space.Space, err error) {
	err = s.Runtime.Db.Get(&sp, "SELECT id,refid,label as name,orgid,userid,type,created,revised FROM label WHERE orgid=? and refid=?",
		ctx.OrgID, id)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select for label %s", id))
	}

	return
}

// PublicSpaces returns spaces that anyone can see.
func (s Scope) PublicSpaces(ctx domain.RequestContext, orgID string) (sp []space.Space, err error) {
	sql := "SELECT id,refid,label as name,orgid,userid,type,created,revised FROM label a where orgid=? AND type=1"

	err = s.Runtime.Db.Select(&sp, sql, orgID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("Unable to execute GetPublicFolders for org %s", orgID))
	}

	return
}

// GetAll returns spaces that the user can see.
// Also handles which spaces can be seen by anonymous users.
func (s Scope) GetAll(ctx domain.RequestContext) (sp []space.Space, err error) {
	sql := `
	SELECT id,refid,label as name,orgid,userid,type,created,revised FROM label
	WHERE orgid=?
		AND refid IN (SELECT refid FROM permission WHERE orgid=? AND location='space' AND refid IN (
		SELECT refid from permission WHERE orgid=? AND who='user' AND whoid=? AND location='space' UNION ALL
		SELECT p.refid from permission p LEFT JOIN rolemember r ON p.whoid=r.roleid WHERE p.orgid=? AND p.who='role' 
		AND p.location='space' AND p.action='view' AND r.userid=?
	))
	ORDER BY name`

	err = s.Runtime.Db.Select(&sp, sql,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.UserID,
		ctx.OrgID,
		ctx.UserID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed space.GetAll org %s", ctx.OrgID))
	}

	return
}

// Update saves space changes.
func (s Scope) Update(ctx domain.RequestContext, sp space.Space) (err error) {
	sp.Revised = time.Now().UTC()

	_, err = ctx.Transaction.NamedExec("UPDATE label SET label=:name, type=:type, userid=:userid, revised=:revised WHERE orgid=:orgid AND refid=:refid", &sp)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute update for label %s", sp.RefID))
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
