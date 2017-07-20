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

package store

import (
	"errors"
	"strings"

	"github.com/documize/community/core/api/entity"
	api "github.com/documize/community/core/convapi"
	"github.com/documize/community/core/stringutil"
)

// StorageProvider describes the interface for document conversion and take-on.
type StorageProvider interface {
	Upload(job string, filename string, file []byte) (err error)
	Convert(api.ConversionJobRequest) (filename string, fileResult *api.DocumentConversionResponse, err error)
}

// ConvertFileResult takes the results of a document upload and convert,
// and creates the outline of a database record suitable for inserting into the document
// table.
func ConvertFileResult(filename string, fileResult *api.DocumentConversionResponse) (document entity.Document) {

	document = entity.Document{}

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

// ExportAs takes a target extension name and html to create an exported file.
// If the target extension is "html" it simply returns the given html suitably wrapped,
// otherwise it runs the "Export" plugin for the given target extension name.
func ExportAs(xtn, html string) (*api.DocumentExport, error) {

	if strings.ToLower(xtn) == "html" {
		return &api.DocumentExport{File: []byte(html), Format: "html"}, nil
	}
	return nil, errors.New("Only 'HTML' export is supported")

	/* This functionality removed for now
	fileI, err := plugins.Lib.Run(nil, "Export", xtn, []byte(html))
	if err != nil {
		log.Error("ExportAs failed", err)
		return nil, err
	}
	return fileI.(*api.DocumentExport), nil
	*/
}
