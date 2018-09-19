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

// Package storage sets up database persistence providers.
package storage

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	account "github.com/documize/community/domain/account/mysql"
	activity "github.com/documize/community/domain/activity/mysql"
	attachment "github.com/documize/community/domain/attachment/mysql"
	audit "github.com/documize/community/domain/audit/mysql"
	block "github.com/documize/community/domain/block/mysql"
	category "github.com/documize/community/domain/category/mysql"
	doc "github.com/documize/community/domain/document/mysql"
	group "github.com/documize/community/domain/group/mysql"
	link "github.com/documize/community/domain/link/mysql"
	meta "github.com/documize/community/domain/meta/mysql"
	org "github.com/documize/community/domain/organization/mysql"
	page "github.com/documize/community/domain/page/mysql"
	permission "github.com/documize/community/domain/permission/mysql"
	pin "github.com/documize/community/domain/pin/mysql"
	search "github.com/documize/community/domain/search/mysql"
	setting "github.com/documize/community/domain/setting/mysql"
	space "github.com/documize/community/domain/space/mysql"
	user "github.com/documize/community/domain/user/mysql"
)

// SetMySQLProvider creates MySQL provider
func SetMySQLProvider(r *env.Runtime, s *domain.Store) {
	// Set up provider specific details.
	r.StoreProvider = MySQLProvider{
		ConnectionString: r.Flags.DBConn,
		Variant:          r.Flags.DBType,
	}

	// Wire up data providers!
	s.Account = account.Scope{Runtime: r}
	s.Activity = activity.Scope{Runtime: r}
	s.Attachment = attachment.Scope{Runtime: r}
	s.Audit = audit.Scope{Runtime: r}
	s.Block = block.Scope{Runtime: r}
	s.Category = category.Scope{Runtime: r}
	s.Document = doc.Scope{Runtime: r}
	s.Group = group.Scope{Runtime: r}
	s.Link = link.Scope{Runtime: r}
	s.Meta = meta.Scope{Runtime: r}
	s.Organization = org.Scope{Runtime: r}
	s.Page = page.Scope{Runtime: r}
	s.Pin = pin.Scope{Runtime: r}
	s.Permission = permission.Scope{Runtime: r}
	s.Search = search.Scope{Runtime: r}
	s.Setting = setting.Scope{Runtime: r}
	s.Space = space.Scope{Runtime: r}
	s.User = user.Scope{Runtime: r}
}

// MySQLProvider supports MySQL 5.7.x and 8.0.x versions.
type MySQLProvider struct {
	// User specified connection string.
	ConnectionString string

	// User specified db type (mysql, percona or mariadb).
	Variant string
}

// Type returns name of provider
func (p MySQLProvider) Type() env.StoreType {
	return env.StoreTypeMySQL
}

// TypeVariant returns databse flavor
func (p MySQLProvider) TypeVariant() string {
	return p.Variant
}

// DriverName returns database/sql driver name.
func (p MySQLProvider) DriverName() string {
	return "mysql"
}

// Params returns connection string parameters that must be present before connecting to DB.
func (p MySQLProvider) Params() map[string]string {
	return map[string]string{
		"charset":          "utf8mb4",
		"parseTime":        "True",
		"maxAllowedPacket": "104857600", // 4194304 // 16777216 = 16MB // 104857600 = 100MB
	}
}

// Example holds storage provider specific connection string format.
// used in error messages
func (p MySQLProvider) Example() string {
	return "database connection string format is 'username:password@tcp(host:3306)/database'"
}

// DatabaseName holds the SQL database name where Documize tables live.
func (p MySQLProvider) DatabaseName() string {
	bits := strings.Split(p.ConnectionString, "/")
	if len(bits) > 1 {
		return strings.Split(bits[len(bits)-1], "?")[0]
	}

	return ""
}

// MakeConnectionString returns provider specific DB connection string
// complete with default parameters.
func (p MySQLProvider) MakeConnectionString() string {
	queryBits := strings.Split(p.ConnectionString, "?")
	ret := queryBits[0] + "?"
	retFirst := true

	params := p.Params()

	if len(queryBits) == 2 {
		paramBits := strings.Split(queryBits[1], "&")
		for _, pb := range paramBits {
			found := false
			if assignBits := strings.Split(pb, "="); len(assignBits) == 2 {
				_, found = params[strings.TrimSpace(assignBits[0])]
			}
			if !found { // if we can't work out what it is, put it through
				if retFirst {
					retFirst = false
				} else {
					ret += "&"
				}
				ret += pb
			}
		}
	}

	for k, v := range params {
		if retFirst {
			retFirst = false
		} else {
			ret += "&"
		}
		ret += k + "=" + v
	}

	return ret
}

