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

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/streamutil"
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

	stmt, err := s.Runtime.Db.Preparex(sql)
	defer streamutil.Close(stmt)

	if err != nil {
		return "", err
	}

	var item = make([]uint8, 0)

	err = stmt.Get(&item)
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
func (s Scope) Set(area, json string) error {
	if area == "" {
		return errors.New("no area")
	}

	sql := "INSERT INTO `config` (`key`,`config`) " +
		"VALUES ('" + area + "','" + json +
		"') ON DUPLICATE KEY UPDATE `config`='" + json + "';"

	stmt, err := s.Runtime.Db.Preparex(sql)
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "failed to save global config value")
		return err
	}

	_, err = stmt.Exec()
	return err
}

// GetUser fetches a configuration JSON element from the userconfig table for a given orgid/userid combination.
// Errors return the empty string. A blank path returns the whole JSON object, as JSON.
func (s Scope) GetUser(orgID, userID, area, path string) (value string, err error) {
	if path != "" {
		path = "." + path
	}

	qry := "SELECT JSON_EXTRACT(`config`,'$" + path + "') FROM `userconfig` WHERE `key` = '" + area +
		"' AND `orgid` = '" + orgID + "' AND `userid` = '" + userID + "';"

	stmt, err := s.Runtime.Db.Preparex(qry)
	defer streamutil.Close(stmt)

	if err != nil {
		return "", err
	}

	var item = make([]uint8, 0)

	err = stmt.Get(&item)
	if err != nil && err != sql.ErrNoRows {
		return "", err
	}

	if len(item) > 1 {
		q := []byte(`"`)
		value = string(bytes.TrimPrefix(bytes.TrimSuffix(item, q), q))
	}

	return value, nil
}

// SetUser writes a configuration JSON element to the userconfig table for the current user.
func (s Scope) SetUser(orgID, userID, area, json string) error {
	if area == "" {
		return errors.New("no area")
	}

	sql := "INSERT INTO `userconfig` (`orgid`,`userid`,`key`,`config`) " +
		"VALUES ('" + orgID + "','" + userID + "','" + area + "','" + json +
		"') ON DUPLICATE KEY UPDATE `config`='" + json + "';"

	stmt, err := s.Runtime.Db.Preparex(sql)
	defer streamutil.Close(stmt)

	if err != nil {
		return err
	}

	_, err = stmt.Exec()

	return err
}
