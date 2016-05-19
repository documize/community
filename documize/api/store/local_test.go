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
	"github.com/documize/community/documize/api/plugins"
	"github.com/documize/community/documize/api/util"
	"github.com/documize/community/wordsmith/api"
	"github.com/documize/community/wordsmith/log"
	"io/ioutil"
	"os"
	"strings"
	"testing"
)

var lsp LocalStorageProvider

func TestUpload(t *testing.T) {
	jb := "job" + util.UniqueID()
	fn := "file.txt"
	cont := "content\n"
	err := lsp.Upload(jb, fn, []byte(cont))
	if err != nil {
		t.Error(err)
	}
	b, e := ioutil.ReadFile(folderPath + jb + string(os.PathSeparator) + fn)
	if e != nil {
		t.Error(e)
	}
	if string(b) != cont {
		t.Error("wrong content:" + string(b))
	}
}

func TestConvert(t *testing.T) {
	_, _, err :=
		lsp.Convert(api.ConversionJobRequest{})
	if err == nil {
		t.Error("there should have been a convert error")
	}

	err = plugins.LibSetup()
	if err == nil {
		// t.Error("did not error with missing config.json")
	}
	defer log.IfErr(plugins.Lib.KillSubProcs())

	jb := "job" + util.UniqueID()

	_, _, err =
		lsp.Convert(api.ConversionJobRequest{
			Job:        jb,
			IndexDepth: 9,
			OrgID:      "Documize",
		})
	if err == nil {
		t.Error("there should have been an error - directory not found")
	}

	fn := "content.html"
	cont := "content\n"
	err = lsp.Upload(jb, fn, []byte(cont))
	if err != nil {
		t.Error(err)
	}
	filename, fileResult, err :=
		lsp.Convert(api.ConversionJobRequest{
			Job:        jb,
			IndexDepth: 9,
			OrgID:      "Documize",
		})
	if err != nil {
		t.Error(err)
	}
	if !strings.HasSuffix(filename, fn) {
		t.Error("wrong filename:" + filename)
	}
	if fileResult.Excerpt != "content." {
		t.Error("wrong excerpt:" + fileResult.Excerpt)
	}
}
