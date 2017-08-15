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
	"fmt"
	"strings"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store/mysql"
	"github.com/documize/community/model"
	"github.com/documize/community/model/page"
	"github.com/documize/community/model/search"
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// Add search entry  (legacy name: searchAdd).
func (s Scope) Add(ctx domain.RequestContext, page page.Page) (err error) {
	id := page.RefID

	// translate the html into text for the search
	nonHTML, err := stringutil.HTML(page.Body).Text(false)
	if err != nil {
		errors.Wrap(err, "search decode body")
		return
	}

	// insert into the search table, getting the document title along the way
	var stmt *sqlx.Stmt
	stmt, err = ctx.Transaction.Preparex(
		"INSERT INTO search (id, orgid, documentid, level, sequence, documenttitle, slug, pagetitle, body, created, revised) " +
			" SELECT page.refid,page.orgid,document.refid,page.level,page.sequence,document.title,document.slug,page.title,?,page.created,page.revised " +
			" FROM document,page WHERE page.refid=? AND document.refid=page.documentid")

	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare search insert")
		return
	}

	_, err = stmt.Exec(nonHTML, id)

	if err != nil {
		err = errors.Wrap(err, "execute search insert")
		return
	}

	return nil
}

// Update search entry (legacy name: searchUpdate).
func (s Scope) Update(ctx domain.RequestContext, page page.Page) (err error) {
	// translate the html into text for the search
	nonHTML, err := stringutil.HTML(page.Body).Text(false)
	if err != nil {
		err = errors.Wrap(err, "search decode body")
		return
	}

	su, err := ctx.Transaction.Preparex("UPDATE search SET pagetitle=?,body=?,sequence=?,level=?,revised=? WHERE id=?")
	defer streamutil.Close(su)

	if err != nil {
		err = errors.Wrap(err, "prepare search update")
		return err
	}

	_, err = su.Exec(page.Title, nonHTML, page.Sequence, page.Level, page.Revised, page.RefID)

	if err != nil {
		err = errors.Wrap(err, "execute search update")
		return
	}

	return nil
}

// UpdateDocument search entries for document (legacy name: searchUpdateDocument).
func (s Scope) UpdateDocument(ctx domain.RequestContext, page page.Page) (err error) {
	stmt, err := ctx.Transaction.Preparex("UPDATE search SET documenttitle=?, slug=?, revised=? WHERE documentid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "prepare search document update")
		return err
	}

	_, err = stmt.Exec(page.Title, page.Body, time.Now().UTC(), page.DocumentID)

	if err != nil {
		err = errors.Wrap(err, "execute search document update")
		return err
	}

	return nil
}

// DeleteDocument removes document search entries (legacy name: searchDeleteDocument)
func (s Scope) DeleteDocument(ctx domain.RequestContext, page page.Page) (err error) {
	var bm = mysql.BaseQuery{}

	_, err = bm.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE from search WHERE documentid='%s'", page.DocumentID))

	if err != nil {
		err = errors.Wrap(err, "delete document search entries")
	}

	return nil
}

// Rebuild ... (legacy name: searchRebuild)
func (s Scope) Rebuild(ctx domain.RequestContext, p page.Page) (err error) {
	var bm = mysql.BaseQuery{}

	_, err = bm.DeleteWhere(ctx.Transaction, fmt.Sprintf("DELETE from search WHERE documentid='%s'", p.DocumentID))
	if err != nil {
		err = errors.Wrap(err, err.Error())
		return err
	}

	var pages []struct{ ID string }

	stmt2, err := ctx.Transaction.Preparex("SELECT refid as id FROM page WHERE documentid=? ")
	defer streamutil.Close(stmt2)

	if err != nil {
		err = errors.Wrap(err, err.Error())
		return err
	}

	err = stmt2.Select(&pages, p.DocumentID)
	if err != nil {
		err = errors.Wrap(err, err.Error())
		return err
	}

	if len(pages) > 0 {
		for _, pg := range pages {
			err = s.Add(ctx, page.Page{BaseEntity: model.BaseEntity{RefID: pg.ID}})
			if err != nil {
				err = errors.Wrap(err, err.Error())
				return err
			}
		}

		// rebuild doc-level tags & excerpts
		// get the 0'th page data and rewrite it

		target := page.Page{}

		stmt1, err := ctx.Transaction.Preparex("SELECT * FROM page WHERE refid=?")
		defer streamutil.Close(stmt1)

		if err != nil {
			err = errors.Wrap(err, err.Error())
			return err
		}

		err = stmt1.Get(&target, pages[0].ID)
		if err != nil {
			err = errors.Wrap(err, err.Error())
			return err
		}

		err = s.Update(ctx, target) // to rebuild the document-level tags + excerpt
		if err != nil {
			err = errors.Wrap(err, err.Error())
			return err
		}
	}

	return
}

// UpdateSequence ... (legacy name: searchUpdateSequence)
func (s Scope) UpdateSequence(ctx domain.RequestContext, page page.Page) (err error) {
	supdate, err := ctx.Transaction.Preparex("UPDATE search SET sequence=?,revised=? WHERE id=?")
	defer streamutil.Close(supdate)

	if err != nil {
		err = errors.Wrap(err, "prepare search update sequence")
		return err
	}

	_, err = supdate.Exec(page.Sequence, time.Now().UTC(), page.RefID)
	if err != nil {
		err = errors.Wrap(err, "execute search update sequence")
		return
	}

	return
}

