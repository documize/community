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

type asana struct {
}

func init() {
	sectionsMap["asana"] = &asana{}
}

func (*asana) Meta() TypeMeta {
	section := TypeMeta{}

	section.ID = "3a3f4661-2195-46b1-a69c-546eaccb5f93"
	section.Title = "Asana"
	section.Description = "Embed tasks and projects"
	section.ContentType = "asana"
	section.IconFile = "sections/asana.png"
	section.Preview = true

	return section
}

// Command stub.
func (*asana) Command(w http.ResponseWriter, r *http.Request) {
	writeEmpty(w)
}

// Render just sends back HMTL as-is.
func (*asana) Render(config, data string) string {
	return data
}

// Refresh just sends back data as-is.
func (*asana) Refresh(config, data string) string {
	return data
}
