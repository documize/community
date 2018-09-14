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
	"fmt"
	"os"
	"strconv"
	"strings"
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
	_, err = tx.Exec(processLockStartQuery(runtime.Storage.Type))
	if err != nil {
		runtime.Log.Error("Database: unable to lock tables", err)
		return false, err
	}

	// Unlock the database at the end of this function.
	defer func() {
		_, err = tx.Exec(processLockFinishQuery(runtime.Storage.Type))
		if err != nil {
			runtime.Log.Error("Database: unable to unlock tables", err)
		}
		tx.Commit()
	}()

	// Try to record this process as leader of database migration process.
	_, err = tx.Exec(insertProcessIDQuery(runtime.Storage.Type))
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

// CurrentVersion returns number that represents the current database version number.
// For example 23 represents the 23rd iteration of the database.
func CurrentVersion(runtime *env.Runtime) (version int, err error) {
	row := runtime.Db.QueryRow(databaseVersionQuery(runtime.Storage.Type))

	var currentVersion string
	err = row.Scan(&currentVersion)
	if err != nil {
		currentVersion = "0"
	}

	return extractVersionNumber(currentVersion), nil
}

// Helper method for defer function called from Unlock().
func doUnlock(runtime *env.Runtime) error {
	tx, err := runtime.Db.Beginx()
	if err != nil {
		return err
	}
	_, err = tx.Exec(deleteProcessIDQuery(runtime.Storage.Type))
	if err != nil {
		return err
	}

	return tx.Commit()
}

// processLockStartQuery returns database specific query that will
// LOCK the database to this running process.
func processLockStartQuery(t env.StoreType) string {
	switch t {
	case env.StoreTypeMySQL, env.StoreTypeMariaDB, env.StoreTypePercona:
		return "LOCK TABLE `config` WRITE;"
	case env.StoreTypePostgreSQL:
		return ""
	case env.StoreTypeMSSQL:
		return ""
	}

	return ""
}

// processLockFinishQuery returns database specific query that will
// UNLOCK the database from this running process.
func processLockFinishQuery(t env.StoreType) string {
	switch t {
	case env.StoreTypeMySQL, env.StoreTypeMariaDB, env.StoreTypePercona:
		return "UNLOCK TABLES;"
	case env.StoreTypePostgreSQL:
		return ""
	case env.StoreTypeMSSQL:
		return ""
	}

	return ""
}

// insertProcessIDQuery returns database specific query that will
// insert ID of this running process.
func insertProcessIDQuery(t env.StoreType) string {
	return "INSERT INTO `config` (`key`,`config`) " + fmt.Sprintf(`VALUES ('DBLOCK','{"pid": "%d"}');`, os.Getpid())
}

// deleteProcessIDQuery returns database specific query that will
// delete ID of this running process.
func deleteProcessIDQuery(t env.StoreType) string {
	return "DELETE FROM `config` WHERE `key`='DBLOCK';"
}

// recordVersionUpgradeQuery returns database specific insert statement
// that records the database version number
func recordVersionUpgradeQuery(t env.StoreType, version int) string {
	// Make record that holds new database version number.
	json := fmt.Sprintf("{\"database\": \"%d\"}", version)

	switch t {
	case env.StoreTypeMySQL, env.StoreTypeMariaDB, env.StoreTypePercona:
		return "INSERT INTO `config` (`key`,`config`) " + "VALUES ('META','" + json + "') ON DUPLICATE KEY UPDATE `config`='" + json + "';"
	case env.StoreTypePostgreSQL:
		return ""
	case env.StoreTypeMSSQL:
		return ""
	}

	return ""
}

// databaseVersionQuery returns the schema version number.
func databaseVersionQuery(t env.StoreType) string {
	switch t {
	case env.StoreTypeMySQL, env.StoreTypeMariaDB, env.StoreTypePercona:
		return "SELECT JSON_EXTRACT(`config`,'$.database') FROM `config` WHERE `key` = 'META';"
	case env.StoreTypePostgreSQL:
		return ""
	case env.StoreTypeMSSQL:
		return ""
	}

	return ""
}

// Turns legacy "db_00021.sql" and new "21" format into version number 21.
func extractVersionNumber(s string) int {
	// Good practice in case of human tampering.
	s = strings.TrimSpace(s)
	s = strings.ToLower(s)

	// Remove any quotes from JSON string.
	s = strings.Replace(s, "\"", "", -1)

	// Remove legacy version string formatting.
	// We know just store the number.
	s = strings.Replace(s, "db_000", "", 1)
	s = strings.Replace(s, ".sql", "", 1)

	i, err := strconv.Atoi(s)
	if err != nil {
		i = 0
	}

	return i
}
