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
	"github.com/documize/community/core/utility"
)

// AddLabel adds new folder into the store.
func (p *Persister) AddLabel(l entity.Label) (err error) {
	l.UserID = p.Context.UserID
	l.Created = time.Now().UTC()
	l.Revised = time.Now().UTC()

	stmt, err := p.Context.Transaction.Preparex("INSERT INTO label (refid, label, orgid, userid, type, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?)")
	defer utility.Close(stmt)

	if err != nil {
		log.Error("Unable to prepare insert for label", err)
		return
	}

	_, err = stmt.Exec(l.RefID, l.Name, l.OrgID, l.UserID, l.Type, l.Created, l.Revised)

	if err != nil {
		log.Error("Unable to execute insert for label", err)
		return
	}

	return
}

// GetLabel returns a folder from the store.
func (p *Persister) GetLabel(id string) (label entity.Label, err error) {

	err = nil

	stmt, err := Db.Preparex("SELECT id,refid,label as name,orgid,userid,type,created,revised FROM label WHERE orgid=? and refid=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare select for label %s", id), err)
		return
	}

	err = stmt.Get(&label, p.Context.OrgID, id)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select for label %s", id), err)
		return
	}

	return
}

// GetPublicFolders returns folders that anyone can see.
func (p *Persister) GetPublicFolders(orgID string) (labels []entity.Label, err error) {
	err = nil

	sql := "SELECT id,refid,label as name,orgid,userid,type,created,revised FROM label a where orgid=? AND type=1"

	err = Db.Select(&labels, sql, orgID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute GetPublicFolders for org %s", p.Context.OrgID), err)
		return
	}

	return
}

// GetLabels returns folders that the user can see.
// Also handles which folders can be seen by anonymous users.
func (p *Persister) GetLabels() (labels []entity.Label, err error) {
	err = nil

	sql := `
(SELECT id,refid,label as name,orgid,userid,type,created,revised from label WHERE orgid=? AND type=2 AND userid=?)
UNION ALL
(SELECT id,refid,label as name,orgid,userid,type,created,revised FROM label a where orgid=? AND type=1 AND refid in
	(SELECT labelid from labelrole WHERE orgid=? AND userid='' AND (canedit=1 OR canview=1)))
UNION ALL
(SELECT id,refid,label as name,orgid,userid,type,created,revised FROM label a where orgid=? AND type=3 AND refid in
	(SELECT labelid from labelrole WHERE orgid=? AND userid=? AND (canedit=1 OR canview=1)))
ORDER BY name`

	err = Db.Select(&labels, sql,
		p.Context.OrgID,
		p.Context.UserID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.UserID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select labels for org %s", p.Context.OrgID), err)
		return
	}

	return
}

// UpdateLabel saves folder changes.
func (p *Persister) UpdateLabel(label entity.Label) (err error) {
	err = nil
	label.Revised = time.Now().UTC()

	stmt, err := p.Context.Transaction.PrepareNamed("UPDATE label SET label=:name, type=:type, userid=:userid, revised=:revised WHERE orgid=:orgid AND refid=:refid")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update for label %s", label.RefID), err)
		return
	}

	_, err = stmt.Exec(&label)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute update for label %s", label.RefID), err)
		return
	}

	return
}

// ChangeLabelOwner transfer folder ownership.
func (p *Persister) ChangeLabelOwner(currentOwner, newOwner string) (err error) {
	err = nil

	stmt, err := p.Context.Transaction.Preparex("UPDATE label SET userid=? WHERE userid=? AND orgid=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare change label owner for  %s", currentOwner), err)
		return
	}

	_, err = stmt.Exec(newOwner, currentOwner, p.Context.OrgID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute change label owner for  %s", currentOwner), err)
		return
	}

	return
}

// GetFolderVisibility returns the list of people who can see shared folders.
func (p *Persister) GetFolderVisibility() (visibleTo []entity.FolderVisibility, err error) {
	err = nil

	sql := `
SELECT a.userid,
	COALESCE(u.firstname, '') as firstname,
	COALESCE(u.lastname, '') as lastname,
	COALESCE(u.email, '') as email,
	a.labelid,
	b.label as name,
	b.type
FROM labelrole a
LEFT JOIN label b ON b.refid=a.labelid
LEFT JOIN user u ON u.refid=a.userid
WHERE a.orgid=? AND b.type != 2
GROUP BY a.labelid,a.userid
ORDER BY u.firstname,u.lastname`

	err = Db.Select(&visibleTo, sql, p.Context.OrgID)

	return
}

// DeleteLabel removes folder from the store.
func (p *Persister) DeleteLabel(labelID string) (rows int64, err error) {
	return p.Base.DeleteConstrained(p.Context.Transaction, "label", p.Context.OrgID, labelID)
}
