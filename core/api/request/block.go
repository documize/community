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
	"github.com/jmoiron/sqlx"
)

// AddBlock saves reusable content block.
func (p *Persister) AddBlock(b entity.Block) (err error) {
	b.OrgID = p.Context.OrgID
	b.UserID = p.Context.UserID
	b.Created = time.Now().UTC()
	b.Revised = time.Now().UTC()

	stmt, err := p.Context.Transaction.Preparex("INSERT INTO block (refid, orgid, labelid, userid, contenttype, pagetype, title, body, excerpt, rawbody, config, externalsource, used, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer utility.Close(stmt)

	if err != nil {
		log.Error("Unable to prepare insert AddBlock", err)
		return
	}

	_, err = stmt.Exec(b.RefID, b.OrgID, b.LabelID, b.UserID, b.ContentType, b.PageType, b.Title, b.Body, b.Excerpt, b.RawBody, b.Config, b.ExternalSource, b.Used, b.Created, b.Revised)

	if err != nil {
		log.Error("Unable to execute insert AddBlock", err)
		return
	}

	return
}

// GetBlock returns requested reusable content block.
func (p *Persister) GetBlock(id string) (b entity.Block, err error) {
	stmt, err := Db.Preparex("SELECT a.id, a.refid, a.orgid, a.labelid, a.userid, a.contenttype, a.pagetype, a.title, a.body, a.excerpt, a.rawbody, a.config, a.externalsource, a.used, a.created, a.revised, b.firstname, b.lastname FROM block a LEFT JOIN user b ON a.userid = b.refid WHERE a.orgid=? AND a.refid=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare select GetBlock %s", id), err)
		return
	}

	err = stmt.Get(&b, p.Context.OrgID, id)
	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select GetBlock %s", id), err)
		return
	}

	return
}

// GetBlocksForSpace returns all reusable content scoped to given space.
func (p *Persister) GetBlocksForSpace(labelID string) (b []entity.Block, err error) {
	err = Db.Select(&b, "SELECT a.id, a.refid, a.orgid, a.labelid, a.userid, a.contenttype, a.pagetype, a.title, a.body, a.excerpt, a.rawbody, a.config, a.externalsource, a.used, a.created, a.revised, b.firstname, b.lastname FROM block a LEFT JOIN user b ON a.userid = b.refid WHERE a.orgid=? AND a.labelid=? ORDER BY a.title", p.Context.OrgID, labelID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select GetBlocksForSpace org %s and label %s", p.Context.OrgID, labelID), err)
		return
	}

	return
}

// IncrementBlockUsage increments usage counter for content block.
func (p *Persister) IncrementBlockUsage(id string) (err error) {
	stmt, err := p.Context.Transaction.Preparex("UPDATE block SET used=used+1, revised=? WHERE orgid=? AND refid=?")
	defer utility.Close(stmt)
	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update IncrementBlockUsage id %s", id), err)
		return
	}

	_, err = stmt.Exec(time.Now().UTC(), p.Context.OrgID, id)
	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute IncrementBlockUsage id %s", id), err)
		return
	}

	return
}

// DecrementBlockUsage decrements usage counter for content block.
func (p *Persister) DecrementBlockUsage(id string) (err error) {
	stmt, err := p.Context.Transaction.Preparex("UPDATE block SET used=used-1, revised=? WHERE orgid=? AND refid=?")
	defer utility.Close(stmt)
	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update DecrementBlockUsage id %s", id), err)
		return
	}

	_, err = stmt.Exec(time.Now().UTC(), p.Context.OrgID, id)
	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute DecrementBlockUsage id %s", id), err)
		return
	}

	return
}

// UpdateBlock updates existing reusable content block item.
func (p *Persister) UpdateBlock(b entity.Block) (err error) {
	b.Revised = time.Now().UTC()

	var stmt *sqlx.NamedStmt
	stmt, err = p.Context.Transaction.PrepareNamed("UPDATE block SET title=:title, body=:body, excerpt=:excerpt, rawbody=:rawbody, config=:config, revised=:revised WHERE orgid=:orgid AND refid=:refid")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update UpdateBlock %s", b.RefID), err)
		return
	}

	_, err = stmt.Exec(&b)
	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute update UpdateBlock %s", b.RefID), err)
		return
	}

	return
}

// DeleteBlock removes reusable content block from database.
func (p *Persister) DeleteBlock(id string) (rows int64, err error) {
	return p.Base.DeleteConstrained(p.Context.Transaction, "block", p.Context.OrgID, id)
}
