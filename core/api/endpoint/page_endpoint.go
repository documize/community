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
	// "html/template"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/documize/community/core/api/endpoint/models"
	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/api/request"
	"github.com/documize/community/core/api/util"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/section/provider"
	"github.com/documize/community/core/utility"

	"github.com/gorilla/mux"
)

// AddDocumentPage inserts new section into document.
func AddDocumentPage(w http.ResponseWriter, r *http.Request) {
	method := "AddDocumentPage"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	documentID := params["documentID"]

	if len(documentID) == 0 {
		writeMissingDataError(w, method, "documentID")
		return
	}

	if !p.CanChangeDocument(documentID) {
		writeForbiddenError(w)
		return
	}

	defer utility.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writeBadRequestError(w, method, "Bad payload")
		return
	}

	model := new(models.PageModel)
	err = json.Unmarshal(body, &model)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	if model.Page.DocumentID != documentID {
		writeBadRequestError(w, method, "documentID mismatch")
		return
	}

	if model.Meta.DocumentID != documentID {
		writeBadRequestError(w, method, "documentID mismatch")
		return
	}

	pageID := util.UniqueID()
	model.Page.RefID = pageID
	model.Meta.PageID = pageID
	model.Page.SetDefaults()
	model.Meta.SetDefaults()
	model.Meta.OrgID = p.Context.OrgID
	model.Meta.UserID = p.Context.UserID
	// page.Title = template.HTMLEscapeString(page.Title)

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	output, ok := provider.Render(model.Page.ContentType,
		provider.NewContext(model.Meta.OrgID, model.Meta.UserID), model.Meta.Config, model.Meta.RawBody)
	if !ok {
		log.ErrorString("provider.Render could not find: " + model.Page.ContentType)
	}

	model.Page.Body = output

	err = p.AddPage(*model)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	log.IfErr(tx.Commit())

	newPage, err := p.GetPage(pageID)

	json, err := json.Marshal(newPage)

	if err != nil {
		writeJSONMarshalError(w, method, "page", err)
		return
	}

	writeSuccessBytes(w, json)
}

// GetDocumentPage gets specified page for document.
func GetDocumentPage(w http.ResponseWriter, r *http.Request) {
	method := "GetDocumentPage"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	documentID := params["documentID"]
	pageID := params["pageID"]

	if len(documentID) == 0 {
		writeMissingDataError(w, method, "documentID")
		return
	}

	if len(pageID) == 0 {
		writeMissingDataError(w, method, "pageID")
		return
	}

	if !p.CanViewDocument(documentID) {
		writeForbiddenError(w)
		return
	}

	page, err := p.GetPage(pageID)

	if err == sql.ErrNoRows {
		writeNotFoundError(w, method, documentID)
		return
	}

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	if page.DocumentID != documentID {
		writeBadRequestError(w, method, "documentID mismatch")
		return
	}

	json, err := json.Marshal(page)

	if err != nil {
		writeJSONMarshalError(w, method, "document", err)
		return
	}

	writeSuccessBytes(w, json)
}

// GetDocumentPages gets all pages for document.
func GetDocumentPages(w http.ResponseWriter, r *http.Request) {
	method := "GetDocumentPages"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	documentID := params["documentID"]

	if len(documentID) == 0 {
		writeMissingDataError(w, method, "documentID")
		return
	}

	if !p.CanViewDocument(documentID) {
		writeForbiddenError(w)
		return
	}

	query := r.URL.Query()
	content := query.Get("content")

	var pages []entity.Page
	var err error

	if len(content) > 0 {
		pages, err = p.GetPagesWithoutContent(documentID)
	} else {
		pages, err = p.GetPages(documentID)
	}

	if len(pages) == 0 {
		pages = []entity.Page{}
	}

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	json, err := json.Marshal(pages)

	if err != nil {
		writeJSONMarshalError(w, method, "document", err)
		return
	}

	writeSuccessBytes(w, json)
}

// GetDocumentPagesBatch gets specified pages for document.
func GetDocumentPagesBatch(w http.ResponseWriter, r *http.Request) {
	method := "GetDocumentPagesBatch"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	documentID := params["documentID"]

	if len(documentID) == 0 {
		writeMissingDataError(w, method, "documentID")
		return
	}

	if !p.CanViewDocument(documentID) {
		writeForbiddenError(w)
		return
	}

	defer utility.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	requestedPages := string(body)

	pages, err := p.GetPagesWhereIn(documentID, requestedPages)

	if err == sql.ErrNoRows {
		writeNotFoundError(w, method, documentID)
		return
	}

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	json, err := json.Marshal(pages)

	if err != nil {
		writeJSONMarshalError(w, method, "document", err)
		return
	}

	writeSuccessBytes(w, json)
}

// DeleteDocumentPage deletes a page.
func DeleteDocumentPage(w http.ResponseWriter, r *http.Request) {
	method := "DeleteDocumentPage"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	documentID := params["documentID"]

	if len(documentID) == 0 {
		writeMissingDataError(w, method, "documentID")
		return
	}

	pageID := params["pageID"]

	if len(pageID) == 0 {
		writeMissingDataError(w, method, "pageID")
		return
	}

	if !p.CanChangeDocument(documentID) {
		writeForbiddenError(w)
		return
	}

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	_, err = p.DeletePage(documentID, pageID)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	log.IfErr(tx.Commit())

	writeSuccessEmptyJSON(w)
}

