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

package pdfjs

import (
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain/section/provider"
	"github.com/documize/community/domain/store"
)

// Provider represents PDF viewer
type Provider struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Meta describes us.
func (*Provider) Meta() provider.TypeMeta {
	section := provider.TypeMeta{}

	section.ID = "d54b0b89-6a91-460b-885d-95518b3dfdca"
	section.Title = "PDF Viewer"
	section.Description = "View PDF file"
	section.ContentType = "pdf"
	section.PageType = "section"
	section.Order = 9995

	return section
}

// Command stub.
func (*Provider) Command(ctx *provider.Context, w http.ResponseWriter, r *http.Request) {
	provider.WriteEmpty(w)
}

// Render just sends back HMTL as-is.
func (*Provider) Render(ctx *provider.Context, config, data string) string {
	return config
}

// Refresh just sends back data as-is.
func (*Provider) Refresh(ctx *provider.Context, config, data string) string {
	return config
}
