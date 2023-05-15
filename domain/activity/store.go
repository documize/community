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

package activity

import (
	"database/sql"
	"time"

	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/activity"
	"github.com/pkg/errors"
)

// Store provides data access to user activity information.
type Store struct {
	store.Context
	store.ActivityStorer
}

// RecordUserActivity logs user initiated data changes.
func (s Store) RecordUserActivity(ctx domain.RequestContext, activity activity.UserActivity) {
	activity.OrgID = ctx.OrgID
	activity.UserID = ctx.UserID
	activity.Created = time.Now().UTC()

	_, err := ctx.Transaction.Exec(s.Bind("INSERT INTO dmz_user_activity (c_orgid, c_userid, c_spaceid, c_docid, c_sectionid, c_sourcetype, c_activitytype, c_metadata, c_created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"),
		activity.OrgID, activity.UserID, activity.SpaceID, activity.DocumentID, activity.SectionID, activity.SourceType, activity.ActivityType, activity.Metadata, activity.Created)

	if err != nil {
		s.Runtime.Log.Error("execute record user activity", err)
	}

	return
}

// GetDocumentActivity returns the metadata for a specified document.
func (s Store) GetDocumentActivity(ctx domain.RequestContext, id string) (a []activity.DocumentActivity, err error) {
	qry := s.Bind(`SELECT a.id, a.c_created AS created, a.c_orgid AS orgid,
        COALESCE(a.c_userid, '') AS userid, a.c_spaceid AS spaceid,
        a.c_docid AS documentid, a.c_sectionid AS sectionid, a.c_activitytype AS activitytype,
        a.c_metadata AS metadata,
		COALESCE(u.c_firstname, 'Anonymous') AS firstname, COALESCE(u.c_lastname, 'Viewer') AS lastname,
		COALESCE(p.c_name, '') AS sectionname
		FROM dmz_user_activity a
		LEFT JOIN dmz_user u ON a.c_userid=u.c_refid
		LEFT JOIN dmz_section p ON a.c_sectionid=p.c_refid
		WHERE a.c_orgid=? AND a.c_docid=?
		AND a.c_userid != '0' AND a.c_userid != ''
		ORDER BY a.c_created DESC`)

	err = s.Runtime.Db.Select(&a, qry, ctx.OrgID, id)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, "select document user activity")
	}

	if len(a) == 0 {
		a = []activity.DocumentActivity{}
	}

	return
}

// DeleteDocumentChangeActivity removes all entries for document changes (add, remove, update).
func (s Store) DeleteDocumentChangeActivity(ctx domain.RequestContext, documentID string) (rows int64, err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_user_activity WHERE c_orgid=? AND c_docid=? AND (c_activitytype=1 OR c_activitytype=2 OR c_activitytype=3 OR c_activitytype=4 OR c_activitytype=7)"), ctx.OrgID, documentID)
	if err == sql.ErrNoRows {
		err = nil
	}

	return
}
