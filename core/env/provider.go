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

// Package env provides runtime, server level setup and configuration
package env

// StoreType represents name of database system
type StoreType string

const (
	// StoreTypeMySQL is MySQL
	StoreTypeMySQL StoreType = "MySQL"

	// StoreTypePercona is Percona
	StoreTypePercona StoreType = "Percona"

	// StoreTypeMariaDB is MariaDB
	StoreTypeMariaDB StoreType = "MariaDB"

	// StoreTypePostgreSQL is PostgreSQL
	StoreTypePostgreSQL StoreType = "PostgreSQL"

	// StoreTypeSQLServer is Microsoft SQL Server
	StoreTypeSQLServer StoreType = "SQLServer"
)

// StoreProvider defines a database provider.
type StoreProvider interface {
	// Name of provider
	Type() StoreType

	// TypeVariant returns flavor of database provider.
	TypeVariant() StoreType

	// SQL driver name used to open DB connection.
	DriverName() string

	// Database connection string parameters that must be present before connecting to DB.
	Params() map[string]string

	// Example holds storage provider specific connection string format.
	// used in error messages
	Example() string

	// DatabaseName holds the SQL database name where Documize tables live.
	DatabaseName() string

	// Make connection string with default parameters.
	MakeConnectionString() string

	// QueryMeta is how to extract version number, collation, character set from database provider.
	QueryMeta() string

	// QueryRecordVersionUpgrade returns database specific insert statement
	// that records the database version number.
	QueryRecordVersionUpgrade(version int) string

	// QueryRecordVersionUpgrade returns database specific insert statement
	// that records the database version number.
	// For use on databases before The Great Schema Migration (v25, MySQL).
	QueryRecordVersionUpgradeLegacy(version int) string

	// QueryGetDatabaseVersion returns the schema version number.
	QueryGetDatabaseVersion() string

	// QueryGetDatabaseVersionLegacy returns the schema version number before The Great Schema Migration (v25, MySQL).
	QueryGetDatabaseVersionLegacy() string

	// QueryTableList returns a list tables in Documize database.
	QueryTableList() string

	// QueryDateInterval returns provider specific
	// interval style date SQL.
	QueryDateInterval(days int64) string

	// JSONEmpty returns empty SQL JSON object.
	// Typically used as 2nd parameter to COALESCE().
	JSONEmpty() string

	// JSONGetValue returns JSON attribute selection syntax.
	// Typically used in SELECT <my_json_field> query.
	JSONGetValue(column, attribute string) string

	// VerfiyVersion checks to see if actual database meets
	// minimum version requirements.
	VerfiyVersion(dbVersion string) (versionOK bool, minVerRequired string)

	// VerfiyCharacterCollation checks to see if actual database
	// has correct character set and collation settings.
	VerfiyCharacterCollation(charset, collation string) (charOK bool, requirements string)

	// ConvertTimestamp returns SQL function to correctly convert
	// ISO 8601 format (e.g. '2016-09-08T06:37:23Z') to SQL specific
	// timestamp value (e.g. 2016-09-08 06:37:23).
	// Must use ? for parameter placeholder character as DB layer
	// will convert to database specific parameter placeholder character.
	ConvertTimestamp() (statement string)

	// IsTrue returns storage provider boolean TRUE:
	// MySQL is 1, PostgresSQL is TRUE, SQL Server is 1
	IsTrue() string

	// IsFalse returns storage provider boolean FALSE:
	// MySQL is 0, PostgresSQL is FALSE, SQL Server is 0
	IsFalse() string

	// RowLimit returns SQL for limited number of returned rows
	RowLimit(max int) string
}
