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

package space

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/space"
	"github.com/pkg/errors"
)

// Store provides data access to space information.
type Store struct {
	store.Context
	store.SpaceStorer
}

// Add adds new space into the store.
func (s Store) Add(ctx domain.RequestContext, sp space.Space) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind(`
        INSERT INTO dmz_space
            (c_refid, c_name, c_orgid, c_userid, c_type, c_lifecycle,
            c_likes, c_icon, c_desc, c_count_category, c_count_content,
            c_labelid, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
		sp.RefID, sp.Name, sp.OrgID, sp.UserID, sp.Type, sp.Lifecycle, sp.Likes,
		sp.Icon, sp.Description, sp.CountCategory, sp.CountContent, sp.LabelID,
		sp.Created, sp.Revised)

	if err != nil {
		err = errors.Wrap(err, "unable to execute insert for space")
	}

	return
}

// Get returns a space from the store.
func (s Store) Get(ctx domain.RequestContext, id string) (sp space.Space, err error) {
	err = s.Runtime.Db.Get(&sp, s.Bind(`SELECT id, c_refid AS refid,
        c_name AS name, c_orgid AS orgid, c_userid AS userid,
        c_type AS type, c_lifecycle AS lifecycle, c_likes AS likes,
        c_icon AS icon, c_labelid AS labelid, c_desc AS description,
        c_count_category As countcategory, c_count_content AS countcontent,
        c_created AS created, c_revised AS revised
        FROM dmz_space
        WHERE c_orgid=? and c_refid=?`),
		ctx.OrgID, id)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute select for space %s", id))
	}

	return
}

// PublicSpaces returns spaces that anyone can see.
func (s Store) PublicSpaces(ctx domain.RequestContext, orgID string) (sp []space.Space, err error) {
	qry := s.Bind(`SELECT id, c_refid AS refid,
        c_name AS name, c_orgid AS orgid, c_userid AS userid,
        c_type AS type, c_lifecycle AS lifecycle, c_likes AS likes,
        c_icon AS icon, c_labelid AS labelid, c_desc AS description,
        c_count_category AS countcategory, c_count_content AS countcontent,
        c_created AS created, c_revised AS revised
        FROM dmz_space
        WHERE c_orgid=? AND c_type=1`)

	err = s.Runtime.Db.Select(&sp, qry, orgID)

	if err == sql.ErrNoRows {
		err = nil
		sp = []space.Space{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("Unable to execute GetPublicFolders for org %s", orgID))
	}

	return
}

// GetViewable returns spaces that the user can see.
// Also handles which spaces can be seen by anonymous users.
func (s Store) GetViewable(ctx domain.RequestContext) (sp []space.Space, err error) {
	q := s.Bind(`SELECT id, c_refid AS refid,
        c_name AS name, c_orgid AS orgid, c_userid AS userid,
        c_type AS type, c_lifecycle AS lifecycle, c_likes AS likes,
        c_icon AS icon, c_labelid AS labelid, c_desc AS description,
        c_count_category AS countcategory, c_count_content AS countcontent,
        c_created AS created, c_revised AS revised
    FROM dmz_space
	WHERE c_orgid=? AND c_refid IN
        (SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_location='space' AND c_refid IN
            (SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0') AND c_location='space' AND c_action='view'
            UNION ALL
		    SELECT p.c_refid from dmz_permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid WHERE p.c_orgid=? AND p.c_who='role'
            AND p.c_location='space' AND p.c_action='view' AND (r.c_userid=? OR r.c_userid='0')
            )
	    )
	ORDER BY c_name`)

	err = s.Runtime.Db.Select(&sp, q,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.UserID,
		ctx.OrgID,
		ctx.UserID)

	if err == sql.ErrNoRows {
		err = nil
		sp = []space.Space{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed space.GetViewable org %s", ctx.OrgID))
	}

	return
}

// AdminList returns all shared spaces and orphaned spaces that have no owner.
func (s Store) AdminList(ctx domain.RequestContext) (sp []space.Space, err error) {
	qry := s.Bind(`
        SELECT id, c_refid AS refid,
        c_name AS name, c_orgid AS orgid, c_userid AS userid,
        c_type AS type, c_lifecycle AS lifecycle, c_likes AS likes,
        c_created AS created, c_revised AS revised,
        c_icon AS icon, c_labelid AS labelid, c_desc AS description,
        c_count_category AS countcategory, c_count_content AS countcontent
        FROM dmz_space
        WHERE c_orgid=? AND (c_type=? OR c_type=?)
        UNION ALL
        SELECT id, c_refid AS refid,
        c_name AS name, c_orgid AS orgid, c_userid AS userid,
        c_type AS type, c_lifecycle AS lifecycle, c_likes AS likes,
        c_created AS created, c_revised AS revised,
        c_icon AS icon, c_labelid AS labelid, c_desc AS description,
        c_count_category AS countcategory, c_count_content AS countcontent
        FROM dmz_space
        WHERE c_orgid=? AND (c_type=? OR c_type=?) AND c_refid NOT IN
        (SELECT c_refid FROM dmz_permission WHERE c_orgid=? AND c_action='own')
        ORDER BY name`)

	err = s.Runtime.Db.Select(&sp, qry,
		ctx.OrgID, space.ScopePublic, space.ScopeRestricted,
		ctx.OrgID, space.ScopePublic, space.ScopeRestricted,
		ctx.OrgID)
	if err == sql.ErrNoRows {
		err = nil
		sp = []space.Space{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed space.AdminList org %s", ctx.OrgID))
	}

	return
}

// Update saves space changes.
func (s Store) Update(ctx domain.RequestContext, sp space.Space) (err error) {
	sp.Revised = time.Now().UTC()

	_, err = ctx.Transaction.NamedExec(`
        UPDATE dmz_space
            SET c_name=:name, c_type=:type, c_lifecycle=:lifecycle, c_userid=:userid,
            c_likes=:likes, c_desc=:description, c_labelid=:labelid, c_icon=:icon,
            c_count_category=:countcategory, c_count_content=:countcontent,
            c_revised=:revised
            WHERE c_orgid=:orgid AND c_refid=:refid`, &sp)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute update for space %s", sp.RefID))
	}

	return
}

// Delete removes space from the store.
func (s Store) Delete(ctx domain.RequestContext, id string) (rows int64, err error) {
	return s.DeleteConstrained(ctx.Transaction, "dmz_space", ctx.OrgID, id)
}

// SetStats updates the number of category/documents in space.
func (s Store) SetStats(ctx domain.RequestContext, spaceID string) (err error) {
	tx, err := s.Runtime.Db.Beginx()
	if err != nil {
		s.Runtime.Log.Error("transaction", err)
		return
	}

	var docs, cats int
	f := s.IsFalse()
	row := s.Runtime.Db.QueryRow(s.Bind("SELECT COUNT(*) FROM dmz_doc WHERE c_orgid=? AND c_spaceid=? AND c_lifecycle=1 AND c_template="+f),
		ctx.OrgID, spaceID)
	err = row.Scan(&docs)
	if err == sql.ErrNoRows {
		docs = 0
	}
	if err != nil {
		s.Runtime.Log.Error("SetStats", err)
		docs = 0
	}

	row = s.Runtime.Db.QueryRow(s.Bind("SELECT COUNT(*) FROM dmz_category WHERE c_orgid=? AND c_spaceid=?"),
		ctx.OrgID, spaceID)
	err = row.Scan(&cats)
	if err == sql.ErrNoRows {
		cats = 0
	}
	if err != nil {
		s.Runtime.Log.Error("SetStats", err)
		cats = 0
	}

	_, err = tx.Exec(s.Bind(`UPDATE dmz_space SET
		c_count_content=?, c_count_category=?, c_revised=?
		WHERE c_orgid=? AND c_refid=?`),
		docs, cats, time.Now().UTC(), ctx.OrgID, spaceID)

	if err != nil {
		s.Runtime.Log.Error("SetStats", err)
		tx.Rollback()
	}

	tx.Commit()

	return
}
