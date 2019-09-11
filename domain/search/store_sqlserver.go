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

package search

import (
	"database/sql"
	"strings"

	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/attachment"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/page"
	"github.com/documize/community/model/search"
	"github.com/pkg/errors"
)

// StoreSQLServer provides data access to space information.
type StoreSQLServer struct {
	store.Context
	store.SearchStorer
}

// IndexDocument adds search index entries for document inserting title, tags and attachments as
// searchable items. Any existing document entries are removed.
func (s StoreSQLServer) IndexDocument(ctx domain.RequestContext, doc doc.Document, a []attachment.Attachment) (err error) {
	// method := "search.IndexDocument"

	// // remove previous search entries
	// _, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_search WHERE c_orgid=? AND c_docid=? AND (c_itemtype='doc' OR c_itemtype='file' OR c_itemtype='tag')"),
	// 	ctx.OrgID, doc.RefID)
	// if err != nil && err != sql.ErrNoRows {
	// 	err = errors.Wrap(err, "execute delete document index entries")
	// 	s.Runtime.Log.Error(method, err)
	// 	return
	// }

	// // insert doc title
	// _, err = ctx.Transaction.Exec(s.Bind("INSERT INTO dmz_search (c_orgid, c_docid, c_itemid, c_itemtype, c_content) VALUES (?, ?, ?, ?, ?)"),
	// 	ctx.OrgID, doc.RefID, "", "doc", doc.Name)
	// if err != nil && err != sql.ErrNoRows {
	// 	err = errors.Wrap(err, "execute insert document title entry")
	// 	s.Runtime.Log.Error(method, err)
	// 	return
	// }

	// // insert doc tags
	// tags := strings.Split(doc.Tags, "#")
	// for _, t := range tags {
	// 	t = strings.TrimSpace(t)
	// 	if len(t) == 0 {
	// 		continue
	// 	}

	// 	_, err = ctx.Transaction.Exec(s.Bind("INSERT INTO dmz_search (c_orgid, c_docid, c_itemid, c_itemtype, c_content) VALUES (?, ?, ?, ?, ?)"),
	// 		ctx.OrgID, doc.RefID, "", "tag", t)
	// 	if err != nil && err != sql.ErrNoRows {
	// 		err = errors.Wrap(err, "execute insert document tag entry")
	// 		s.Runtime.Log.Error(method, err)
	// 		return
	// 	}
	// }

	// for _, file := range a {
	// 	_, err = ctx.Transaction.Exec(s.Bind("INSERT INTO dmz_search (c_orgid, c_docid, c_itemid, c_itemtype, c_content) VALUES (?, ?, ?, ?, ?)"),
	// 		ctx.OrgID, doc.RefID, file.RefID, "file", file.Filename)
	// 	if err != nil && err != sql.ErrNoRows {
	// 		err = errors.Wrap(err, "execute insert document file entry")
	// 		s.Runtime.Log.Error(method, err)
	// 		return
	// 	}
	// }

	return nil
}

// DeleteDocument removes all search entries for document.
func (s StoreSQLServer) DeleteDocument(ctx domain.RequestContext, ID string) (err error) {
	// method := "search.DeleteDocument"

	// _, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_search WHERE c_orgid=? AND c_docid=?"),
	// 	ctx.OrgID, ID)

	// if err != nil && err != sql.ErrNoRows {
	// 	err = errors.Wrap(err, "execute delete document entries")
	// 	s.Runtime.Log.Error(method, err)
	// }

	return
}

// IndexContent adds search index entry for document context.
// Any existing document entries are removed.
func (s StoreSQLServer) IndexContent(ctx domain.RequestContext, p page.Page) (err error) {
	// method := "search.IndexContent"

	// // remove previous search entries
	// _, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_search WHERE c_orgid=? AND c_docid=? AND c_itemid=? AND c_itemtype='page'"),
	// 	ctx.OrgID, p.DocumentID, p.RefID)

	// if err != nil && err != sql.ErrNoRows {
	// 	err = errors.Wrap(err, "execute delete document content entry")
	// 	s.Runtime.Log.Error(method, err)
	// 	return
	// }
	// err = nil

	// // prepare content
	// content, err := stringutil.HTML(p.Body).Text(false)
	// if err != nil {
	// 	err = errors.Wrap(err, "search strip HTML failed")
	// 	s.Runtime.Log.Error(method, err)
	// 	return
	// }
	// content = strings.TrimSpace(content)

	// _, err = ctx.Transaction.Exec(s.Bind("INSERT INTO dmz_search (c_orgid, c_docid, c_itemid, c_itemtype, c_content) VALUES (?, ?, ?, ?, ?)"),
	// 	ctx.OrgID, p.DocumentID, p.RefID, "page", content)
	// if err != nil && err != sql.ErrNoRows {
	// 	err = errors.Wrap(err, "execute insert section content entry")
	// 	s.Runtime.Log.Error(method, err)
	// 	return
	// }
	// err = nil

	// _, err = ctx.Transaction.Exec(s.Bind("INSERT INTO dmz_search (c_orgid, c_docid, c_itemid, c_itemtype, c_content) VALUES (?, ?, ?, ?, ?)"),
	// 	ctx.OrgID, p.DocumentID, p.RefID, "page", p.Name)
	// if err != nil && err != sql.ErrNoRows {
	// 	err = errors.Wrap(err, "execute insert section title entry")
	// 	s.Runtime.Log.Error(method, err)
	// 	return
	// }

	return nil
}

