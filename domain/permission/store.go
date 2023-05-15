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

package permission

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/permission"
	"github.com/documize/community/model/user"
	"github.com/pkg/errors"
)

// Store provides data access to user permission information.
type Store struct {
	store.Context
	store.PermissionStorer
}

// AddPermission inserts the given record into the permisssion table.
func (s Store) AddPermission(ctx domain.RequestContext, r permission.Permission) (err error) {
	r.Created = time.Now().UTC()

	_, err = ctx.Transaction.Exec(s.Bind(`INSERT INTO dmz_permission
        (c_orgid, c_who, c_whoid, c_action, c_scope, c_location, c_refid, c_created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`),
		r.OrgID, string(r.Who), r.WhoID, string(r.Action), string(r.Scope), string(r.Location), r.RefID, r.Created)

	if err != nil {
		err = errors.Wrap(err, "unable to execute insert permission")
	}

	return
}

// AddPermissions inserts records into permission database table, one per action.
func (s Store) AddPermissions(ctx domain.RequestContext, r permission.Permission, actions ...permission.Action) (err error) {
	for _, a := range actions {
		r.Action = a

		err := s.AddPermission(ctx, r)
		if err != nil {
			return err
		}
	}

	return
}

// GetUserSpacePermissions returns space permissions for user.
// Context is used to for userID because must match by userID
// or everyone ID of 0.
func (s Store) GetUserSpacePermissions(ctx domain.RequestContext, spaceID string) (r []permission.Permission, err error) {
	r = []permission.Permission{}

	err = s.Runtime.Db.Select(&r, s.Bind(`
        SELECT id, c_orgid AS orgid, c_who AS who, c_whoid AS whoid, c_action AS action,
            c_scope AS scope, c_location AS location, c_refid AS refid
			FROM dmz_permission
			WHERE c_orgid=? AND c_location='space' AND c_refid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0')
		UNION ALL
		SELECT p.id, p.c_orgid AS orgid, p.c_who AS who, p.c_whoid AS whoid, p.c_action AS action, p.c_scope AS scope, p.c_location AS location, p.c_refid AS refid
			FROM dmz_permission p
			LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid
			WHERE p.c_orgid=? AND p.c_location='space' AND c_refid=? AND p.c_who='role' AND (r.c_userid=? OR r.c_userid='0')`),
		ctx.OrgID, spaceID, ctx.UserID, ctx.OrgID, spaceID, ctx.UserID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select user permissions %s", ctx.UserID))
	}

	return
}

// GetSpacePermissionsForUser returns space permissions for specified user.
func (s Store) GetSpacePermissionsForUser(ctx domain.RequestContext, spaceID, userID string) (r []permission.Permission, err error) {
	r = []permission.Permission{}

	err = s.Runtime.Db.Select(&r, s.Bind(`
		SELECT id, c_orgid AS orgid, c_who AS who, c_whoid AS whoid, c_action AS action, c_scope AS scope, c_location AS location, c_refid AS refid
        FROM dmz_permission
        WHERE c_orgid=? AND c_location='space' AND c_refid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0')
		UNION ALL
		SELECT p.id, p.c_orgid AS orgid, p.c_who AS who, p.c_whoid AS whoid, p.c_action AS action, p.c_scope AS scope, p.c_location AS location, p.c_refid AS refid
        FROM dmz_permission p
        LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid
		WHERE p.c_orgid=? AND p.c_location='space' AND c_refid=? AND p.c_who='role' AND (r.c_userid=? OR r.c_userid='0')`),
		ctx.OrgID, spaceID, userID, ctx.OrgID, spaceID, userID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select user permissions %s", userID))
	}

	return
}

// GetSpacePermissions returns space permissions for all users.
// We do not filter by userID because we return permissions for all users.
func (s Store) GetSpacePermissions(ctx domain.RequestContext, spaceID string) (r []permission.Permission, err error) {
	r = []permission.Permission{}

	err = s.Runtime.Db.Select(&r, s.Bind(`
        SELECT id, c_orgid AS orgid, c_who AS who, c_whoid AS whoid, c_action AS action, c_scope AS scope, c_location AS location, c_refid AS refid
        FROM dmz_permission
        WHERE c_orgid=? AND c_location='space' AND c_refid=?`),
		ctx.OrgID, spaceID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select space permissions %s", ctx.UserID))
	}

	return
}

