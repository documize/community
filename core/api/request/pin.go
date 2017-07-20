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
	"time"

	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/streamutil"
	"github.com/jmoiron/sqlx"
)

// AddPin saves pinned item.
func (p *Persister) AddPin(pin entity.Pin) (err error) {
	row := Db.QueryRow("SELECT max(sequence) FROM pin WHERE orgid=? AND userid=?", p.Context.OrgID, p.Context.UserID)
	var maxSeq int
	err = row.Scan(&maxSeq)

	if err != nil {
		maxSeq = 99
	}

	pin.Created = time.Now().UTC()
	pin.Revised = time.Now().UTC()
	pin.Sequence = maxSeq + 1

	stmt, err := p.Context.Transaction.Preparex("INSERT INTO pin (refid, orgid, userid, labelid, documentid, pin, sequence, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		log.Error("Unable to prepare insert for pin", err)
		return
	}

	_, err = stmt.Exec(pin.RefID, pin.OrgID, pin.UserID, pin.FolderID, pin.DocumentID, pin.Pin, pin.Sequence, pin.Created, pin.Revised)

	if err != nil {
		log.Error("Unable to execute insert for pin", err)
		return
	}

	return
}

// GetPin returns requested pinned item.
func (p *Persister) GetPin(id string) (pin entity.Pin, err error) {
	stmt, err := Db.Preparex("SELECT id, refid, orgid, userid, labelid as folderid, documentid, pin, sequence, created, revised FROM pin WHERE orgid=? AND refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare select for pin %s", id), err)
		return
	}

	err = stmt.Get(&pin, p.Context.OrgID, id)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select for pin %s", id), err)
		return
	}

	return
}

// GetUserPins returns pinned items for specified user.
func (p *Persister) GetUserPins(userID string) (pins []entity.Pin, err error) {
	err = Db.Select(&pins, "SELECT id, refid, orgid, userid, labelid as folderid, documentid, pin, sequence, created, revised FROM pin WHERE orgid=? AND userid=? ORDER BY sequence", p.Context.OrgID, userID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select pin for org %s and user %s", p.Context.OrgID, userID), err)
		return
	}

	return
}

// UpdatePin updates existing pinned item.
func (p *Persister) UpdatePin(pin entity.Pin) (err error) {
	pin.Revised = time.Now().UTC()

	var stmt *sqlx.NamedStmt
	stmt, err = p.Context.Transaction.PrepareNamed("UPDATE pin SET labelid=:folderid, documentid=:documentid, pin=:pin, sequence=:sequence, revised=:revised WHERE orgid=:orgid AND refid=:refid")
	defer streamutil.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update for pin %s", pin.RefID), err)
		return
	}

	_, err = stmt.Exec(&pin)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute update for pin %s", pin.RefID), err)
		return
	}

	return
}

// UpdatePinSequence updates existing pinned item sequence number
func (p *Persister) UpdatePinSequence(pinID string, sequence int) (err error) {
	stmt, err := p.Context.Transaction.Preparex("UPDATE pin SET sequence=?, revised=? WHERE orgid=? AND userid=? AND refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update for pin sequence %s", pinID), err)
		return
	}

	_, err = stmt.Exec(sequence, time.Now().UTC(), p.Context.OrgID, p.Context.UserID, pinID)

	return
}

// DeletePin removes folder from the store.
func (p *Persister) DeletePin(id string) (rows int64, err error) {
	return p.Base.DeleteConstrained(p.Context.Transaction, "pin", p.Context.OrgID, id)
}

// DeletePinnedSpace removes any pins for specified space.
func (p *Persister) DeletePinnedSpace(spaceID string) (rows int64, err error) {
	return p.Base.DeleteWhere(p.Context.Transaction, fmt.Sprintf("DELETE FROM pin WHERE orgid=\"%s\" AND labelid=\"%s\"", p.Context.OrgID, spaceID))
}

// DeletePinnedDocument removes any pins for specified document.
func (p *Persister) DeletePinnedDocument(documentID string) (rows int64, err error) {
	return p.Base.DeleteWhere(p.Context.Transaction, fmt.Sprintf("DELETE FROM pin WHERE orgid=\"%s\" AND documentid=\"%s\"", p.Context.OrgID, documentID))
}
