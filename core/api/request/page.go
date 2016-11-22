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
	"strings"
	"time"

	"github.com/documize/community/core/api/endpoint/models"
	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/api/util"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/utility"
	"github.com/jmoiron/sqlx"
)

// AddPage inserts the given page into the page table, adds that page to the queue of pages to index and audits that the page has been added.
func (p *Persister) AddPage(model models.PageModel) (err error) {
	err = nil
	model.Page.OrgID = p.Context.OrgID
	model.Page.UserID = p.Context.UserID
	model.Page.Created = time.Now().UTC()
	model.Page.Revised = time.Now().UTC()

	model.Meta.OrgID = p.Context.OrgID
	model.Meta.UserID = p.Context.UserID
	model.Meta.DocumentID = model.Page.DocumentID
	model.Meta.Created = time.Now().UTC()
	model.Meta.Revised = time.Now().UTC()

	if model.Page.IsSectionType() {
		// Get maximum page sequence number and increment
		row := Db.QueryRow("SELECT max(sequence) FROM page WHERE orgid=? AND documentid=? AND pagetype='section'", p.Context.OrgID, model.Page.DocumentID)
		var maxSeq float64
		err = row.Scan(&maxSeq)

		if err != nil {
			maxSeq = 2048
		}

		model.Page.Sequence = maxSeq * 2
	}

	stmt, err := p.Context.Transaction.Preparex("INSERT INTO page (refid, orgid, documentid, userid, contenttype, pagetype, level, title, body, revisions, sequence, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer utility.Close(stmt)

	if err != nil {
		log.Error("Unable to prepare insert for page", err)
		return
	}

	_, err = stmt.Exec(model.Page.RefID, model.Page.OrgID, model.Page.DocumentID, model.Page.UserID, model.Page.ContentType, model.Page.PageType, model.Page.Level, model.Page.Title, model.Page.Body, model.Page.Revisions, model.Page.Sequence, model.Page.Created, model.Page.Revised)

	if err != nil {
		log.Error("Unable to execute insert for page", err)
		return
	}

	err = searches.Add(&databaseRequest{OrgID: p.Context.OrgID}, model.Page, model.Page.RefID)

	stmt2, err := p.Context.Transaction.Preparex("INSERT INTO pagemeta (pageid, orgid, userid, documentid, rawbody, config, externalsource, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer utility.Close(stmt2)

	if err != nil {
		log.Error("Unable to prepare insert for page meta", err)
		return
	}

	_, err = stmt2.Exec(model.Meta.PageID, model.Meta.OrgID, model.Meta.UserID, model.Meta.DocumentID, model.Meta.RawBody, model.Meta.Config, model.Meta.ExternalSource, model.Meta.Created, model.Meta.Revised)

	if err != nil {
		log.Error("Unable to execute insert for page meta", err)
		return
	}

	p.Base.Audit(p.Context, "add-page", model.Page.DocumentID, model.Page.RefID)

	return
}

// GetPage returns the pageID page record from the page table.
func (p *Persister) GetPage(pageID string) (page entity.Page, err error) {
	err = nil

	stmt, err := Db.Preparex("SELECT a.id, a.refid, a.orgid, a.documentid, a.userid, a.contenttype, a.pagetype, a.level, a.sequence, a.title, a.body, a.revisions, a.created, a.revised FROM page a WHERE a.orgid=? AND a.refid=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare select for page %s", pageID), err)
		return
	}

	err = stmt.Get(&page, p.Context.OrgID, pageID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select for page %s", pageID), err)
		return
	}

	return
}

// GetPages returns a slice containing all the page records for a given documentID, in presentation sequence.
func (p *Persister) GetPages(documentID string) (pages []entity.Page, err error) {
	err = nil

	err = Db.Select(&pages, "SELECT a.id, a.refid, a.orgid, a.documentid, a.userid, a.contenttype, a.pagetype, a.level, a.sequence, a.title, a.body, a.revisions, a.created, a.revised FROM page a WHERE a.orgid=? AND a.documentid=? ORDER BY a.sequence", p.Context.OrgID, documentID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select pages for org %s and document %s", p.Context.OrgID, documentID), err)
		return
	}

	return
}