// GetCategoryPermissions returns category permissions for all users.
func (s Store) GetCategoryPermissions(ctx domain.RequestContext, catID string) (r []permission.Permission, err error) {
	r = []permission.Permission{}

	err = s.Runtime.Db.Select(&r, s.Bind(`
        SELECT id, c_orgid AS orgid, c_who AS who, c_whoid AS whoid, c_action AS action, c_scope AS scope, c_location AS location, c_refid AS refid
        FROM dmz_permission
        WHERE c_orgid=? AND c_location='category' AND c_who='user' AND (c_refid=? OR c_refid='0')
		UNION ALL
        SELECT p.id, p.c_orgid AS orgid, p.c_who AS who, p.c_whoid AS whoid, p.c_action AS action, p.c_scope AS scope, p.c_location AS location, p.c_refid AS refid
        FROM dmz_permission p
        LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid
        WHERE p.c_orgid=? AND p.c_location='category' AND p.c_who='role' AND (p.c_refid=? OR p.c_refid='0')`),
		ctx.OrgID, catID, ctx.OrgID, catID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select category permissions %s", catID))
	}

	return
}

// GetCategoryUsers returns space permissions for all users.
func (s Store) GetCategoryUsers(ctx domain.RequestContext, catID string) (u []user.User, err error) {
	u = []user.User{}

	err = s.Runtime.Db.Select(&u, s.Bind(`
		SELECT u.id, COALESCE(u.c_refid, '') AS refid, COALESCE(u.c_firstname, '') AS firstname, COALESCE(u.c_lastname, '') as lastname, u.email AS email, u.initials AS initials, u.password AS password, u.salt AS salt, u.c_reset AS reset, u.c_created AS created, u.c_revised AS revised
        FROM dmz_user u
        LEFT JOIN dmz_user_account a ON u.c_refid = a.c_userid
		WHERE a.c_orgid=? AND a.c_active=`+s.IsTrue()+` AND u.c_refid IN (
			SELECT c_whoid from dmz_permission
			WHERE c_orgid=? AND c_who='user' AND c_location='category' AND c_refid=?
			UNION ALL
			SELECT r.c_userid from dmz_group_member r
				LEFT JOIN dmz_permission p ON p.c_whoid=r.c_groupid
				WHERE p.c_orgid=? AND p.c_who='role' AND p.c_location='category' AND p.c_refid=?
		)
		GROUP by u.id
		ORDER BY firstname, lastname`),
		ctx.OrgID, ctx.OrgID, catID, ctx.OrgID, catID)

	if err == sql.ErrNoRows {
		err = nil
		u = []user.User{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select users for category %s", catID))
	}

	return
}

// GetUserCategoryPermissions returns category permissions for given user.
func (s Store) GetUserCategoryPermissions(ctx domain.RequestContext, userID string) (r []permission.Permission, err error) {
	r = []permission.Permission{}

	err = s.Runtime.Db.Select(&r, s.Bind(`
        SELECT id, c_orgid AS orgid, c_who AS who, c_whoid AS whoid, c_action AS action, c_scope AS scope, c_location AS location, c_refid AS refid
        FROM dmz_permission
        WHERE c_orgid=? AND c_location='category' AND c_who='user' AND (c_whoid=? OR c_whoid='0')
        UNION ALL
        SELECT p.id, p.c_orgid AS orgid, p.c_who AS who, p.c_whoid AS whoid, p.c_action AS action, p.c_scope AS scope, p.c_location AS location, p.c_refid AS refid
        FROM dmz_permission p
        LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid
        WHERE p.c_orgid=? AND p.c_location='category' AND p.c_who='role' AND (r.c_userid=? OR r.c_userid='0')`),
		ctx.OrgID, userID, ctx.OrgID, userID)

	if err == sql.ErrNoRows {
		err = nil
		r = []permission.Permission{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select category permissions for user %s", userID))
	}

	return
}

// GetUserDocumentPermissions returns document permissions for user.
// Context is used to for user ID.
func (s Store) GetUserDocumentPermissions(ctx domain.RequestContext, documentID string) (r []permission.Permission, err error) {
	err = s.Runtime.Db.Select(&r, s.Bind(`
        SELECT id, c_orgid AS orgid, c_who AS who, c_whoid AS whoid, c_action AS action, c_scope AS scope, c_location AS location, c_refid AS refid
        FROM dmz_permission
        WHERE c_orgid=? AND c_location='document' AND c_refid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0')
		UNION ALL
        SELECT p.id, p.c_orgid AS orgid, p.c_who AS who, p.c_whoid AS whoid, p.c_action AS action, p.c_scope AS scope, p.c_location AS location, p.c_refid AS refid
        FROM dmz_permission p
        LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid
        WHERE p.c_orgid=? AND p.c_location='document' AND p.c_refid=? AND p.c_who='role' AND (r.c_userid=? OR r.c_userid='0')`),
		ctx.OrgID, documentID, ctx.UserID, ctx.OrgID, documentID, ctx.OrgID)

	if err == sql.ErrNoRows {
		err = nil
		r = []permission.Permission{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select user document permissions %s", ctx.UserID))
	}

	return
}

// GetDocumentPermissions returns documents permissions for all users.
// We do not filter by userID because we return permissions for all users.
func (s Store) GetDocumentPermissions(ctx domain.RequestContext, documentID string) (r []permission.Permission, err error) {
	err = s.Runtime.Db.Select(&r, s.Bind(`
        SELECT id, c_orgid AS orgid, c_who AS who, c_whoid AS whoid, c_action AS action, c_scope AS scope, c_location AS location, c_refid AS refid
        FROM dmz_permission
        WHERE c_orgid=? AND c_location='document' AND c_refid=? AND c_who='user'
		UNION ALL
        SELECT p.id, p.c_orgid AS orgid, p.c_who AS who, p.c_whoid AS whoid, p.c_action AS action, p.c_scope AS scope, p.c_location AS location, p.c_refid AS refid
        FROM dmz_permission p
        LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid
        WHERE p.c_orgid=? AND p.c_location='document' AND p.c_refid=? AND p.c_who='role'`),
		ctx.OrgID, documentID, ctx.OrgID, documentID)

	if err == sql.ErrNoRows {
		err = nil
		r = []permission.Permission{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select document permissions %s", ctx.UserID))
	}

	return
}

// DeleteDocumentPermissions removes records from dmz_permissions table for given document.
func (s Store) DeleteDocumentPermissions(ctx domain.RequestContext, documentID string) (rows int64, err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_permission WHERE c_orgid=? AND c_location='document' AND c_refid=?"),
		ctx.OrgID, documentID)

	return
}

// DeleteSpacePermissions removes records from dmz_permissions table for given space ID.
func (s Store) DeleteSpacePermissions(ctx domain.RequestContext, spaceID string) (rows int64, err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_permission WHERE c_orgid=? AND c_location='space' AND c_refid=?"),
		ctx.OrgID, spaceID)

	return
}

// DeleteUserSpacePermissions removes all roles for the specified user, for the specified space.
func (s Store) DeleteUserSpacePermissions(ctx domain.RequestContext, spaceID, userID string) (rows int64, err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_permission WHERE c_orgid=? AND c_location='space' AND c_refid=? AND c_who='user' AND c_whoid=?"),
		ctx.OrgID, spaceID, userID)

	return
}

// DeleteUserPermissions removes all roles for the specified user, for the specified space.
func (s Store) DeleteUserPermissions(ctx domain.RequestContext, userID string) (rows int64, err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_permission WHERE c_orgid=? AND c_who='user' AND c_whoid=?"),
		ctx.OrgID, userID)

	return
}

// DeleteCategoryPermissions removes records from dmz_permissions table for given category ID.
func (s Store) DeleteCategoryPermissions(ctx domain.RequestContext, categoryID string) (rows int64, err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_permission WHERE c_orgid=? AND c_location='category' AND c_refid=?"),
		ctx.OrgID, categoryID)

	return
}

// DeleteSpaceCategoryPermissions removes all category permission for for given space.
func (s Store) DeleteSpaceCategoryPermissions(ctx domain.RequestContext, spaceID string) (rows int64, err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_permission WHERE c_orgid=? AND c_location='category' AND c_refid IN (SELECT c_refid FROM dmz_category WHERE c_orgid=? AND c_spaceid=?)"),
		ctx.OrgID, ctx.OrgID, spaceID)

	return
}

// DeleteGroupPermissions removes all roles for the specified group
func (s Store) DeleteGroupPermissions(ctx domain.RequestContext, groupID string) (rows int64, err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_permission WHERE c_orgid=? AND c_who='role' AND c_whoid=?"),
		ctx.OrgID, groupID)

	return
}
