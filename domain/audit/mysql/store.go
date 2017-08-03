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

// Package audit records user events.
package audit

import (
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/model/audit"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// Record adds event entry for specified user.
func (s Scope) Record(ctx domain.RequestContext, t audit.EventType) {
	e := audit.AppEvent{}
	e.OrgID = ctx.OrgID
	e.UserID = ctx.UserID
	e.Created = time.Now().UTC()
	e.IP = ctx.ClientIP
	e.Type = string(t)

	tx, err := s.Runtime.Db.Beginx()
	if err != nil {
		s.Runtime.Log.Error("transaction", err)
		return
	}

	stmt, err := tx.Preparex("INSERT INTO userevent (orgid, userid, eventtype, ip, created) VALUES (?, ?, ?, ?, ?)")
	if err != nil {
		tx.Rollback()
		s.Runtime.Log.Error("prepare audit insert", err)
		return
	}

	_, err = stmt.Exec(e.OrgID, e.UserID, e.Type, e.IP, e.Created)
	if err != nil {
		tx.Rollback()
		s.Runtime.Log.Error("execute audit insert", err)
		return
	}

	stmt.Close()
	tx.Commit()

	return
}
