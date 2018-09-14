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

	"github.com/documize/community/core/env"
	"github.com/documize/community/server/web"
)

// Scripts holds all .SQL files for all supported database providers.
type Scripts struct {
	MySQLScripts       []Script
	PostgresSQLScripts []Script
	SQLServerScripts   []Script
}

// Script holds SQL script and it's associated version number.
type Script struct {
	Version int
	Script  []byte
}

// LoadScripts returns .SQL scripts for supported database providers.
func LoadScripts() (s Scripts, err error) {
	assetDir := "bindata/scripts"

	// MySQL
	s.MySQLScripts, err = loadFiles(fmt.Sprintf("%s/mysql", assetDir))
	if err != nil {
		return
	}

	return s, nil
}

// SpecificScripts returns SQL scripts for current databasse provider.
func SpecificScripts(runtime *env.Runtime, all Scripts) (s []Script) {
	switch runtime.StoreProvider.Type() {
	case env.StoreTypeMySQL, env.StoreTypeMariaDB, env.StoreTypePercona:
		return all.MySQLScripts
	case env.StoreTypePostgreSQL:
		return all.PostgresSQLScripts
	case env.StoreTypeMSSQL:
		return all.SQLServerScripts
	}

	return
}

// loadFiles returns all SQL scripts in specified folder as [][]byte.
func loadFiles(path string) (b []Script, err error) {
	buf := []byte{}
	scripts, err := web.AssetDir(path)
	if err != nil {
		return
	}
	sort.Strings(scripts)
	for _, file := range scripts {
		buf, err = web.Asset(fmt.Sprintf("%s/%s", path, file))
		if err != nil {
			return
		}

		b = append(b, Script{Version: extractVersionNumber(file), Script: buf})
	}

	return b, nil
}