// DeleteContent removes all search entries for specific document content.
func (s StoreSQLServer) DeleteContent(ctx domain.RequestContext, pageID string) (err error) {
	// method := "search.DeleteContent"

	// // remove all search entries
	// _, err = ctx.Transaction.Exec(s.Bind("DELETE FROM dmz_search WHERE c_orgid=? AND c_itemid=? AND c_itemtype=?"),
	// 	ctx.OrgID, pageID, "page")

	// if err != nil && err != sql.ErrNoRows {
	// 	err = errors.Wrap(err, "execute delete document content entry")
	// 	s.Runtime.Log.Error(method, err)
	// 	return
	// }

	return nil
}

// Documents searches the documents that the client is allowed to see, using the keywords search string, then audits that search.
// Visible documents include both those in the client's own organization and those that are public, or whose visibility includes the client.
func (s StoreSQLServer) Documents(ctx domain.RequestContext, q search.QueryOptions) (results []search.QueryResult, err error) {
	q.Keywords = strings.TrimSpace(q.Keywords)
	if len(q.Keywords) == 0 {
		return
	}

	results = []search.QueryResult{}

	// Match doc names
	if q.Doc {
		r1, err1 := s.matchDoc(ctx, q.Keywords)
		if err1 != nil {
			err = errors.Wrap(err1, "search document names")
			return
		}

		results = append(results, r1...)
	}

	// Match doc content
	if q.Content {
		r2, err2 := s.matchSection(ctx, q.Keywords)
		if err2 != nil {
			err = errors.Wrap(err2, "search document content")
			return
		}

		results = append(results, r2...)
	}

	if len(results) == 0 {
		results = []search.QueryResult{}
	}

	return
}

// Match published documents.
func (s StoreSQLServer) matchDoc(ctx domain.RequestContext, keywords string) (r []search.QueryResult, err error) {
	keywords = strings.ToLower(keywords)

	sql1 := s.Bind(`SELECT
			d.id, d.c_orgid AS orgid, d.c_refid AS documentid, d.c_refid AS itemid, 'doc' AS itemtype,
			d.c_spaceid as spaceid, COALESCE(d.c_name,'Unknown') AS document, d.c_tags AS tags,
			d.c_desc AS excerpt, d.c_template AS template, d.c_versionid AS versionid,
			COALESCE(l.c_name,'Unknown') AS space, d.c_created AS created, d.c_revised AS revised
		FROM
            dmz_doc d
        LEFT JOIN
            dmz_space l ON l.c_orgid=d.c_orgid AND l.c_refid = d.c_spaceid
        WHERE
			d.c_orgid = ?
			AND d.c_lifecycle = 1
            AND d.c_spaceid IN
            (
                SELECT c_refid FROM dmz_space WHERE c_orgid=? AND c_refid IN
                (
                    SELECT c_refid from dmz_permission WHERE c_orgid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0') AND c_location='space'
                    UNION ALL
                    SELECT p.c_refid from dmz_permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid WHERE p.c_orgid=? AND p.c_who='role'
                    AND p.c_location='space' AND (r.c_userid=? OR r.c_userid='0')
                )
            )
            AND (CONTAINS(d.c_name, ?) OR CONTAINS(d.c_desc, ?))`)

	err = s.Runtime.Db.Select(&r,
		sql1,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.UserID,
		ctx.OrgID,
		ctx.UserID,
		keywords, keywords)

	if err == sql.ErrNoRows {
		err = nil
		r = []search.QueryResult{}
	}

	return
}

