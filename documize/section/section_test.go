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

package section


import (
	"net/http"
	"testing"
)

type testsection struct {
	didRefresh bool
}

var ts testsection

func init() {
	sectionsMap["testsection"] = &ts
}

// Command is an end-point...
func (ts *testsection) Command(w http.ResponseWriter, r *http.Request) {}

// Refresh existing data ...
func (ts *testsection) Refresh(meta, data string) string {
	ts.didRefresh = true
	return ""
}

// Render converts ...
func (*testsection) Render(meta, data string) string {
	return "testsection " + data
}

func (*testsection) Meta() TypeMeta {
	section := TypeMeta{}

	section.ID = "TestGUID"
	section.Title = "TestSection"
	section.Description = "A Test Section"
	section.ContentType = "testsection"

	return section
}

func TestSection(t *testing.T) {
	if _,ok := Refresh("testsection", "", ""); !ok {
		t.Error("did not find 'testsection' smart section (1)")
	}
	if !ts.didRefresh {
		t.Error("did not run the test Refresh method")
	}
	out, ok := Render("testsection", "meta", "dingbat")
	if !ok {
		t.Error("did not find 'testsection' smart section (2)")
	}
	if out != "testsection dingbat" {
		t.Error("wrong output from Render")
	}
	sects := GetSectionMeta()
	for _, v := range sects {
		t.Logf("%v %v", v.Order, v.Title)
	}
}
