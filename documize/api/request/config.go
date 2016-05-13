package request

import (
	"strings"

	"github.com/documize/community/wordsmith/environment"
	"github.com/documize/community/wordsmith/utility"
)

// FlagFromDB overrides the value in *target if it is set in the database configuration JSON.
// Function signiture must map that in environment
func FlagFromDB(target *string, name string) bool {
	value := ConfigString(environment.Prefix, name)
	//fmt.Println("DEBUG FlagFromDB " + value)
	if value != `""` && value != "" {
		*target = strings.TrimPrefix(strings.TrimSuffix(value, `"`), `"`)
		return true
	}
	return false
}

// ConfigString fetches a configuration JSON element from the config table.
func ConfigString(area, path string) (ret string) {
	if path != "" {
		path = "." + path
	}
	sql := `SELECT JSON_EXTRACT(details,'$` + path + `') AS item FROM config WHERE area = '` + area + `';`

	stmt, err := Db.Preparex(sql)
	if err != nil {
		//log.Error(fmt.Sprintf("Unable to prepare select for ConfigString: %s", sql), err)
		return ""
	}
	defer utility.Close(stmt)

	var item = make([]uint8, 0)

	err = stmt.Get(&item)

	if err != nil {
		//log.Error(fmt.Sprintf("Unable to execute select for ConfigString: %s", sql), err)
		return ""
	}

	if len(item) > 1 {
		ret = string(item)
	}

	//fmt.Println("DEBUG ConfigString " + sql + " => " + ret)
	return ret
}
