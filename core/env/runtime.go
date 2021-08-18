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

// Package env provides runtime, server level setup and configuration
package env

import (
	"context"
	"database/sql"
	"embed"

	"github.com/documize/community/domain"
	"github.com/jmoiron/sqlx"
)

const (
	// SiteModeNormal serves app
	SiteModeNormal = ""

	// SiteModeOffline serves offline.html
	SiteModeOffline = "1"

	// SiteModeSetup tells Ember to serve setup route
	SiteModeSetup = "2"

	// SiteModeBadDB redirects to db-error.html page
	SiteModeBadDB = "3"
)

// Runtime provides access to database, logger and other server-level scoped objects.
// Use Context for per-request values.
type Runtime struct {
	Flags         Flags
	Db            *sqlx.DB
	StoreProvider StoreProvider
	Log           Logger
	Product       domain.Product
	Assets        embed.FS
}

// StartTx begins database transaction with given transaction isolation level.
// Any error encountered during this operation is logged to runtime logger.
func (r *Runtime) StartTx(i sql.IsolationLevel) (tx *sqlx.Tx, ok bool) {
	tx, err := r.Db.BeginTxx(context.Background(), &sql.TxOptions{Isolation: i})
	if err != nil {
		r.Log.Error("unable to start database transaction", err)
		return nil, false
	}

	return tx, true
}

// Rollback aborts active database transaction.
// Any error encountered during this operation is logged to runtime logger.
func (r *Runtime) Rollback(tx *sqlx.Tx) bool {
	if err := tx.Commit(); err != nil {
		r.Log.Error("unable to commit database transaction", err)
		return false
	}

	return true
}

// Commit flushes pending changes to database.
// Any error encountered during this operation is logged to runtime logger.
func (r *Runtime) Commit(tx *sqlx.Tx) bool {
	if err := tx.Commit(); err != nil {
		r.Log.Error("unable to commit database transaction", err)
		return false
	}

	return true
}
