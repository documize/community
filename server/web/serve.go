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

// Package web contains the Documize static web data.
package web

import (
	"html/template"
	"net/http"

	"github.com/documize/community/core/asset"
	"github.com/documize/community/core/env"
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/domain/store"
)

// SiteInfo describes set-up information about the site
var SiteInfo struct {
	DBname, DBhash, Issue, Edition string
}

func init() {
	SiteInfo.DBhash = secrets.GenerateRandomPassword() // do this only once
}

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// EmberHandler serves HTML web pages
func (h *Handler) EmberHandler(w http.ResponseWriter, r *http.Request) {
	filename := "index.html"

	switch h.Runtime.Flags.SiteMode {
	case env.SiteModeOffline:
		filename = "offline.html"
	case env.SiteModeSetup:
		// noop
	case env.SiteModeBadDB:
		filename = "db-error.html"
	default:
		SiteInfo.DBhash = ""
	}

	SiteInfo.Edition = string(h.Runtime.Product.Edition)

	content, _, err := asset.FetchStatic(h.Runtime.Assets, filename)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	emberView := template.Must(template.New(filename).Parse(string(content)))

	if err := emberView.Execute(w, SiteInfo); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