// Match approved section contents.
func (s StoreSQLServer) matchSection(ctx domain.RequestContext, keywords string) (r []search.QueryResult, err error) {
	keywords = strings.ToLower(keywords)

	sql1 := s.Bind(`SELECT
			d.id, d.c_orgid AS orgid, d.c_refid AS documentid, s.c_refid AS itemid, 'page' AS itemtype,
			d.c_spaceid as spaceid, COALESCE(d.c_name,'Unknown') AS document, d.c_tags AS tags,
			d.c_desc AS excerpt, d.c_template AS template, d.c_versionid AS versionid,
			COALESCE(l.c_name,'Unknown') AS space, d.c_created AS created, d.c_revised AS revised
		FROM
			dmz_doc d
		INNER JOIN
			dmz_section s ON s.c_docid = d.c_refid
        INNER JOIN
            dmz_space l ON l.c_orgid=d.c_orgid AND l.c_refid = d.c_spaceid
		WHERE
			d.c_refid = s.c_docid
			AND d.c_orgid = ?
			AND d.c_lifecycle = 1
			AND s.c_status = 0
            AND d.c_spaceid IN
            (
                SELECT c_refid FROM dmz_space WHERE c_orgid=? AND c_refid IN
                (
                    SELECT c_refid from dmz_permission WHERE c_orgid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0') AND c_location='space'
                    UNION ALL
                    SELECT p.c_refid from dmz_permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid WHERE p.c_orgid=? AND p.c_who='role'
                    AND p.c_location='space' AND (r.c_userid=? OR r.c_userid='0')
                )
            )
            AND (CONTAINS(s.c_name, ?) OR CONTAINS(s.c_body, ?))`)

	err = s.Runtime.Db.Select(&r,
		sql1,
		ctx.OrgID,
		ctx.OrgID,
		ctx.OrgID,
		ctx.UserID,
		ctx.OrgID,
		ctx.UserID,
		keywords, keywords)

	if err == sql.ErrNoRows {
		err = nil
		r = []search.QueryResult{}
	}

	return
}

/*
https://docs.microsoft.com/en-us/sql/relational-databases/search/get-started-with-full-text-search?view=sql-server-2017#options

SELECT * FROM dmz_doc WHERE CONTAINS(c_name, 'release AND v2.0*');
SELECT * FROM dmz_doc WHERE CONTAINS(c_name, 'release AND NOT v2.0*');
SELECT * FROM dmz_section WHERE CONTAINS(c_name, 'User');
SELECT * FROM dmz_section WHERE CONTAINS(c_body, 'authenticate AND NOT user');

func (s StoreSQLServer) match(ctx domain.RequestContext, keywords, itemType string) (r []search.QueryResult, err error) {
	// LIKE clause does not like quotes!
	keywords = strings.Replace(keywords, "'", "", -1)
	keywords = strings.Replace(keywords, "\"", "", -1)
	keywords = strings.Replace(keywords, "%", "", -1)
	keywords = fmt.Sprintf("%%%s%%", strings.ToLower(keywords))

	// s.c_itemid AS itemid

	sql1 := s.Bind(`SELECT
			s.id, s.c_orgid AS orgid, s.c_docid AS documentid, s.c_itemid AS itemid, s.c_itemtype AS itemtype,
			d.c_spaceid as spaceid, COALESCE(d.c_name,'Unknown') AS document, d.c_tags AS tags,
			d.c_desc AS excerpt, d.c_template AS template, d.c_versionid AS versionid,
			COALESCE(l.c_name,'Unknown') AS space, d.c_created AS created, d.c_revised AS revised
		FROM
            dmz_search s,
            dmz_doc d
        LEFT JOIN
            dmz_space l ON l.c_orgid=d.c_orgid AND l.c_refid = d.c_spaceid
        WHERE
            s.c_orgid = ?
            AND s.c_itemtype = ?
            AND s.c_docid = d.c_refid
            AND d.c_spaceid IN
            (
                SELECT c_refid FROM dmz_space WHERE c_orgid=? AND c_refid IN
                (
                    SELECT c_refid from dmz_permission WHERE c_orgid=? AND c_who='user' AND (c_whoid=? OR c_whoid='0') AND c_location='space'
                    UNION ALL
                    SELECT p.c_refid from dmz_permission p LEFT JOIN dmz_group_member r ON p.c_whoid=r.c_groupid WHERE p.c_orgid=? AND p.c_who='role'
                    AND p.c_location='space' AND (r.c_userid=? OR r.c_userid='0')
                )
            )
            AND LOWER(s.c_content) LIKE ?`)

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
		err = errors.Wrap(err, "search document")
	}

	return
}
*/
