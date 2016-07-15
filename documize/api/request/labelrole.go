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
	"database/sql"
	"fmt"
	"time"

	"github.com/documize/community/documize/api/entity"
	"github.com/documize/community/wordsmith/log"
	"github.com/documize/community/wordsmith/utility"
)

// AddLabelRole inserts the given record into the labelrole database table.
func (p *Persister) AddLabelRole(l entity.LabelRole) (err error) {
	l.Created = time.Now().UTC()
	l.Revised = time.Now().UTC()

	stmt, err := p.Context.Transaction.Preparex("INSERT INTO labelrole (refid, labelid, orgid, userid, canview, canedit, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
	defer utility.Close(stmt)

	if err != nil {
		log.Error("Unable to prepare insert for label role", err)
		return
	}

	_, err = stmt.Exec(l.RefID, l.LabelID, l.OrgID, l.UserID, l.CanView, l.CanEdit, l.Created, l.Revised)

	if err != nil {
		log.Error("Unable to execute insert for label role", err)
		return
	}

	return
}

// GetLabelRoles returns a slice of labelrole records, for the given labelID in the client's organization, grouped by user.
func (p *Persister) GetLabelRoles(labelID string) (roles []entity.LabelRole, err error) {

	err = nil

	query := `SELECT id, refid, labelid, orgid, userid, canview, canedit, created, revised FROM labelrole WHERE orgid=? AND labelid=?` // was + "GROUP BY userid"

	err = Db.Select(&roles, query, p.Context.OrgID, labelID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare select for label roles %s", labelID), err)
		return
	}

	if err == sql.ErrNoRows {
		err = nil
	}

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select for label role %s", labelID), err)
		return
	}

	return
}

// GetUserLabelRoles returns a slice of labelrole records, for both the client's user and organization, and
// those label roles that exist for all users in the client's organization.
func (p *Persister) GetUserLabelRoles() (roles []entity.LabelRole, err error) {
	err = Db.Select(&roles, `
		SELECT id, refid, labelid, orgid, userid, canview, canedit, created, revised FROM labelrole WHERE orgid=? and userid=?
		UNION ALL
		SELECT id, refid, labelid, orgid, userid, canview, canedit, created, revised FROM labelrole WHERE orgid=? AND userid=''`,
		p.Context.OrgID, p.Context.UserID, p.Context.OrgID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare select for user label roles %s", p.Context.UserID), err)
		return
	}

	if err == sql.ErrNoRows {
		err = nil
	}

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select for user label roles %s", p.Context.UserID), err)
		return
	}

	return
}

// DeleteLabelRole deletes the labelRoleID record from the labelrole table.
func (p *Persister) DeleteLabelRole(labelRoleID string) (rows int64, err error) {
	sql := fmt.Sprintf("DELETE FROM labelrole WHERE orgid='%s' AND refid='%s'", p.Context.OrgID, labelRoleID)
	return p.Base.DeleteWhere(p.Context.Transaction, sql)
}

// DeleteLabelRoles deletes records from the labelrole table which have the given labelID.
func (p *Persister) DeleteLabelRoles(labelID string) (rows int64, err error) {
	sql := fmt.Sprintf("DELETE FROM labelrole WHERE orgid='%s' AND labelid='%s'", p.Context.OrgID, labelID)
	return p.Base.DeleteWhere(p.Context.Transaction, sql)
}

// DeleteUserFolderRoles removes all roles for the specified user, for the specified folder.
func (p *Persister) DeleteUserFolderRoles(labelID, userID string) (rows int64, err error) {
	sql := fmt.Sprintf("DELETE FROM labelrole WHERE orgid='%s' AND labelid='%s' AND userid='%s'",
		p.Context.OrgID, labelID, userID)

	return p.Base.DeleteWhere(p.Context.Transaction, sql)
}

// MoveLabelRoles changes the labelid for an organization's labelrole records from previousLabel to newLabel.
func (p *Persister) MoveLabelRoles(previousLabel, newLabel string) (err error) {
	stmt, err := p.Context.Transaction.Preparex("UPDATE labelrole SET labelid=? WHERE labelid=? AND orgid=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare move label roles for label  %s", previousLabel), err)
		return
	}

	_, err = stmt.Exec(newLabel, previousLabel, p.Context.OrgID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute move label roles for label  %s", previousLabel), err)
	}

	return
}
