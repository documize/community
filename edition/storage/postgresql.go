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
	_ "github.com/lib/pq" // the PostgreSQL driver is required behind the scenes
)

// PostgreSQLProvider supports by popular demand.
type PostgreSQLProvider struct {
	// User specified connection string.
	ConnectionString string

	// Unused for this provider.
	Variant env.StoreType
}

// SetPostgreSQLProvider creates PostgreSQL provider
func SetPostgreSQLProvider(r *env.Runtime, s *store.Store) {
	// Set up provider specific details.
	r.StoreProvider = PostgreSQLProvider{
		ConnectionString: r.Flags.DBConn,
		Variant:          env.StoreTypePostgreSQL,
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

// Type returns name of provider
func (p PostgreSQLProvider) Type() env.StoreType {
	return env.StoreTypePostgreSQL
}

// TypeVariant returns databse flavor
func (p PostgreSQLProvider) TypeVariant() env.StoreType {
	return p.Variant
}

// DriverName returns database/sql driver name.
func (p PostgreSQLProvider) DriverName() string {
	return "postgres"
}

// Params returns connection string parameters that must be present before connecting to DB.
func (p PostgreSQLProvider) Params() map[string]string {
	// Not used for this provider.
	return map[string]string{}
}

// Example holds storage provider specific connection string format
// used in error messages.
func (p PostgreSQLProvider) Example() string {
	return "database connection string format is 'host=localhost port=5432 sslmode=disable user=admin password=secret dbname=documize'"
}

// DatabaseName holds the SQL database name where Documize tables live.
func (p PostgreSQLProvider) DatabaseName() string {
	bits := strings.Split(p.ConnectionString, " ")
	for _, s := range bits {
		s = strings.TrimSpace(s)
		if strings.Contains(s, "dbname=") {
			s = strings.Replace(s, "dbname=", "", 1)

			return s
		}
	}

	return ""
}

// MakeConnectionString returns provider specific DB connection string
// complete with default parameters.
func (p PostgreSQLProvider) MakeConnectionString() string {
	// No special processing so return as-is.
	return p.ConnectionString
}

// QueryMeta is how to extract version number, collation, character set from database provider.
func (p PostgreSQLProvider) QueryMeta() string {
	// SELECT version() as vstring, current_setting('server_version_num') as vnumber, pg_encoding_to_char(encoding) AS charset FROM pg_database WHERE datname = 'documize';

	return fmt.Sprintf(`SELECT cast(current_setting('server_version_num') AS TEXT) AS version, version() AS comment, pg_encoding_to_char(encoding) AS charset, '' AS collation
        FROM pg_database WHERE datname = '%s'`, p.DatabaseName())
}

// QueryRecordVersionUpgrade returns database specific insert statement
// that records the database version number.
func (p PostgreSQLProvider) QueryRecordVersionUpgrade(version int) string {
	// Make record that holds new database version number.
	json := fmt.Sprintf("{\"database\": \"%d\"}", version)

	return fmt.Sprintf(`INSERT INTO dmz_config (c_key,c_config) VALUES ('META','%s')
        ON CONFLICT (c_key) DO UPDATE SET c_config='%s' WHERE dmz_config.c_key='META'`, json, json)
}

// QueryRecordVersionUpgradeLegacy returns database specific insert statement
// that records the database version number.
func (p PostgreSQLProvider) QueryRecordVersionUpgradeLegacy(version int) string {
	// This provider has no legacy schema.
	return p.QueryRecordVersionUpgrade(version)
}

// QueryGetDatabaseVersion returns the schema version number.
func (p PostgreSQLProvider) QueryGetDatabaseVersion() string {
	return "SELECT c_config -> 'database' FROM dmz_config WHERE c_key = 'META';"
}

// QueryGetDatabaseVersionLegacy returns the schema version number before The Great Schema Migration (v25, MySQL).
func (p PostgreSQLProvider) QueryGetDatabaseVersionLegacy() string {
	// This provider has no legacy schema.
	return p.QueryGetDatabaseVersion()
}

// QueryTableList returns a list tables in Documize database.
func (p PostgreSQLProvider) QueryTableList() string {
	return fmt.Sprintf(`select table_name
        FROM information_schema.tables
        WHERE table_type='BASE TABLE' AND table_schema NOT IN ('pg_catalog', 'information_schema') AND table_name != 'spatial_ref_sys' AND table_catalog='%s'`, p.DatabaseName())
}

// QueryDateInterval returns provider specific interval style
// date SQL.
func (p PostgreSQLProvider) QueryDateInterval(days int64) string {
	return fmt.Sprintf("DATE(NOW()) - INTERVAL '%d day'", days)
}

// JSONEmpty returns empty SQL JSON object.
// Typically used as 2nd parameter to COALESCE().
func (p PostgreSQLProvider) JSONEmpty() string {
	return "'{}'::json"
}

// JSONGetValue returns JSON attribute selection syntax.
// Typically used in SELECT <my_json_field> query.
func (p PostgreSQLProvider) JSONGetValue(column, attribute string) string {
	if len(attribute) > 0 {
		return fmt.Sprintf("%s -> '%s'", column, attribute)
	}

	return fmt.Sprintf("%s", column)
}

// VerfiyVersion checks to see if actual database meets
// minimum version requirements.``
func (p PostgreSQLProvider) VerfiyVersion(dbVersion string) (bool, string) {
	// All versions supported.
	return true, ""
}

// VerfiyCharacterCollation needs to ensure utf8.
func (p PostgreSQLProvider) VerfiyCharacterCollation(charset, collation string) (charOK bool, requirements string) {
	if strings.ToLower(charset) != "utf8" {
		return false, fmt.Sprintf("PostgreSQL character set needs to be utf8, found %s", charset)
	}

	// Collation check ignored.

	return true, ""
}

// ConvertTimestamp returns SQL function to correctly convert
// ISO 8601 format (e.g. '2016-09-08T06:37:23Z') to SQL specific
// timestamp value (e.g. 2016-09-08 06:37:23).
// Must use ? for parameter placeholder character as DB layer
// will convert to database specific parameter placeholder character.
func (p PostgreSQLProvider) ConvertTimestamp() (statement string) {
	return `to_timestamp(?,'YYYY-MM-DD HH24:MI:SS')`
}

// IsTrue returns "true"
func (p PostgreSQLProvider) IsTrue() string {
	return "true"
}

// IsFalse returns "false"
func (p PostgreSQLProvider) IsFalse() string {
	return "false"
}

// RowLimit returns SQL for limiting number of rows returned.
func (p PostgreSQLProvider) RowLimit(max int) string {
	return fmt.Sprintf("LIMIT %d", max)
}
