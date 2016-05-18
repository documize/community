package request

import (
	"bytes"

	"github.com/documize/community/wordsmith/utility"
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
	defer utility.Close(stmt)

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