// GetPagesWhereIn returns a slice, in presentation sequence, containing those page records for a given documentID
// where their refid is in the comma-separated list passed as inPages.
func (p *Persister) GetPagesWhereIn(documentID, inPages string) (pages []entity.Page, err error) {
	err = nil

	args := []interface{}{p.Context.OrgID, documentID}
	tempValues := strings.Split(inPages, ",")
	sql := "SELECT a.id, a.refid, a.orgid, a.documentid, a.userid, a.contenttype, a.pagetype, a.level, a.sequence, a.title, a.body, a.revisions, a.created, a.revised FROM page a WHERE a.orgid=? AND a.documentid=? AND a.refid IN (?" + strings.Repeat(",?", len(tempValues)-1) + ") ORDER BY sequence"

	inValues := make([]interface{}, len(tempValues))

	for i, v := range tempValues {
		inValues[i] = interface{}(v)
	}

	args = append(args, inValues...)

	stmt, err := Db.Preparex(sql)
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Failed to prepare select pages for org %s and document %s where in %s", p.Context.OrgID, documentID, inPages), err)
		return
	}

	rows, err := stmt.Queryx(args...)

	if err != nil {
		log.Error(fmt.Sprintf("Failed to execute select pages for org %s and document %s where in %s", p.Context.OrgID, documentID, inPages), err)
		return
	}

	defer utility.Close(rows)

	for rows.Next() {
		page := entity.Page{}
		err = rows.StructScan(&page)

		if err != nil {
			log.Error(fmt.Sprintf("Failed to scan row: select pages for org %s and document %s where in %s", p.Context.OrgID, documentID, inPages), err)
			return
		}

		pages = append(pages, page)
	}

	if err != nil {
		log.Error(fmt.Sprintf("Failed to execute select pages for org %s and document %s where in %s", p.Context.OrgID, documentID, inPages), err)
		return
	}

	return
}

// GetPagesWithoutContent returns a slice containing all the page records for a given documentID, in presentation sequence,
// but without the body field (which holds the HTML content).
func (p *Persister) GetPagesWithoutContent(documentID string) (pages []entity.Page, err error) {
	err = Db.Select(&pages, "SELECT id, refid, orgid, documentid, userid, contenttype, pagetype, sequence, level, title, revisions, created, revised FROM page WHERE orgid=? AND documentid=? ORDER BY sequence", p.Context.OrgID, documentID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select pages for org %s and document %s", p.Context.OrgID, documentID), err)
		return
	}

	return
}

