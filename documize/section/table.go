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

type table struct {
}

func init() {
	sectionsMap["table"] = &table{}
}

func (*table) Meta() TypeMeta {
	section := TypeMeta{}

	section.ID = "81a2ea93-2dfc-434d-841e-54b832492c92"
	section.Title = "Tabular"
	section.Description = "Rows, columns and formatting for tabular data"
	section.ContentType = "table"
	section.Order = 9996

	return section
}

// Command stub.
func (*table) Command(w http.ResponseWriter, r *http.Request) {
	writeEmpty(w)
}

// Render sends back data as-is (HTML).
func (*table) Render(config, data string) string {
	return data
}

// Refresh just sends back data as-is.
func (*table) Refresh(config, data string) string {
	return data
}
