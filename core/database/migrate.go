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
	"bytes"
	"crypto/rand"
	"database/sql"
	"fmt"
	"os"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/server/web"
	"github.com/jmoiron/sqlx"
)

const migrationsDir = "bindata/scripts"

// migrationsT holds a list of migration sql files to run.
type migrationsT []string

// migrations returns a list of the migrations to update the database as required for this version of the code.
func migrations(lastMigration string) (migrationsT, error) {

	lastMigration = strings.TrimPrefix(strings.TrimSuffix(lastMigration, `"`), `"`)

	//fmt.Println(`DEBUG Migrations("`+lastMigration+`")`)

	files, err := web.AssetDir(migrationsDir)
	if err != nil {
		return nil, err
	}
	sort.Strings(files)

	ret := make(migrationsT, 0, len(files))

	hadLast := false

	if len(lastMigration) == 0 {
		hadLast = true
	}

	for _, v := range files {
		if v == lastMigration {
			hadLast = true
		} else {
			if hadLast {
				ret = append(ret, v)
			}
		}
	}

	//fmt.Println(`DEBUG Migrations("`+lastMigration+`")=`,ret)
	return ret, nil
}

// migrate the database as required, by applying the migrations.
func (m migrationsT) migrate(runtime env.Runtime, tx *sqlx.Tx) error {
	for _, v := range m {
		runtime.Log.Info("Processing migration file: " + v)

		buf, err := web.Asset(migrationsDir + "/" + v)
		if err != nil {
			return err
		}

		err = processSQLfile(tx, buf)
		if err != nil {
			return err
		}

		json := `{"database":"` + v + `"}`
		sql := "INSERT INTO `config` (`key`,`config`) " +
			"VALUES ('META','" + json +
			"') ON DUPLICATE KEY UPDATE `config`='" + json + "';"

		_, err = tx.Exec(sql) // add a record in the config file to say we have done the upgrade
		if err != nil {
			return err
		}
	}
	return nil
}

func lockDB(runtime env.Runtime) (bool, error) {
	b := make([]byte, 2)
	_, err := rand.Read(b)
	if err != nil {
		return false, err
	}
	wait := ((time.Duration(b[0]) << 8) | time.Duration(b[1])) * time.Millisecond / 10 // up to 6.5 secs wait
	time.Sleep(wait)

	tx, err := (*dbPtr).Beginx()
	if err != nil {
		return false, err
	}

	_, err = tx.Exec("LOCK TABLE `config` WRITE;")
	if err != nil {
		return false, err
	}

	defer func() {
		_, err = tx.Exec("UNLOCK TABLES;")
		if err != nil {
			runtime.Log.Error("unable to unlock tables", err)
		}
		tx.Commit()
	}()

	_, err = tx.Exec("INSERT INTO `config` (`key`,`config`) " +
		fmt.Sprintf(`VALUES ('DBLOCK','{"pid": "%d"}');`, os.Getpid()))
	if err != nil {
		// good error would be "Error 1062: Duplicate entry 'DBLOCK' for key 'idx_config_area'"
		if strings.HasPrefix(err.Error(), "Error 1062:") {
			runtime.Log.Info("Database locked by annother Documize instance")
			return false, nil
		}
		return false, err
	}

	runtime.Log.Info("Database locked by this Documize instance")
	return true, err // success!
}

func unlockDB() error {
	tx, err := (*dbPtr).Beginx()
	if err != nil {
		return err
	}
	_, err = tx.Exec("DELETE FROM `config` WHERE `key`='DBLOCK';")
	if err != nil {
		return err
	}
	return tx.Commit()
}

func migrateEnd(runtime env.Runtime, tx *sqlx.Tx, err error, amLeader bool) error {
	if amLeader {
		defer func() { unlockDB() }()
		if tx != nil {
			if err == nil {
				tx.Commit()
				runtime.Log.Info("Database checks: completed")
				return nil
			}
			tx.Rollback()
		}
		runtime.Log.Error("Database checks: failed: ", err)
		return err
	}
	return nil // not the leader, so ignore errors
}

func getLastMigration(tx *sqlx.Tx) (lastMigration string, err error) {
	var stmt *sql.Stmt
	stmt, err = tx.Prepare("SELECT JSON_EXTRACT(`config`,'$.database') FROM `config` WHERE `key` = 'META';")
	if err == nil {
		defer streamutil.Close(stmt)
		var item = make([]uint8, 0)

		row := stmt.QueryRow()

		err = row.Scan(&item)
		if err == nil {
			if len(item) > 1 {
				q := []byte(`"`)
				lastMigration = string(bytes.TrimPrefix(bytes.TrimSuffix(item, q), q))
			}
		}
	}
	return
}

// Migrate the database as required, consolidated action.
func Migrate(runtime env.Runtime, ConfigTableExists bool) error {
	amLeader := false

	if ConfigTableExists {
		var err error
		amLeader, err = lockDB(runtime)
		if err != nil {
			runtime.Log.Error("unable to lock DB", err)
		}
	} else {
		amLeader = true // what else can you do?
	}

	tx, err := (*dbPtr).Beginx()
	if err != nil {
		return migrateEnd(runtime, tx, err, amLeader)
	}

	lastMigration := ""

	if ConfigTableExists {
		lastMigration, err = getLastMigration(tx)
		if err != nil {
			return migrateEnd(runtime, tx, err, amLeader)
		}
		runtime.Log.Info("Database checks: last applied " + lastMigration)
	}

	mig, err := migrations(lastMigration)
	if err != nil {
		return migrateEnd(runtime, tx, err, amLeader)
	}

	if len(mig) == 0 {
		runtime.Log.Info("Database checks: no updates required")
		return migrateEnd(runtime, tx, nil, amLeader) // no migrations to perform
	}

	if amLeader {
		runtime.Log.Info("Database checks: will execute the following update files: " + strings.Join([]string(mig), ", "))
		return migrateEnd(runtime, tx, mig.migrate(runtime, tx), amLeader)
	}

	// a follower instance
	targetMigration := string(mig[len(mig)-1])
	for targetMigration != lastMigration {
		time.Sleep(time.Second)
		runtime.Log.Info("Waiting for database migration completion")
		tx.Rollback()                // ignore error
		tx, err := (*dbPtr).Beginx() // need this in order to see the changed situation since last tx
		if err != nil {
			return migrateEnd(runtime, tx, err, amLeader)
		}
		lastMigration, _ = getLastMigration(tx)
	}

	return migrateEnd(runtime, tx, nil, amLeader)
}

func processSQLfile(tx *sqlx.Tx, buf []byte) error {
	stmts := getStatements(buf)

	for _, stmt := range stmts {
		_, err := tx.Exec(stmt)
		if err != nil {
			return err
		}
	}

	return nil
}

// getStatement strips out the comments and returns all the individual SQL commands (apart from "USE") as a []string.
func getStatements(bytes []byte) []string {
	/* Strip comments of the form '-- comment' or like this one */
	stripped := regexp.MustCompile("(?s)--.*?\n|/\\*.*?\\*/").ReplaceAll(bytes, []byte("\n"))
	sqls := strings.Split(string(stripped), ";")
	ret := make([]string, 0, len(sqls))
	for _, v := range sqls {
		trimmed := strings.TrimSpace(v)
		if len(trimmed) > 0 &&
			!strings.HasPrefix(strings.ToUpper(trimmed), "USE ") { // make sure we don't USE the wrong database
			ret = append(ret, trimmed+";")
		}
	}
	return ret
}
