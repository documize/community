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

package setting

import (
    "bytes"
    "database/sql"
    "fmt"

    "github.com/pkg/errors"

    "github.com/documize/community/domain/store"
)

// Store provides data access to user permission information.
type Store struct {
	store.Context
	store.SettingStorer
}

// Get fetches a configuration JSON element from the config table.
func (s Store) Get(area, path string) (value string, err error) {
	qry := fmt.Sprintf("SELECT %s FROM dmz_config WHERE c_key = '%s';", s.GetJSONValue("c_config", path), area)

	item := []byte{}
	err = s.Runtime.Db.Get(&item, qry)
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
func (s Store) Set(area, json string) (err error) {
	if area == "" {
		return errors.New("no area")
	}

	tx, err := s.Runtime.Db.Beginx()
	if err != nil {
		s.Runtime.Log.Error(fmt.Sprintf("setting.Set %s", area), err)
		return
	}

	_, err = tx.Exec(s.Bind("DELETE FROM dmz_config WHERE c_key = ?"), area)
	if err != nil && err != sql.ErrNoRows {
		tx.Rollback()
		s.Runtime.Log.Error(fmt.Sprintf("setting.Set %s", area), err)
		return err
	}

	_, err = tx.Exec(s.Bind("INSERT INTO dmz_config (c_key,c_config) VALUES (?, ?)"), area, json)
	if err != nil && err != sql.ErrNoRows {
		tx.Rollback()
		s.Runtime.Log.Error(fmt.Sprintf("setting.Set %s", area), err)
		return err
	}

	tx.Commit()

	return err
}

// GetUser fetches a configuration JSON element from the userconfig table for a given orgid/userid combination.
// Errors return the empty string. A blank path returns the whole JSON object, as JSON.
// You can store org level settings by providing an empty user ID.
func (s Store) GetUser(orgID, userID, key, path string) (value string, err error) {
	var item = make([]uint8, 0)

	qry := fmt.Sprintf("SELECT %s FROM dmz_user_config WHERE c_key = '%s' AND c_orgid='%s' AND c_userid='%s';",
		s.GetJSONValue("c_config", path), key, orgID, userID)

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
func (s Store) SetUser(orgID, userID, key, json string) (err error) {
	if key == "" {
		return errors.New("no key")
	}

	tx, err := s.Runtime.Db.Beginx()
	if err != nil {
		return err
	}

	_, err = tx.Exec(s.Bind("DELETE FROM dmz_user_config WHERE c_orgid=? AND c_userid=? AND c_key=?"),
		orgID, userID, key)
	if err != nil {
		fmt.Println(err)
	}

	_, err = tx.Exec(s.Bind("INSERT INTO dmz_user_config (c_orgid, c_userid, c_key, c_config) VALUES (?, ?, ?, ?)"),
		orgID, userID, key, json)
	if err != nil {
		fmt.Println(err)
	}

	if err == nil {
		tx.Commit()
	} else {
		tx.Rollback()
	}

	return err
}
