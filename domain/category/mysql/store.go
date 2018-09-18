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

	_, err = ctx.Transaction.Exec("INSERT INTO dmz_category (c_refid, c_orgid, c_spaceid, c_name, c_created, c_revised) VALUES (?, ?, ?, ?, ?, ?)",
		c.RefID, c.OrgID, c.SpaceID, c.Name, c.Created, c.Revised)

	if err != nil {
		err = errors.Wrap(err, "unable to execute insert category")
	}

	return
}

// GetBySpace returns space categories accessible by user.
// Context is used to for user ID.
func (s Scope) GetBySpace(ctx domain.RequestContext, spaceID string) (c []category.Category, err error) {
	err = s.Runtime.Db.Select(&c, `
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_name AS name, c_created AS created, c_revised AS revised
        FROM dmz_category
		WHERE c_orgid=? AND c_spaceid=? AND c_refid IN
              (SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_location='category' AND c_refid IN
                (SELECT c_refid from dmz_permission WHERE c_orgid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0') AND c_location='category'
                UNION ALL
				SELECT p.c_refid from dmz_permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid
					WHERE p.c_orgid=? AND p.c_who='role' AND p.c_location='category' AND (r.c_userid=? OR r.c_userid='0')
		))
	  ORDER BY name`, ctx.OrgID, spaceID, ctx.OrgID, ctx.OrgID, ctx.UserID, ctx.OrgID, ctx.UserID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select categories for space %s", spaceID))
	}

	return
}

// GetAllBySpace returns all space categories.
func (s Scope) GetAllBySpace(ctx domain.RequestContext, spaceID string) (c []category.Category, err error) {
	c = []category.Category{}

	err = s.Runtime.Db.Select(&c, `
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_name AS name, c_created AS created, c_revised AS revised
        FROM dmz_category
        WHERE c_orgid=? AND c_spaceid=? AND spaceid IN
            (SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_location='space' AND c_refid IN
                (SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0') AND c_location='space' AND c_action='view'
                UNION ALL
                SELECT p.c_refid FROM dmz_permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid
                    WHERE p.c_orgid=? AND p.c_who='role' AND p.c_location='space' AND p.c_action='view' AND (r.c_userid=? OR r.c_userid='0')
		))
	  ORDER BY dmz_category`, ctx.OrgID, spaceID, ctx.OrgID, ctx.OrgID, ctx.UserID, ctx.OrgID, ctx.UserID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select all categories for space %s", spaceID))
	}

	return
}

// GetByOrg returns all categories accessible by user for their org.
func (s Scope) GetByOrg(ctx domain.RequestContext, userID string) (c []category.Category, err error) {
	err = s.Runtime.Db.Select(&c, `
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_name AS name, c_created AS created, c_revised AS revised
        FROM dmz_category
        WHERE c_orgid=? AND c_refid IN
            (SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_location='category' AND c_refid IN (
                SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0') AND c_location='category'
                UNION ALL
				SELECT p.c_refid FROM dmz_permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid
					WHERE p.c_orgid=? AND p.c_who='role' AND p.c_location='category' AND (r.c_userid=? OR r.c_userid='0')
		))
	  ORDER BY dmz_category`, ctx.OrgID, ctx.OrgID, ctx.OrgID, userID, ctx.OrgID, userID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select categories for org %s", ctx.OrgID))
	}

	return
}

// Update saves category name change.
func (s Scope) Update(ctx domain.RequestContext, c category.Category) (err error) {
	c.Revised = time.Now().UTC()

	_, err = ctx.Transaction.NamedExec("UPDATE dmz_category SET c_name=:name, c_revised=:revised WHERE c_orgid=:orgid AND c_refid=:refid", c)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute update for category %s", c.RefID))
	}

	return
}

// Get returns specified category
func (s Scope) Get(ctx domain.RequestContext, id string) (c category.Category, err error) {
	err = s.Runtime.Db.Get(&c, `
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_name AS name, c_created AS created, c_revised AS revised
        FROM dmz_category
        WHERE c_orgid=? AND c_refid=?`,
		ctx.OrgID, id)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to get category %s", id))
	}

	return
}

