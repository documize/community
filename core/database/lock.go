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

package database

import (
	"crypto/rand"
	"time"

	"github.com/documize/community/core/env"
	"github.com/jmoiron/sqlx"
)

// Lock will try to lock the database instance to the running process.
// Uses a "random" delay as a por man's database cluster-aware process.
// We skip delay if there are no scripts to process.
func Lock(runtime *env.Runtime, scriptsToProcess int) (bool, error) {
	// Wait for random period of time.
	b := make([]byte, 2)
	_, err := rand.Read(b)
	if err != nil {
		return false, err
	}
	wait := ((time.Duration(b[0]) << 8) | time.Duration(b[1])) * time.Millisecond / 10 // up to 6.5 secs wait

	// Why delay if nothing to process?
	if scriptsToProcess > 0 {
		time.Sleep(wait)
	}

	// Start transaction fotr lock process.
	tx, err := runtime.Db.Beginx()
	if err != nil {
		runtime.Log.Error("Database: unable to start transaction", err)
		return false, err
	}

	// Lock the database.
	_, err = tx.Exec(runtime.StoreProvider.QueryStartLock())
	if err != nil {
		runtime.Log.Error("Database: unable to lock tables", err)
		return false, err
	}

	// Unlock the database at the end of this function.
	defer func() {
		_, err = tx.Exec(runtime.StoreProvider.QueryFinishLock())
		if err != nil {
			runtime.Log.Error("Database: unable to unlock tables", err)
		}
		tx.Commit()
	}()

	// Try to record this process as leader of database migration process.
	_, err = tx.Exec(runtime.StoreProvider.QueryInsertProcessID())
	if err != nil {
		runtime.Log.Info("Database: marked as slave process awaiting upgrade")
		return false, nil
	}

	// We are the leader!
	runtime.Log.Info("Database: marked as database upgrade process leader")
	return true, err
}

// Unlock completes process that was started with Lock().
func Unlock(runtime *env.Runtime, tx *sqlx.Tx, err error, amLeader bool) error {
	if amLeader {
		defer func() {
			doUnlock(runtime)
		}()

		if tx != nil {
			if err == nil {
				tx.Commit()
				runtime.Log.Info("Database: is ready")
				return nil
			}
			tx.Rollback()
		}

		runtime.Log.Error("Database: install/upgrade failed", err)

		return err
	}

	return nil // not the leader, so ignore errors
}

// Helper method for defer function called from Unlock().
func doUnlock(runtime *env.Runtime) error {
	tx, err := runtime.Db.Beginx()
	if err != nil {
		return err
	}
	_, err = tx.Exec(runtime.StoreProvider.QueryDeleteProcessID())
	if err != nil {
		return err
	}

	return tx.Commit()
}
