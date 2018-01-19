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

package conversion

import (
	"bytes"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/documize/community/core/env"

	api "github.com/documize/community/core/convapi"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/conversion/store"
	"github.com/documize/community/domain/permission"
	"github.com/documize/community/model/activity"
	"github.com/documize/community/model/attachment"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/page"
	uuid "github.com/nu7hatch/gouuid"
	"github.com/pkg/errors"
)

var storageProvider StorageProvider

func init() {
	storageProvider = new(store.LocalStorageProvider)
}

func (h *Handler) upload(w http.ResponseWriter, r *http.Request) (string, string, string) {
	method := "conversion.upload"
	ctx := domain.GetRequestContext(r)

	folderID := request.Param(r, "folderID")

	if !permission.CanUploadDocument(ctx, *h.Store, folderID) {
		response.WriteForbiddenError(w)
		return "", "", ""
	}

	// grab file
	filedata, filename, err := r.FormFile("attachment")
	if err != nil {
		response.WriteMissingDataError(w, method, "attachment")
		return "", "", ""
	}

	b := new(bytes.Buffer)
	_, err = io.Copy(b, filedata)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return "", "", ""
	}

	// generate job id
	newUUID, err := uuid.NewV4()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return "", "", ""
	}

	job := newUUID.String()

	err = storageProvider.Upload(job, filename.Filename, b.Bytes())
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return "", "", ""
	}

	h.Runtime.Log.Info(fmt.Sprintf("Org %s (%s) [Uploaded] %s", ctx.OrgName, ctx.OrgID, filename.Filename))

	return job, folderID, ctx.OrgID
}

func (h *Handler) convert(w http.ResponseWriter, r *http.Request, job, folderID string, conversion api.ConversionJobRequest) {
	method := "conversion.upload"
	ctx := domain.GetRequestContext(r)

	licenseKey, _ := h.Store.Setting.Get("EDITION-LICENSE", "key")
	licenseSignature, _ := h.Store.Setting.Get("EDITION-LICENSE", "signature")
	k, _ := hex.DecodeString(licenseKey)
	s, _ := hex.DecodeString(licenseSignature)

	conversion.LicenseKey = k
	conversion.LicenseSignature = s

	org, err := h.Store.Organization.GetOrganization(ctx, ctx.OrgID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	conversion.ServiceEndpoint = org.ConversionEndpoint

	var fileResult *api.DocumentConversionResponse
	var filename string
	filename, fileResult, err = storageProvider.Convert(conversion)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if fileResult.Err != "" {
		response.WriteServerError(w, method, errors.New(fileResult.Err))
		h.Runtime.Log.Error(method, err)
		return
	}

	// NOTE: empty .docx documents trigger this error
	if len(fileResult.Pages) == 0 {
		response.WriteMissingDataError(w, method, "no pages in document")
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	nd, err := processDocument(ctx, h.Runtime, h.Store, filename, job, folderID, fileResult)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	a, _ := h.Store.Attachment.GetAttachments(ctx, nd.RefID)
	go h.Indexer.IndexDocument(ctx, nd, a)

	response.WriteJSON(w, nd)
}

func processDocument(ctx domain.RequestContext, r *env.Runtime, store *domain.Store, filename, job, folderID string, fileResult *api.DocumentConversionResponse) (newDocument doc.Document, err error) {
	// Convert into database objects
	document := convertFileResult(filename, fileResult)
	document.Job = job
	document.OrgID = ctx.OrgID
	document.LabelID = folderID
	document.UserID = ctx.UserID
	documentID := uniqueid.Generate()
	document.RefID = documentID

	err = store.Document.Add(ctx, document)
	if err != nil {
		ctx.Transaction.Rollback()
		err = errors.Wrap(err, "cannot insert new document")
		return
	}

	for k, v := range fileResult.Pages {
		var p page.Page
		p.OrgID = ctx.OrgID
		p.DocumentID = documentID
		p.Level = v.Level
		p.Title = v.Title
		p.Body = string(v.Body)
		p.Sequence = float64(k+1) * 1024.0 // need to start above 0 to allow insertion before the first item
		pageID := uniqueid.Generate()
		p.RefID = pageID
		p.ContentType = "wysiwyg"
		p.PageType = "section"

		meta := page.Meta{}
		meta.PageID = pageID
		meta.RawBody = p.Body
		meta.Config = "{}"

		model := page.NewPage{}
		model.Page = p
		model.Meta = meta

		err = store.Page.Add(ctx, model)
		if err != nil {
			ctx.Transaction.Rollback()
			err = errors.Wrap(err, "cannot insert new page for new document")
			return
		}
	}

	for _, e := range fileResult.EmbeddedFiles {
		//fmt.Println("DEBUG embedded file info", document.OrgId, document.Job, e.Name, len(e.Data), e.ID)
		var a attachment.Attachment
		a.DocumentID = documentID
		a.Job = document.Job
		a.FileID = e.ID
		a.Filename = strings.Replace(e.Name, "embeddings/", "", 1)
		a.Data = e.Data
		refID := uniqueid.Generate()
		a.RefID = refID

		err = store.Attachment.Add(ctx, a)
		if err != nil {
			ctx.Transaction.Rollback()
			err = errors.Wrap(err, "cannot insert attachment for new document")
			return
		}
	}

	store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		LabelID:      newDocument.LabelID,
		DocumentID:   newDocument.RefID,
		SourceType:   activity.SourceTypeDocument,
		ActivityType: activity.TypeCreated})

	err = ctx.Transaction.Commit()
	if err != nil {
		err = errors.Wrap(err, "cannot commit new document import")
		return
	}

	newDocument, err = store.Document.Get(ctx, documentID)
	if err != nil {
		ctx.Transaction.Rollback()
		err = errors.Wrap(err, "cannot fetch new document")
		return
	}

	store.Audit.Record(ctx, audit.EventTypeDocumentUpload)

	return
}

// convertFileResult takes the results of a document upload and convert,
// and creates the outline of a database record suitable for inserting into the document
// table.
func convertFileResult(filename string, fileResult *api.DocumentConversionResponse) (document doc.Document) {
	document = doc.Document{}
	document.RefID = ""
	document.OrgID = ""
	document.LabelID = ""
	document.Job = ""
	document.Location = filename

	if fileResult != nil {
		if len(fileResult.Pages) > 0 {
			document.Title = fileResult.Pages[0].Title
			document.Slug = stringutil.MakeSlug(fileResult.Pages[0].Title)
		}
		document.Excerpt = fileResult.Excerpt
	}

	document.Tags = "" // now a # separated list of tag-words, rather than JSON

	return document
}
