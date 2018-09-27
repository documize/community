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

package airtable

import (
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain/section/provider"
	"github.com/documize/community/domain/store"
)

// Provider represents Airtable
type Provider struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Meta describes us
func (*Provider) Meta() provider.TypeMeta {
	section := provider.TypeMeta{}

	section.ID = "3cfa411e-73bf-474c-841a-effd6b00fdd8"
	section.Title = "Airtable"
	section.Description = "Databases, tables, views"
	section.ContentType = "airtable"
	section.PageType = "tab"

	return section
}

// Command stub.
func (*Provider) Command(ctx *provider.Context, w http.ResponseWriter, r *http.Request) {
	provider.WriteEmpty(w)
}

// Render converts markdown data into HTML suitable for browser rendering.
func (*Provider) Render(ctx *provider.Context, config, data string) string {
	return embed(config, data)
}

// Refresh just sends back data as-is.
func (*Provider) Refresh(ctx *provider.Context, config, data string) string {
	return embed(config, data)
}

func embed(config, data string) string {
	return data
	// return `
	// <iframe class="airtable-embed"
	// src="https://airtable.com/embed/shrFOcQ6BYrlUe62L?backgroundColor=yellow&viewControls=on"
	// frameborder="0"
	// onmousewheel=""
	// width="100%"
	// height="533"
	// style="background: transparent; border: 1px solid #ccc;"></iframe>
	// `
}
