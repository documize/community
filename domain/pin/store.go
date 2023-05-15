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

	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/pin"
	"github.com/pkg/errors"
)

// Store provides data access to user permission information.
type Store struct {
	store.Context
	store.PinStorer
}

// Add saves pinned item.
func (s Store) Add(ctx domain.RequestContext, pin pin.Pin) (err error) {
	row := s.Runtime.Db.QueryRow(s.Bind("SELECT max(c_sequence) FROM dmz_pin WHERE c_orgid=? AND c_userid=?"),
		ctx.OrgID, ctx.UserID)
	var maxSeq int
	err = row.Scan(&maxSeq)

	if err != nil {
		maxSeq = 99
	}

	pin.Created = time.Now().UTC()
	pin.Revised = time.Now().UTC()
	pin.Sequence = maxSeq + 1

	_, err = ctx.Transaction.Exec(s.Bind("INSERT INTO dmz_pin (c_refid, c_orgid, c_userid, c_spaceid, c_docid, c_name, c_sequence, c_created, c_revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"),
		pin.RefID, pin.OrgID, pin.UserID, pin.SpaceID, pin.DocumentID, pin.Name, pin.Sequence, pin.Created, pin.Revised)

	if err != nil {
		err = errors.Wrap(err, "execute pin insert")
	}

	return
}

// GetPin returns requested pinned item.
func (s Store) GetPin(ctx domain.RequestContext, id string) (pin pin.Pin, err error) {
	err = s.Runtime.Db.Get(&pin, s.Bind(`SELECT id, c_refid AS refid,
        c_orgid AS orgid, c_userid AS userid, c_spaceid AS spaceid, c_docid AS documentid,
        c_name AS name, c_sequence AS sequence, c_created AS created, c_revised AS revised
        FROM dmz_pin
        WHERE c_orgid=? AND c_refid=?`),
		ctx.OrgID, id)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute select for pin %s", id))
	}

	return
}

// GetUserPins returns pinned items for specified user.
func (s Store) GetUserPins(ctx domain.RequestContext, userID string) (pins []pin.Pin, err error) {
	err = s.Runtime.Db.Select(&pins, s.Bind(`SELECT id, c_refid AS refid,
        c_orgid AS orgid, c_userid AS userid, c_spaceid AS spaceid, c_docid AS documentid,
        c_name AS name, c_sequence AS sequence, c_created AS created, c_revised AS revised
        FROM dmz_pin
        WHERE c_orgid=? AND c_userid=?
        ORDER BY c_sequence`),
		ctx.OrgID, userID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute select pins for org %s and user %s", ctx.OrgID, userID))
	}

	return
}

// UpdatePin updates existing pinned item.
func (s Store) UpdatePin(ctx domain.RequestContext, pin pin.Pin) (err error) {
	pin.Revised = time.Now().UTC()

	_, err = ctx.Transaction.NamedExec(`UPDATE dmz_pin SET
        c_spaceid=:spaceid, c_docid=:documentid, c_name=:name, c_sequence=:sequence,
        c_revised=:revised
        WHERE c_orgid=:orgid AND c_refid=:refid`,
		&pin)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute pin update %s", pin.RefID))
	}

	return
}

// UpdatePinSequence updates existing pinned item sequence number
func (s Store) UpdatePinSequence(ctx domain.RequestContext, pinID string, sequence int) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind("UPDATE dmz_pin SET c_sequence=?, c_revised=? WHERE c_orgid=? AND c_userid=? AND c_refid=?"),
		sequence, time.Now().UTC(), ctx.OrgID, ctx.UserID, pinID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("execute pin sequence update %s", pinID))
	}

	return
}

// DeletePin removes folder from the store.
func (s Store) DeletePin(ctx domain.RequestContext, id string) (rows int64, err error) {
	return s.DeleteConstrained(ctx.Transaction, "dmz_pin", ctx.OrgID, id)
}

// DeletePinnedSpace removes any pins for specified space.
func (s Store) DeletePinnedSpace(ctx domain.RequestContext, spaceID string) (rows int64, err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_pin WHERE c_orgid=? AND c_spaceid=?"),
		ctx.OrgID, spaceID)

	return
}

// DeletePinnedDocument removes any pins for specified document.
func (s Store) DeletePinnedDocument(ctx domain.RequestContext, documentID string) (rows int64, err error) {
	_, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_pin WHERE c_orgid=? AND c_docid=?"),
		ctx.OrgID, documentID)

	return
}