// Delete removes category from the store.
func (s Scope) Delete(ctx domain.RequestContext, id string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	return b.DeleteConstrained(ctx.Transaction, "dmz_category", ctx.OrgID, id)
}

// AssociateDocument inserts category membership record into the category member table.
func (s Scope) AssociateDocument(ctx domain.RequestContext, m category.Member) (err error) {
	m.Created = time.Now().UTC()
	m.Revised = time.Now().UTC()

	_, err = ctx.Transaction.Exec("INSERT INTO dmz_category_member (c_refid, c_orgid, c_categoryid, c_spaceid, docid, c_created, c_revised) VALUES (?, ?, ?, ?, ?, ?, ?)",
		m.RefID, m.OrgID, m.CategoryID, m.SpaceID, m.DocumentID, m.Created, m.Revised)

	if err != nil {
		err = errors.Wrap(err, "unable to execute insert categorymember")
	}

	return
}

// DisassociateDocument removes document associatation from category.
func (s Scope) DisassociateDocument(ctx domain.RequestContext, categoryID, documentID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	sql := fmt.Sprintf("DELETE FROM dmz_category_member WHERE c_orgid='%s' AND c_categoryid='%s' AND c_docid='%s'",
		ctx.OrgID, categoryID, documentID)

	return b.DeleteWhere(ctx.Transaction, sql)
}

// RemoveCategoryMembership removes all category associations from the store.
func (s Scope) RemoveCategoryMembership(ctx domain.RequestContext, categoryID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	sql := fmt.Sprintf("DELETE FROM dmz_category_member WHERE c_orgid='%s' AND c_categoryid='%s'",
		ctx.OrgID, categoryID)

	return b.DeleteWhere(ctx.Transaction, sql)
}

// RemoveSpaceCategoryMemberships removes all category associations from the store for the space.
func (s Scope) RemoveSpaceCategoryMemberships(ctx domain.RequestContext, spaceID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	sql := fmt.Sprintf("DELETE FROM dmz_category_member WHERE c_orgid='%s' AND c_spaceid='%s'",
		ctx.OrgID, spaceID)

	return b.DeleteWhere(ctx.Transaction, sql)
}

// RemoveDocumentCategories removes all document category associations from the store.
func (s Scope) RemoveDocumentCategories(ctx domain.RequestContext, documentID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	sql := fmt.Sprintf("DELETE FROM dmz_category_member WHERE c_orgid='%s' AND c_docid='%s'",
		ctx.OrgID, documentID)

	return b.DeleteWhere(ctx.Transaction, sql)
}

// DeleteBySpace removes all category and category associations for given space.
func (s Scope) DeleteBySpace(ctx domain.RequestContext, spaceID string) (rows int64, err error) {
	b := mysql.BaseQuery{}

	s1 := fmt.Sprintf("DELETE FROM categorymember WHERE c_orgid='%s' AND c_groupid='%s'", ctx.OrgID, spaceID)
	b.DeleteWhere(ctx.Transaction, s1)

	s2 := fmt.Sprintf("DELETE FROM dmz_category WHERE c_orgid='%s' AND c_spaceid='%s'", ctx.OrgID, spaceID)
	return b.DeleteWhere(ctx.Transaction, s2)
}

