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
	"strconv"
	"strings"

	"github.com/documize/community/core/env"
	account "github.com/documize/community/domain/account"
	activity "github.com/documize/community/domain/activity"
	attachment "github.com/documize/community/domain/attachment"
	audit "github.com/documize/community/domain/audit"
	block "github.com/documize/community/domain/block"
	category "github.com/documize/community/domain/category"
	document "github.com/documize/community/domain/document"
	group "github.com/documize/community/domain/group"
	label "github.com/documize/community/domain/label"
	link "github.com/documize/community/domain/link"
	meta "github.com/documize/community/domain/meta"
	"github.com/documize/community/domain/onboard"
	org "github.com/documize/community/domain/organization"
	page "github.com/documize/community/domain/page"
	permission "github.com/documize/community/domain/permission"
	pin "github.com/documize/community/domain/pin"
	search "github.com/documize/community/domain/search"
	setting "github.com/documize/community/domain/setting"
	space "github.com/documize/community/domain/space"
	"github.com/documize/community/domain/store"
	user "github.com/documize/community/domain/user"
	_ "github.com/go-sql-driver/mysql" // the mysql driver is required behind the scenes
)

// SetMySQLProvider creates MySQL provider
func SetMySQLProvider(r *env.Runtime, s *store.Store) {
	// Set up provider specific details.
	p := MySQLProvider{
		ConnectionString: r.Flags.DBConn,
	}
	switch r.Flags.DBType {
	case "mysql":
		p.Variant = env.StoreTypeMySQL
	case "mariadb":
		p.Variant = env.StoreTypeMariaDB
	case "percona":
		p.Variant = env.StoreTypePercona
	}

	r.StoreProvider = p

	// Wire up data providers.

	// Account
	accountStore := account.Store{}
	accountStore.Runtime = r
	s.Account = accountStore

	// Activity
	activityStore := activity.Store{}
	activityStore.Runtime = r
	s.Activity = activityStore

	// Attachment
	attachmentStore := attachment.Store{}
	attachmentStore.Runtime = r
	s.Attachment = attachmentStore

	// Audit
	auditStore := audit.Store{}
	auditStore.Runtime = r
	s.Audit = auditStore

	// (Block) Section Template
	blockStore := block.Store{}
	blockStore.Runtime = r
	s.Block = blockStore

	// Category
	categoryStore := category.Store{}
	categoryStore.Runtime = r
	s.Category = categoryStore

	// Document
	documentStore := document.Store{}
	documentStore.Runtime = r
	s.Document = documentStore

	// Group
	groupStore := group.Store{}
	groupStore.Runtime = r
	s.Group = groupStore

	// Link
	linkStore := link.Store{}
	linkStore.Runtime = r
	s.Link = linkStore

	// Meta
	metaStore := meta.Store{}
	metaStore.Runtime = r
	s.Meta = metaStore

	// Organization (tenant)
	orgStore := org.Store{}
	orgStore.Runtime = r
	s.Organization = orgStore

	// Page (section)
	pageStore := page.Store{}
	pageStore.Runtime = r
	s.Page = pageStore

	// Permission
	permissionStore := permission.Store{}
	permissionStore.Runtime = r
	s.Permission = permissionStore

	// Pin
	pinStore := pin.Store{}
	pinStore.Runtime = r
	s.Pin = pinStore

	// Search
	searchStore := search.Store{}
	searchStore.Runtime = r
	s.Search = searchStore

	// Setting
	settingStore := setting.Store{}
	settingStore.Runtime = r
	s.Setting = settingStore

	// Space
	spaceStore := space.Store{}
	spaceStore.Runtime = r
	s.Space = spaceStore

	// User
	userStore := user.Store{}
	userStore.Runtime = r
	s.User = userStore

	// Space Label
	labelStore := label.Store{}
	labelStore.Runtime = r
	s.Label = labelStore

	// New user onboarding.
	onboardStore := onboard.Store{}
	onboardStore.Runtime = r
	s.Onboard = onboardStore
}

// MySQLProvider supports MySQL 5.7.x and 8.0.x versions.
type MySQLProvider struct {
	// User specified connection string.
	ConnectionString string

	// User specified db type (mysql, percona or mariadb).
	Variant env.StoreType
}

// Type returns name of provider
func (p MySQLProvider) Type() env.StoreType {
	return env.StoreTypeMySQL
}

// TypeVariant returns databse flavor
func (p MySQLProvider) TypeVariant() env.StoreType {
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
		"maxAllowedPacket": "0",
	}

	// maxAllowedPacket
	// default is 4194304
	// 16777216 = 16MB
	// 104857600 = 100MB
	// 0 means fetch value from server
}

// Example holds storage provider specific connection string format
// used in error messages.
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

// QueryMeta is how to extract version number, collatio``n, character set from database provider.
func (p MySQLProvider) QueryMeta() string {
	return "SELECT VERSION() AS version, @@version_comment as comment, @@character_set_database AS charset, @@collation_database AS collation"
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
	return `SELECT TABLE_NAME FROM information_schema.tables
        WHERE TABLE_SCHEMA = '` + p.DatabaseName() + `' AND TABLE_TYPE='BASE TABLE'`
}

// QueryDateInterval returns provider specific interval style
// date SQL.
func (p MySQLProvider) QueryDateInterval(days int64) string {
	return fmt.Sprintf("DATE(NOW()) - INTERVAL %d DAY", days)
}

// JSONEmpty returns empty SQL JSON object.
// Typically used as 2nd parameter to COALESCE().
func (p MySQLProvider) JSONEmpty() string {
	return "JSON_UNQUOTE('{}')"
}

// JSONGetValue returns JSON attribute selection syntax.
// Typically used in SELECT <my_json_field> query.
func (p MySQLProvider) JSONGetValue(column, attribute string) string {
	if len(attribute) > 0 {
		return fmt.Sprintf("JSON_EXTRACT(%s,'$.%s')", column, attribute)
	}

	return fmt.Sprintf("JSON_EXTRACT(%s,'$')", column)
}

// VerfiyVersion checks to see if actual database meets
// minimum version requirements.
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
	charset = strings.ToLower(charset)
	collation = strings.ToLower(collation)

	if charset != "utf8" && charset != "utf8mb4" {
		return false, "MySQL character needs to be utf8/utf8mb4"
	}
	if !strings.HasPrefix(collation, "utf8") {
		return false, "MySQL collation sequence needs to be utf8"
	}

	return true, ""
}

// ConvertTimestamp returns SQL function to correctly convert
// ISO 8601 format (e.g. '2016-09-08T06:37:23Z') to SQL specific
// timestamp value (e.g. 2016-09-08 06:37:23).
// Must use ? for parameter placeholder character as DB layer
// will convert to database specific parameter placeholder character.
func (p MySQLProvider) ConvertTimestamp() (statement string) {
	return `STR_TO_DATE(?,'%Y-%m-%d %H:%i:%s')`
}

// IsTrue returns "1"
func (p MySQLProvider) IsTrue() string {
	return "1"
}

// IsFalse returns "0"
func (p MySQLProvider) IsFalse() string {
	return "0"
}

// RowLimit returns SQL for limiting number of rows returned.
func (p MySQLProvider) RowLimit(max int) string {
	return fmt.Sprintf("LIMIT %d", max)
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
