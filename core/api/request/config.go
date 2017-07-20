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

package request

import (
	"bytes"
	"errors"

	"github.com/documize/community/core/streamutil"
)

/* NOT CURRENTLY USED
// FlagFromDB overrides the value in *target if it is set in the database configuration JSON.
// Function signaiture must map that in environment.
func FlagFromDB(target *string, name string) bool {
	value := ConfigString(environment.Prefix, name)
	//fmt.Println("DEBUG FlagFromDB " + value)
	if value != `""` && value != "" {
		*target = strings.TrimPrefix(strings.TrimSuffix(value, `"`), `"`)
		return true
	}
	return false
}
*/

// ConfigString fetches a configuration JSON element from the config table.
func ConfigString(area, path string) (ret string) {
	if Db == nil {
		return ""
	}
	if path != "" {
		path = "." + path
	}
	sql := "SELECT JSON_EXTRACT(`config`,'$" + path + "') FROM `config` WHERE `key` = '" + area + "';"

	stmt, err := Db.Preparex(sql)
	if err != nil {
		//fmt.Printf("DEBUG: Unable to prepare select SQL for ConfigString: %s -- error: %v\n", sql, err)
		return ""
	}
	defer streamutil.Close(stmt)

	var item = make([]uint8, 0)

	err = stmt.Get(&item)

	if err != nil {
		//fmt.Printf("DEBUG: Unable to prepare execute SQL for ConfigString: %s -- error: %v\n", sql, err)
		return ""
	}

	if len(item) > 1 {
		q := []byte(`"`)
		ret = string(bytes.TrimPrefix(bytes.TrimSuffix(item, q), q))
	}

	//fmt.Println("DEBUG ConfigString " + sql + " => " + ret)
	return ret
}

// ConfigSet writes a configuration JSON element to the config table.
func ConfigSet(area, json string) error {
	if Db == nil {
		return errors.New("no database")
	}
	if area == "" {
		return errors.New("no area")
	}
	sql := "INSERT INTO `config` (`key`,`config`) " +
		"VALUES ('" + area + "','" + json +
		"') ON DUPLICATE KEY UPDATE `config`='" + json + "';"

	stmt, err := Db.Preparex(sql)
	if err != nil {
		//fmt.Printf("DEBUG: Unable to prepare select SQL for ConfigSet: %s -- error: %v\n", sql, err)
		return err
	}
	defer streamutil.Close(stmt)

	_, err = stmt.Exec()
	return err
}

// UserConfigGetJSON fetches a configuration JSON element from the userconfig table for a given orgid/userid combination.
// Errors return the empty string. A blank path returns the whole JSON object, as JSON.
func UserConfigGetJSON(orgid, userid, area, path string) (ret string) {
	if Db == nil {
		return ""
	}
	if path != "" {
		path = "." + path
	}
	sql := "SELECT JSON_EXTRACT(`config`,'$" + path + "') FROM `userconfig` WHERE `key` = '" + area +
		"' AND `orgid` = '" + orgid + "' AND `userid` = '" + userid + "';"

	stmt, err := Db.Preparex(sql)
	if err != nil {
		//fmt.Printf("DEBUG: Unable to prepare select SQL for ConfigString: %s -- error: %v\n", sql, err)
		return ""
	}
	defer streamutil.Close(stmt)

	var item = make([]uint8, 0)

	err = stmt.Get(&item)

	if err != nil {
		//fmt.Printf("DEBUG: Unable to prepare execute SQL for ConfigString: %s -- error: %v\n", sql, err)
		return ""
	}

	if len(item) > 1 {
		q := []byte(`"`)
		ret = string(bytes.TrimPrefix(bytes.TrimSuffix(item, q), q))
	}

	//fmt.Println("DEBUG UserConfigString " + sql + " => " + ret)
	return ret

}

// UserConfigSetJSON writes a configuration JSON element to the userconfig table for the current user.
func UserConfigSetJSON(orgid, userid, area, json string) error {
	if Db == nil {
		return errors.New("no database")
	}
	if area == "" {
		return errors.New("no area")
	}
	sql := "INSERT INTO `userconfig` (`orgid`,`userid`,`key`,`config`) " +
		"VALUES ('" + orgid + "','" + userid + "','" + area + "','" + json +
		"') ON DUPLICATE KEY UPDATE `config`='" + json + "';"

	stmt, err := Db.Preparex(sql)
	if err != nil {
		//fmt.Printf("DEBUG: Unable to prepare select SQL for UserConfigSetJSON: %s -- error: %v\n", sql, err)
		return err
	}
	defer streamutil.Close(stmt)

	_, err = stmt.Exec()
	return err
}