// DeleteDocumentPages batch deletes pages.
func DeleteDocumentPages(w http.ResponseWriter, r *http.Request) {
	method := "DeleteDocumentPages"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	documentID := params["documentID"]

	if len(documentID) == 0 {
		writeMissingDataError(w, method, "documentID")
		return
	}

	if !p.CanChangeDocument(documentID) {
		writeForbiddenError(w)
		return
	}

	defer utility.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writeBadRequestError(w, method, "Bad body")
		return
	}

	model := new([]models.PageLevelRequestModel)
	err = json.Unmarshal(body, &model)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	for _, page := range *model {
		_, err = p.DeletePage(documentID, page.PageID)

		if err != nil {
			log.IfErr(tx.Rollback())
			writeGeneralSQLError(w, method, err)
			return
		}
	}

	log.IfErr(tx.Commit())

	writeSuccessEmptyJSON(w)
}

// UpdateDocumentPage will persist changed page and note the fact
// that this is a new revision. If the page is the first in a document
// then the corresponding document title will also be changed.
func UpdateDocumentPage(w http.ResponseWriter, r *http.Request) {
	method := "UpdateDocumentPage"
	p := request.GetPersister(r)

	if !p.Context.Editor {
		writeForbiddenError(w)
		return
	}

	params := mux.Vars(r)
	documentID := params["documentID"]

	if len(documentID) == 0 {
		writeMissingDataError(w, method, "documentID")
		return
	}

	pageID := params["pageID"]

	if len(pageID) == 0 {
		writeMissingDataError(w, method, "pageID")
		return
	}

	defer utility.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writeBadRequestError(w, method, "Bad request body")
		return
	}

	model := new(models.PageModel)
	err = json.Unmarshal(body, &model)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	if model.Page.RefID != pageID || model.Page.DocumentID != documentID {
		writeBadRequestError(w, method, "id mismatch")
		return
	}

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	model.Page.SetDefaults()
	model.Meta.SetDefaults()

	oldPageMeta, err := p.GetPageMeta(pageID)

	if err != nil {
		log.Error("unable to fetch old pagemeta record", err)
		writeBadRequestError(w, method, err.Error())
		return
	}

	output, ok := provider.Render(model.Page.ContentType, provider.NewContext(model.Meta.OrgID, oldPageMeta.UserID), model.Meta.Config, model.Meta.RawBody)
	if !ok {
		log.ErrorString("provider.Render could not find: " + model.Page.ContentType)
	}
	model.Page.Body = output

	p.Context.Transaction = tx

	var skipRevision bool
	skipRevision, err = strconv.ParseBool(r.URL.Query().Get("r"))

	refID := util.UniqueID()
	err = p.UpdatePage(model.Page, refID, p.Context.UserID, skipRevision)

	if err != nil {
		writeGeneralSQLError(w, method, err)
		log.IfErr(tx.Rollback())
		return
	}

	err = p.UpdatePageMeta(model.Meta, true) // change the UserID to the current one

	log.IfErr(tx.Commit())

	updatedPage, err := p.GetPage(pageID)

	json, err := json.Marshal(updatedPage)

	if err != nil {
		writeJSONMarshalError(w, method, "page", err)
		return
	}

	writeSuccessBytes(w, json)
}

// ChangeDocumentPageSequence will swap page sequence for a given number of pages.
func ChangeDocumentPageSequence(w http.ResponseWriter, r *http.Request) {
	method := "ChangeDocumentPageSequence"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	documentID := params["documentID"]

	if len(documentID) == 0 {
		writeMissingDataError(w, method, "documentID")
		return
	}

	if !p.CanChangeDocument(documentID) {
		writeForbiddenError(w)
		return
	}

	defer utility.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	model := new([]models.PageSequenceRequestModel)
	err = json.Unmarshal(body, &model)

	if err != nil {
		writeBadRequestError(w, method, "bad payload")
		return
	}

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	for _, page := range *model {
		err = p.UpdatePageSequence(documentID, page.PageID, page.Sequence)

		if err != nil {
			log.IfErr(tx.Rollback())
			writeGeneralSQLError(w, method, err)
			return
		}
	}

	log.IfErr(tx.Commit())

	writeSuccessEmptyJSON(w)
}

// ChangeDocumentPageLevel handles page indent/outdent changes.
func ChangeDocumentPageLevel(w http.ResponseWriter, r *http.Request) {
	method := "ChangeDocumentPageLevel"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	documentID := params["documentID"]

	if len(documentID) == 0 {
		writeMissingDataError(w, method, "documentID")
		return
	}

	if !p.CanChangeDocument(documentID) {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	defer utility.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	model := new([]models.PageLevelRequestModel)
	err = json.Unmarshal(body, &model)

	if err != nil {
		writeBadRequestError(w, method, "bad payload")
		return
	}

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	for _, page := range *model {
		err = p.UpdatePageLevel(documentID, page.PageID, page.Level)

		if err != nil {
			log.IfErr(tx.Rollback())
			writeGeneralSQLError(w, method, err)
			return
		}
	}

	log.IfErr(tx.Commit())

	writeSuccessEmptyJSON(w)
}

// GetDocumentPageMeta gets page meta data for specified document page.
func GetDocumentPageMeta(w http.ResponseWriter, r *http.Request) {
	method := "GetDocumentPageMeta"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	documentID := params["documentID"]
	pageID := params["pageID"]

	if len(documentID) == 0 {
		writeMissingDataError(w, method, "documentID")
		return
	}

	if len(pageID) == 0 {
		writeMissingDataError(w, method, "pageID")
		return
	}

	if !p.CanViewDocument(documentID) {
		writeForbiddenError(w)
		return
	}

	meta, err := p.GetPageMeta(pageID)

	if err == sql.ErrNoRows {
		writeNotFoundError(w, method, pageID)
		return
	}

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	if meta.DocumentID != documentID {
		writeBadRequestError(w, method, "documentID mismatch")
		return
	}

	json, err := json.Marshal(meta)

	if err != nil {
		writeJSONMarshalError(w, method, "pagemeta", err)
		return
	}

	writeSuccessBytes(w, json)
}
