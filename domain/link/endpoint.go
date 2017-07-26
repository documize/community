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

package link

import (
	"database/sql"
	"net/http"
	"net/url"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/document"
	"github.com/documize/community/model/attachment"
	"github.com/documize/community/model/link"
	"github.com/documize/community/model/page"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *domain.Store
}

// GetLinkCandidates returns references to documents/sections/attachments.
func (h *Handler) GetLinkCandidates(w http.ResponseWriter, r *http.Request) {
	method := "link.Candidates"
	ctx := domain.GetRequestContext(r)

	folderID := request.Param(r, "folderID")
	if len(folderID) == 0 {
		response.WriteMissingDataError(w, method, "folderID")
		return
	}

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	pageID := request.Param(r, "pageID")
	if len(pageID) == 0 {
		response.WriteMissingDataError(w, method, "pageID")
		return
	}

	// permission check
	if document.CanViewDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	// We can link to a section within the same document so
	// let's get all pages for the document and remove "us".
	pages, err := h.Store.Page.GetPagesWithoutContent(ctx, documentID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}

	if len(pages) == 0 {
		pages = []page.Page{}
	}

	pc := []link.Candidate{}

	for _, p := range pages {
		if p.RefID != pageID {
			c := link.Candidate{
				RefID:      uniqueid.Generate(),
				FolderID:   folderID,
				DocumentID: documentID,
				TargetID:   p.RefID,
				LinkType:   p.PageType,
				Title:      p.Title,
			}
			pc = append(pc, c)
		}
	}

	// We can link to attachment within the same document so
	// let's get all attachments for the document.
	files, err := h.Store.Attachment.GetAttachments(ctx, documentID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}

	if len(files) == 0 {
		files = []attachment.Attachment{}
	}

	fc := []link.Candidate{}

	for _, f := range files {
		c := link.Candidate{
			RefID:      uniqueid.Generate(),
			FolderID:   folderID,
			DocumentID: documentID,
			TargetID:   f.RefID,
			LinkType:   "file",
			Title:      f.Filename,
			Context:    f.Extension,
		}

		fc = append(fc, c)
	}

	var payload struct {
		Pages       []link.Candidate `json:"pages"`
		Attachments []link.Candidate `json:"attachments"`
	}

	payload.Pages = pc
	payload.Attachments = fc

	response.WriteJSON(w, payload)
}

// SearchLinkCandidates endpoint takes a list of keywords and returns a list of document references matching those keywords.
func (h *Handler) SearchLinkCandidates(w http.ResponseWriter, r *http.Request) {
	method := "link.SearchLinkCandidates"
	ctx := domain.GetRequestContext(r)

	keywords := request.Query(r, "keywords")
	decoded, err := url.QueryUnescape(keywords)
	if err != nil {
		h.Runtime.Log.Error("decode query string", err)
	}

	docs, pages, attachments, err := h.Store.Link.SearchCandidates(ctx, decoded)
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	var payload struct {
		Documents   []link.Candidate `json:"documents"`
		Pages       []link.Candidate `json:"pages"`
		Attachments []link.Candidate `json:"attachments"`
	}

	payload.Documents = docs
	payload.Pages = pages
	payload.Attachments = attachments

	response.WriteJSON(w, payload)
}
