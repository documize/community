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
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"

	"database/sql"

	"github.com/gorilla/mux"

	"github.com/documize/community/documize/api/convert"
	"github.com/documize/community/documize/api/endpoint/models"
	"github.com/documize/community/documize/api/entity"
	"github.com/documize/community/documize/api/request"
	"github.com/documize/community/documize/api/util"
	"github.com/documize/community/wordsmith/api"
	"github.com/documize/community/wordsmith/log"
	"github.com/documize/community/wordsmith/utility"

	uuid "github.com/nu7hatch/gouuid"
)

// SaveAsTemplate saves existing document as a template.
func SaveAsTemplate(w http.ResponseWriter, r *http.Request) {
	method := "SaveAsTemplate"
	p := request.GetPersister(r)

	var model struct {
		DocumentID string
		Name       string
		Excerpt    string
	}

	defer utility.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writeBadRequestError(w, method, "Bad payload")
		return
	}

	err = json.Unmarshal(body, &model)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	if !p.CanChangeDocument(model.DocumentID) {
		writeForbiddenError(w)
		return
	}

	// DB transaction
	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	// Duplicate document
	doc, err := p.GetDocument(model.DocumentID)

	if err != nil {
		writeServerError(w, method, err)
		return
	}

	docID := util.UniqueID()
	doc.Template = true
	doc.Title = model.Name
	doc.Excerpt = model.Excerpt
	doc.RefID = docID
	doc.ID = 0
	doc.Template = true

	// Duplicate pages and associated meta
	pages, err := p.GetPages(model.DocumentID)
	var pageModel []models.PageModel

	if err != nil {
		writeServerError(w, method, err)
		return
	}

	for _, page := range pages {
		page.DocumentID = docID
		page.ID = 0

		meta, err2 := p.GetPageMeta(page.RefID)

		if err2 != nil {
			writeServerError(w, method, err2)
			return
		}

		pageID := util.UniqueID()
		page.RefID = pageID

		meta.PageID = pageID
		meta.DocumentID = docID

		m := models.PageModel{}

		m.Page = page
		m.Meta = meta

		pageModel = append(pageModel, m)
	}

	// Duplicate attachments
	attachments, err := p.GetAttachments(model.DocumentID)

	for i, a := range attachments {
		a.DocumentID = docID
		a.RefID = util.UniqueID()
		a.ID = 0
		attachments[i] = a
	}

	// Now create the template: document, attachments, pages and their meta
	err = p.AddDocument(doc)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	for _, a := range attachments {
		err = p.AddAttachment(a)

		if err != nil {
			log.IfErr(tx.Rollback())
			writeGeneralSQLError(w, method, err)
			return
		}
	}

	for _, m := range pageModel {
		err = p.AddPage(m)

		if err != nil {
			log.IfErr(tx.Rollback())
			writeGeneralSQLError(w, method, err)
			return
		}
	}

	// Commit and return new document template
	log.IfErr(tx.Commit())

	doc, err = p.GetDocument(docID)

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	d, err := json.Marshal(doc)

	if err != nil {
		writeJSONMarshalError(w, method, "document", err)
		return
	}

	writeSuccessBytes(w, d)
}

// GetSavedTemplates returns all templates saved by the user
func GetSavedTemplates(w http.ResponseWriter, r *http.Request) {
	method := "GetSavedTemplates"
	p := request.GetPersister(r)

	documents, err := p.GetDocumentTemplates()

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	templates := []entity.Template{}

	for _, d := range documents {

		var template = entity.Template{}

		template.ID = d.RefID
		template.Title = d.Title
		template.Description = d.Excerpt
		template.Author = ""
		template.Dated = d.Created
		template.Type = entity.TemplateTypePrivate

		templates = append(templates, template)
	}

	data, err := json.Marshal(templates)

	if err != nil {
		writeJSONMarshalError(w, method, "template", err)
		return
	}

	writeSuccessBytes(w, data)
}