// UpdatePage saves changes to the database and handles recording of revisions.
// Not all updates result in a revision being recorded hence the parameter.
func (p *Persister) UpdatePage(page entity.Page, refID, userID string, skipRevision bool) (err error) {
	err = nil
	page.Revised = time.Now().UTC()

	// Store revision history
	if !skipRevision {
		var stmt *sqlx.Stmt
		stmt, err = p.Context.Transaction.Preparex("INSERT INTO revision (refid, orgid, documentid, ownerid, pageid, userid, contenttype, pagetype, title, body, rawbody, config, created, revised) SELECT ? as refid, a.orgid, a.documentid, a.userid as ownerid, a.refid as pageid, ? as userid, a.contenttype, a.pagetype, a.title, a.body, b.rawbody, b.config, ? as created, ? as revised FROM page a, pagemeta b WHERE a.refid=? AND a.refid=b.pageid")

		defer utility.Close(stmt)

		if err != nil {
			log.Error(fmt.Sprintf("Unable to prepare insert for page revision %s", page.RefID), err)
			return err
		}

		_, err = stmt.Exec(refID, userID, time.Now().UTC(), time.Now().UTC(), page.RefID)

		if err != nil {
			log.Error(fmt.Sprintf("Unable to execute insert for page revision %s", page.RefID), err)
			return err
		}
	}

	// Update page
	var stmt2 *sqlx.NamedStmt
	stmt2, err = p.Context.Transaction.PrepareNamed("UPDATE page SET documentid=:documentid, level=:level, title=:title, body=:body, revisions=:revisions, sequence=:sequence, revised=:revised WHERE orgid=:orgid AND refid=:refid")
	defer utility.Close(stmt2)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update for page %s", page.RefID), err)
		return
	}

	_, err = stmt2.Exec(&page)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute update for page %s", page.RefID), err)
		return
	}

	err = searches.Update(&databaseRequest{OrgID: p.Context.OrgID}, page)
	if err != nil {
		log.Error("Unable to update for searching", err)
		return
	}

	// Update revisions counter
	if !skipRevision {
		stmt3, err := p.Context.Transaction.Preparex("UPDATE page SET revisions=revisions+1 WHERE orgid=? AND refid=?")
		defer utility.Close(stmt3)

		if err != nil {
			log.Error(fmt.Sprintf("Unable to prepare revisions counter update for page %s", page.RefID), err)
			return err
		}

		_, err = stmt3.Exec(p.Context.OrgID, page.RefID)

		if err != nil {
			log.Error(fmt.Sprintf("Unable to execute revisions counter update for page %s", page.RefID), err)
			return err
		}
	}

	//if page.Level == 1 { // may need to update the document name
	//var doc entity.Document

	//stmt4, err := p.Context.Transaction.Preparex("SELECT id, refid, orgid, labelid, job, location, title, excerpt, slug, tags, template, created, revised FROM document WHERE refid=?")
	//defer utility.Close(stmt4)

	//if err != nil {
	//log.Error(fmt.Sprintf("Unable to prepare pagemanager doc query for Id %s", page.DocumentID), err)
	//return err
	//}

	//err = stmt4.Get(&doc, page.DocumentID)

	//if err != nil {
	//log.Error(fmt.Sprintf("Unable to execute pagemanager document query for Id %s", page.DocumentID), err)
	//return err
	//}

	//if doc.Title != page.Title {
	//doc.Title = page.Title
	//doc.Revised = page.Revised
	//err = p.UpdateDocument(doc)

	//if err != nil {
	//log.Error(fmt.Sprintf("Unable to update document when page 1 altered DocumentId %s", page.DocumentID), err)
	//return err
	//}
	//}
	//}

	// find any content links in the HTML
	links := util.GetContentLinks(page.Body)

	// get a copy of previously saved links
	previousLinks, _ := p.GetPageLinks(page.DocumentID, page.RefID)

	// delete previous content links for this page
	_, _ = p.DeleteSourcePageLinks(page.RefID)

	// save latest content links for this page
	for _, link := range links {
		link.Orphan = false
		link.OrgID = p.Context.OrgID
		link.UserID = p.Context.UserID
		link.SourceDocumentID = page.DocumentID
		link.SourcePageID = page.RefID

		if link.LinkType == "document" {
			link.TargetID = ""
		}

		// We check if there was a previously saved version of this link.
		// If we find one, we carry forward the orphan flag.
		for _, p := range previousLinks {
			if link.TargetID == p.TargetID && link.LinkType == p.LinkType {
				link.Orphan = p.Orphan
				break
			}
		}

		// save
		err := p.AddContentLink(link)

		if err != nil {
			log.Error(fmt.Sprintf("Unable to insert content links for page %s", page.RefID), err)
			return err
		}
	}

	p.Base.Audit(p.Context, "update-page", page.DocumentID, page.RefID)

	return
}

// UpdatePageMeta persists meta information associated with a document page.
func (p *Persister) UpdatePageMeta(meta entity.PageMeta, updateUserID bool) (err error) {
	err = nil
	meta.Revised = time.Now().UTC()
	if updateUserID {
		meta.UserID = p.Context.UserID
	}

	var stmt *sqlx.NamedStmt
	stmt, err = p.Context.Transaction.PrepareNamed("UPDATE pagemeta SET userid=:userid, documentid=:documentid, rawbody=:rawbody, config=:config, externalsource=:externalsource, revised=:revised WHERE orgid=:orgid AND pageid=:pageid")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update for page meta %s", meta.PageID), err)
		return
	}

	_, err = stmt.Exec(&meta)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute update for page meta %s", meta.PageID), err)
		return
	}

	return
}

