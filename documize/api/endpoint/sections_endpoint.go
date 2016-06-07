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

package endpoint

import (
	"encoding/json"
	"net/http"

	"github.com/documize/community/documize/api/entity"
	"github.com/documize/community/documize/api/request"
	"github.com/documize/community/documize/api/util"
	"github.com/documize/community/documize/section/provider"
	"github.com/documize/community/wordsmith/log"
)

// GetSections returns available smart sections.
func GetSections(w http.ResponseWriter, r *http.Request) {
	method := "GetSections"

	json, err := json.Marshal(provider.GetSectionMeta())

	if err != nil {
		writeJSONMarshalError(w, method, "section", err)
		return
	}

	writeSuccessBytes(w, json)
}

// RunSectionCommand passes UI request to section handler.
func RunSectionCommand(w http.ResponseWriter, r *http.Request) {
	method := "WebCommand"
	p := request.GetPersister(r)

	query := r.URL.Query()
	documentID := query.Get("documentID")
	sectionName := query.Get("section")

	// Missing value checks
	if len(documentID) == 0 {
		writeMissingDataError(w, method, "documentID")
		return
	}

	if len(sectionName) == 0 {
		writeMissingDataError(w, method, "section")
		return
	}

	// Note that targetMethod query item can be empty --
	// it's up to the section handler to parse if required.

	// Permission checks
	if !p.CanChangeDocument(documentID) {
		writeForbiddenError(w)
		return
	}

	if !p.Context.Editor {
		writeForbiddenError(w)
		return
	}

	if !provider.Command(sectionName, w, r) {
		log.ErrorString("Unable to run provider.Command() for: " + sectionName)
		writeNotFoundError(w, "RunSectionCommand", sectionName)
	}
}

// RefreshSections updates document sections where the data
// is externally sourced.
func RefreshSections(w http.ResponseWriter, r *http.Request) {
	method := "RefreshSections"
	p := request.GetPersister(r)

	query := r.URL.Query()
	documentID := query.Get("documentID")

	if len(documentID) == 0 {
		writeMissingDataError(w, method, "documentID")
		return
	}

	if !p.CanViewDocument(documentID) {
		writeForbiddenError(w)
		return
	}

	// Return payload
	var pages []entity.Page

	// Let's see what sections are reliant on external sources
	meta, err := p.GetDocumentPageMeta(documentID, true)

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	for _, pm := range meta {
		// Grab the page because we need content type and
		page, err := p.GetPage(pm.PageID)

		if err != nil {
			writeGeneralSQLError(w, method, err)
			log.IfErr(tx.Rollback())
			return
		}

		// Ask for data refresh
		data, ok := provider.Refresh(page.ContentType, pm.Config, pm.RawBody)
		if !ok {
			log.ErrorString("provider.Refresh could not find: " + page.ContentType)
		}

		// Render again
		body, ok := provider.Render(page.ContentType, pm.Config, data)
		if !ok {
			log.ErrorString("provider.Render could not find: " + page.ContentType)
		}

		// Compare to stored render
		if body != page.Body {

			// Persist latest data
			page.Body = body
			pages = append(pages, page)

			refID := util.UniqueID()
			err = p.UpdatePage(page, refID, p.Context.UserID, false)

			if err != nil {
				writeGeneralSQLError(w, method, err)
				log.IfErr(tx.Rollback())
				return
			}

			err = p.UpdatePageMeta(pm)

			if err != nil {
				writeGeneralSQLError(w, method, err)
				log.IfErr(tx.Rollback())
				return
			}
		}
	}

	log.IfErr(tx.Commit())

	json, err := json.Marshal(pages)

	if err != nil {
		writeJSONMarshalError(w, method, "pages", err)
		return
	}

	writeSuccessBytes(w, json)
}
