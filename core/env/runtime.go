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
	"strings"
)

// SQL-STORE: DbVariant needs to be struct like: name, delims, std params and conn string method

// Runtime provides access to database, logger and other server-level scoped objects.
// Use Context for per-request values.
type Runtime struct {
	Flags   Flags
	Db      *sqlx.DB
	Storage StoreProvider
	Log     Logger
	Product ProdInfo
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

// StoreProvider contains database specific details
type StoreProvider struct {
	// Type identifies storage provider
	Type StoreType

	// SQL driver name used to open DB connection.
	DriverName string

	// Database connection string parameters that must be present before connecting to DB
	Params map[string]string

	// Example holds storage provider specific connection string format
	// used in error messages
	Example string
}

// ConnectionString returns provider specific DB connection string
// complete with default parameters.
func (s *StoreProvider) ConnectionString(cs string) string {
	switch s.Type {

	case StoreTypePostgreSQL:
		return "pg"

	case StoreTypeMSSQL:
		return "sql server"

	case StoreTypeMySQL, StoreTypeMariaDB, StoreTypePercona:
		queryBits := strings.Split(cs, "?")
		ret := queryBits[0] + "?"
		retFirst := true

		if len(queryBits) == 2 {
			paramBits := strings.Split(queryBits[1], "&")
			for _, pb := range paramBits {
				found := false
				if assignBits := strings.Split(pb, "="); len(assignBits) == 2 {
					_, found = s.Params[strings.TrimSpace(assignBits[0])]
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

		for k, v := range s.Params {
			if retFirst {
				retFirst = false
			} else {
				ret += "&"
			}
			ret += k + "=" + v
		}

		return ret
	}

	return ""
}

const (
	// CommunityEdition is AGPL product variant
	CommunityEdition = "Community"

	// EnterpriseEdition is commercial licensed product variant
	EnterpriseEdition = "Enterprise"
)
