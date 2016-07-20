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
	"regexp"
	"strings"
	"time"

	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/utility"
)

// AddDocument inserts the given document record into the document table and audits that it has been done.
func (p *Persister) AddDocument(document entity.Document) (err error) {
	document.OrgID = p.Context.OrgID
	document.Created = time.Now().UTC()
	document.Revised = document.Created // put same time in both fields

	stmt, err := p.Context.Transaction.Preparex("INSERT INTO document (refId, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer utility.Close(stmt)

	if err != nil {
		log.Error("Unable to prepare insert for document", err)
		return
	}

	_, err = stmt.Exec(document.RefID, document.OrgID, document.LabelID, document.UserID, document.Job, document.Location, document.Title, document.Excerpt, document.Slug, document.Tags, document.Template, document.Created, document.Revised)

	if err != nil {
		log.Error("Unable to execute insert for document", err)
		return
	}

	p.Base.Audit(p.Context, "add-document", document.RefID, "")

	return
}

// GetDocument fetches the document record with the given id fromt the document table and audits that it has been got.
func (p *Persister) GetDocument(id string) (document entity.Document, err error) {
	err = nil

	stmt, err := Db.Preparex("SELECT id, refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, created, revised FROM document WHERE orgid=? and refid=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare select for document %s", id), err)
		return
	}

	err = stmt.Get(&document, p.Context.OrgID, id)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select for document %s", id), err)
		return
	}

	p.Base.Audit(p.Context, "get-document", id, "")

	return
}

// GetDocumentMeta returns the metadata for a specified document.
func (p *Persister) GetDocumentMeta(id string) (meta entity.DocumentMeta, err error) {
	err = nil

	sqlViewers := `SELECT CONVERT_TZ(MAX(a.created), @@session.time_zone, '+00:00') as created, a.userid, u.firstname, u.lastname
		FROM audit a LEFT JOIN user u ON a.userid=u.refid
		WHERE a.orgid=? AND a.documentid=? AND a.userid != '0' AND action='get-document'
		GROUP BY a.userid ORDER BY MAX(a.created) DESC`

	err = Db.Select(&meta.Viewers, sqlViewers, p.Context.OrgID, id)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select GetDocumentMeta.viewers %s", id), err)
		return
	}
	//SELECT CONVERT_TZ(a.created, @@session.time_zone, '+00:00') as
	sqlEdits := `SELECT CONVERT_TZ(a.created, @@session.time_zone, '+00:00') as created,
		a.action, a.userid, u.firstname, u.lastname, a.pageid
		FROM audit a LEFT JOIN user u ON a.userid=u.refid
		WHERE a.orgid=? AND a.documentid=? AND a.userid != '0'
		AND (a.action='update-page' OR a.action='add-page' OR a.action='remove-page')
		ORDER BY a.created DESC;`

	err = Db.Select(&meta.Editors, sqlEdits, p.Context.OrgID, id)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select GetDocumentMeta.edits %s", id), err)
		return
	}

	return
}

// GetDocuments returns a slice containg all of the the documents for the client's organisation, with the most recient first.
func (p *Persister) GetDocuments() (documents []entity.Document, err error) {
	err = Db.Select(&documents, "SELECT id, refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, created, revised FROM document WHERE orgid=? AND template=0 ORDER BY revised DESC", p.Context.OrgID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select documents for org %s", p.Context.OrgID), err)
		return
	}

	return
}

// GetDocumentsByFolder returns a slice containing the documents for a given folder, most recient first.
func (p *Persister) GetDocumentsByFolder(folderID string) (documents []entity.Document, err error) {
	err = nil
	err = Db.Select(&documents, "SELECT id, refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, created, revised FROM document WHERE orgid=? AND template=0 AND labelid=? ORDER BY revised DESC", p.Context.OrgID, folderID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select documents for org %s", p.Context.OrgID), err)
		return
	}

	return
}

