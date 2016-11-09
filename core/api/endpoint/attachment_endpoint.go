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
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"mime"
	"net/http"

	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/api/request"
	"github.com/documize/community/core/api/util"
	"github.com/documize/community/core/log"

	uuid "github.com/nu7hatch/gouuid"

	"github.com/gorilla/mux"

	_ "github.com/mytrile/mime-ext" // this adds a large number of mime extensions
)

// AttachmentDownload is the end-point that responds to a request for a particular attachment
// by sending the requested file to the client.
func AttachmentDownload(w http.ResponseWriter, r *http.Request) {
	method := "AttachmentDownload"
	p := request.GetPersister(r)

	params := mux.Vars(r)

	attachment, err := p.GetAttachment(params["orgID"], params["attachmentID"])

	if err == sql.ErrNoRows {
		writeNotFoundError(w, method, params["fileID"])
		return
	}

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	typ := mime.TypeByExtension("." + attachment.Extension)
	if typ == "" {
		typ = "application/octet-stream"
	}

	w.Header().Set("Content-Type", typ)
	w.Header().Set("Content-Disposition", `Attachment; filename="`+attachment.Filename+`" ; `+`filename*="`+attachment.Filename+`"`)
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(attachment.Data)))
	w.WriteHeader(http.StatusOK)

	_, err = w.Write(attachment.Data)
	log.IfErr(err)
}

// GetAttachments is an end-point that returns all of the attachments of a particular documentID.
func GetAttachments(w http.ResponseWriter, r *http.Request) {
	method := "GetAttachments"
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

	a, err := p.GetAttachments(documentID)

	if err != nil && err != sql.ErrNoRows {
		writeGeneralSQLError(w, method, err)
		return
	}

	if len(a) == 0 {
		a = []entity.Attachment{}
	}

	json, err := json.Marshal(a)

	if err != nil {
		writeJSONMarshalError(w, method, "attachments", err)
		return
	}

	writeSuccessBytes(w, json)
}

// DeleteAttachment is an endpoint that deletes a particular document attachment.
func DeleteAttachment(w http.ResponseWriter, r *http.Request) {
	method := "DeleteAttachment"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	documentID := params["documentID"]
	attachmentID := params["attachmentID"]

	if len(documentID) == 0 || len(attachmentID) == 0 {
		writeMissingDataError(w, method, "documentID, attachmentID")
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

	_, err = p.DeleteAttachment(attachmentID)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	log.IfErr(tx.Commit())

	writeSuccessEmptyJSON(w)
}

// AddAttachments stores files against a document.
func AddAttachments(w http.ResponseWriter, r *http.Request) {
	method := "AddAttachments"
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

	filedata, filename, err := r.FormFile("attachment")

	if err != nil {
		writeMissingDataError(w, method, "attachment")
		return
	}

	b := new(bytes.Buffer)
	_, err = io.Copy(b, filedata)

	if err != nil {
		writeServerError(w, method, err)
		return
	}

	var job = "some-uuid"

	newUUID, err := uuid.NewV4()

	if err != nil {
		writeServerError(w, method, err)
		return
	}

	job = newUUID.String()

	var a entity.Attachment
	refID := util.UniqueID()
	a.RefID = refID
	a.DocumentID = documentID
	a.Job = job
	random := util.GenerateSalt()
	a.FileID = random[0:9]
	a.Filename = filename.Filename
	a.Data = b.Bytes()

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	err = p.AddAttachment(a)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	log.IfErr(tx.Commit())

	writeSuccessEmptyJSON(w)
}
