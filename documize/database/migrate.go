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
	"sort"
	"strings"

	"github.com/documize/community/documize/web"
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
func (m migrationsT) migrate() error {
	for _, v := range m {
		buf, err := web.Asset(migrationsDir + "/" + v)
		if err != nil {
			return err
		}
		fmt.Println("DEBUG database.Migrate() ", v, ":\n", string(buf)) // TODO actually run the SQL
	}
	return nil
}

// Migrate the database as required, consolidated action.
func Migrate(lastMigration string) error {
	mig, err := migrations(lastMigration)
	if err != nil {
		return err
	}
	if len(mig) == 0 {
		return nil // no migrations to perform
	}
	locked, err := lockDB()
	if err != nil {
		return err
	}
	if locked {
		defer unlockDB()
		if err := mig.migrate(); err != nil {
			return err
		}
	}
	return nil
}
