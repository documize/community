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
)

// RecordEvent adds event entry for specified user.
func (p *Persister) RecordEvent(t entity.EventType) {
	e := entity.AppEvent{}
	e.OrgID = p.Context.OrgID
	e.UserID = p.Context.UserID
	e.Created = time.Now().UTC()
	e.IP = p.Context.ClientIP
	e.Type = string(t)

	if e.OrgID == "" || e.UserID == "" {
		log.Info("Missing OrgID/UserID for event record " + e.Type)
		return
	}

	tx, err := Db.Beginx()
	if err != nil {
		log.Error("Unable to prepare insert RecordEvent", err)
		return
	}

	stmt, err := tx.Preparex("INSERT INTO userevent (orgid, userid, eventtype, ip, created) VALUES (?, ?, ?, ?, ?)")
	if err != nil {
		tx.Rollback()
		log.Error("Unable to prepare insert RecordEvent", err)
		return
	}

	_, err = stmt.Exec(e.OrgID, e.UserID, e.Type, e.IP, e.Created)
	if err != nil {
		log.Error("Unable to execute insert RecordEvent", err)
		tx.Rollback()
		return
	}

	stmt.Close()
	tx.Commit()

	return
}
