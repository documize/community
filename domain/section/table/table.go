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

package table

import (
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain/section/provider"
)

// Provider represents Table
type Provider struct {
	Runtime env.Runtime
}

// Meta describes us
func (*Provider) Meta() provider.TypeMeta {
	section := provider.TypeMeta{}

	section.ID = "81a2ea93-2dfc-434d-841e-54b832492c92"
	section.Title = "Tabular"
	section.Description = "Rows, columns for tabular data"
	section.ContentType = "table"
	section.PageType = "section"
	section.Order = 9996

	return section
}

// Command stub.
func (*Provider) Command(ctx *provider.Context, w http.ResponseWriter, r *http.Request) {
	provider.WriteEmpty(w)
}

// Render sends back data as-is (HTML).
func (*Provider) Render(ctx *provider.Context, config, data string) string {
	return data
}

// Refresh just sends back data as-is.
func (*Provider) Refresh(ctx *provider.Context, config, data string) string {
	return data
}
