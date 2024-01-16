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

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/server/web"
)

// Check that the database is configured correctly and that all the required tables exist.
// It must be the first function called in this package.
func Check(runtime *env.Runtime) bool {
	runtime.Log.Info("Database: checking state")

	web.SiteInfo.DBname = runtime.StoreProvider.DatabaseName()

	rows, err := runtime.Db.Query(runtime.StoreProvider.QueryMeta())
	if err != nil {
		runtime.Log.Error("Database: unable to load meta information from database provider", err)
		web.SiteInfo.Issue = "Unable to load meta information from database provider: " + err.Error()
		runtime.Flags.SiteMode = env.SiteModeBadDB
		return false
	}

	defer streamutil.Close(rows)
	var version, dbComment, charset, collation string
	if rows.Next() {
		err = rows.Scan(&version, &dbComment, &charset, &collation)
	}
	if err == nil {
		err = rows.Err() // get any error encountered during iteration
	}
	if err != nil {
		runtime.Log.Error("Database: no meta data returned by database provider", err)
		web.SiteInfo.Issue = "No meta data returned by database provider: " + err.Error()
		runtime.Flags.SiteMode = env.SiteModeBadDB
		return false
	}

	runtime.Log.Info(fmt.Sprintf("Database: provider name %v", runtime.StoreProvider.Type()))
	runtime.Log.Info(fmt.Sprintf("Database: provider version %s", version))

	// Version OK?
	versionOK, minVersion := runtime.StoreProvider.VerfiyVersion(version)
	if !versionOK {
		msg := fmt.Sprintf("*** ERROR: database version needs to be %s or above ***", minVersion)
		runtime.Log.Info(msg)
		web.SiteInfo.Issue = msg
		runtime.Flags.SiteMode = env.SiteModeBadDB
		return false
	}

	// Character set and collation OK?
	charOK, charRequired := runtime.StoreProvider.VerfiyCharacterCollation(charset, collation)
	if !charOK {
		msg := fmt.Sprintf("*** ERROR: %s ***", charRequired)
		runtime.Log.Info(msg)
		web.SiteInfo.Issue = msg
		runtime.Flags.SiteMode = env.SiteModeBadDB
		return false
	}

	// if there are no rows in the database, enter set-up mode
	var flds []string
	if err := runtime.Db.Select(&flds, runtime.StoreProvider.QueryTableList()); err != nil {
		msg := fmt.Sprintf("Database: unable to get database table list ")
		runtime.Log.Error(msg, err)
		web.SiteInfo.Issue = msg + err.Error()
		runtime.Flags.SiteMode = env.SiteModeBadDB
		return false
	}

	if len(flds) <= 5 {
		runtime.Log.Info("Database: starting setup mode for empty database")
		runtime.Flags.SiteMode = env.SiteModeSetup
		return false
	}

	// We have good database, so proceed with app boot process.
	runtime.Flags.SiteMode = env.SiteModeNormal
	web.SiteInfo.DBname = ""

	return true
}
