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

package pin

import (
	"fmt"
	"time"

	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store/mysql"
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
)

// Add saves pinned item.
func Add(s domain.StoreContext, pin Pin) (err error) {
	row := s.Runtime.Db.QueryRow("SELECT max(sequence) FROM pin WHERE orgid=? AND userid=?", s.Context.OrgID, s.Context.UserID)
	var maxSeq int
	err = row.Scan(&maxSeq)

	if err != nil {
		maxSeq = 99
	}

	pin.Created = time.Now().UTC()
	pin.Revised = time.Now().UTC()
	pin.Sequence = maxSeq + 1

	stmt, err := s.Context.Transaction.Preparex("INSERT INTO pin (refid, orgid, userid, labelid, documentid, pin, sequence, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare pin insert")
		return
	}

	_, err = stmt.Exec(pin.RefID, pin.OrgID, pin.UserID, pin.FolderID, pin.DocumentID, pin.Pin, pin.Sequence, pin.Created, pin.Revised)
	if err != nil {
		err = errors.Wrap(err, "execute pin insert")
		return
	}

	return
}

// GetPin returns requested pinned item.
func GetPin(s domain.StoreContext, id string) (pin Pin, err error) {
	stmt, err := s.Runtime.Db.Preparex("SELECT id, refid, orgid, userid, labelid as folderid, documentid, pin, sequence, created, revised FROM pin WHERE orgid=? AND refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("prepare select for pin %s", id))
		return
	}

	err = stmt.Get(&pin, s.Context.OrgID, id)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute select for pin %s", id))
		return
	}

	return
}

// GetUserPins returns pinned items for specified user.
func GetUserPins(s domain.StoreContext, userID string) (pins []Pin, err error) {
	err = s.Runtime.Db.Select(&pins, "SELECT id, refid, orgid, userid, labelid as folderid, documentid, pin, sequence, created, revised FROM pin WHERE orgid=? AND userid=? ORDER BY sequence", s.Context.OrgID, userID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute select pins for org %s and user %s", s.Context.OrgID, userID))
		return
	}

	return
}

// UpdatePin updates existing pinned item.
func UpdatePin(s domain.StoreContext, pin entity.Pin) (err error) {
	pin.Revised = time.Now().UTC()

	var stmt *sqlx.NamedStmt
	stmt, err = s.Context.Transaction.PrepareNamed("UPDATE pin SET labelid=:folderid, documentid=:documentid, pin=:pin, sequence=:sequence, revised=:revised WHERE orgid=:orgid AND refid=:refid")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("prepare pin update %s", pin.RefID))
		return
	}

	_, err = stmt.Exec(&pin)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute pin update %s", pin.RefID))
		return
	}

	return
}

// UpdatePinSequence updates existing pinned item sequence number
func UpdatePinSequence(s domain.StoreContext, pinID string, sequence int) (err error) {
	stmt, err := s.Context.Transaction.Preparex("UPDATE pin SET sequence=?, revised=? WHERE orgid=? AND userid=? AND refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("prepare pin sequence update %s", pinID))
		return
	}

	_, err = stmt.Exec(sequence, time.Now().UTC(), s.Context.OrgID, s.Context.UserID, pinID)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute pin sequence update %s", pinID))
		return
	}

	return
}

// DeletePin removes folder from the store.
func DeletePin(s domain.StoreContext, id string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	return b.DeleteConstrained(s.Context.Transaction, "pin", s.Context.OrgID, id)
}

// DeletePinnedSpace removes any pins for specified space.
func DeletePinnedSpace(s domain.StoreContext, spaceID string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	return b.DeleteWhere(s.Context.Transaction, fmt.Sprintf("DELETE FROM pin WHERE orgid=\"%s\" AND labelid=\"%s\"", s.Context.OrgID, spaceID))
}

// DeletePinnedDocument removes any pins for specified document.
func DeletePinnedDocument(s domain.StoreContext, documentID string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	return b.DeleteWhere(s.Context.Transaction, fmt.Sprintf("DELETE FROM pin WHERE orgid=\"%s\" AND documentid=\"%s\"", s.Context.OrgID, documentID))
}
