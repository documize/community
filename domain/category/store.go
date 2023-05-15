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

package category

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/category"
	"github.com/pkg/errors"
)

// Store provides data access to space category information.
type Store struct {
	store.Context
	store.CategoryStorer
}

// Add inserts the given record into the category table.
func (s Store) Add(ctx domain.RequestContext, c category.Category) (err error) {
	c.Created = time.Now().UTC()
	c.Revised = time.Now().UTC()

	_, err = ctx.Transaction.Exec(s.Bind("INSERT INTO dmz_category (c_refid, c_orgid, c_spaceid, c_name, c_default, c_created, c_revised) VALUES (?, ?, ?, ?, ?, ?, ?)"),
		c.RefID, c.OrgID, c.SpaceID, c.Name, c.IsDefault, c.Created, c.Revised)

	if err != nil {
		err = errors.Wrap(err, "unable to execute insert category")
	}

	return
}

// GetBySpace returns space categories accessible by user.
// Context is used to for user ID.
func (s Store) GetBySpace(ctx domain.RequestContext, spaceID string) (c []category.Category, err error) {
	err = s.Runtime.Db.Select(&c, s.Bind(`
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_name AS name, c_default AS isdefault, c_created AS created, c_revised AS revised
        FROM dmz_category
		WHERE c_orgid=? AND c_spaceid=? AND c_refid IN
            (
                SELECT c_refid
                    FROM dmz_permission
                    WHERE c_orgid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0') AND c_location='category'
                UNION ALL
                SELECT p.c_refid
                    FROM dmz_permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid
                    WHERE p.c_orgid=? AND p.c_who='role' AND p.c_location='category' AND (r.c_userid=? OR r.c_userid='0')
		    )
        ORDER BY name`),
		ctx.OrgID, spaceID, ctx.OrgID, ctx.UserID, ctx.OrgID, ctx.UserID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select categories for space %s", spaceID))
	}

	return
}

// GetAllBySpace returns all space categories.
func (s Store) GetAllBySpace(ctx domain.RequestContext, spaceID string) (c []category.Category, err error) {
	c = []category.Category{}

	err = s.Runtime.Db.Select(&c, s.Bind(`
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_name AS name, c_default AS isdefault, c_created AS created, c_revised AS revised
        FROM dmz_category
        WHERE c_orgid=? AND c_spaceid=? AND c_spaceid IN
            (
                SELECT c_refid
                    FROM dmz_permission
                    WHERE c_orgid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0') AND c_location='space' AND c_action='view'
                UNION ALL
                SELECT p.c_refid
                    FROM dmz_permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid
                    WHERE p.c_orgid=? AND p.c_who='role' AND p.c_location='space' AND p.c_action='view' AND (r.c_userid=? OR r.c_userid='0')
		    )
        ORDER BY c_name`),
		ctx.OrgID, spaceID, ctx.OrgID, ctx.UserID, ctx.OrgID, ctx.UserID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select all categories for space %s", spaceID))
	}

	return
}

// GetByOrg returns all categories accessible by user for their org.
func (s Store) GetByOrg(ctx domain.RequestContext, userID string) (c []category.Category, err error) {
	err = s.Runtime.Db.Select(&c, s.Bind(`
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_name AS name, c_default AS isdefault, c_created AS created, c_revised AS revised
        FROM dmz_category
        WHERE c_orgid=? AND c_refid IN
            (SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_location='category' AND c_refid IN (
                SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0') AND c_location='category'
                UNION ALL
				SELECT p.c_refid FROM dmz_permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid
					WHERE p.c_orgid=? AND p.c_who='role' AND p.c_location='category' AND (r.c_userid=? OR r.c_userid='0')
		))
        ORDER BY c_name`),
		ctx.OrgID, ctx.OrgID, ctx.OrgID, userID, ctx.OrgID, userID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select categories for org %s", ctx.OrgID))
	}

	return
}

