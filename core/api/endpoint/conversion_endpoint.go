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
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/documize/community/core/api/endpoint/models"
	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/api/request"
	"github.com/documize/community/core/api/store"
	"github.com/documize/community/core/api/util"
	api "github.com/documize/community/core/convapi"
	"github.com/documize/community/core/log"

	uuid "github.com/nu7hatch/gouuid"

	"github.com/gorilla/mux"
)

func uploadDocument(w http.ResponseWriter, r *http.Request) (string, string, string) {
	method := "uploadDocument"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	folderID := params["folderID"]

	if !p.CanUploadDocument(folderID) {
		writeForbiddenError(w)
		return "", "", ""
	}

	// grab file
	filedata, filename, err := r.FormFile("attachment")

	if err != nil {
		writeMissingDataError(w, method, "attachment")
		return "", "", ""
	}

	b := new(bytes.Buffer)
	_, err = io.Copy(b, filedata)

	if err != nil {
		writeServerError(w, method, err)
		return "", "", ""
	}

	// generate job id
	var job = "some-uuid"

	newUUID, err := uuid.NewV4()

	if err != nil {
		writeServerError(w, method, err)
		return "", "", ""
	}

	job = newUUID.String()

	err = storageProvider.Upload(job, filename.Filename, b.Bytes())

	if err != nil {
		writeServerError(w, method, err)
		return "", "", ""
	}

	log.Info(fmt.Sprintf("Org %s (%s) [Uploaded] %s", p.Context.OrgName, p.Context.OrgID, filename.Filename))

	return job, folderID, p.Context.OrgID
}

func convertDocument(w http.ResponseWriter, r *http.Request, job, folderID string, conversion api.ConversionJobRequest) {
	method := "convertDocument"
	p := request.GetPersister(r)

	var fileResult *api.DocumentConversionResponse
	var filename string
	var err error

	filename, fileResult, err = storageProvider.Convert(conversion)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	if fileResult.Err != "" {
		writeGeneralSQLError(w, method, errors.New(fileResult.Err))
		return
	}

	// NOTE: empty .docx documents trigger this error
	if len(fileResult.Pages) == 0 {
		writeMissingDataError(w, method, "no pages in document")
		return
	}

	// All the commented-out code below should be in following function call

	newDocument, err := processDocument(p, filename, job, folderID, fileResult)

	if err != nil {
		writeServerError(w, method, err)
		return
	}

	json, err := json.Marshal(newDocument)

	if err != nil {
		writeJSONMarshalError(w, method, "conversion", err)
		return
	}

	writeSuccessBytes(w, json)
}

// UploadConvertDocument is an endpoint to both upload and convert a document
func UploadConvertDocument(w http.ResponseWriter, r *http.Request) {
	job, folderID, orgID := uploadDocument(w, r)
	if job == "" {
		return // error already handled
	}
	convertDocument(w, r, job, folderID, api.ConversionJobRequest{
		Job:        job,
		IndexDepth: 4,
		OrgID:      orgID,
	})
}

func processDocument(p request.Persister, filename, job, folderID string, fileResult *api.DocumentConversionResponse) (newDocument entity.Document, err error) {
	// Convert into database objects
	document := store.ConvertFileResult(filename, fileResult)
	document.Job = job
	document.OrgID = p.Context.OrgID
	document.LabelID = folderID
	document.UserID = p.Context.UserID
	documentID := util.UniqueID()
	document.RefID = documentID

	tx, err := request.Db.Beginx()

	log.IfErr(err)

	p.Context.Transaction = tx

	err = p.AddDocument(document)

	if err != nil {
		log.IfErr(tx.Rollback())
		log.Error("Cannot insert new document", err)
		return
	}

	//err = processPage(documentID, fileResult.PageFiles, fileResult.Pages.Children[0], 1, p)

	for k, v := range fileResult.Pages {
		var page entity.Page
		page.OrgID = p.Context.OrgID
		page.DocumentID = documentID
		page.Level = v.Level
		page.Title = v.Title
		page.Body = string(v.Body)
		page.Sequence = float64(k+1) * 1024.0 // need to start above 0 to allow insertion before the first item
		pageID := util.UniqueID()
		page.RefID = pageID
		page.ContentType = "wysiwyg"
		page.PageType = "section"

		meta := entity.PageMeta{}
		meta.PageID = pageID
		meta.RawBody = page.Body

		model := models.PageModel{}
		model.Page = page
		model.Meta = meta

		err = p.AddPage(model)

		if err != nil {
			log.IfErr(tx.Rollback())
			log.Error("Cannot process page newly added document", err)
			return
		}
	}

	for _, e := range fileResult.EmbeddedFiles {
		//fmt.Println("DEBUG embedded file info", document.OrgId, document.Job, e.Name, len(e.Data), e.ID)
		var a entity.Attachment
		a.DocumentID = documentID
		a.Job = document.Job
		a.FileID = e.ID
		a.Filename = strings.Replace(e.Name, "embeddings/", "", 1)
		a.Data = e.Data
		refID := util.UniqueID()
		a.RefID = refID

		err = p.AddAttachment(a)

		if err != nil {
			log.IfErr(tx.Rollback())
			log.Error("Cannot add attachment for newly added document", err)
			return
		}
	}

	log.IfErr(tx.Commit())

	newDocument, err = p.GetDocument(documentID)

	if err != nil {
		log.Error("Cannot fetch newly added document", err)
		return
	}

	// New code from normal conversion code

	tx, err = request.Db.Beginx()

	if err != nil {
		log.Error("Cannot begin a transatcion", err)
		return
	}

	p.Context.Transaction = tx

	err = p.UpdateDocument(newDocument) // TODO review - this seems to write-back an unaltered record from that read above, but within that it calls searches.UpdateDocument() to reindex the doc.

	if err != nil {
		log.IfErr(tx.Rollback())
		log.Error("Cannot update an imported document", err)
		return
	}

	log.IfErr(tx.Commit())

	// End new code

	return
}
