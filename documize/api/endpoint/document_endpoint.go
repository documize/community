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
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"

	"github.com/documize/community/documize/api/entity"
	"github.com/documize/community/documize/api/plugins"
	"github.com/documize/community/documize/api/request"
	"github.com/documize/community/documize/api/store"
	"github.com/documize/community/wordsmith/log"
	"github.com/documize/community/wordsmith/utility"

	"github.com/gorilla/mux"
)

// SearchDocuments endpoint takes a list of keywords and returns a list of document references matching those keywords.
func SearchDocuments(w http.ResponseWriter, r *http.Request) {
	method := "SearchDocuments"
	p := request.GetPersister(r)

	query := r.URL.Query()
	keywords := query.Get("keywords")
	decoded, err := url.QueryUnescape(keywords)
	log.IfErr(err)

	results, err := p.SearchDocument(decoded)

	if err != nil {
		writeServerError(w, method, err)
		return
	}

	// Put in slugs for easy UI display of search URL
	for key, result := range results {
		result.DocumentSlug = utility.MakeSlug(result.DocumentTitle)
		result.FolderSlug = utility.MakeSlug(result.LabelName)
		results[key] = result
	}

	if len(results) == 0 {
		results = []entity.DocumentSearch{}
	}

	data, err := json.Marshal(results)

	if err != nil {
		writeJSONMarshalError(w, method, "search", err)
		return
	}

	writeSuccessBytes(w, data)
}

// GetDocument is an endpoint that returns the document-level information for a given documentID.
func GetDocument(w http.ResponseWriter, r *http.Request) {
	method := "GetDocument"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	id := params["documentID"]

	if len(id) == 0 {
		writeMissingDataError(w, method, "documentID")
		return
	}

	document, err := p.GetDocument(id)

	if err == sql.ErrNoRows {
		writeNotFoundError(w, method, id)
		return
	}

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	if !p.CanViewDocumentInFolder(document.LabelID) {
		writeForbiddenError(w)
		return
	}

	json, err := json.Marshal(document)

	if err != nil {
		writeJSONMarshalError(w, method, "document", err)
		return
	}

	writeSuccessBytes(w, json)
}

// GetDocumentMeta is an endpoint returning the metadata for a document.
func GetDocumentMeta(w http.ResponseWriter, r *http.Request) {
	method := "GetDocumentMeta"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	id := params["documentID"]

	if len(id) == 0 {
		writeMissingDataError(w, method, "documentID")
		return
	}

	meta, err := p.GetDocumentMeta(id)

	if err == sql.ErrNoRows {
		writeNotFoundError(w, method, id)
		return
	}

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	json, err := json.Marshal(meta)

	if err != nil {
		writeJSONMarshalError(w, method, "document", err)
		return
	}

	writeSuccessBytes(w, json)
}

// GetDocumentsByFolder is an endpoint that returns the documents in a given folder.
func GetDocumentsByFolder(w http.ResponseWriter, r *http.Request) {
	method := "GetDocumentsByFolder"
	p := request.GetPersister(r)

	query := r.URL.Query()
	folderID := query.Get("folder")

	if len(folderID) == 0 {
		writeMissingDataError(w, method, "folder")
		return
	}

	if !p.CanViewFolder(folderID) {
		writeForbiddenError(w)
		return
	}

	documents, err := p.GetDocumentsByFolder(folderID)

	if err != nil && err != sql.ErrNoRows {
		writeServerError(w, method, err)
		return
	}

	json, err := json.Marshal(documents)

	if err != nil {
		writeJSONMarshalError(w, method, "document", err)
		return
	}

	writeSuccessBytes(w, json)
}

// GetDocumentsByTag is an endpoint that returns the documents with a given tag.
func GetDocumentsByTag(w http.ResponseWriter, r *http.Request) {
	method := "GetDocumentsByTag"
	p := request.GetPersister(r)

	query := r.URL.Query()
	tag := query.Get("tag")

	if len(tag) == 0 {
		writeMissingDataError(w, method, "tag")
		return
	}

	documents, err := p.GetDocumentsByTag(tag)

	if err != nil && err != sql.ErrNoRows {
		writeServerError(w, method, err)
		return
	}

	json, err := json.Marshal(documents)

	if err != nil {
		writeJSONMarshalError(w, method, "document", err)
		return
	}

	writeSuccessBytes(w, json)
}

// DeleteDocument is an endpoint that deletes a document specified by documentID.
func DeleteDocument(w http.ResponseWriter, r *http.Request) {
	method := "DeleteDocument"
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

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	_, err = p.DeleteDocument(documentID)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	log.IfErr(tx.Commit())

	writeSuccessEmptyJSON(w)
}

// GetDocumentAsDocx returns a Word document.
func GetDocumentAsDocx(w http.ResponseWriter, r *http.Request) {
	method := "GetDocumentAsDocx"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	documentID := params["documentID"]

	if len(documentID) == 0 {
		writeMissingDataError(w, method, "documentID")
		return
	}

	document, err := p.GetDocument(documentID)

	if err == sql.ErrNoRows {
		writeNotFoundError(w, method, documentID)
		return
	}

	if err != nil {
		writeServerError(w, method, err)
		return
	}

	if !p.CanViewDocumentInFolder(document.LabelID) {
		writeForbiddenError(w)
		return
	}

	pages, err := p.GetPages(documentID)

	if err != nil {
		writeServerError(w, method, err)
		return
	}

	xtn := "html"
	actions, err := plugins.Lib.Actions("Export")
	if err == nil {
		for _, x := range actions {
			if x == "docx" { // only actually export a docx if we have the plugin
				xtn = x
				break
			}
		}
	}

	estLen := 0
	for _, page := range pages {
		estLen += len(page.Title) + len(page.Body)
	}
	html := make([]byte, 0, estLen*2) // should be far bigger than we need
	html = append(html, []byte("<html><head></head><body>")...)
	for _, page := range pages {
		html = append(html, []byte(fmt.Sprintf("<h%d>", page.Level))...)
		html = append(html, utility.EscapeHTMLcomplexCharsByte([]byte(page.Title))...)
		html = append(html, []byte(fmt.Sprintf("</h%d>", page.Level))...)
		html = append(html, utility.EscapeHTMLcomplexCharsByte([]byte(page.Body))...)
	}
	html = append(html, []byte("</body></html>")...)

	export, err := store.ExportAs(xtn, string(html))
	log.Error("store.ExportAs()", err)

	w.Header().Set("Content-Disposition", "attachment; filename="+utility.MakeSlug(document.Title)+"."+xtn)
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(export.File)))

	writeSuccessBytes(w, export.File)
}

// UpdateDocument updates an existing document using the
// format described in NewDocumentModel() encoded as JSON in the request.
func UpdateDocument(w http.ResponseWriter, r *http.Request) {
	method := "UpdateDocument"
	p := request.GetPersister(r)

	if !p.Context.Editor {
		w.WriteHeader(http.StatusForbidden)
		return
	}

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

	d := entity.Document{}
	err = json.Unmarshal(body, &d)

	if err != nil {
		writeBadRequestError(w, method, "document")
		return
	}

	d.RefID = documentID

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	err = p.UpdateDocument(d)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	log.IfErr(tx.Commit())

	writeSuccessEmptyJSON(w)
}
