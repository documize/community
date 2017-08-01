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

package mysql

import (
	"database/sql"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store/mysql"
	"github.com/documize/community/model/block"
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// Add saves reusable content block.
func (s Scope) Add(ctx domain.RequestContext, b block.Block) (err error) {
	b.OrgID = ctx.OrgID
	b.UserID = ctx.UserID
	b.Created = time.Now().UTC()
	b.Revised = time.Now().UTC()

	stmt, err := ctx.Transaction.Preparex("INSERT INTO block (refid, orgid, labelid, userid, contenttype, pagetype, title, body, excerpt, rawbody, config, externalsource, used, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare insert block")
		return
	}

	_, err = stmt.Exec(b.RefID, b.OrgID, b.LabelID, b.UserID, b.ContentType, b.PageType, b.Title, b.Body, b.Excerpt, b.RawBody, b.Config, b.ExternalSource, b.Used, b.Created, b.Revised)
	if err != nil {
		err = errors.Wrap(err, "execute insert block")
		return
	}

	return
}

// Get returns requested reusable content block.
func (s Scope) Get(ctx domain.RequestContext, id string) (b block.Block, err error) {
	stmt, err := s.Runtime.Db.Preparex("SELECT a.id, a.refid, a.orgid, a.labelid, a.userid, a.contenttype, a.pagetype, a.title, a.body, a.excerpt, a.rawbody, a.config, a.externalsource, a.used, a.created, a.revised, b.firstname, b.lastname FROM block a LEFT JOIN user b ON a.userid = b.refid WHERE a.orgid=? AND a.refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare select block")
		return
	}

	err = stmt.Get(&b, ctx.OrgID, id)
	if err != nil {
		err = errors.Wrap(err, "execute select block")
		return
	}

	return
}

// GetBySpace returns all reusable content scoped to given space.
func (s Scope) GetBySpace(ctx domain.RequestContext, spaceID string) (b []block.Block, err error) {
	err = s.Runtime.Db.Select(&b, "SELECT a.id, a.refid, a.orgid, a.labelid, a.userid, a.contenttype, a.pagetype, a.title, a.body, a.excerpt, a.rawbody, a.config, a.externalsource, a.used, a.created, a.revised, b.firstname, b.lastname FROM block a LEFT JOIN user b ON a.userid = b.refid WHERE a.orgid=? AND a.labelid=? ORDER BY a.title", ctx.OrgID, spaceID)

	if err != nil {
		err = errors.Wrap(err, "select space blocks")
		return
	}

	return
}

// IncrementUsage increments usage counter for content block.
func (s Scope) IncrementUsage(ctx domain.RequestContext, id string) (err error) {
	stmt, err := ctx.Transaction.Preparex("UPDATE block SET used=used+1, revised=? WHERE orgid=? AND refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare increment block usage")
		return
	}

	_, err = stmt.Exec(time.Now().UTC(), ctx.OrgID, id)
	if err != nil {
		err = errors.Wrap(err, "execute increment block usage")
		return
	}

	return
}

// DecrementUsage decrements usage counter for content block.
func (s Scope) DecrementUsage(ctx domain.RequestContext, id string) (err error) {
	stmt, err := ctx.Transaction.Preparex("UPDATE block SET used=used-1, revised=? WHERE orgid=? AND refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare decrement block usage")
		return
	}

	_, err = stmt.Exec(time.Now().UTC(), ctx.OrgID, id)
	if err != nil {
		err = errors.Wrap(err, "execute decrement block usage")
		return
	}

	return
}

// RemoveReference clears page.blockid for given blockID.
func (s Scope) RemoveReference(ctx domain.RequestContext, id string) (err error) {
	stmt, err := ctx.Transaction.Preparex("UPDATE page SET blockid='', revised=? WHERE orgid=? AND blockid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare remove block ref")
		return
	}

	_, err = stmt.Exec(time.Now().UTC(), ctx.OrgID, id)

	if err == sql.ErrNoRows {
		err = nil
	}

	if err != nil {
		err = errors.Wrap(err, "execute remove block ref")
		return
	}

	return
}

// Update updates existing reusable content block item.
func (s Scope) Update(ctx domain.RequestContext, b block.Block) (err error) {
	b.Revised = time.Now().UTC()

	var stmt *sqlx.NamedStmt
	stmt, err = ctx.Transaction.PrepareNamed("UPDATE block SET title=:title, body=:body, excerpt=:excerpt, rawbody=:rawbody, config=:config, revised=:revised WHERE orgid=:orgid AND refid=:refid")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare update block")
		return
	}

	_, err = stmt.Exec(&b)
	if err != nil {
		err = errors.Wrap(err, "execute update block")
		return
	}

	return
}

// Delete removes reusable content block from database.
func (s Scope) Delete(ctx domain.RequestContext, id string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	return b.DeleteConstrained(ctx.Transaction, "block", ctx.OrgID, id)
}
