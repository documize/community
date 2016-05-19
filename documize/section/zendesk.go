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

type zendesk struct {
}

func init() {
	sectionsMap["zendesk"] = &zendesk{}
}

func (*zendesk) Meta() TypeMeta {
	section := TypeMeta{}

	section.ID = "05b02331-4ca2-4fc2-a31a-82bc45dceafe"
	section.Title = "Zendesk"
	section.Description = "Show customer support tickets"
	section.ContentType = "zendesk"
	section.IconFile = "sections/zendesk.png"
	section.Preview = true

	return section
}

// Command stub.
func (*zendesk) Command(w http.ResponseWriter, r *http.Request) {
	writeEmpty(w)
}

// Render just sends back HMTL as-is.
func (*zendesk) Render(config, data string) string {
	return data
}

// Refresh just sends back data as-is.
func (*zendesk) Refresh(config, data string) string {
	return data
}
