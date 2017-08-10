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

import "github.com/jmoiron/sqlx"

// Runtime provides access to database, logger and other server-level scoped objects.
// Use Context for per-request values.
type Runtime struct {
	Flags     Flags
	Db        *sqlx.DB
	DbVariant DbVariant
	Log       Logger
	Product   ProdInfo
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

// DbVariant details SQL database variant
type DbVariant string

const (
	// DbVariantMySQL is MySQL
	DbVariantMySQL DbVariant = "MySQL"
	// DBVariantPercona is Percona
	DBVariantPercona DbVariant = "Percona"
	// DBVariantMariaDB is MariaDB
	DBVariantMariaDB DbVariant = "MariaDB"
	// DBVariantMSSQL is Microsoft SQL Server
	DBVariantMSSQL DbVariant = "MSSQL"
	// DBVariantPostgreSQL is PostgreSQL
	DBVariantPostgreSQL DbVariant = "PostgreSQL"
)
