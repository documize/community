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

package label

import (
	"database/sql"
	"time"

	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/label"
	"github.com/pkg/errors"
)

// Store provides data access to section template information.
type Store struct {
	store.Context
	store.LabelStorer
}

// Add saves space label to store.
func (s Store) Add(ctx domain.RequestContext, l label.Label) (err error) {
	l.OrgID = ctx.OrgID
	l.Created = time.Now().UTC()
	l.Revised = time.Now().UTC()

	_, err = ctx.Transaction.Exec(s.Bind("INSERT INTO dmz_space_label (c_refid, c_orgid, c_name, c_color, c_created, c_revised) VALUES (?, ?, ?, ?, ?, ?)"),
		l.RefID, l.OrgID, l.Name, l.Color, l.Created, l.Revised)

	if err != nil {
		err = errors.Wrap(err, "execute insert label")
	}

	return
}

// Get returns all space labels from store.
func (s Store) Get(ctx domain.RequestContext) (l []label.Label, err error) {
	err = s.Runtime.Db.Select(&l, s.Bind(`
        SELECT id, c_refid as refid,
        c_orgid as orgid,
        c_name AS name, c_color AS color,
        c_created AS created, c_revised AS revised
        FROM dmz_space_label
        WHERE c_orgid=? ORDER BY c_name`),
		ctx.OrgID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, "execute select label")
	}

	return
}

// Update persists space label changes to the store.
func (s Store) Update(ctx domain.RequestContext, l label.Label) (err error) {
	l.Revised = time.Now().UTC()

	_, err = ctx.Transaction.NamedExec(s.Bind(`UPDATE dmz_space_label SET
        c_name=:name, c_color=:color, c_revised=:revised
        WHERE c_orgid=:orgid AND c_refid=:refid`),
		l)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, "execute update label")
	}

	return
}

// Delete removes space label from the store.
func (s Store) Delete(ctx domain.RequestContext, id string) (rows int64, err error) {
	return s.DeleteConstrained(ctx.Transaction, "dmz_space_label", ctx.OrgID, id)
}

// RemoveReference clears space.labelID for given label.
func (s Store) RemoveReference(ctx domain.RequestContext, labelID string) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind(`UPDATE dmz_space SET
        c_labelid='', c_revised=?
        WHERE c_orgid=? AND c_labelid=?`),
		time.Now().UTC(), ctx.OrgID, labelID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, "execute remove space label reference")
	}

	return
}
