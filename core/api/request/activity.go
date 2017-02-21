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
	"time"

	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/utility"
)

// RecordUserActivity logs user initiated data changes.
func (p *Persister) RecordUserActivity(activity entity.UserActivity) (err error) {
	activity.OrgID = p.Context.OrgID
	activity.UserID = p.Context.UserID
	activity.Created = time.Now().UTC()

	stmt, err := p.Context.Transaction.Preparex("INSERT INTO useractivity (orgid, userid, labelid, sourceid, sourcetype, activitytype, created) VALUES (?, ?, ?, ?, ?, ?, ?)")
	defer utility.Close(stmt)

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