// UpdateLevel ... legacy name: searchUpdateLevel)
func (s Scope) UpdateLevel(ctx domain.RequestContext, page page.Page) (err error) {
	pageID := page.RefID
	level := page.Level

	supdate, err := ctx.Transaction.Preparex("UPDATE search SET level=?,revised=? WHERE id=?")
	defer streamutil.Close(supdate)

	if err != nil {
		err = errors.Wrap(err, "prepare search update level")
		return err
	}

	_, err = supdate.Exec(level, time.Now().UTC(), pageID)
	if err != nil {
		err = errors.Wrap(err, "execute search update level")
		return
	}

	return
}

// Delete ... (legacy name: searchDelete).
func (s Scope) Delete(ctx domain.RequestContext, page page.Page) (err error) {
	var bm = mysql.BaseQuery{}
	_, err = bm.DeleteConstrainedWithID(ctx.Transaction, "search", ctx.OrgID, page.RefID)

	return
}

// Documents searches the documents that the client is allowed to see, using the keywords search string, then audits that search.
// Visible documents include both those in the client's own organisation and those that are public, or whose visibility includes the client.
func (s Scope) Documents(ctx domain.RequestContext, q search.QueryOptions) (results []search.QueryResult, err error) {
	q.Keywords = strings.TrimSpace(q.Keywords)

	if len(q.Keywords) == 0 {
		return
	}

	results = []search.QueryResult{}

	// Match doc names
	if q.Doc {
		r1, err1 := s.matchFullText(ctx, q.Keywords, "doc")
		if err1 != nil {
			err = errors.Wrap(err1, "search document names")
			return
		}

		results = append(results, r1...)
	}

	// Match doc content
	if q.Content {
		r2, err2 := s.matchFullText(ctx, q.Keywords, "page")
		if err2 != nil {
			err = errors.Wrap(err2, "search document content")
			return
		}

		results = append(results, r2...)
	}

	// Match doc tags
	if q.Tag {
		r3, err3 := s.matchFullText(ctx, q.Keywords, "tag")
		if err3 != nil {
			err = errors.Wrap(err3, "search document tag")
			return
		}

		results = append(results, r3...)
	}

	// Match doc attachments
	if q.Attachment {
		r4, err4 := s.matchLike(ctx, q.Keywords, "file")
		if err4 != nil {
			err = errors.Wrap(err4, "search document attachments")
			return
		}

		results = append(results, r4...)
	}

	return
}

func (s Scope) matchFullText(ctx domain.RequestContext, keywords, itemType string) (r []search.QueryResult, err error) {
	sql1 := `
	SELECT 
		s.id, s.orgid, s.documentid, s.itemid, s.itemtype, 
		d.labelid as spaceid, COALESCE(d.title,'Unknown') AS document, d.tags, d.excerpt, 
		COALESCE(l.label,'Unknown') AS space
	FROM
		search s,
		document d
	LEFT JOIN 
		label l ON l.orgid=d.orgid AND l.refid = d.labelid
	WHERE
		s.orgid = ?
		AND s.itemtype = ?
		AND s.documentid = d.refid 
		-- AND d.template = 0
		AND d.labelid IN (SELECT refid from label WHERE orgid=? AND type=2 AND userid=?
			UNION ALL SELECT refid FROM label a where orgid=? AND type=1 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid='' AND (canedit=1 OR canview=1))
			UNION ALL SELECT refid FROM label a where orgid=? AND type=3 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid=? AND (canedit=1 OR canview=1)))
		AND MATCH(s.content) AGAINST(? IN BOOLEAN MODE)`

	err = s.Runtime.Db.Select(&r,
		sql1,
		ctx.OrgID,
		itemType,
		ctx.OrgID,
		ctx.UserID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.UserID,
		keywords)

	if err == sql.ErrNoRows {
		err = nil
		r = []search.QueryResult{}
	}

	if err != nil {
		err = errors.Wrap(err, "search document "+itemType)
		return
	}

	return
}

func (s Scope) matchLike(ctx domain.RequestContext, keywords, itemType string) (r []search.QueryResult, err error) {
	// LIKE clause does not like quotes!
	keywords = strings.Replace(keywords, "'", "", -1)
	keywords = strings.Replace(keywords, "\"", "", -1)
	keywords = strings.Replace(keywords, "%", "", -1)
	keywords = fmt.Sprintf("%%%s%%", keywords)

	sql1 := `
	SELECT 
		s.id, s.orgid, s.documentid, s.itemid, s.itemtype, 
		d.labelid as spaceid, COALESCE(d.title,'Unknown') AS document, d.tags, d.excerpt, 
		COALESCE(l.label,'Unknown') AS space
	FROM
		search s,
		document d
	LEFT JOIN 
		label l ON l.orgid=d.orgid AND l.refid = d.labelid
	WHERE
		s.orgid = ?
		AND s.itemtype = ?
		AND s.documentid = d.refid 
		-- AND d.template = 0
		AND d.labelid IN (SELECT refid from label WHERE orgid=? AND type=2 AND userid=?
			UNION ALL SELECT refid FROM label a where orgid=? AND type=1 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid='' AND (canedit=1 OR canview=1))
			UNION ALL SELECT refid FROM label a where orgid=? AND type=3 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid=? AND (canedit=1 OR canview=1)))
		AND s.content LIKE ?`

	err = s.Runtime.Db.Select(&r,
		sql1,
		ctx.OrgID,
		itemType,
		ctx.OrgID,
		ctx.UserID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.UserID,
		keywords)

	if err == sql.ErrNoRows {
		err = nil
		r = []search.QueryResult{}
	}

	if err != nil {
		err = errors.Wrap(err, "search document "+itemType)
		return
	}

	return
}
