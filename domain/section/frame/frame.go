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

package frame

import (
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain/section/provider"
	"github.com/documize/community/domain/store"
)

// Provider represents IFRAME
type Provider struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Meta describes us
func (*Provider) Meta() provider.TypeMeta {
	section := provider.TypeMeta{}

	section.ID = "1ef25a5a-7b24-470a-afca-bedd8462b7e2"
	section.Title = "IFrame"
	section.Description = "Embed an IFRAME code snippet"
	section.ContentType = "frame"
	section.PageType = "tab"

	return section
}

// Command stub.
func (*Provider) Command(ctx *provider.Context, w http.ResponseWriter, r *http.Request) {
	provider.WriteEmpty(w)
}

// Render converts as-is.
func (*Provider) Render(ctx *provider.Context, config, data string) string {
	return embed(config, data)
}

// Refresh just sends back data as-is.
func (*Provider) Refresh(ctx *provider.Context, config, data string) string {
	return embed(config, data)
}

func embed(config, data string) string {
	// return bluemonday.UGCPolicy().Sanitize(data)
	return data
}
