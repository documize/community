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
	"fmt"
	"strings"

	_ "github.com/denisenkom/go-mssqldb" // the SQL Server driver is required behind the scenes
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
)

// SQLServerProvider supports Microsoft SQl Server.
type SQLServerProvider struct {
	// User specified connection string.
	ConnectionString string

	// Unused for this provider.
	Variant env.StoreType
}

// SetSQLServerProvider creates PostgreSQL provider.
//
// Useful links:
//
// Driver for Golang:
//		https://github.com/denisenkom/go-mssqldb
// Docker Linux testing:
//		https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker?view=sql-server-2017
// 		docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=Passw0rd' -p 1433:1433 --name sql1 -d mcr.microsoft.com/mssql/server:2017-latest
// JSON types:
// 		https://docs.microsoft.com/en-us/sql/relational-databases/json/json-data-sql-server?view=sql-server-2017
//
// Supports 2016, 2017 and 2019.
func SetSQLServerProvider(r *env.Runtime, s *store.Store) {
	// Set up provider specific details.
	r.StoreProvider = SQLServerProvider{
		ConnectionString: r.Flags.DBConn,
		Variant:          env.StoreTypeSQLServer,
	}

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

	// Section Template
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
	searchStore := search.StoreSQLServer{}
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

// Type returns name of provider
func (p SQLServerProvider) Type() env.StoreType {
	return env.StoreTypeSQLServer
}

// TypeVariant returns databse flavor
func (p SQLServerProvider) TypeVariant() env.StoreType {
	return p.Variant
}

// DriverName returns database/sql driver name.
func (p SQLServerProvider) DriverName() string {
	return "sqlserver"
}

// Params returns connection string parameters that must be present before connecting to DB.
func (p SQLServerProvider) Params() map[string]string {
	// Not used for this provider.
	// return map[string]string{}

	return map[string]string{
		"app+name":           "Documize",
		"connection+timeout": "0",
		"keep-alive":         "0",
	}
}

// Example holds storage provider specific connection string format
// used in error messages.
func (p SQLServerProvider) Example() string {
	return "database connection string format options: sqlserver://username:password@host:port?database=Documize OR sqlserver://username:password@host/instance?database=Documize OR sqlserver://sa@localhost/SQLExpress?database=Documize"
}

// DatabaseName holds the SQL database name where Documize tables live.
func (p SQLServerProvider) DatabaseName() string {
	bits := strings.Split(p.ConnectionString, "?")
	if len(bits) != 2 {
		return ""
	}

	params := strings.Split(bits[len(bits)-1], "&")
	for _, s := range params {
		s = strings.TrimSpace(s)
		if strings.Contains(s, "database=") {
			s = strings.Replace(s, "database=", "", 1)

			return s
		}
	}

	return ""
}

// MakeConnectionString returns provider specific DB connection string
// complete with default parameters.
func (p SQLServerProvider) MakeConnectionString() string {
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
	// No special processing so return as-is.
	// return p.ConnectionString
}

// QueryMeta is how to extract version number, version related comment,
// character set and collation from database provider.
func (p SQLServerProvider) QueryMeta() string {
	return fmt.Sprintf(`
		SELECT 
		CAST(SERVERPROPERTY('productversion') AS VARCHAR) AS version,
		@@VERSION AS comment,
		collation_name AS collation,
		'' AS charset
		FROM sys.databases
		WHERE name='%s'`, p.DatabaseName())
}

// QueryRecordVersionUpgrade returns database specific insert statement
// that records the database version number.
func (p SQLServerProvider) QueryRecordVersionUpgrade(version int) string {
	// Make record that holds new database version number.
	json := fmt.Sprintf("{\"database\": \"%d\"}", version)

	return fmt.Sprintf(`UPDATE dmz_config SET c_config='%s' WHERE c_key='META'`, json)
}

// QueryRecordVersionUpgradeLegacy returns database specific insert statement
// that records the database version number.
func (p SQLServerProvider) QueryRecordVersionUpgradeLegacy(version int) string {
	// This provider has no legacy schema.
	return p.QueryRecordVersionUpgrade(version)
}

// QueryGetDatabaseVersion returns the schema version number.
func (p SQLServerProvider) QueryGetDatabaseVersion() string {
	return "SELECT JSON_VALUE(c_config, '$.database') FROM dmz_config WHERE c_key = 'META';"
}

// QueryGetDatabaseVersionLegacy returns the schema version number before The Great Schema Migration (v25, MySQL).
func (p SQLServerProvider) QueryGetDatabaseVersionLegacy() string {
	// This provider has no legacy schema.
	return p.QueryGetDatabaseVersion()
}

// QueryTableList returns a list tables in Documize database.
func (p SQLServerProvider) QueryTableList() string {
	return fmt.Sprintf(`SELECT TABLE_NAME 
	FROM %s.INFORMATION_SCHEMA.TABLES`, p.DatabaseName())
}

// QueryDateInterval returns provider specific interval style
// date SQL.
func (p SQLServerProvider) QueryDateInterval(days int64) string {
	return fmt.Sprintf("DATEADD(DAY, -%d, GETDATE())", days)
}

// JSONEmpty returns empty SQL JSON object.
// Typically used as 2nd parameter to COALESCE().
func (p SQLServerProvider) JSONEmpty() string {
	return "'{}'"
}

// JSONGetValue returns JSON attribute selection syntax.
// Typically used in SELECT <my_json_field> query.
func (p SQLServerProvider) JSONGetValue(column, attribute string) string {
	if len(attribute) > 0 {
		return fmt.Sprintf("JSON_VALUE(%s, '$.%s')", column, attribute)
	}

	return fmt.Sprintf("JSON_QUERY(%s)", column)
}

// VerfiyVersion checks to see if actual database meets
// minimum version requirements.
//
// See: http://sqlserverbuilds.blogspot.com
func (p SQLServerProvider) VerfiyVersion(dbVersion string) (bool, string) {

	if strings.HasPrefix(dbVersion, "13.") ||
		strings.HasPrefix(dbVersion, "14.") ||
		strings.HasPrefix(dbVersion, "15.") {
		return true, ""
	}

	return false, "Microsoft SQL Server 2016, 2017 or 2019 is required"
}

// VerfiyCharacterCollation needs to ensure utf8.
// https://www.red-gate.com/simple-talk/sql/sql-development/questions-sql-server-collations-shy-ask/
func (p SQLServerProvider) VerfiyCharacterCollation(charset, collation string) (charOK bool, requirements string) {
	// Collation & characters check ignored.
	return true, ""
}

// ConvertTimestamp returns SQL function to correctly convert
// ISO 8601 format (e.g. '2016-09-08T06:37:23Z') to SQL specific
// timestamp value (e.g. 2016-09-08 06:37:23).
//
// We must use ? for parameter placeholder character as DB layer
// will convert to database specific parameter placeholder character.
func (p SQLServerProvider) ConvertTimestamp() (statement string) {
	return `convert(varchar, ?, 13)`
}

// IsTrue returns "1"
func (p SQLServerProvider) IsTrue() string {
	return "1"
}

// IsFalse returns "0"
func (p SQLServerProvider) IsFalse() string {
	return "0"
}

// RowLimit returns SQL for limiting number of rows returned.
func (p SQLServerProvider) RowLimit(max int) string {
	return fmt.Sprintf("TOP %d", max)
}