// UpdatePageSequence changes the presentation sequence of the pageID page in the document.
// It then propagates that change into the search table and audits that it has occurred.
func (p *Persister) UpdatePageSequence(documentID, pageID string, sequence float64) (err error) {
	stmt, err := p.Context.Transaction.Preparex("UPDATE page SET sequence=? WHERE orgid=? AND refid=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update for page %s", pageID), err)
		return
	}

	_, err = stmt.Exec(sequence, p.Context.OrgID, pageID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute update for page %s", pageID), err)
		return
	}

	err = searches.UpdateSequence(&databaseRequest{OrgID: p.Context.OrgID}, documentID, pageID, sequence)

	p.Base.Audit(p.Context, "re-sequence-page", "", pageID)

	return
}

// UpdatePageLevel changes the heading level of the pageID page in the document.
// It then propagates that change into the search table and audits that it has occurred.
func (p *Persister) UpdatePageLevel(documentID, pageID string, level int) (err error) {
	stmt, err := p.Context.Transaction.Preparex("UPDATE page SET level=? WHERE orgid=? AND refid=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update for page %s", pageID), err)
		return
	}

	_, err = stmt.Exec(level, p.Context.OrgID, pageID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute update for page %s", pageID), err)
		return
	}

	err = searches.UpdateLevel(&databaseRequest{OrgID: p.Context.OrgID}, documentID, pageID, level)

	p.Base.Audit(p.Context, "re-level-page", "", pageID)

	return
}

// DeletePage deletes the pageID page in the document.
// It then propagates that change into the search table, adds a delete the page revisions history, and audits that the page has been removed.
func (p *Persister) DeletePage(documentID, pageID string) (rows int64, err error) {
	rows, err = p.Base.DeleteConstrained(p.Context.Transaction, "page", p.Context.OrgID, pageID)

	if err == nil {
		_, err = p.Base.DeleteWhere(p.Context.Transaction, fmt.Sprintf("DELETE FROM pagemeta WHERE orgid='%s' AND pageid='%s'", p.Context.OrgID, pageID))
		_, err = searches.Delete(&databaseRequest{OrgID: p.Context.OrgID}, documentID, pageID)

		// delete content links from this page
		_, err = p.DeleteSourcePageLinks(pageID)

		// mark as orphan links to this page
		err = p.MarkOrphanPageLink(pageID)

		p.Base.Audit(p.Context, "remove-page", documentID, pageID)
	}

	return
}

// GetPageMeta returns the meta information associated with the page.
func (p *Persister) GetPageMeta(pageID string) (meta entity.PageMeta, err error) {
	err = nil

	stmt, err := Db.Preparex("SELECT id, pageid, orgid, userid, documentid, rawbody, coalesce(config,JSON_UNQUOTE('{}')) as config, externalsource, created, revised FROM pagemeta WHERE orgid=? AND pageid=?")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare select for pagemeta %s", pageID), err)
		return
	}

	err = stmt.Get(&meta, p.Context.OrgID, pageID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select for pagemeta %s", pageID), err)
		return
	}

	return
}

// GetDocumentPageMeta returns the meta information associated with a document.
func (p *Persister) GetDocumentPageMeta(documentID string, externalSourceOnly bool) (meta []entity.PageMeta, err error) {
	err = nil
	filter := ""
	if externalSourceOnly {
		filter = " AND externalsource=1"
	}

	err = Db.Select(&meta, "SELECT id, pageid, orgid, userid, documentid, rawbody, coalesce(config,JSON_UNQUOTE('{}')) as config, externalsource, created, revised FROM pagemeta WHERE orgid=? AND documentid=?"+filter, p.Context.OrgID, documentID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select document page meta for org %s and document %s", p.Context.OrgID, documentID), err)
		return
	}

	return
}
