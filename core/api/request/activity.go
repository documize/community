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

package request

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/documize/community/core/api/endpoint/models"
	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/streamutil"
)

// RecordUserActivity logs user initiated data changes.
func (p *Persister) RecordUserActivity(activity entity.UserActivity) (err error) {
	activity.OrgID = p.Context.OrgID
	activity.UserID = p.Context.UserID
	activity.Created = time.Now().UTC()

	stmt, err := p.Context.Transaction.Preparex("INSERT INTO useractivity (orgid, userid, labelid, sourceid, sourcetype, activitytype, created) VALUES (?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		log.Error("Unable to prepare insert RecordUserActivity", err)
		return
	}

	_, err = stmt.Exec(activity.OrgID, activity.UserID, activity.LabelID, activity.SourceID, activity.SourceType, activity.ActivityType, activity.Created)

	if err != nil {
		log.Error("Unable to execute insert RecordUserActivity", err)
		return
	}

	return
}

// GetDocumentActivity returns the metadata for a specified document.
func (p *Persister) GetDocumentActivity(id string) (a []models.DocumentActivity, err error) {
	s := `SELECT a.id, a.created, a.orgid, IFNULL(a.userid, '') AS userid, a.labelid, a.sourceid as documentid, a.activitytype,
		IFNULL(u.firstname, 'Anonymous') AS firstname, IFNULL(u.lastname, 'Viewer') AS lastname
		FROM useractivity a
		LEFT JOIN user u ON a.userid=u.refid
		WHERE a.orgid=? AND a.sourceid=? AND a.sourcetype=2
		AND a.userid != '0' AND a.userid != ''
		ORDER BY a.created DESC`

	err = Db.Select(&a, s, p.Context.OrgID, id)

	if len(a) == 0 {
		a = []models.DocumentActivity{}
	}

	if err != nil && err != sql.ErrNoRows {
		log.Error(fmt.Sprintf("Unable to execute GetDocumentActivity %s", id), err)
		return
	}

	return
}
