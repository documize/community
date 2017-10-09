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

package mysql

import (
	"fmt"

	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
)

// BaseQuery provides common MySQL methods.
type BaseQuery struct {
}

// Delete record.
func (m *BaseQuery) Delete(tx *sqlx.Tx, table string, id string) (rows int64, err error) {
	result, err := tx.Exec("DELETE FROM "+table+" WHERE refid=?", id)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to delete row in table %s", table))
		return
	}

	rows, err = result.RowsAffected()

	return
}

// DeleteConstrained record constrained to Organization using refid.
func (m *BaseQuery) DeleteConstrained(tx *sqlx.Tx, table string, orgID, id string) (rows int64, err error) {
	result, err := tx.Exec("DELETE FROM "+table+" WHERE orgid=? AND refid=?", orgID, id)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to delete row in table %s", table))
		return
	}

	rows, err = result.RowsAffected()

	return
}

// DeleteConstrainedWithID record constrained to Organization using non refid.
func (m *BaseQuery) DeleteConstrainedWithID(tx *sqlx.Tx, table string, orgID, id string) (rows int64, err error) {
	result, err := tx.Exec("DELETE FROM "+table+" WHERE orgid=? AND id=?", orgID, id)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to delete row in table %s", table))
		return
	}

	rows, err = result.RowsAffected()

	return
}

// DeleteWhere free form query.
func (m *BaseQuery) DeleteWhere(tx *sqlx.Tx, statement string) (rows int64, err error) {
	result, err := tx.Exec(statement)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to delete rows: %s", statement))
		return
	}

	rows, err = result.RowsAffected()

	return
}
