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
	"testing"

	"github.com/documize/community/core/api/plugins"
	api "github.com/documize/community/core/convapi"
	"github.com/documize/community/core/log"
)

func TestExportAs(t *testing.T) {
	err := plugins.LibSetup()
	if err == nil {
		// t.Error("did not error with missing config.json")
	}
	defer log.IfErr(plugins.Lib.KillSubProcs())

	htm := "<p>some html</p>"

	exp, err := ExportAs("html", htm)
	if err != nil {
		t.Error(err)
	}
	if string(exp.File) != htm {
		t.Error("html returned not as expected: " + string(exp.File))
	}

	// log.TestIfErr = true
	_, err = ExportAs("XXXXX", htm)
	if err == nil /* || log.TestIfErr */ {
		t.Error("did not error as expected")
	}
}

func TestConvertFileResult(t *testing.T) {
	fn := "afile"
	doc := ConvertFileResult(fn, &api.DocumentConversionResponse{}) // should not panic
	if doc.Location != fn {
		t.Error("filename not passed through")
	}
	doc = ConvertFileResult(fn, nil) // should not panic
	if doc.Location != fn {
		t.Error("filename not passed through")
	}
	rj := "Romeo & Juliet"
	doc = ConvertFileResult(fn, &api.DocumentConversionResponse{
		Pages: []api.Page{{Title: rj}},
	})
	if doc.Title != rj || doc.Slug != "romeo-juliet" {
		t.Error("title not passed through correctly")
	}
}
