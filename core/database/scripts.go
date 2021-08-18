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
	"embed"
	"fmt"
	"sort"

	"github.com/documize/community/core/asset"
	"github.com/documize/community/core/env"
)

// Scripts holds all .SQL files for all supported database providers.
type Scripts struct {
	MySQL      []Script
	PostgreSQL []Script
	SQLServer  []Script
}

// Script holds SQL script and it's associated version number.
type Script struct {
	Version int
	Script  []byte
}

// LoadScripts returns .SQL scripts for supported database providers.
func LoadScripts(runtime *env.Runtime) (s Scripts, err error) {
	// MySQL
	s.MySQL, err = loadFiles(runtime.Assets, "scripts/mysql")
	if err != nil {
		return
	}
	// PostgreSQL
	s.PostgreSQL, err = loadFiles(runtime.Assets, "scripts/postgresql")
	if err != nil {
		return
	}
	// PostgreSQL
	s.SQLServer, err = loadFiles(runtime.Assets, "scripts/sqlserver")
	if err != nil {
		return
	}

	return s, nil
}

// SpecificScripts returns SQL scripts for current databasse provider.
func SpecificScripts(runtime *env.Runtime, all Scripts) (s []Script) {
	switch runtime.StoreProvider.Type() {
	case env.StoreTypeMySQL, env.StoreTypeMariaDB, env.StoreTypePercona:
		return all.MySQL
	case env.StoreTypePostgreSQL:
		return all.PostgreSQL
	case env.StoreTypeSQLServer:
		return all.SQLServer
	}

	return
}

// loadFiles returns all SQL scripts in specified folder as [][]byte.
func loadFiles(fs embed.FS, path string) (b []Script, err error) {
	scripts, err := asset.FetchStaticDir(fs, path)
	if err != nil {
		return
	}

	sort.Strings(scripts)

	for i := range scripts {
		filename := scripts[i]
		sqlfile, _, err := asset.FetchStatic(fs, fmt.Sprintf("%s/%s", path, filename))
		if err != nil {
			return b, err
		}

		b = append(b, Script{Version: extractVersionNumber(filename), Script: []byte(sqlfile)})
	}

	return b, nil
}
