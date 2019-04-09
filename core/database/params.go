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

package database

import (
	"github.com/documize/community/core/env"
	"github.com/jmoiron/sqlx"
)

// RebindParams changes MySQL query parameter placeholder from "?" to
// correct value for given database provider.
//
// MySQL uses ?, ?, ? (default for all Documize queries)
// PostgreSQL uses $1, $2, $3
// MS SQL Server uses @p1, @p2, @p3
func RebindParams(sql string, s env.StoreType) string {
	bindParam := sqlx.QUESTION

	switch s {
	case env.StoreTypePostgreSQL:
		bindParam = sqlx.DOLLAR
	case env.StoreTypeSQLServer:
		bindParam = sqlx.AT
	}

	return sqlx.Rebind(bindParam, sql)
}

// RebindPostgreSQL is a helper method on top of RebindParams.
func RebindPostgreSQL(sql string) string {
	return RebindParams(sql, env.StoreTypePostgreSQL)
}
