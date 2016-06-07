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

package salesforce

import (
	"net/http"

	"github.com/documize/community/documize/section/provider"
)

// Provider represents Salesforce
type Provider struct {
}

// Meta describes us
func (*Provider) Meta() provider.TypeMeta {
	section := provider.TypeMeta{}

	section.ID = "2240c0f8-b795-47b0-bcd4-5f6b171a2ffd"
	section.Title = "Salesforce"
	section.Description = "Customers, contacts and leads"
	section.ContentType = "salesforce"
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
