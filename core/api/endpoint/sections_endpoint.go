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
	"database/sql"
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/api/request"
	"github.com/documize/community/core/api/util"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/section/provider"
	"github.com/documize/community/core/utility"
	"github.com/gorilla/mux"
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

	if !provider.Command(sectionName, provider.NewContext(p.Context.OrgID, p.Context.UserID), w, r) {
		log.ErrorString("Unable to run provider.Command() for: " + sectionName)
		writeNotFoundError(w, "RunSectionCommand", sectionName)
	}
}

// RefreshSections updates document sections where the data is externally sourced.
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
		page, err2 := p.GetPage(pm.PageID)

		if err2 == sql.ErrNoRows {
			continue
		}

		if err2 != nil {
			writeGeneralSQLError(w, method, err2)
			log.IfErr(tx.Rollback())
			return
		}

		pcontext := provider.NewContext(pm.OrgID, pm.UserID)

		// Ask for data refresh
		data, ok := provider.Refresh(page.ContentType, pcontext, pm.Config, pm.RawBody)
		if !ok {
			log.ErrorString("provider.Refresh could not find: " + page.ContentType)
		}

		// Render again
		body, ok := provider.Render(page.ContentType, pcontext, pm.Config, data)
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

			err = p.UpdatePageMeta(pm, false) // do not change the UserID on this PageMeta

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

/**************************************************
 * Reusable Content Blocks
 **************************************************/

// AddBlock inserts new reusable content block into database.
func AddBlock(w http.ResponseWriter, r *http.Request) {
	if IsInvalidLicense() {
		util.WriteBadLicense(w)
		return
	}

	method := "AddBlock"
	p := request.GetPersister(r)

	defer utility.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writeBadRequestError(w, method, "Bad payload")
		return
	}

	b := entity.Block{}
	err = json.Unmarshal(body, &b)
	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	if !p.CanUploadDocument(b.LabelID) {
		writeForbiddenError(w)
		return
	}

	b.RefID = util.UniqueID()

	tx, err := request.Db.Beginx()
	if err != nil {
		writeTransactionError(w, method, err)
		return
	}
	p.Context.Transaction = tx

	err = p.AddBlock(b)
	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	p.RecordEvent(entity.EventTypeBlockAdd)

	log.IfErr(tx.Commit())

	b, err = p.GetBlock(b.RefID)
	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	json, err := json.Marshal(b)
	if err != nil {
		writeJSONMarshalError(w, method, "block", err)
		return
	}

	writeSuccessBytes(w, json)
}

// GetBlock returns requested reusable content block.
func GetBlock(w http.ResponseWriter, r *http.Request) {
	method := "GetBlock"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	blockID := params["blockID"]

	if len(blockID) == 0 {
		writeMissingDataError(w, method, "blockID")
		return
	}

	b, err := p.GetBlock(blockID)
	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	json, err := json.Marshal(b)
	if err != nil {
		writeJSONMarshalError(w, method, "block", err)
		return
	}

	writeSuccessBytes(w, json)
}

// GetBlocksForSpace returns available reusable content blocks for the space.
func GetBlocksForSpace(w http.ResponseWriter, r *http.Request) {
	method := "GetBlocksForSpace"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	folderID := params["folderID"]

	if len(folderID) == 0 {
		writeMissingDataError(w, method, "folderID")
		return
	}

	var b []entity.Block
	var err error

	b, err = p.GetBlocksForSpace(folderID)

	if len(b) == 0 {
		b = []entity.Block{}
	}

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	json, err := json.Marshal(b)
	if err != nil {
		writeJSONMarshalError(w, method, "block", err)
		return
	}

	writeSuccessBytes(w, json)
}

// UpdateBlock inserts new reusable content block into database.
func UpdateBlock(w http.ResponseWriter, r *http.Request) {
	method := "UpdateBlock"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	blockID := params["blockID"]
	if len(blockID) == 0 {
		writeMissingDataError(w, method, "blockID")
		return
	}

	defer utility.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		writeBadRequestError(w, method, "Bad payload")
		return
	}

	b := entity.Block{}
	err = json.Unmarshal(body, &b)
	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	b.RefID = blockID

	if !p.CanUploadDocument(b.LabelID) {
		writeForbiddenError(w)
		return
	}

	tx, err := request.Db.Beginx()
	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	err = p.UpdateBlock(b)
	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	p.RecordEvent(entity.EventTypeBlockUpdate)

	log.IfErr(tx.Commit())

	writeSuccessEmptyJSON(w)
}

// DeleteBlock removes requested reusable content block.
func DeleteBlock(w http.ResponseWriter, r *http.Request) {
	method := "DeleteBlock"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	blockID := params["blockID"]

	if len(blockID) == 0 {
		writeMissingDataError(w, method, "blockID")
		return
	}

	tx, err := request.Db.Beginx()
	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	_, err = p.DeleteBlock(blockID)
	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	err = p.RemoveBlockReference(blockID)
	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	p.RecordEvent(entity.EventTypeBlockDelete)

	log.IfErr(tx.Commit())

	writeSuccessEmptyJSON(w)
}