// GetStockTemplates returns available templates from the public Documize repository.
func GetStockTemplates(w http.ResponseWriter, r *http.Request) {
	method := "GetStockTemplates"

	var templates = fetchStockTemplates()

	json, err := json.Marshal(templates)

	if err != nil {
		writeJSONMarshalError(w, method, "template", err)
		return
	}

	writeSuccessBytes(w, json)
}

// StartDocumentFromStockTemplate creates new document using one of the stock templates
func StartDocumentFromStockTemplate(w http.ResponseWriter, r *http.Request) {
	method := "StartDocumentFromStockTemplate"
	p := request.GetPersister(r)

	if !p.Context.Editor {
		writeForbiddenError(w)
		return
	}

	params := mux.Vars(r)
	folderID := params["folderID"]

	if len(folderID) == 0 {
		writeMissingDataError(w, method, "folderID")
		return
	}

	templateID := params["templateID"]

	if len(templateID) == 0 {
		writeMissingDataError(w, method, "templateID")
		return
	}

	filename, template, err := fetchStockTemplate(templateID)

	if err != nil {
		writeServerError(w, method, err)
		return
	}

	if len(template) == 0 {
		writeBadRequestError(w, method, "No data found in template")
	}

	fileRequest := api.DocumentConversionRequest{}
	fileRequest.Filedata = template
	fileRequest.Filename = fmt.Sprintf("%s.docx", filename)
	fileRequest.PageBreakLevel = 4
	//fileRequest.Job = templateID
	//fileRequest.OrgID = p.Context.OrgID

	//	fileResult, err := store.RunConversion(fileRequest)
	//fileResultI, err := plugins.Lib.Run(nil, "Convert", "docx", fileRequest)
	fileResult, err := convert.Convert(nil, "docx", &fileRequest)
	if err != nil {
		writeServerError(w, method, err)
		return
	}

	model, err := processDocument(p, fileRequest.Filename, templateID, folderID, fileResult)

	if err != nil {
		writeServerError(w, method, err)
		return
	}

	json, err := json.Marshal(model)

	if err != nil {
		writeJSONMarshalError(w, method, "stockTemplate", err)
		return
	}

	writeSuccessBytes(w, json)
}

// StartDocumentFromSavedTemplate creates new document using a saved document as a template.
// If template ID is ZERO then we provide an Empty Document as the new document.
func StartDocumentFromSavedTemplate(w http.ResponseWriter, r *http.Request) {
	method := "StartDocumentFromSavedTemplate"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	folderID := params["folderID"]

	if len(folderID) == 0 {
		writeMissingDataError(w, method, "folderID")
		return
	}

	templateID := params["templateID"]

	// We are OK with zero valued template ID because it signals 'give me empty document'
	if len(templateID) == 0 {
		writeMissingDataError(w, method, "templateID")
		return
	}

	// Define an empty document just in case user wanted one.
	var err error
	var d = entity.Document{}
	d.Title = "New Document"
	d.Location = fmt.Sprintf("template-%s", templateID)
	d.Excerpt = "A new document"
	d.Slug = utility.MakeSlug(d.Title)
	d.Tags = ""
	d.LabelID = folderID
	documentID := util.UniqueID()
	d.RefID = documentID

	var pages = []entity.Page{}
	//var pages = make([]entity.Page, 1, 1)
	//pages[0] = entity.Page{}
	//pages[0].Title = "Heading"
	//pages[0].Body = "<p>Some content here.</p>"
	//pages[0].Level = 1
	//pages[0].Sequence = 1

	var attachments = []entity.Attachment{}

	// Fetch document and associated pages, attachments if we have template ID
	if templateID != "0" {
		d, err = p.GetDocument(templateID)

		if err == sql.ErrNoRows {
			api.WriteError(w, errors.New("NotFound"))
			return
		}

		if err != nil {
			api.WriteError(w, err)
			return
		}

		pages, err = p.GetPages(templateID)
		attachments, err = p.GetAttachmentsWithData(templateID)
	}

	// create new document
	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	// Prepare new document
	documentID = util.UniqueID()
	d.RefID = documentID
	d.Template = false
	d.LabelID = folderID
	d.UserID = p.Context.UserID

	err = p.AddDocument(d)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	for _, page := range pages {
		page.DocumentID = documentID
		pageID := util.UniqueID()
		page.RefID = pageID

		meta := entity.PageMeta{}
		meta.PageID = pageID
		meta.RawBody = page.Body

		model := models.PageModel{}
		model.Page = page
		model.Meta = meta

		err = p.AddPage(model)

		if err != nil {
			log.IfErr(tx.Rollback())
			writeGeneralSQLError(w, method, err)
			return
		}
	}

	newUUID, err := uuid.NewV4()

	if err != nil {
		log.IfErr(tx.Rollback())
		writeServerError(w, method, err)
		return
	}

	for _, a := range attachments {
		a.DocumentID = documentID
		a.Job = newUUID.String()
		random := util.GenerateSalt()
		a.FileID = random[0:9]
		attachmentID := util.UniqueID()
		a.RefID = attachmentID

		err = p.AddAttachment(a)

		if err != nil {
			log.IfErr(tx.Rollback())
			writeServerError(w, method, err)
			return
		}
	}

	log.IfErr(tx.Commit())

	newDocument, err := p.GetDocument(documentID)

	if err != nil {
		writeServerError(w, method, err)
		return
	}

	data, err := json.Marshal(newDocument)

	if err != nil {
		writeJSONMarshalError(w, method, "document", err)
		return
	}

	writeSuccessBytes(w, data)
}

