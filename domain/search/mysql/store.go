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

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/model/attachment"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/page"
	"github.com/documize/community/model/search"
	"github.com/documize/community/model/workflow"
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// IndexDocument adds search index entries for document inserting title, tags and attachments as
// searchable items. Any existing document entries are removed.
func (s Scope) IndexDocument(ctx domain.RequestContext, doc doc.Document, a []attachment.Attachment) (err error) {
	// remove previous search entries
	_, err = ctx.Transaction.Exec("DELETE FROM search WHERE orgid=? AND documentid=? AND (itemtype='doc' OR itemtype='file' OR itemtype='tag')",
		ctx.OrgID, doc.RefID)

	if err != nil {
		err = errors.Wrap(err, "execute delete document index entries")
	}

	// insert doc title
	_, err = ctx.Transaction.Exec("INSERT INTO search (orgid, documentid, itemid, itemtype, content) VALUES (?, ?, ?, ?, ?)",
		ctx.OrgID, doc.RefID, "", "doc", doc.Title)
	if err != nil {
		err = errors.Wrap(err, "execute insert document title entry")
	}

	// insert doc tags
	tags := strings.Split(doc.Tags, "#")
	for _, t := range tags {
		if len(t) == 0 {
			continue
		}

		_, err = ctx.Transaction.Exec("INSERT INTO search (orgid, documentid, itemid, itemtype, content) VALUES (?, ?, ?, ?, ?)",
			ctx.OrgID, doc.RefID, "", "tag", t)

		if err != nil {
			err = errors.Wrap(err, "execute insert document tag entry")
			return
		}
	}

	for _, file := range a {
		_, err = ctx.Transaction.Exec("INSERT INTO search (orgid, documentid, itemid, itemtype, content) VALUES (?, ?, ?, ?, ?)",
			ctx.OrgID, doc.RefID, file.RefID, "file", file.Filename)

		if err != nil {
			err = errors.Wrap(err, "execute insert document file entry")
		}
	}

	return nil
}

// DeleteDocument removes all search entries for document.
func (s Scope) DeleteDocument(ctx domain.RequestContext, ID string) (err error) {
	_, err = ctx.Transaction.Exec("DELETE FROM search WHERE orgid=? AND documentid=?", ctx.OrgID, ID)

	if err != nil {
		err = errors.Wrap(err, "execute delete document entries")
	}

	return
}

// IndexContent adds search index entry for document context.
// Any existing document entries are removed.
func (s Scope) IndexContent(ctx domain.RequestContext, p page.Page) (err error) {
	// we do not index pending pages
	if p.Status == workflow.ChangePending || p.Status == workflow.ChangePendingNew {
		return
	}

	// remove previous search entries
	_, err = ctx.Transaction.Exec("DELETE FROM search WHERE orgid=? AND documentid=? AND itemid=? AND itemtype='page'",
		ctx.OrgID, p.DocumentID, p.RefID)

	if err != nil {
		err = errors.Wrap(err, "execute delete document content entry")
	}

	// prepare content
	content, err := stringutil.HTML(p.Body).Text(false)
	if err != nil {
		err = errors.Wrap(err, "search strip HTML failed")
		return
	}
	content = strings.TrimSpace(content)

	_, err = ctx.Transaction.Exec("INSERT INTO search (orgid, documentid, itemid, itemtype, content) VALUES (?, ?, ?, ?, ?)",
		ctx.OrgID, p.DocumentID, p.RefID, "page", content)
	if err != nil {
		err = errors.Wrap(err, "execute insert document content entry")
	}

	_, err = ctx.Transaction.Exec("INSERT INTO search (orgid, documentid, itemid, itemtype, content) VALUES (?, ?, ?, ?, ?)",
		ctx.OrgID, p.DocumentID, p.RefID, "page", p.Title)
	if err != nil {
		err = errors.Wrap(err, "execute insert document page title entry")
	}

	return nil
}

// DeleteContent removes all search entries for specific document content.
func (s Scope) DeleteContent(ctx domain.RequestContext, pageID string) (err error) {
	// remove all search entries
	var stmt1 *sqlx.Stmt
	stmt1, err = ctx.Transaction.Preparex("DELETE FROM search WHERE orgid=? AND itemid=? AND itemtype=?")
	defer streamutil.Close(stmt1)
	if err != nil {
		err = errors.Wrap(err, "prepare delete document content entry")
		return
	}

	_, err = stmt1.Exec(ctx.OrgID, pageID, "page")
	if err != nil {
		err = errors.Wrap(err, "execute delete document content entry")
		return
	}

	return
}

// Documents searches the documents that the client is allowed to see, using the keywords search string, then audits that search.
// Visible documents include both those in the client's own organization and those that are public, or whose visibility includes the client.
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

	if len(results) == 0 {
		results = []search.QueryResult{}
	}

	return
}

func (s Scope) matchFullText(ctx domain.RequestContext, keywords, itemType string) (r []search.QueryResult, err error) {
	sql1 := `
	SELECT
		s.id, s.orgid, s.documentid, s.itemid, s.itemtype,
        d.labelid as spaceid, COALESCE(d.title,'Unknown') AS document, d.tags,
        d.excerpt, d.template, d.versionid,
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
		AND d.labelid IN
		(
            SELECT refid FROM label WHERE orgid=? AND refid IN
            (
				SELECT refid from permission WHERE orgid=? AND who='user' AND (whoid=? OR whoid='0') AND location='space'
				UNION ALL
                SELECT p.refid from permission p LEFT JOIN rolemember r ON p.whoid=r.roleid WHERE p.orgid=? AND p.who='role'
                AND p.location='space' AND (r.userid=? OR r.userid='0')
            )
        )
	AND MATCH(s.content) AGAINST(? IN BOOLEAN MODE)`

	err = s.Runtime.Db.Select(&r,
		sql1,
		ctx.OrgID,
		itemType,
		ctx.OrgID,
		ctx.OrgID,
		ctx.UserID,
		ctx.OrgID,
		ctx.UserID,
		keywords)

	if err == sql.ErrNoRows {
		err = nil
		r = []search.QueryResult{}
	}
	if err != nil {
		err = errors.Wrap(err, "search document "+itemType)
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
		AND d.labelid IN
		(
            SELECT refid FROM label WHERE orgid=? AND refid IN
            (
				SELECT refid from permission WHERE orgid=? AND who='user' AND (whoid=? OR whoid='0') AND location='space'
				UNION ALL
				SELECT p.refid from permission p LEFT JOIN rolemember r ON p.whoid=r.roleid WHERE p.orgid=? AND p.who='role'
				AND p.location='space' AND (r.userid=? OR r.userid='0')
			)
		)
		AND s.content LIKE ?`

	err = s.Runtime.Db.Select(&r,
		sql1,
		ctx.OrgID,
		itemType,
		ctx.OrgID,
		ctx.OrgID,
		ctx.UserID,
		ctx.OrgID,
		ctx.UserID,
		keywords)

	if err == sql.ErrNoRows {
		err = nil
		r = []search.QueryResult{}
	}

	if err != nil {
		err = errors.Wrap(err, "search document "+itemType)
	}

	return
}
