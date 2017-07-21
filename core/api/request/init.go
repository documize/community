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

package request

import (
	"fmt"
	// "os"
	// "strings"
	// "time"

	"github.com/jmoiron/sqlx"
	// "github.com/documize/community/core/database"
	// "github.com/documize/community/core/env"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/streamutil"
	// "github.com/documize/community/core/web"
)

var connectionString string

// Db is the central connection to the database, used by all database requests.
var Db *sqlx.DB

var searches *SearchManager

type databaseRequest struct {
	Transaction *sqlx.Tx
	OrgID       string
}

func (dr *databaseRequest) MakeTx() (err error) {
	if dr.Transaction != nil {
		return nil
	}
	dr.Transaction, err = Db.Beginx()
	return err
}

type baseManager struct {
}

func (m *baseManager) Delete(tx *sqlx.Tx, table string, id string) (rows int64, err error) {
	stmt, err := tx.Preparex("DELETE FROM " + table + " WHERE refid=?")
	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare delete of row in table %s", table), err)
		return
	}
	defer streamutil.Close(stmt)

	result, err := stmt.Exec(id)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to delete row in table %s", table), err)
		return
	}

	rows, err = result.RowsAffected()

	return
}

func (m *baseManager) DeleteConstrained(tx *sqlx.Tx, table string, orgID, id string) (rows int64, err error) {
	stmt, err := tx.Preparex("DELETE FROM " + table + " WHERE orgid=? AND refid=?")
	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare constrained delete of row in table %s", table), err)
		return
	}
	defer streamutil.Close(stmt)

	result, err := stmt.Exec(orgID, id)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to delete row in table %s", table), err)
		return
	}

	rows, err = result.RowsAffected()

	return
}

func (m *baseManager) DeleteConstrainedWithID(tx *sqlx.Tx, table string, orgID, id string) (rows int64, err error) {
	stmt, err := tx.Preparex("DELETE FROM " + table + " WHERE orgid=? AND id=?")
	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare ConstrainedWithID delete of row in table %s", table), err)
		return
	}
	defer streamutil.Close(stmt)

	result, err := stmt.Exec(orgID, id)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to delete row in table %s", table), err)
		return
	}

	rows, err = result.RowsAffected()

	return
}

func (m *baseManager) DeleteWhere(tx *sqlx.Tx, statement string) (rows int64, err error) {
	result, err := tx.Exec(statement)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to delete rows: %s", statement), err)
		return
	}

	rows, err = result.RowsAffected()

	return
}

// SQLPrepareError returns a string detailing the location of the error.
func (m *baseManager) SQLPrepareError(method string, id string) string {
	return fmt.Sprintf("Unable to prepare SQL for %s, ID %s", method, id)
}

// SQLSelectError returns a string detailing the location of the error.
func (m *baseManager) SQLSelectError(method string, id string) string {
	return fmt.Sprintf("Unable to execute SQL for %s, ID %s", method, id)
}
