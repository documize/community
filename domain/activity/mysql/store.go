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
	"fmt"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store/mysql"
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

	_, err = ctx.Transaction.Exec("INSERT INTO useractivity (orgid, userid, labelid, documentid, pageid, sourcetype, activitytype, metadata, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
		activity.OrgID, activity.UserID, activity.LabelID, activity.DocumentID, activity.PageID, activity.SourceType, activity.ActivityType, activity.Metadata, activity.Created)

	if err != nil {
		err = errors.Wrap(err, "execute record user activity")
	}

	return
}

// GetDocumentActivity returns the metadata for a specified document.
func (s Scope) GetDocumentActivity(ctx domain.RequestContext, id string) (a []activity.DocumentActivity, err error) {
	qry := `SELECT a.id, DATE(a.created) as created, a.orgid, IFNULL(a.userid, '') AS userid, a.labelid, a.documentid, a.pageid, a.activitytype, a.metadata,
		IFNULL(u.firstname, 'Anonymous') AS firstname, IFNULL(u.lastname, 'Viewer') AS lastname,
		IFNULL(p.title, '') as pagetitle
		FROM useractivity a
		LEFT JOIN user u ON a.userid=u.refid
		LEFT JOIN page p ON a.pageid=p.refid
		WHERE a.orgid=? AND a.documentid=?
		AND a.userid != '0' AND a.userid != ''
		ORDER BY a.created DESC`

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
func (s Scope) DeleteDocumentChangeActivity(ctx domain.RequestContext, documentID string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	rows, err = b.DeleteWhere(ctx.Transaction,
		fmt.Sprintf("DELETE FROM useractivity WHERE orgid='%s' AND documentid='%s' AND (activitytype=1 OR activitytype=2 OR activitytype=3 OR activitytype=4 OR activitytype=7)", ctx.OrgID, documentID))

	return
}
