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
	"database/sql"
	"regexp"
	"sort"
	"strings"

	"github.com/jmoiron/sqlx"

	"github.com/documize/community/core/web"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/utility"
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
func (m migrationsT) migrate(tx *sqlx.Tx) error {
	for _, v := range m {
		log.Info("Processing migration file: " + v)
		buf, err := web.Asset(migrationsDir + "/" + v)
		if err != nil {
			return err
		}
		//fmt.Println("DEBUG database.Migrate() ", v, ":\n", string(buf)) // TODO actually run the SQL
		err = processSQLfile(tx, buf)
		if err != nil {
			return err
		}
		json := `{"database":"` + v + `"}`
		sql := "INSERT INTO `config` (`key`,`config`) " +
			"VALUES ('META','" + json +
			"') ON DUPLICATE KEY UPDATE `config`='" + json + "';"

		_, err = tx.Exec(sql)
		if err != nil {
			return err
		}

		//fmt.Println("DEBUG insert 10s wait for testing")
		//time.Sleep(10 * time.Second)
	}
	return nil
}

func migrateEnd(tx *sqlx.Tx, err error) error {
	if tx != nil {
		_, ulerr := tx.Exec("UNLOCK TABLES;")
		log.IfErr(ulerr)
		if err == nil {
			log.IfErr(tx.Commit())
			log.Info("Database checks: completed")
			return nil
		}
		log.IfErr(tx.Rollback())
	}
	log.Error("Database checks: failed: ", err)
	return err
}

// Migrate the database as required, consolidated action.
func Migrate(ConfigTableExists bool) error {

	lastMigration := ""

	tx, err := (*dbPtr).Beginx()
	if err != nil {
		return migrateEnd(tx, err)
	}

	if ConfigTableExists {
		_, err = tx.Exec("LOCK TABLE `config` WRITE;")
		if err != nil {
			return migrateEnd(tx, err)
		}

		log.Info("Database checks: lock taken")

		var stmt *sql.Stmt
		stmt, err = tx.Prepare("SELECT JSON_EXTRACT(`config`,'$.database') FROM `config` WHERE `key` = 'META';")
		if err == nil {
			defer utility.Close(stmt)
			var item = make([]uint8, 0)

			row := stmt.QueryRow()

			err = row.Scan(&item)
			if err != nil {
				return migrateEnd(tx, err)
			}

			if len(item) > 1 {
				q := []byte(`"`)
				lastMigration = string(bytes.TrimPrefix(bytes.TrimSuffix(item, q), q))
			}
		}
		log.Info("Database checks: last previously applied file was " + lastMigration)
	}

	mig, err := migrations(lastMigration)
	if err != nil {
		return migrateEnd(tx, err)
	}

	if len(mig) == 0 {
		log.Info("Database checks: no updates to perform")
		return migrateEnd(tx, nil) // no migrations to perform
	}
	log.Info("Database checks: will execute the following update files: " + strings.Join([]string(mig), ", "))

	return migrateEnd(tx, mig.migrate(tx))
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