// QueryMeta is how to extract version number, collation, character set from database provider.
func (p MySQLProvider) QueryMeta() string {
	return "SELECT VERSION() AS version, @@version_comment as comment, @@character_set_database AS charset, @@collation_database AS collation"
}

// QueryStartLock locks database tables.
func (p MySQLProvider) QueryStartLock() string {
	return "LOCK TABLE dmz_config WRITE;"
}

// QueryFinishLock unlocks database tables.
func (p MySQLProvider) QueryFinishLock() string {
	return "UNLOCK TABLES;"
}

// QueryInsertProcessID returns database specific query that will
// insert ID of this running process.
func (p MySQLProvider) QueryInsertProcessID() string {
	return "INSERT INTO dmz_config (c_key,c_config) " + fmt.Sprintf(`VALUES ('DBLOCK','{"pid": "%d"}');`, os.Getpid())
}

// QueryDeleteProcessID returns database specific query that will
// delete ID of this running process.
func (p MySQLProvider) QueryDeleteProcessID() string {
	return "DELETE FROM dmz_config WHERE c_key='DBLOCK';"
}

// QueryRecordVersionUpgrade returns database specific insert statement
// that records the database version number.
func (p MySQLProvider) QueryRecordVersionUpgrade(version int) string {
	// Make record that holds new database version number.
	json := fmt.Sprintf("{\"database\": \"%d\"}", version)
	return "INSERT INTO dmz_config (c_key,c_config) " + "VALUES ('META','" + json + "') ON DUPLICATE KEY UPDATE c_config='" + json + "';"
}

// QueryRecordVersionUpgradeLegacy returns database specific insert statement
// that records the database version number.
func (p MySQLProvider) QueryRecordVersionUpgradeLegacy(version int) string {
	// Make record that holds new database version number.
	json := fmt.Sprintf("{\"database\": \"%d\"}", version)
	return "INSERT INTO `config` (`key`,`config`) " + "VALUES ('META','" + json + "') ON DUPLICATE KEY UPDATE `config`='" + json + "';"
}

// QueryGetDatabaseVersion returns the schema version number.
func (p MySQLProvider) QueryGetDatabaseVersion() string {
	return "SELECT JSON_EXTRACT(c_config,'$.database') FROM dmz_config WHERE c_key = 'META';"
}

// QueryGetDatabaseVersionLegacy returns the schema version number before The Great Schema Migration (v25, MySQL).
func (p MySQLProvider) QueryGetDatabaseVersionLegacy() string {
	return "SELECT JSON_EXTRACT(`config`,'$.database') FROM `config` WHERE `key` = 'META';"
}

// QueryTableList returns a list tables in Documize database.
func (p MySQLProvider) QueryTableList() string {
	return `SELECT COUNT(*) FROM information_schema.tables
        WHERE table_schema = '` + p.DatabaseName() + `' and TABLE_TYPE='BASE TABLE'`
}

// VerfiyVersion checks to see if actual database meets
// minimum version requirements.``
func (p MySQLProvider) VerfiyVersion(dbVersion string) (bool, string) {
	// Minimum MySQL / MariaDB version.
	minVer := []int{5, 7, 10}
	if p.Variant == "mariadb" {
		minVer = []int{10, 3, 0}
	}

	// Convert string to semver.
	dbSemver, _ := convertDatabaseVersion(dbVersion)

	for k, v := range minVer {
		// If major release is higher then skip minor/patch checks (e.g. 8.x.x > 5.x.x)
		if k == 0 && len(dbSemver) > 0 && dbSemver[0] > minVer[0] {
			break
		}
		if dbSemver[k] < v {
			want := fmt.Sprintf("%d.%d.%d", minVer[0], minVer[1], minVer[2])
			return false, want
		}
	}

	return true, ""
}

// VerfiyCharacterCollation needs to ensure utf8/utf8mb4.
func (p MySQLProvider) VerfiyCharacterCollation(charset, collation string) (charOK bool, requirements string) {
	if charset != "utf8" && charset != "utf8mb4" {
		return false, "MySQL character needs to be utf8/utf8mb4"
	}
	if !strings.HasPrefix(collation, "utf8") {
		return false, "MySQL collation sequence needs to be utf8"
	}

	return true, ""
}

// convertDatabaseVersion turns database version string as major,minor,patch numerics.
func convertDatabaseVersion(v string) (ints []int, err error) {
	ints = []int{0, 0, 0}

	pos := strings.Index(v, "-")
	if pos > 1 {
		v = v[:pos]
	}

	vs := strings.Split(v, ".")

	if len(vs) < 3 {
		err = errors.New("MySQL version not of the form a.b.c")
		return
	}

	for key, val := range vs {
		num, err := strconv.Atoi(val)

		if err != nil {
			return ints, err
		}

		ints[key] = num
	}

	return
}
