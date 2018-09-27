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

// Add adds new folder into the store.
func (s Store) Add(ctx domain.RequestContext, sp space.Space) (err error) {
	sp.UserID = ctx.UserID
	sp.Created = time.Now().UTC()
	sp.Revised = time.Now().UTC()

	_, err = ctx.Transaction.Exec(s.Bind("INSERT INTO dmz_space (c_refid, c_name, c_orgid, c_userid, c_type, c_lifecycle, c_likes, c_created, c_revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"),
		sp.RefID, sp.Name, sp.OrgID, sp.UserID, sp.Type, sp.Lifecycle, sp.Likes, sp.Created, sp.Revised)

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

// GetAll for admin users!
func (s Store) GetAll(ctx domain.RequestContext) (sp []space.Space, err error) {
	qry := s.Bind(`SELECT id, c_refid AS refid,
        c_name AS name, c_orgid AS orgid, c_userid AS userid,
        c_type AS type, c_lifecycle AS lifecycle, c_likes AS likes,
        c_created AS created, c_revised AS revised
    FROM dmz_space
    WHERE c_orgid=?
	ORDER BY c_name`)

	err = s.Runtime.Db.Select(&sp, qry, ctx.OrgID)

	if err == sql.ErrNoRows {
		err = nil
		sp = []space.Space{}
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed space.GetAll org %s", ctx.OrgID))
	}

	return
}

// Update saves space changes.
func (s Store) Update(ctx domain.RequestContext, sp space.Space) (err error) {
	sp.Revised = time.Now().UTC()

	_, err = ctx.Transaction.NamedExec("UPDATE dmz_space SET c_name=:name, c_type=:type, c_lifecycle=:lifecycle, c_userid=:userid, c_likes=:likes, c_revised=:revised WHERE c_orgid=:orgid AND c_refid=:refid", &sp)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute update for space %s", sp.RefID))
	}

	return
}

// Delete removes space from the store.
func (s Store) Delete(ctx domain.RequestContext, id string) (rows int64, err error) {
	return s.DeleteConstrained(ctx.Transaction, "dmz_space", ctx.OrgID, id)
}