// GetDocumentsByTag returns a slice containing the documents with the specified tag, in title order.
func (p *Persister) GetDocumentsByTag(tag string) (documents []entity.Document, err error) {

	tagQuery := "tags LIKE '%#" + tag + "#%'"

	err = Db.Select(&documents,
		`SELECT id, refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, created, revised FROM document WHERE orgid=? AND template=0 AND `+tagQuery+` AND labelid IN
		(SELECT refid from label WHERE orgid=? AND type=2 AND userid=?
    	UNION ALL SELECT refid FROM label a where orgid=? AND type=1 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid='' AND (canedit=1 OR canview=1))
		UNION ALL SELECT refid FROM label a where orgid=? AND type=3 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid=? AND (canedit=1 OR canview=1)))
		ORDER BY title`,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.UserID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.UserID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select document by tag for org %s", p.Context.OrgID), err)
		return
	}

	return
}

// GetDocumentTemplates returns a slice containing the documents available as templates to the client's organisation, in title order.
func (p *Persister) GetDocumentTemplates() (documents []entity.Document, err error) {
	err = Db.Select(&documents,
		`SELECT id, refid, orgid, labelid, userid, job, location, title, excerpt, slug, tags, template, created, revised FROM document WHERE orgid=? AND template=1 AND labelid IN
		(SELECT refid from label WHERE orgid=? AND type=2 AND userid=?
    	UNION ALL SELECT refid FROM label a where orgid=? AND type=1 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid='' AND (canedit=1 OR canview=1))
		UNION ALL SELECT refid FROM label a where orgid=? AND type=3 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid=? AND (canedit=1 OR canview=1)))
		ORDER BY title`,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.UserID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.UserID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select document templates for org %s", p.Context.OrgID), err)
		return
	}

	return
}

// GetPublicDocuments returns a slice of SitemapDocument records, holding documents in folders of type 1 (entity.TemplateTypePublic).
func (p *Persister) GetPublicDocuments(orgID string) (documents []entity.SitemapDocument, err error) {
	err = Db.Select(&documents,
		`SELECT d.refid as documentid, d.title as document, d.revised as revised, l.refid as folderid, l.label as folder
FROM document d LEFT JOIN label l ON l.refid=d.labelid
WHERE d.orgid=?
AND l.type=1
AND d.template=0`, orgID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute GetPublicDocuments for org %s", orgID), err)
		return
	}

	return
}

// SearchDocument searches the documents that the client is allowed to see, using the keywords search string, then audits that search.
// Visible documents include both those in the client's own organisation and those that are public, or whose visibility includes the client.
func (p *Persister) SearchDocument(keywords string) (results []entity.DocumentSearch, err error) {
	if len(keywords) == 0 {
		return
	}

	var tagQuery, keywordQuery string

	r, _ := regexp.Compile(`(#[a-z0-9][a-z0-9\-_]*)`)
	res := r.FindAllString(keywords, -1)

	if len(res) == 0 {
		tagQuery = " "
	} else {
		if len(res) == 1 {
			tagQuery = " AND document.tags LIKE '%" + res[0] + "#%' "
		} else {
			fmt.Println("lots of tags!")

			tagQuery = " AND ("

			for i := 0; i < len(res); i++ {
				tagQuery += "document.tags LIKE '%" + res[i] + "#%'"
				if i < len(res)-1 {
					tagQuery += " OR "
				}
			}

			tagQuery += ") "
		}

		keywords = r.ReplaceAllString(keywords, "")
		keywords = strings.Replace(keywords, "  ", "", -1)
	}

	keywords = strings.TrimSpace(keywords)

	if len(keywords) > 0 {
		keywordQuery = "AND MATCH(pagetitle,body) AGAINST('" + keywords + "' in boolean mode)"
	}

	sql := `SELECT search.id, documentid, pagetitle, document.labelid, document.title as documenttitle, document.tags,
   		COALESCE(label.label,'Unknown') AS labelname, document.excerpt as documentexcerpt
   		FROM search, document LEFT JOIN label ON label.orgid=document.orgid AND label.refid = document.labelid
		WHERE search.documentid = document.refid AND search.orgid=? AND document.template=0 ` + tagQuery +
		`AND document.labelid IN
		(SELECT refid from label WHERE orgid=? AND type=2 AND userid=?
    	UNION ALL SELECT refid FROM label a where orgid=? AND type=1 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid='' AND (canedit=1 OR canview=1))
		UNION ALL SELECT refid FROM label a where orgid=? AND type=3 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid=? AND (canedit=1 OR canview=1))) ` + keywordQuery
	// AND MATCH(pagetitle,body)
	//  		AGAINST('` + keywords + "' in boolean mode)"

	err = Db.Select(&results,
		sql,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.UserID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.UserID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute search documents for org %s looking for %s", p.Context.OrgID, keywords), err)
		return
	}

	p.Base.Audit(p.Context, "search", "", "")

	return
}

