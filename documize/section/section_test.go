package section

import (
	"net/http"
	"testing"
)

type testsection struct {
	didFetch bool
}

var ts testsection

func init() {
	sectionsMap["testsection"] = &ts
}

// Fetch runs ...
func (ts *testsection) Fetch(w http.ResponseWriter, r *http.Request) {
	ts.didFetch = true
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
	section.IconFontLigature = "border_all"

	return section
}

func TestSection(t *testing.T) {
	if ok := Fetch("testsection", nil, nil); !ok {
		t.Error("did not find 'testsection' smart section (1)")
	}
	if !ts.didFetch {
		t.Error("did not run the test Fetch method")
	}
	out, ok := Render("testsection", "meta", "dingbat")
	if !ok {
		t.Error("did not find 'testsection' smart section (2)")
	}
	if out != "testsection dingbat" {
		t.Error("wrong output from Render")
	}
	for k := range sectionsMap {
		t.Log(k)
	}
	sects := GetRegisteredSections()
	for _, v := range sects {
		t.Logf("%v %v", v.Order, v.Title)
	}
}
