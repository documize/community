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

import (
	"github.com/jmoiron/sqlx"
)

// SQL-STORE: DbVariant needs to be struct like: name, delims, std params and conn string method

// Runtime provides access to database, logger and other server-level scoped objects.
// Use Context for per-request values.
type Runtime struct {
	Flags         Flags
	Db            *sqlx.DB
	StoreProvider StoreProvider
	Log           Logger
	Product       ProdInfo
}

const (
	// SiteModeNormal serves app
	SiteModeNormal = ""

	// SiteModeOffline serves offline.html
	SiteModeOffline = "1"

	// SiteModeSetup tells Ember to serve setup route
	SiteModeSetup = "2"

	// SiteModeBadDB redirects to db-error.html page
	SiteModeBadDB = "3"
)

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

	// StoreTypeMSSQL is Microsoft SQL Server
	StoreTypeMSSQL StoreType = "MSSQL"
)

// StoreProvider defines a database provider.
type StoreProvider interface {
	// Name of provider
	Type() StoreType

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

	// QueryStartLock locks database tables.
	QueryStartLock() string

	// QueryFinishLock unlocks database tables.
	QueryFinishLock() string

	// QueryInsertProcessID returns database specific query that will
	// insert ID of this running process.
	QueryInsertProcessID() string

	// QueryInsertProcessID returns database specific query that will
	// delete ID of this running process.
	QueryDeleteProcessID() string

	// QueryRecordVersionUpgrade returns database specific insert statement
	// that records the database version number.
	QueryRecordVersionUpgrade(version int) string

	// QueryGetDatabaseVersion returns the schema version number.
	QueryGetDatabaseVersion() string

	// QueryTableList returns a list tables in Documize database.
	QueryTableList() string

	// VerfiyVersion checks to see if actual database meets
	// minimum version requirements.
	VerfiyVersion(dbVersion string) (versionOK bool, minVerRequired string)

	// VerfiyCharacterCollation checks to see if actual database
	// has correct character set and collation settings.
	VerfiyCharacterCollation(charset, collation string) (charOK bool, requirements string)
}

const (
	// CommunityEdition is AGPL product variant
	CommunityEdition = "Community"

	// EnterpriseEdition is commercial licensed product variant
	EnterpriseEdition = "Enterprise"
)
