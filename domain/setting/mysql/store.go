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

package mysql

import (
	"bytes"
	"database/sql"
	"fmt"

	"github.com/documize/community/core/env"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// Get fetches a configuration JSON element from the config table.
func (s Scope) Get(area, path string) (value string, err error) {
	if path != "" {
		path = "." + path
	}

	sql := "SELECT JSON_EXTRACT(`config`,'$" + path + "') FROM `config` WHERE `key` = '" + area + "';"

	var item = make([]uint8, 0)

	err = s.Runtime.Db.Get(&item, sql)
	if err != nil {
		return "", err
	}

	if len(item) > 1 {
		q := []byte(`"`)
		value = string(bytes.TrimPrefix(bytes.TrimSuffix(item, q), q))
	}

	return value, nil
}

// Set writes a configuration JSON element to the config table.
func (s Scope) Set(area, json string) (err error) {
	if area == "" {
		return errors.New("no area")
	}

	sql := "INSERT INTO `config` (`key`,`config`) " +
		"VALUES ('" + area + "','" + json +
		"') ON DUPLICATE KEY UPDATE `config`='" + json + "';"

	_, err = s.Runtime.Db.Exec(sql)

	return err
}

// GetUser fetches a configuration JSON element from the userconfig table for a given orgid/userid combination.
// Errors return the empty string. A blank path returns the whole JSON object, as JSON.
// You can store org level settings by providing an empty user ID.
func (s Scope) GetUser(orgID, userID, key, path string) (value string, err error) {
	var item = make([]uint8, 0)

	if path != "" {
		path = "." + path
	}

	qry := "SELECT JSON_EXTRACT(`config`,'$" + path + "') FROM `userconfig` WHERE `key` = '" + key +
		"' AND `orgid` = '" + orgID + "' AND `userid` = '" + userID + "';"

	err = s.Runtime.Db.Get(&item, qry)
	if err != nil && err != sql.ErrNoRows {
		return "", err
	}

	if len(item) > 1 {
		q := []byte(`"`)
		value = string(bytes.TrimPrefix(bytes.TrimSuffix(item, q), q))
	}

	return value, nil
}

// SetUser writes a configuration JSON element to the userconfig table for the specified user.
// You can store org level settings by providing an empty user ID.
func (s Scope) SetUser(orgID, userID, key, json string) (err error) {
	if key == "" {
		return errors.New("no key")
	}

	tx, err := s.Runtime.Db.Beginx()
	if err != nil {
		return err
	}

	_, err = tx.Exec("DELETE FROM userconfig WHERE orgid=? AND userid=? AND `key`=?", orgID, userID, key)
	if err != nil {
		fmt.Println(err)
		fmt.Println("ccc")
	}

	_, err = tx.Exec("INSERT INTO userconfig (orgid, userid, `key`, `config`) VALUES (?, ?, ?, ?)", orgID, userID, key, json)
	if err != nil {
		fmt.Println(err)
		fmt.Println("ddd")
	}

	if err == nil {
		tx.Commit()
	} else {
		tx.Rollback()
	}

	return err
}