// UpdateDocument changes the given document record to the new values, updates search information and audits the action.
func (p *Persister) UpdateDocument(document entity.Document) (err error) {
	document.Revised = time.Now().UTC()

	stmt, err := p.Context.Transaction.PrepareNamed("UPDATE document SET labelid=:labelid, userid=:userid, job=:job, location=:location, title=:title, excerpt=:excerpt, slug=:slug, tags=:tags, template=:template, revised=:revised WHERE orgid=:orgid AND refid=:refid")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update for document %s", document.RefID), err)
		return
	}

	var res sql.Result
	res, err = stmt.Exec(&document)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute update for document %s", document.RefID), err)
		return
	}

	rows, rerr := res.RowsAffected()
	if rerr == nil && rows > 1 { // zero rows occur where the update is done with exactly the same data as in the record
		re := fmt.Errorf("Update for document %s affected %d rows", document.RefID, rows)
		log.Error("", re)
		return re
	}

	err = searches.UpdateDocument(&databaseRequest{OrgID: p.Context.OrgID}, document)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute search update for document %s", document.RefID), err)
		return
	}

	p.Base.Audit(p.Context, "update-document", document.RefID, "")

	return
}

// ChangeDocumentLabel assigns the specified folder to the document.
func (p *Persister) ChangeDocumentLabel(document, label string) (err error) {
	revised := time.Now().UTC()

	stmt, err := p.Context.Transaction.Preparex("UPDATE document SET labelid=?, revised=? WHERE orgid=? AND refid=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update for document label change %s", document), err)
		return
	}

	var res sql.Result
	res, err = stmt.Exec(label, revised, p.Context.OrgID, document)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute update for document label change %s", document), err)
		return
	}

	rows, rerr := res.RowsAffected()
	if rerr == nil && rows != 1 {
		re := fmt.Errorf("Update for document %s affected %d rows", document, rows)
		log.Error("", re)
		return re
	}

	p.Base.Audit(p.Context, "update-document-label", document, "")

	return
}

// MoveDocumentLabel changes the label for client's organization's documents which have label "id", to "move".
// Then audits that move.
func (p *Persister) MoveDocumentLabel(id, move string) (err error) {
	stmt, err := p.Context.Transaction.Preparex("UPDATE document SET labelid=? WHERE orgid=? AND labelid=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update for document label move %s", id), err)
		return
	}

	_, err = stmt.Exec(move, p.Context.OrgID, id)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute update for document label move %s", id), err)
		return
	}

	p.Base.Audit(p.Context, "move-document-label", "", "")

	return
}

// DeleteDocument delete the document pages in the database, updates the search subsystem, deletes the associated revisions and attachments,
// audits the deletion, then finally deletes the document itself.
func (p *Persister) DeleteDocument(documentID string) (rows int64, err error) {
	rows, err = p.Base.DeleteWhere(p.Context.Transaction, fmt.Sprintf("DELETE from page WHERE documentid=\"%s\" AND orgid=\"%s\"", documentID, p.Context.OrgID))

	if err != nil {
		return
	}

	err = searches.DeleteDocument(&databaseRequest{OrgID: p.Context.OrgID}, documentID)

	if err != nil {
		return
	}

	_ /*revision rows*/, err = p.Base.DeleteWhere(p.Context.Transaction, fmt.Sprintf("DELETE from revision WHERE documentid=\"%s\" AND orgid=\"%s\"", documentID, p.Context.OrgID))

	if err != nil {
		return
	}

	_ /*attachment rows*/, err = p.Base.DeleteWhere(p.Context.Transaction, fmt.Sprintf("DELETE from attachment WHERE documentid=\"%s\" AND orgid=\"%s\"", documentID, p.Context.OrgID))

	if err != nil {
		return
	}

	p.Base.Audit(p.Context, "delete-document", documentID, "")

	return p.Base.DeleteConstrained(p.Context.Transaction, "document", p.Context.OrgID, documentID)
}
