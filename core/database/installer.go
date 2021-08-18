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
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/documize/community/core/env"
	"github.com/jmoiron/sqlx"
)

// InstallUpgrade creates new database or upgrades existing database.
func InstallUpgrade(runtime *env.Runtime, existingDB bool) (err error) {
	// amLeader := false

	// Get all SQL scripts.
	scripts, err := LoadScripts(runtime)
	if err != nil {
		runtime.Log.Error("Database: unable to load scripts", err)
		return
	}

	// Get current database version.
	currentVersion := 0
	if existingDB {
		currentVersion, err = CurrentVersion(runtime)
		if err != nil {
			runtime.Log.Error("Database: unable to get current version", err)
			return
		}

		runtime.Log.Info(fmt.Sprintf("Database: current version number is %d", currentVersion))
	}

	// Filter out database specific scripts.
	dbTypeScripts := SpecificScripts(runtime, scripts)
	if len(dbTypeScripts) == 0 {
		runtime.Log.Info(fmt.Sprintf("Database: unable to load scripts for database type %s", runtime.StoreProvider.Type()))
		return
	}

	runtime.Log.Info(fmt.Sprintf("Database: loaded %d SQL scripts for provider %s", len(dbTypeScripts), runtime.StoreProvider.Type()))

	// Make a list of scripts to execute based upon current database state.
	toProcess := []Script{}
	for _, s := range dbTypeScripts {
		if s.Version > currentVersion || currentVersion == 0 {
			toProcess = append(toProcess, s)
		}
	}

	runtime.Log.Info(fmt.Sprintf("Database: %d scripts to process", len(toProcess)))

	// For MySQL type there was major new schema introduced in v24.
	// We check for this release and bypass usual locking code
	// because tables have changed.
	legacyMigration := runtime.StoreProvider.Type() == env.StoreTypeMySQL &&
		currentVersion > 0 && currentVersion < 25 && len(toProcess) >= 26 && toProcess[len(toProcess)-1].Version == 25

	if legacyMigration {
		// Bypass all DB locking/checking processes as these look for new schema
		// which we are about to install.
		toProcess = toProcess[len(toProcess)-1:]

		runtime.Log.Info(fmt.Sprintf("Database: legacy schema has %d scripts to process", len(toProcess)))
	}

	err = runScripts(runtime, toProcess)
	if err != nil {
		runtime.Log.Error("Database: error processing SQL scripts", err)
	}

	return nil
}

// Run SQL scripts to instal or upgrade this database.
// We do not use transactions for Microsoft SQL Server because
// CREATE FULLTEXT CATALOG statement cannot be used inside a user transaction.
func runScripts(runtime *env.Runtime, scripts []Script) (err error) {
	tx, err := runtime.Db.Beginx()
	if err != nil {
		return err
	}

	// We can have multiple scripts as each Documize database change has it's own SQL script.
	for _, script := range scripts {
		runtime.Log.Info(fmt.Sprintf("Database: processing SQL script %d", script.Version))

		err = executeSQL(tx, runtime, script.Script)
		if err != nil {
			runtime.Log.Error(fmt.Sprintf("error executing SQL script %d", script.Version), err)
			if runtime.StoreProvider.Type() != env.StoreTypeSQLServer {
				tx.Rollback()
			}
			return err
		}

		// Record the fact we have processed this database script version.
		if runtime.StoreProvider.Type() != env.StoreTypeSQLServer {
			_, err = tx.Exec(runtime.StoreProvider.QueryRecordVersionUpgrade(script.Version))
		} else {
			_, err = runtime.Db.Exec(runtime.StoreProvider.QueryRecordVersionUpgrade(script.Version))
		}
		if err != nil {
			// For MySQL we try the legacy DB schema.
			if runtime.StoreProvider.Type() == env.StoreTypeMySQL {
				runtime.Log.Info(fmt.Sprintf("Database: attempting legacy fallback for SQL script %d", script.Version))

				_, err = tx.Exec(runtime.StoreProvider.QueryRecordVersionUpgradeLegacy(script.Version))
				if err != nil {
					runtime.Log.Error(fmt.Sprintf("error recording execution of SQL script %d", script.Version), err)
					if runtime.StoreProvider.Type() != env.StoreTypeSQLServer {
						tx.Rollback()
					}
					return err
				}
			} else {
				// Unknown issue running script on non-MySQL database.
				runtime.Log.Error(fmt.Sprintf("error executing SQL script %d", script.Version), err)
				if runtime.StoreProvider.Type() != env.StoreTypeSQLServer {
					tx.Rollback()
				}
				return err
			}
		}
	}

	tx.Commit()

	return nil
}

// executeSQL runs specified SQL commands.
func executeSQL(tx *sqlx.Tx, runtime *env.Runtime, SQLfile []byte) error {
	// Turn SQL file contents into runnable SQL statements.
	stmts := getStatements(SQLfile)

	for _, stmt := range stmts {
		// MariaDB has no specific JSON column type (but has JSON queries)
		if runtime.StoreProvider.Type() == env.StoreTypeMySQL &&
			runtime.StoreProvider.TypeVariant() == env.StoreTypeMariaDB {
			stmt = strings.Replace(stmt, "` JSON", "` TEXT", -1)
		}

		var err error
		if runtime.StoreProvider.Type() != env.StoreTypeSQLServer {
			_, err = tx.Exec(stmt)
		} else {
			_, err = runtime.Db.Exec(stmt)
		}
		if err != nil {
			fmt.Println("sql statement error:", stmt)
			return err
		}
	}

	return nil
}

// getStatement strips out the comments and returns all the individual SQL commands (apart from "USE") as a []string.
func getStatements(bytes []byte) (stmts []string) {
	// Strip comments of the form '-- comment' or like this one /**/
	stripped := regexp.MustCompile("(?s)--.*?\n|/\\*.*?\\*/").ReplaceAll(bytes, []byte("\n"))

	// Break into lines using ; terminator.
	lines := strings.Split(string(stripped), ";")

	// Prepare return data.
	stmts = make([]string, 0, len(lines))

	for _, v := range lines {
		trimmed := strings.TrimSpace(v)
		// Process non-empty lines and exclude "USE dbname" command
		if len(trimmed) > 0 && !strings.HasPrefix(strings.ToUpper(trimmed), "USE ") {
			stmts = append(stmts, trimmed+";")
		}
	}

	return
}

// CurrentVersion returns number that represents the current database version number.
// For example 23 represents the 23rd iteration of the database.
func CurrentVersion(runtime *env.Runtime) (version int, err error) {
	currentVersion := "0"

	row := runtime.Db.QueryRow(runtime.StoreProvider.QueryGetDatabaseVersion())
	err = row.Scan(&currentVersion)
	if err != nil {
		// For MySQL we try the legacy DB checks.
		if runtime.StoreProvider.Type() == env.StoreTypeMySQL {
			row := runtime.Db.QueryRow(runtime.StoreProvider.QueryGetDatabaseVersionLegacy())
			err = row.Scan(&currentVersion)
		}
	}

	return extractVersionNumber(currentVersion), nil
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