type templateConfig struct {
	ID          string `json:"id"`
	Description string `json:"description"`
	Author      string `json:"author"`
	Title       string `json:"title"`
}

func fetchStockTemplates() (templates []entity.Template) {
	path := "./templates"
	templates = make([]entity.Template, 0)

	folders, err := ioutil.ReadDir(path)
	log.IfErr(err)
	for _, folder := range folders {

		if folder.IsDir() {
			files, err := ioutil.ReadDir(path + "/" + folder.Name())
			log.IfErr(err)

			for _, file := range files {
				if !file.IsDir() && file.Name() == "template.json" {
					data, err := ioutil.ReadFile(path + "/" + folder.Name() + "/" + file.Name())

					if err != nil {
						log.Error("error reading template.json", err)
					} else {
						var config = templateConfig{}
						err = json.Unmarshal(data, &config)

						if err != nil {
							log.Error("error parsing template.json", err)
						} else {
							var template = entity.Template{}

							template.ID = config.ID
							template.Title = config.Title
							template.Description = config.Description
							template.Author = config.Author
							template.Type = entity.TemplateTypePublic

							templates = append(templates, template)
						}
					}
				}
			}
		}
	}

	return
}

func fetchStockTemplate(ID string) (filename string, template []byte, err error) {

	path := "./templates"
	folders, err := ioutil.ReadDir(path)
	if err != nil {
		log.Error("error reading template directory", err)
		return "", nil, err
	}

	for _, folder := range folders {
		if folder.IsDir() {
			files, err := ioutil.ReadDir(path + "/" + folder.Name())
			if err != nil {
				log.Error("error reading template sub-dir", err)
				return "", nil, err
			}

			for _, file := range files {
				if !file.IsDir() && file.Name() == "template.json" {
					data, err := ioutil.ReadFile(path + "/" + folder.Name() + "/template.json")

					if err != nil {
						log.Error("error reading template.json", err)
						return "", nil, err
					}

					var config = templateConfig{}
					err = json.Unmarshal(data, &config)

					if err != nil {
						log.Error("error parsing template.json", err)
						return "", nil, err
					}

					if config.ID == ID {
						template, err = ioutil.ReadFile(path + "/" + folder.Name() + "/template.docx")
						return folder.Name(), template, err
					}
				}
			}
		}
	}

	return
}
