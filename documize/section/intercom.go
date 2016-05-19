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

type intercom struct {
}

func init() {
	sectionsMap["intercom"] = &intercom{}
}

func (*intercom) Meta() TypeMeta {
	section := TypeMeta{}

	section.ID = "bf40314d-3b3c-41f9-b283-517da56aa7e4"
	section.Title = "Intercom"
	section.Description = "Application events and metrics"
	section.ContentType = "intercom"
	section.IconFile = "sections/intercom.png"
	section.Preview = true

	return section
}

// Command stub.
func (*intercom) Command(w http.ResponseWriter, r *http.Request) {
	writeEmpty(w)
}

// Render just sends back HMTL as-is.
func (*intercom) Render(config, data string) string {
	return data
}

// Refresh just sends back data as-is.
func (*intercom) Refresh(config, data string) string {
	return data
}
