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
	l.UserID = p.Context.UserID
	l.Created = time.Now().UTC()
	l.Revised = time.Now().UTC()

	stmt, err := p.Context.Transaction.Preparex("INSERT INTO link (refid, orgid, folderid, userid, sourceid, documentid, targetid, linktype, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer utility.Close(stmt)

	if err != nil {
		log.Error("Unable to prepare insert for link", err)
		return
	}

	_, err = stmt.Exec(l.RefID, l.OrgID, l.FolderID, l.UserID, l.SourceID, l.DocumentID, l.TargetID, l.LinkType, l.Created, l.Revised)

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

// GetReferencedLinks returns all links that the specified section is referencing.
// func (p *Persister) GetReferencedLinks(sectionID string) (links []entity.Link, err error) {
// 	err = nil
//
// 	sql := "SELECT id,refid,orgid,folderid,userid,sourceid,documentid,targetid,linktype,orphan,created,revised from link WHERE orgid=? AND sourceid=?"
//
// 	err = Db.Select(&links, sql, p.Context.OrgID, sectionID)
//
// 	if err != nil {
// 		log.Error(fmt.Sprintf("Unable to execute select links for org %s", p.Context.OrgID), err)
// 		return
// 	}
//
// 	return
// }
//
// // GetContentLinksForSection returns all links that are linking to the specified section.
// func (p *Persister) GetContentLinksForSection(sectionID string) (links []entity.Link, err error) {
// 	err = nil
//
// 	sql := "SELECT id,refid,orgid,folderid,userid,sourceid,documentid,targetid,linktype,orphan,created,revised from link WHERE orgid=? AND sectionid=?"
//
// 	err = Db.Select(&links, sql, p.Context.OrgID, sectionID)
//
// 	if err != nil {
// 		log.Error(fmt.Sprintf("Unable to execute select links for org %s", p.Context.OrgID), err)
// 		return
// 	}
//
// 	return
// }
//
// // GetContentLinksForDocument returns all links that are linking to the specified document.
// func (p *Persister) GetContentLinksForDocument(documentID string) (links []entity.Link, err error) {
// 	err = nil
//
// 	sql := "SELECT id,refid,orgid,folderid,userid,sourceid,documentid,targetid,linktype,orphan,created,revised from link WHERE orgid=? AND documentid=?"
//
// 	err = Db.Select(&links, sql, p.Context.OrgID, documentID)
//
// 	if err != nil {
// 		log.Error(fmt.Sprintf("Unable to execute select links for org %s", p.Context.OrgID), err)
// 		return
// 	}
//
// 	return
// }

// MarkOrphanContentLink marks the link record as being invalid.
func (p *Persister) MarkOrphanContentLink(l entity.Link) (err error) {
	l.Orphan = true
	l.Revised = time.Now().UTC()

	stmt, err := p.Context.Transaction.PrepareNamed("UPDATE link SET orphan=1 revised=:revised WHERE orgid=:orgid AND refid=:refid")
	defer utility.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update for link %s", l.RefID), err)
		return
	}

	_, err = stmt.Exec(&l)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute update for link %s", l.RefID), err)
		return
	}

	return
}

// DeleteSourceLinks removes saved links for given source.
func (p *Persister) DeleteSourceLinks(sourceID string) (rows int64, err error) {
	return p.Base.DeleteWhere(p.Context.Transaction, fmt.Sprintf("DELETE FROM link WHERE orgid=\"%s\" AND sourceid=\"%s\"", p.Context.OrgID, sourceID))
}

// DeleteLink removes saved link from the store.
func (p *Persister) DeleteLink(id string) (rows int64, err error) {
	return p.Base.DeleteConstrained(p.Context.Transaction, "link", p.Context.OrgID, id)
}
