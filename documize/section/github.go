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
)

type github struct {
}

func init() {
	sectionsMap["github"] = &github{}
}

func (*github) Meta() TypeMeta {
	section := TypeMeta{}

	section.ID = "38c0e4c5-291c-415e-8a4d-262ee80ba5df"
	section.Title = "GitHub"
	section.Description = "Code commits and branches"
	section.ContentType = "github"
	section.IconFile = "sections/github.png"
	section.Preview = true

	return section
}

// Command stub.
func (*github) Command(w http.ResponseWriter, r *http.Request) {
	writeEmpty(w)
}

// Render just sends back HMTL as-is.
func (*github) Render(config, data string) string {
	return data
}

// Refresh just sends back data as-is.
func (*github) Refresh(config, data string) string {
	return data
}
