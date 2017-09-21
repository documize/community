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

// Package mysql handles data persistence for both category definition
// and and document/category association.
package mysql

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store/mysql"
	"github.com/documize/community/model/category"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// Add inserts the given record into the category table.
func (s Scope) Add(ctx domain.RequestContext, c category.Category) (err error) {
	c.Created = time.Now().UTC()
	c.Revised = time.Now().UTC()

	stmt, err := ctx.Transaction.Preparex("INSERT INTO category (refid, orgid, labelid, category, created, revised) VALUES (?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "unable to prepare insert category")
		return
	}

	_, err = stmt.Exec(c.RefID, c.OrgID, c.LabelID, c.Category, c.Created, c.Revised)
	if err != nil {
		err = errors.Wrap(err, "unable to execute insert category")
		return
	}

	return
}

// GetBySpace returns space categories for a user.
// Context is used to for user ID.
func (s Scope) GetBySpace(ctx domain.RequestContext, spaceID string) (c []category.Category, err error) {
	err = s.Runtime.Db.Select(&c, `
		SELECT id, refid, orgid, labelid, category, created, revised FROM category
		WHERE orgid=? AND labelid=?
			  AND refid IN (SELECT refid FROM permission WHERE orgid=? AND location='category' AND refid IN (
				SELECT refid from permission WHERE orgid=? AND who='user' AND whoid=? AND location='category' UNION ALL
				SELECT p.refid from permission p LEFT JOIN rolemember r ON p.whoid=r.roleid WHERE p.orgid=? AND p.who='role' AND p.location='category' 
					AND p.action='view' AND r.userid=?
		))
	  ORDER BY category`, ctx.OrgID, spaceID, ctx.OrgID, ctx.OrgID, ctx.UserID, ctx.OrgID, ctx.UserID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select categories for space %s", spaceID))
		return
	}

	return
}

// GetAllBySpace returns all space categories.
func (s Scope) GetAllBySpace(ctx domain.RequestContext, spaceID string) (c []category.Category, err error) {
	err = s.Runtime.Db.Select(&c, `
		SELECT id, refid, orgid, labelid, category, created, revised FROM category
		WHERE orgid=? AND labelid=?
			  AND labelid IN (SELECT refid FROM permission WHERE orgid=? AND location='space' AND refid IN (
				SELECT refid from permission WHERE orgid=? AND who='user' AND whoid=? AND location='space' UNION ALL
				SELECT p.refid from permission p LEFT JOIN rolemember r ON p.whoid=r.roleid WHERE p.orgid=? AND p.who='role' AND p.location='space' 
					AND p.action='view' AND r.userid=?
		))
	  ORDER BY category`, ctx.OrgID, spaceID, ctx.OrgID, ctx.OrgID, ctx.UserID, ctx.OrgID, ctx.UserID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select all categories for space %s", spaceID))
		return
	}

	return
}

// Update saves category name change.
func (s Scope) Update(ctx domain.RequestContext, c category.Category) (err error) {
	c.Revised = time.Now().UTC()

	stmt, err := ctx.Transaction.PrepareNamed("UPDATE category SET category=:category, revised=:revised WHERE orgid=:orgid AND refid=:refid")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to prepare update for category %s", c.RefID))
		return
	}

	_, err = stmt.Exec(&c)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute update for category %s", c.RefID))
		return
	}

	return
}

// Get returns specified category
func (s Scope) Get(ctx domain.RequestContext, id string) (c category.Category, err error) {
	stmt, err := s.Runtime.Db.Preparex("SELECT id, refid, orgid, labelid, category, created, revised FROM category WHERE orgid=? AND refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to prepare select for category %s", id))
		return
	}

	err = stmt.Get(&c, ctx.OrgID, id)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to get category %s", id))
		return
	}

	return
}

// Delete removes category from the store.
func (s Scope) Delete(ctx domain.RequestContext, id string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	return b.DeleteConstrained(ctx.Transaction, "category", ctx.OrgID, id)
}

// AssociateDocument inserts category membership record into the category member table.
func (s Scope) AssociateDocument(ctx domain.RequestContext, m category.Member) (err error) {
	m.Created = time.Now().UTC()
	m.Revised = time.Now().UTC()

	stmt, err := ctx.Transaction.Preparex("INSERT INTO categorymember (refid, orgid, categoryid, labelid, documentid, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "unable to prepare insert categorymember")
		return
	}

	_, err = stmt.Exec(m.RefID, m.OrgID, m.CategoryID, m.LabelID, m.DocumentID, m.Created, m.Revised)
	if err != nil {
		err = errors.Wrap(err, "unable to execute insert categorymember")
		return
	}

	return
}

// DisassociateDocument removes document associatation from category.
func (s Scope) DisassociateDocument(ctx domain.RequestContext, categoryID, documentID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	sql := fmt.Sprintf("DELETE FROM categorymember WHERE orgid='%s' AND categoryid='%s' AND documentid='%s'",
		ctx.OrgID, categoryID, documentID)

	return b.DeleteWhere(ctx.Transaction, sql)
}

// RemoveCategoryMembership removes all category associations from the store.
func (s Scope) RemoveCategoryMembership(ctx domain.RequestContext, categoryID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	sql := fmt.Sprintf("DELETE FROM categorymember WHERE orgid='%s' AND categoryid='%s'",
		ctx.OrgID, categoryID)

	return b.DeleteWhere(ctx.Transaction, sql)
}

// DeleteBySpace removes all category and category associations for given space.
func (s Scope) DeleteBySpace(ctx domain.RequestContext, spaceID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	s1 := fmt.Sprintf("DELETE FROM categorymember WHERE orgid='%s' AND labelid='%s'", ctx.OrgID, spaceID)
	b.DeleteWhere(ctx.Transaction, s1)

	s2 := fmt.Sprintf("DELETE FROM category WHERE orgid='%s' AND labelid='%s'", ctx.OrgID, spaceID)
	return b.DeleteWhere(ctx.Transaction, s2)
}

// GetSpaceCategorySummary returns number of documents and users for space categories.
func (s Scope) GetSpaceCategorySummary(ctx domain.RequestContext, spaceID string) (c []category.SummaryModel, err error) {
	err = s.Runtime.Db.Select(&c, `
		SELECT 'documents' as type, categoryid, COUNT(*) as count FROM categorymember WHERE orgid=? AND labelid=? GROUP BY categoryid, type
		UNION ALL
		SELECT 'users' as type, refid AS categoryid, count(*) AS count FROM permission WHERE orgid=? AND who='user' AND location='category'
			AND refid IN (SELECT refid FROM category WHERE orgid=? AND labelid=?)
			GROUP BY refid, type
		UNION ALL
		SELECT 'users' as type, p.refid AS categoryid, count(*) AS count FROM rolemember r LEFT JOIN permission p ON p.whoid=r.roleid
			WHERE p.orgid=? AND p.who='role' AND p.location='category'
			AND p.refid IN (SELECT refid FROM category WHERE orgid=? AND labelid=?)
			GROUP BY p.refid, type`,
		ctx.OrgID, spaceID, ctx.OrgID, ctx.OrgID, spaceID, ctx.OrgID, ctx.OrgID, spaceID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select category summary for space %s", spaceID))
		return
	}

	return
}
