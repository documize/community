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

package mermaid

import (
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/section/provider"
)

// Provider represents Mermaid Diagram
type Provider struct {
	Runtime *env.Runtime
	Store   *domain.Store
}

// Meta describes us
func (*Provider) Meta() provider.TypeMeta {
	section := provider.TypeMeta{}

	section.ID = "f1067a60-45e5-40b5-89f6-aa3b03dd7f35"
	section.Title = "Mermaid Diagram"
	section.Description = "Diagrams generated from textual descriptions"
	section.ContentType = "mermaid"
	section.PageType = "tab"
	section.Order = 9990

	return section
}

// Command stub.
func (*Provider) Command(ctx *provider.Context, w http.ResponseWriter, r *http.Request) {
	provider.WriteEmpty(w)
}

// Render returns data as-is (HTML).
func (*Provider) Render(ctx *provider.Context, config, data string) string {
	return data
}

// Refresh just sends back data as-is.
func (*Provider) Refresh(ctx *provider.Context, config, data string) string {
	return data
}
