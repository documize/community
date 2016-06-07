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

package stripe

import (
	"net/http"

	"github.com/documize/community/documize/section/provider"
)

// Provider represents Stripe
type Provider struct {
}

// Meta describes us
func (*Provider) Meta() provider.TypeMeta {
	section := provider.TypeMeta{}

	section.ID = "cb597d8d-c724-4034-b272-e8d9e261444f"
	section.Title = "Stripe"
	section.Description = "Online and mobile payments, refunds and transfers"
	section.ContentType = "stripe"
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