// GetSpaceCategorySummary returns number of documents and users for space categories.
func (s Scope) GetSpaceCategorySummary(ctx domain.RequestContext, spaceID string) (c []category.SummaryModel, err error) {
	c = []category.SummaryModel{}

	err = s.Runtime.Db.Select(&c, `
		SELECT 'documents' AS type, c_categoryid, COUNT(*) AS count
			FROM dmz_category_member
            WHERE c_orgid=? AND c_spaceid=?
            AND c_docid IN (
                SELECT c_refid
                FROM dmz_doc
                WHERE c_orgid=? AND c_spaceid=? AND c_lifecycle!=2 AND c_template=0 AND c_groupid=''
                UNION ALL
                SELECT d.c_refid
                    FROM (
                        SELECT c_groupid, MIN(c_versionorder) AS latestversion
                        FROM dmz_doc
                        WHERE c_orgid=? AND c_spaceid=? AND c_lifecycle!=2 AND c_groupid!='' AND c_template=0
                        GROUP BY c_groupid
                    ) AS x INNER JOIN dmz_doc AS d ON d.c_groupid=x.c_groupid AND d.c_versionorder=x.latestversion
                )
            GROUP BY c_categoryid, c_type
		UNION ALL
		SELECT 'users' AS type, c_refid AS categoryid, count(*) AS count
			FROM dmz_permission
            WHERE c_orgid=? AND c_location='category' AND c_refid IN
                (SELECT c_refid FROM dmz_category WHERE c_orgid=? AND c_spaceid=?)
			GROUP BY c_refid, c_type`,
		ctx.OrgID, spaceID,
		ctx.OrgID, spaceID, ctx.OrgID, spaceID,
		ctx.OrgID, ctx.OrgID, spaceID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("select category summary for space %s", spaceID))
	}

	return
}

// GetDocumentCategoryMembership returns all space categories associated with given document.
func (s Scope) GetDocumentCategoryMembership(ctx domain.RequestContext, documentID string) (c []category.Category, err error) {
	c = []category.Category{}

	err = s.Runtime.Db.Select(&c, `
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_name AS name, c_created AS created, c_revised AS revised
        FROM dmz_category
		WHERE c_orgid=? AND c_refid IN (SELECT c_categoryid FROM dmz_category_member WHERE c_orgid=? AND c_docid=?)`, ctx.OrgID, ctx.OrgID, documentID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select categories for document %s", documentID))
	}

	return
}

// GetSpaceCategoryMembership returns category/document associations within space.
func (s Scope) GetSpaceCategoryMembership(ctx domain.RequestContext, spaceID string) (c []category.Member, err error) {
	err = s.Runtime.Db.Select(&c, `
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_categoryid AS categoryid, c_docid AS documentid, c_created AS created, c_revised AS revised
        FROM dmz_category_member
        WHERE c_orgid=? AND c_spaceid=? AND spaceid IN
            (SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_location='space' AND c_refid IN
                (SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0') AND c_location='space' AND c_action='view'
                UNION ALL
                SELECT p.c_refid FROM dmz_permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid
                    WHERE p.c_orgid=? AND p.c_who='role' AND p.c_location='space'
					AND p.c_action='view' AND (r.c_userid=? OR r.c_userid='0')
		))
	    ORDER BY documentid`, ctx.OrgID, spaceID, ctx.OrgID, ctx.OrgID, ctx.UserID, ctx.OrgID, ctx.UserID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("select all category/document membership for space %s", spaceID))
	}

	return
}

// GetOrgCategoryMembership returns category/document associations within organization.
func (s Scope) GetOrgCategoryMembership(ctx domain.RequestContext, userID string) (c []category.Member, err error) {
	err = s.Runtime.Db.Select(&c, `
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_categoryid AS categoryid, c_docid AS documentid, c_created AS created, c_revised AS revised
        FROM dmz_category_member
        WHERE c_orgid=?  AND c_spaceid IN
            (SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_location='space' AND c_refid IN
                (SELECT c_refid from dmz_permission WHERE c_orgid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0') AND c_location='space' AND c_action='view'
                UNION ALL
				SELECT p.c_refid from dmz_permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid WHERE p.c_orgid=? AND p.c_who='role' AND p.c_location='space'
					AND p.c_action='view' AND (r.c_userid=? OR r.c_userid='0')
		))
	    ORDER BY documentid`, ctx.OrgID, ctx.OrgID, ctx.OrgID, userID, ctx.OrgID, userID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("select all category/document membership for organization %s", ctx.OrgID))
	}

	return
}
