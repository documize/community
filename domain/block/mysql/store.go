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
	"database/sql"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store/mysql"
	"github.com/documize/community/model/block"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// Add saves reusable content block.
func (s Scope) Add(ctx domain.RequestContext, b block.Block) (err error) {
	b.OrgID = ctx.OrgID
	b.UserID = ctx.UserID
	b.Created = time.Now().UTC()
	b.Revised = time.Now().UTC()

	_, err = ctx.Transaction.Exec("INSERT INTO dmz_section_template (c_refid, c_orgid, c_spaceid, c_userid, c_contenttype, c_type, c_name, c_body, c_desc, c_rawbody, c_config, c_external, used, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		b.RefID, b.OrgID, b.SpaceID, b.UserID, b.ContentType, b.Type, b.Name, b.Body, b.Excerpt, b.RawBody, b.Config, b.ExternalSource, b.Used, b.Created, b.Revised)

	if err != nil {
		err = errors.Wrap(err, "execute insert block")
	}

	return
}

// Get returns requested reusable content block.
func (s Scope) Get(ctx domain.RequestContext, id string) (b block.Block, err error) {
	err = s.Runtime.Db.Get(&b, `
        SELECT a.id, a.c_refid as refid,
        a.c_orgid as orgid,
        a.c_spaceid AS spaceid, a.c_userid AS userid, a.c_contenttype AS contenttype, a.c_type AS type,
        a.c_name AS name, a.c_body AS body, a.c_desc AS excerpt, a.c_rawbody AS rawbody,
        a.c_config AS config, a.c_external AS externalsource, a.c_used AS used,
        a.c_created AS created, a.c_revised AS revised,
        b.c_firstname AS firstname, b.c_lastname AS lastname
        FROM dmz_section_template a LEFT JOIN dmz_user b ON a.c_userid = b.c_refid
        WHERE a.c_orgid=? AND a.c_refid=?`,
		ctx.OrgID, id)

	if err != nil {
		err = errors.Wrap(err, "execute select block")
	}

	return
}

// GetBySpace returns all reusable content scoped to given space.
func (s Scope) GetBySpace(ctx domain.RequestContext, spaceID string) (b []block.Block, err error) {
	err = s.Runtime.Db.Select(&b, `
        SELECT a.id, a.c_refid as refid,
        a.c_orgid as orgid,
        a.c_spaceid AS spaceid, a.c_userid AS userid, a.c_contenttype AS contenttype, a.c_type AS type,
        a.c_name AS name, a.c_body AS body, a.c_desc AS excerpt, a.c_rawbody AS rawbody,
        a.c_config AS config, a.c_external AS externalsource, a.c_used AS used,
        a.c_created AS created, a.c_revised AS revised,
        b.c_firstname AS firstname, b.c_lastname AS lastname
        FROM dmz_section_template a LEFT JOIN dmz_user b ON a.c_userid = b.c_refid
        WHERE a.c_orgid=? AND a.c_spaceid=?
        ORDER BY a.c_name`,
		ctx.OrgID, spaceID)

	if err != nil {
		err = errors.Wrap(err, "select space blocks")
	}

	return
}

// IncrementUsage increments usage counter for content block.
func (s Scope) IncrementUsage(ctx domain.RequestContext, id string) (err error) {
	_, err = ctx.Transaction.Exec(`UPDATE dmz_section_template SET
        c_used=c_used+1, c_revised=? WHERE c_orgid=? AND c_refid=?`,
		time.Now().UTC(), ctx.OrgID, id)

	if err != nil {
		err = errors.Wrap(err, "execute increment block usage")
	}

	return
}

// DecrementUsage decrements usage counter for content block.
func (s Scope) DecrementUsage(ctx domain.RequestContext, id string) (err error) {
	_, err = ctx.Transaction.Exec(`UPDATE dmz_section_template SET
        c_used=c_used-1, c_revised=? WHERE c_orgid=? AND c_refid=?`,
		time.Now().UTC(), ctx.OrgID, id)

	if err != nil {
		err = errors.Wrap(err, "execute decrement block usage")
	}

	return
}

// RemoveReference clears page.blockid for given blockID.
func (s Scope) RemoveReference(ctx domain.RequestContext, id string) (err error) {
	_, err = ctx.Transaction.Exec(`UPDATE dmz_section SET
        c_templateid='', c_revised=?
        WHERE c_orgid=? AND c_templateid=?`,
		time.Now().UTC(), ctx.OrgID, id)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		err = errors.Wrap(err, "execute remove block ref")
	}

	return
}

// Update updates existing reusable content block item.
func (s Scope) Update(ctx domain.RequestContext, b block.Block) (err error) {
	b.Revised = time.Now().UTC()
	_, err = ctx.Transaction.NamedExec(`UPDATE dmz_section_template SET
        c_name=:title, c_body=:body, c_desc=:excerpt, c_rawbody=:rawbody,
        c_config=:config, c_revised=:revised
        WHERE c_orgid=:orgid AND c_refid=:refid`,
		b)

	if err != nil {
		err = errors.Wrap(err, "execute update block")
	}

	return
}

// Delete removes reusable content block from database.
func (s Scope) Delete(ctx domain.RequestContext, id string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	return b.DeleteConstrained(ctx.Transaction, "dmz_section_template", ctx.OrgID, id)
}
