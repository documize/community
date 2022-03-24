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

package flowchart

import (
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain/section/provider"
	"github.com/documize/community/domain/store"
)

// Provider represents Draw.io
type Provider struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Meta describes us
func (*Provider) Meta() provider.TypeMeta {
	section := provider.TypeMeta{}

	section.ID = "d46a18f6-49fb-11e8-842f-0ed5f89f718b"
	section.Title = "Diagrams.net"
	section.Description = "Flowcharts and diagrams"
	section.ContentType = "flowchart"
	section.PageType = "tab"
	section.Order = 9991

	return section
}

// Command stub.
func (p *Provider) Command(ctx *provider.Context, w http.ResponseWriter, r *http.Request) {
}

// Render returns data as-is (HTML).
func (p *Provider) Render(ctx *provider.Context, config, data string) string {
	return data
}

// Refresh just sends back data as-is.
func (*Provider) Refresh(ctx *provider.Context, config, data string) string {
	return data
}
