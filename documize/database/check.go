package database

import (
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/documize/community/documize/web"
	"github.com/documize/community/wordsmith/log"
	"github.com/jmoiron/sqlx"
)

var dbCheckOK bool // default false

// Check that the database is configured correctly and that all the required tables exist
func Check(Db *sqlx.DB, connectionString string) bool {
	csBits := strings.Split(connectionString, "/")
	if len(csBits) > 1 {
		web.SiteInfo.DBname = strings.Split(csBits[len(csBits)-1], "?")[0]
	}

	rows, err := Db.Query("SELECT VERSION() AS version, @@character_set_database AS charset, @@collation_database AS collation;")
	if err != nil {
		log.Error("Can't get MySQL configuration", err)
		web.SiteInfo.Issue = "Can't get MySQL configuration: " + err.Error()
		web.SiteMode = web.SiteModeBadDB
		return false
	}
	defer rows.Close() // ignore error
	var version, charset, collation string
	if rows.Next() {
		err = rows.Scan(&version, &charset, &collation)
	}
	if err == nil {
		err = rows.Err() // get any error encountered during iteration
	}
	if err != nil {
		log.Error("no MySQL configuration returned", err)
		web.SiteInfo.Issue = "no MySQL configuration return issue: " + err.Error()
		web.SiteMode = web.SiteModeBadDB
		return false
	}

	{ // check minimum MySQL version as we need JSON column type. 5.7.10
		vParts := strings.Split(version, ".")
		if len(vParts) < 3 {
			log.Error("MySQL version not of the form a.b.c:", errors.New(version))
			web.SiteInfo.Issue = "MySQL version in the wrong format: " + version
			web.SiteMode = web.SiteModeBadDB
			return false
		}
		verInts := []int{5, 7, 10} // Minimum MySQL version
		for k, v := range verInts {
			i, err := strconv.Atoi(vParts[k])
			if err != nil {
				log.Error("MySQL version element "+strconv.Itoa(k+1)+" of '"+version+"' not an integer:", err)
				web.SiteInfo.Issue = "MySQL version element " + strconv.Itoa(k+1) + " of '" + version + "' not an integer: " + err.Error()
				web.SiteMode = web.SiteModeBadDB
				return false
			}
			if i < v {
				want := fmt.Sprintf("%d.%d.%d", verInts[0], verInts[1], verInts[2])
				log.Error("MySQL version element "+strconv.Itoa(k+1)+" of '"+version+"' not high enough, need at least version "+want, errors.New("bad MySQL version"))
				web.SiteInfo.Issue = "MySQL version element " + strconv.Itoa(k+1) + " of '" + version + "' not high enough, need at least version " + want
				web.SiteMode = web.SiteModeBadDB
				return false
			}
		}
	}

	{ // check the MySQL character set and collation
		if charset != "utf8" {
			log.Error("MySQL character set not utf8:", errors.New(charset))
			web.SiteInfo.Issue = "MySQL character set not utf8: " + charset
			web.SiteMode = web.SiteModeBadDB
			return false
		}
		if !strings.HasPrefix(collation, "utf8") {
			log.Error("MySQL collation sequence not utf8...:", errors.New(collation))
			web.SiteInfo.Issue = "MySQL collation sequence not utf8...: " + collation
			web.SiteMode = web.SiteModeBadDB
			return false
		}
	}

	{ // if there are no rows in the database, enter set-up mode
		var flds []string
		if err := Db.Select(&flds,
			`SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '`+web.SiteInfo.DBname+
				`' and TABLE_TYPE='BASE TABLE'`); err != nil {
			log.Error("Can't get MySQL number of tables", err)
			web.SiteInfo.Issue = "Can't get MySQL number of tables: " + err.Error()
			web.SiteMode = web.SiteModeBadDB
			return false
		}
		if strings.TrimSpace(flds[0]) == "0" {
			log.Error("Entering database set-up mode because the database is empty.", errors.New("no tables"))
			web.SiteMode = web.SiteModeSetup
			return false
		}
	}

	{ // check all the required tables exist
		var tables = []string{`account`,
			`attachment`, `audit`, `document`,
			`label`, `labelrole`, `organization`,
			`page`, `revision`, `search`, `user`}

		for _, table := range tables {
			var dummy []string
			if err := Db.Select(&dummy, "SELECT 1 FROM "+table+" LIMIT 1;"); err != nil {
				log.Error("Entering bad database mode because: SELECT 1 FROM "+table+" LIMIT 1;", err)
				web.SiteInfo.Issue = "MySQL database is not empty, but does not contain table: " + table
				web.SiteMode = web.SiteModeBadDB
				return false
			}
		}
	}

	web.SiteMode = web.SiteModeNormal // actually no need to do this (as already ""), this for documentation
	web.SiteInfo.DBname = ""          // do not give this info when not in set-up mode
	dbCheckOK = true
	return true
}
