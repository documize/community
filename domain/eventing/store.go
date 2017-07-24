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

// Package eventing records user events.
package eventing

import (
	"time"

	"github.com/documize/community/domain"
	"github.com/pkg/errors"
)

// Record adds event entry for specified user.
func Record(s domain.StoreContext, t EventType) {
	e := AppEvent{}
	e.OrgID = s.Context.OrgID
	e.UserID = s.Context.UserID
	e.Created = time.Now().UTC()
	e.IP = s.Context.ClientIP
	e.Type = string(t)

	tx, err := s.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, "start transaction")
		return
	}

	stmt, err := tx.Preparex("INSERT INTO userevent (orgid, userid, eventtype, ip, created) VALUES (?, ?, ?, ?, ?)")
	if err != nil {
		tx.Rollback()
		err = errors.Wrap(err, "prepare insert RecordEvent")
		return
	}

	_, err = stmt.Exec(e.OrgID, e.UserID, e.Type, e.IP, e.Created)
	if err != nil {
		err = errors.Wrap(err, "execute insert RecordEvent")
		tx.Rollback()
		return
	}

	stmt.Close()
	tx.Commit()

	return
}