// Update saves category name change.
func (s Store) Update(ctx domain.RequestContext, c category.Category) (err error) {
	c.Revised = time.Now().UTC()

	_, err = ctx.Transaction.NamedExec(s.Bind("UPDATE dmz_category SET c_name=:name, c_default=:isdefault, c_revised=:revised WHERE c_orgid=:orgid AND c_refid=:refid"), c)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute update for category %s", c.RefID))
	}

	return
}

// Get returns specified category
func (s Store) Get(ctx domain.RequestContext, id string) (c category.Category, err error) {
	err = s.Runtime.Db.Get(&c, s.Bind(`
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_name AS name, c_default AS isdefault, c_created AS created, c_revised AS revised
        FROM dmz_category
        WHERE c_orgid=? AND c_refid=?`),
		ctx.OrgID, id)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to get category %s", id))
	}

	return
}

// Delete removes category from the store.
func (s Store) Delete(ctx domain.RequestContext, id string) (rows int64, err error) {
	return s.DeleteConstrained(ctx.Transaction, "dmz_category", ctx.OrgID, id)
}

// AssociateDocument inserts category membership record into the category member table.
func (s Store) AssociateDocument(ctx domain.RequestContext, m category.Member) (err error) {
	m.Created = time.Now().UTC()
	m.Revised = time.Now().UTC()

	_, err = ctx.Transaction.Exec(s.Bind("INSERT INTO dmz_category_member (c_refid, c_orgid, c_categoryid, c_spaceid, c_docid, c_created, c_revised) VALUES (?, ?, ?, ?, ?, ?, ?)"),
		m.RefID, m.OrgID, m.CategoryID, m.SpaceID, m.DocumentID, m.Created, m.Revised)

	if err != nil {
		err = errors.Wrap(err, "unable to execute insert categorymember")
	}

	return
}

// DisassociateDocument removes document associatation from category.
func (s Store) DisassociateDocument(ctx domain.RequestContext, categoryID, documentID string) (rows int64, err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_category_member WHERE c_orgid=? AND c_categoryid=? AND c_docid=?"),
		ctx.OrgID, categoryID, documentID)

	if err == sql.ErrNoRows {
		err = nil
	}

	return
}

// RemoveCategoryMembership removes all category associations from the store.
func (s Store) RemoveCategoryMembership(ctx domain.RequestContext, categoryID string) (rows int64, err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_category_member WHERE c_orgid=? AND c_categoryid=?"),
		ctx.OrgID, categoryID)

	if err == sql.ErrNoRows {
		err = nil
	}

	return
}

// RemoveSpaceCategoryMemberships removes all category associations from the store for the space.
func (s Store) RemoveSpaceCategoryMemberships(ctx domain.RequestContext, spaceID string) (rows int64, err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_category_member WHERE c_orgid=? AND c_spaceid=?"),
		ctx.OrgID, spaceID)

	if err == sql.ErrNoRows {
		err = nil
	}

	return
}

// RemoveDocumentCategories removes all document category associations from the store.
func (s Store) RemoveDocumentCategories(ctx domain.RequestContext, documentID string) (rows int64, err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_category_member WHERE c_orgid=? AND c_docid=?"),
		ctx.OrgID, documentID)

	if err == sql.ErrNoRows {
		err = nil
	}

	return
}

// DeleteBySpace removes all category and category associations for given space.
func (s Store) DeleteBySpace(ctx domain.RequestContext, spaceID string) (rows int64, err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_category_member WHERE c_orgid=? AND c_spaceid=?"),
		ctx.OrgID, spaceID)

	if err == sql.ErrNoRows {
		err = nil
	}

	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_category WHERE c_orgid=? AND c_spaceid=?"),
		ctx.OrgID, spaceID)

	if err == sql.ErrNoRows {
		err = nil
	}

	return
}

