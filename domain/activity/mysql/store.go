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
	"github.com/documize/community/model/activity"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// RecordUserActivity logs user initiated data changes.
func (s Scope) RecordUserActivity(ctx domain.RequestContext, activity activity.UserActivity) (err error) {
	activity.OrgID = ctx.OrgID
	activity.UserID = ctx.UserID
	activity.Created = time.Now().UTC()

	stmt, err := ctx.Transaction.Preparex("INSERT INTO useractivity (orgid, userid, labelid, sourceid, sourcetype, activitytype, created) VALUES (?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare record user activity")
		return
	}

	_, err = stmt.Exec(activity.OrgID, activity.UserID, activity.LabelID, activity.SourceID, activity.SourceType, activity.ActivityType, activity.Created)

	if err != nil {
		err = errors.Wrap(err, "execute record user activity")
		return
	}

	return
}

// GetDocumentActivity returns the metadata for a specified document.
func (s Scope) GetDocumentActivity(ctx domain.RequestContext, id string) (a []activity.DocumentActivity, err error) {
	qry := `SELECT a.id, a.created, a.orgid, IFNULL(a.userid, '') AS userid, a.labelid, a.sourceid as documentid, a.activitytype,
		IFNULL(u.firstname, 'Anonymous') AS firstname, IFNULL(u.lastname, 'Viewer') AS lastname
		FROM useractivity a
		LEFT JOIN user u ON a.userid=u.refid
		WHERE a.orgid=? AND a.sourceid=? AND a.sourcetype=2
		AND a.userid != '0' AND a.userid != ''
		ORDER BY a.created DESC`

	err = s.Runtime.Db.Select(&a, qry, ctx.OrgID, id)

	if len(a) == 0 {
		a = []activity.DocumentActivity{}
	}

	if err != nil && err != sql.ErrNoRows {
		err = errors.Wrap(err, "select document user activity")
		return
	}

	return
}
