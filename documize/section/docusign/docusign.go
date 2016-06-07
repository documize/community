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

package docusign

import (
	"net/http"

	"github.com/documize/community/documize/section/provider"
)

// Provider represents DocuSign
type Provider struct {
}

// Meta describes us.
func (*Provider) Meta() provider.TypeMeta {
	section := provider.TypeMeta{}

	section.ID = "a195f983-4bd7-412b-879e-2d71d2f822a7"
	section.Title = "DocuSign"
	section.Description = "Sign and approve documents"
	section.ContentType = "docusign"
	section.Preview = true

	return section
}

// Command stub.
func (*Provider) Command(w http.ResponseWriter, r *http.Request) {
	provider.WriteEmpty(w)
}

// Render just sends back HMTL as-is.
func (*Provider) Render(config, data string) string {
	return data
}

// Refresh just sends back data as-is.
func (*Provider) Refresh(config, data string) string {
	return data
}
