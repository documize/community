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
	"github.com/documize/community/core/api/util"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/utility"
)

// AddContentLink inserts wiki-link into the store.
// These links exist when content references another document or content.
func (p *Persister) AddContentLink(l entity.Link) (err error) {
	l.Created = time.Now().UTC()
	l.Revised = time.Now().UTC()

	stmt, err := p.Context.Transaction.Preparex("INSERT INTO link (refid, orgid, folderid, userid, sourcedocumentid, sourcepageid, targetdocumentid, targetpageid, linktype, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer utility.Close(stmt)

	if err != nil {
		log.Error("Unable to prepare insert for link", err)
		return
	}

	_, err = stmt.Exec(l.RefID, l.OrgID, l.FolderID, l.UserID, l.SourceDocumentID, l.SourcePageID, l.TargetDocumentID, l.TargetPageID, l.LinkType, l.Created, l.Revised)

	if err != nil {
		log.Error("Unable to execute insert for link", err)
		return
	}

	return
}

// SearchLinkCandidates returns matching documents, sections and attachments using keywords.
func (p *Persister) SearchLinkCandidates(keywords string) (docs []entity.LinkCandidate,
	pages []entity.LinkCandidate, attachments []entity.LinkCandidate, err error) {

	err = nil

	// find matching documents
	temp := []entity.LinkCandidate{}
	likeQuery := "title LIKE '%" + keywords + "%'"

	err = Db.Select(&temp,
		`SELECT refid as documentid, labelid as folderid,title from document WHERE orgid=? AND `+likeQuery+` AND labelid IN
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
		log.Error(fmt.Sprintf("Unable to execute search links for org %s", p.Context.OrgID), err)
		return
	}

	for _, r := range temp {
		c := entity.LinkCandidate{
			RefID:      util.UniqueID(),
			FolderID:   r.FolderID,
			DocumentID: r.DocumentID,
			TargetID:   r.DocumentID,
			LinkType:   "document",
			Title:      r.Title,
			Context:    "",
		}

		docs = append(docs, c)
	}

	// find matching sections
	likeQuery = "p.title LIKE '%" + keywords + "%'"
	temp = []entity.LinkCandidate{}

	err = Db.Select(&temp,
		`SELECT p.refid as targetid, p.documentid as documentid, p.title as title, d.title as context, d.labelid as folderid from page p
		LEFT JOIN document d ON d.refid=p.documentid WHERE p.orgid=? AND `+likeQuery+` AND d.labelid IN
		(SELECT refid from label WHERE orgid=? AND type=2 AND userid=?
    	UNION ALL SELECT refid FROM label a where orgid=? AND type=1 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid='' AND (canedit=1 OR canview=1))
		UNION ALL SELECT refid FROM label a where orgid=? AND type=3 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid=? AND (canedit=1 OR canview=1)))
		ORDER BY p.title`,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.UserID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.UserID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute search links for org %s", p.Context.OrgID), err)
		return
	}

	for _, r := range temp {
		c := entity.LinkCandidate{
			RefID:      util.UniqueID(),
			FolderID:   r.FolderID,
			DocumentID: r.DocumentID,
			TargetID:   r.TargetID,
			LinkType:   "section",
			Title:      r.Title,
			Context:    r.Context,
		}

		pages = append(pages, c)
	}

	// find matching attachments
	likeQuery = "a.filename LIKE '%" + keywords + "%'"
	temp = []entity.LinkCandidate{}

	err = Db.Select(&temp,
		`SELECT a.refid as targetid, a.documentid as documentid, a.filename as title, a.extension as context, d.labelid as folderid from attachment a
		LEFT JOIN document d ON d.refid=a.documentid WHERE a.orgid=? AND `+likeQuery+` AND d.labelid IN
		(SELECT refid from label WHERE orgid=? AND type=2 AND userid=?
    	UNION ALL SELECT refid FROM label a where orgid=? AND type=1 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid='' AND (canedit=1 OR canview=1))
		UNION ALL SELECT refid FROM label a where orgid=? AND type=3 AND refid IN (SELECT labelid from labelrole WHERE orgid=? AND userid=? AND (canedit=1 OR canview=1)))
		ORDER BY a.filename`,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.UserID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.OrgID,
		p.Context.UserID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute search links for org %s", p.Context.OrgID), err)
		return
	}

	for _, r := range temp {
		c := entity.LinkCandidate{
			RefID:      util.UniqueID(),
			FolderID:   r.FolderID,
			DocumentID: r.DocumentID,
			TargetID:   r.TargetID,
			LinkType:   "file",
			Title:      r.Title,
			Context:    r.Context,
		}

		attachments = append(attachments, c)
	}

	if len(docs) == 0 {
		docs = []entity.LinkCandidate{}
	}
	if len(pages) == 0 {
		pages = []entity.LinkCandidate{}
	}
	if len(attachments) == 0 {
		attachments = []entity.LinkCandidate{}
	}

	return
}

// GetDocumentOutboundLinks returns outbound links for specified document.
func (p *Persister) GetDocumentOutboundLinks(documentID string) (links []entity.Link, err error) {
	err = nil

	err = Db.Select(&links,
		`select l.refid, l.orgid, l.folderid, l.userid, l.sourcedocumentid, l.sourcepageid, l.targetdocumentid, l.targetpageid, l.linktype, l.orphan, l.created, l.revised
		FROM link l
		WHERE l.orgid=? AND l.sourcedocumentid=?`,
		p.Context.OrgID,
		documentID)

	if err != nil {
		return
	}

	if len(links) == 0 {
		links = []entity.Link{}
	}

	return
}

// MarkOrphanDocumentLink marks all link records referencing specified document.
func (p *Persister) MarkOrphanDocumentLink(documentID string) (err error) {
	revised := time.Now().UTC()

	stmt, err := p.Context.Transaction.Preparex("UPDATE link SET orphan=1, revised=? WHERE linktype='document' AND orgid=? AND targetdocumentid=?")

	if err != nil {
		return
	}

	defer utility.Close(stmt)

	_, err = stmt.Exec(revised, p.Context.OrgID, documentID)

	if err != nil {
		return
	}

	return
}

// MarkOrphanPageLink marks all link records referencing specified page.
func (p *Persister) MarkOrphanPageLink(pageID string) (err error) {
	revised := time.Now().UTC()

	stmt, err := p.Context.Transaction.Preparex("UPDATE link SET orphan=1, revised=? WHERE linktype='section' AND orgid=? AND targetpageid=?")

	if err != nil {
		return
	}

	defer utility.Close(stmt)

	_, err = stmt.Exec(revised, p.Context.OrgID, pageID)

	if err != nil {
		return
	}

	return
}

// DeleteSourcePageLinks removes saved links for given source.
func (p *Persister) DeleteSourcePageLinks(pageID string) (rows int64, err error) {
	return p.Base.DeleteWhere(p.Context.Transaction, fmt.Sprintf("DELETE FROM link WHERE orgid=\"%s\" AND sourcepageid=\"%s\"", p.Context.OrgID, pageID))
}

// DeleteSourceDocumentLinks removes saved links for given document.
func (p *Persister) DeleteSourceDocumentLinks(documentID string) (rows int64, err error) {
	return p.Base.DeleteWhere(p.Context.Transaction, fmt.Sprintf("DELETE FROM link WHERE orgid=\"%s\" AND sourcedocumentid=\"%s\"", p.Context.OrgID, documentID))
}

// DeleteLink removes saved link from the store.
func (p *Persister) DeleteLink(id string) (rows int64, err error) {
	return p.Base.DeleteConstrained(p.Context.Transaction, "link", p.Context.OrgID, id)
}
