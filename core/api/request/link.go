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

// AddLink inserts wiki-link into the store.
// These links exist when content references another document or content.
func (p *Persister) AddLink(l entity.Link) (err error) {
	l.UserID = p.Context.UserID
	l.Created = time.Now().UTC()
	l.Revised = time.Now().UTC()

	stmt, err := p.Context.Transaction.Preparex("INSERT INTO link (refid, orgid, userid, sourceid, documentid, pageid, linktype, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer utility.Close(stmt)

	if err != nil {
		log.Error("Unable to prepare insert for link", err)
		return
	}

	_, err = stmt.Exec(l.RefID, l.OrgID, l.UserID, l.SourceID, l.DocumentID, l.PageID, l.LinkType, l.Created, l.Revised)

	if err != nil {
		log.Error("Unable to execute insert for link", err)
		return
	}

	return
}

// GetReferencedLinks returns all links that the specified section is referencing.
func (p *Persister) GetReferencedLinks(sectionID string) (links []entity.Link, err error) {
	err = nil

	sql := "SELECT id,refid,orgid,userid,sourceid,documentid,sectionid,linktype,orphan,created,revised from link WHERE orgid=? AND sourceid=?"

	err = Db.Select(&links, sql, p.Context.OrgID, sectionID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select links for org %s", p.Context.OrgID), err)
		return
	}

	return
}

// GetLinksToSection returns all links that are linking to the specified section.
func (p *Persister) GetLinksToSection(sectionID string) (links []entity.Link, err error) {
	err = nil

	sql := "SELECT id,refid,orgid,userid,sourceid,documentid,sectionid,linktype,orphan,created,revised from link WHERE orgid=? AND sectionid=?"

	err = Db.Select(&links, sql, p.Context.OrgID, sectionID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select links for org %s", p.Context.OrgID), err)
		return
	}

	return
}

// GetLinksToDocument returns all links that are linking to the specified document.
func (p *Persister) GetLinksToDocument(documentID string) (links []entity.Link, err error) {
	err = nil

	sql := "SELECT id,refid,orgid,userid,sourceid,documentid,sectionid,linktype,orphan,created,revised from link WHERE orgid=? AND documentid=?"

	err = Db.Select(&links, sql, p.Context.OrgID, documentID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute select links for org %s", p.Context.OrgID), err)
		return
	}

	return
}

// MarkLinkAsOrphan marks the link record as being invalid.
func (p *Persister) MarkLinkAsOrphan(l entity.Link) (err error) {
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

// DeleteLink removes saved link from the store.
func (p *Persister) DeleteLink(id string) (rows int64, err error) {
	return p.Base.DeleteConstrained(p.Context.Transaction, "link", p.Context.OrgID, id)
}

// GetLinkCandidates returns matching results based upon specified parameters.
// func (p *Persister) GetLinkCandidates(keywords string) (c []entity.LinkCandidate, err error) {
// 	err = nil
//
// 	sql := "SELECT id,refid,orgid,userid,sourceid,documentid,sectionid,linktype,orphan,created,revised from link WHERE orgid=? AND sectionid=?"
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
// package main
//
// import (
// 	"fmt"
// 	"regexp"
// )
//
// var imgRE = regexp.MustCompile(`<a[^>]+\bhref=["']([^"']+)["']`)
//
// func findImages(htm string) []string {
// 	imgs := imgRE.FindAllStringSubmatch(htm, -1)
// 	out := make([]string, len(imgs))
// 	for i := range out {
// 		out[i] = imgs[i][1]
// 	}
// 	return out
// }
//
// func main() {
// 	fmt.Printf("%q", findImages(data))
// }
//
// const data = `
// <p>dfdfdf</p><a href="/link/section/34354"><x><z?>
// <a czx zcxz href='/link/file/file.exe'><x><z?>
// `
