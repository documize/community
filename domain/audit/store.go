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
	"database/sql"

	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/audit"
)

// Store provides data access to audit log information.
type Store struct {
	store.Context
	store.AuditStorer
}

// Record adds event entry for specified user using own DB TX.
func (s Store) Record(ctx domain.RequestContext, t audit.EventType) {
	e := audit.AppEvent{}
	e.OrgID = ctx.OrgID
	e.UserID = ctx.UserID
	e.Created = time.Now().UTC()
	e.IP = ctx.ClientIP
	e.Type = string(t)

	tx, ok := s.Runtime.StartTx(sql.LevelReadUncommitted)
	if !ok {
		s.Runtime.Log.Info("unable to start transaction")
		return
	}

	_, err := tx.Exec(s.Bind("INSERT INTO dmz_audit_log (c_orgid, c_userid, c_eventtype, c_ip, c_created) VALUES (?, ?, ?, ?, ?)"),
		e.OrgID, e.UserID, e.Type, e.IP, e.Created)
	if err != nil {
	    s.Runtime.Rollback(tx)
		s.Runtime.Log.Error("prepare audit insert", err)
		return
	}

    s.Runtime.Commit(tx)

	return
}