// GetSpaceCategorySummary returns number of documents and users for space categories.
func (s Store) GetSpaceCategorySummary(ctx domain.RequestContext, spaceID string) (c []category.SummaryModel, err error) {
	c = []category.SummaryModel{}

	err = s.Runtime.Db.Select(&c, s.Bind(`
		SELECT 'documents' AS grouptype, c_categoryid AS categoryid, COUNT(*) AS count
			FROM dmz_category_member
            WHERE c_orgid=? AND c_spaceid=?
            AND c_docid IN (
                SELECT c_refid
                FROM dmz_doc
                WHERE c_orgid=? AND c_spaceid=? AND c_lifecycle!=2 AND c_template=`+s.IsFalse()+` AND c_groupid=''
                UNION ALL
                SELECT d.c_refid
                    FROM (
                        SELECT c_groupid, MIN(c_versionorder) AS latestversion
                        FROM dmz_doc
                        WHERE c_orgid=? AND c_spaceid=? AND c_lifecycle!=2 AND c_groupid!='' AND c_template=`+s.IsFalse()+`
                        GROUP BY c_groupid
                    ) AS x INNER JOIN dmz_doc AS d ON d.c_groupid=x.c_groupid AND d.c_versionorder=x.latestversion
                )
            GROUP BY c_categoryid
		UNION ALL
		SELECT 'users' AS grouptype, c_refid AS categoryid, count(*) AS count
			FROM dmz_permission
            WHERE c_orgid=? AND c_location='category' AND c_refid IN
                (SELECT c_refid FROM dmz_category WHERE c_orgid=? AND c_spaceid=?)
			GROUP BY c_refid`),
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
func (s Store) GetDocumentCategoryMembership(ctx domain.RequestContext, documentID string) (c []category.Category, err error) {
	err = s.Runtime.Db.Select(&c, s.Bind(`
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_name AS name, c_default AS isdefault, c_created AS created, c_revised AS revised
        FROM dmz_category
        WHERE c_orgid=? AND c_refid IN (SELECT c_categoryid FROM dmz_category_member WHERE c_orgid=? AND c_docid=?)`),
		ctx.OrgID, ctx.OrgID, documentID)

	if err == sql.ErrNoRows {
		err = nil
		c = []category.Category{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select categories for document %s", documentID))
	}

	return
}

// GetSpaceCategoryMembership returns category/document associations within space,
// for specified user.
func (s Store) GetSpaceCategoryMembership(ctx domain.RequestContext, spaceID string) (c []category.Member, err error) {
	err = s.Runtime.Db.Select(&c, s.Bind(`
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_categoryid AS categoryid, c_docid AS documentid, c_created AS created, c_revised AS revised
        FROM dmz_category_member
        WHERE c_orgid=? AND c_spaceid=? AND c_spaceid IN
            (
                SELECT c_refid
                    FROM dmz_permission
                    WHERE c_orgid=? AND c_who='user'
                    AND (c_whoid=? OR c_whoid='0') AND c_location='space' AND c_action='view'
                UNION ALL
                SELECT p.c_refid
                    FROM dmz_permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid
                    WHERE p.c_orgid=? AND p.c_who='role' AND p.c_location='space'
                    AND p.c_action='view' AND (r.c_userid=? OR r.c_userid='0')
		    )
        ORDER BY documentid`),
		ctx.OrgID, spaceID, ctx.OrgID, ctx.UserID, ctx.OrgID, ctx.UserID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("select all category/document membership for space %s", spaceID))
	}

	return
}

// GetOrgCategoryMembership returns category/document associations within organization.
func (s Store) GetOrgCategoryMembership(ctx domain.RequestContext, userID string) (c []category.Member, err error) {
	err = s.Runtime.Db.Select(&c, s.Bind(`
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_categoryid AS categoryid, c_docid AS documentid, c_created AS created, c_revised AS revised
        FROM dmz_category_member
        WHERE c_orgid=? AND c_spaceid IN
            (
                SELECT c_refid
                    FROM dmz_permission
                        WHERE c_orgid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0') AND c_location='space' AND c_action='view'
                UNION ALL
                SELECT p.c_refid
                    FROM dmz_permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid
                    WHERE p.c_orgid=? AND p.c_who='role' AND p.c_location='space' AND p.c_action='view' AND (r.c_userid=? OR r.c_userid='0')
    		)
        ORDER BY documentid`),
		ctx.OrgID, ctx.OrgID, userID, ctx.OrgID, userID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("select all category/document membership for organization %s", ctx.OrgID))
	}

	return
}
