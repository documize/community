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

package org

import (
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
)

// SitemapDocument details a document that can be exposed via Sitemap.
type SitemapDocument struct {
	DocumentID string
	Document   string
	SpaceID    string
	Folder     string
	Revised    time.Time
}

// SiteMeta holds information associated with an Organization.
type SiteMeta struct {
	OrgID                string         `json:"orgId"`
	Title                string         `json:"title"`
	Message              string         `json:"message"`
	URL                  string         `json:"url"`
	AllowAnonymousAccess bool           `json:"allowAnonymousAccess"`
	AuthProvider         string         `json:"authProvider"`
	AuthConfig           string         `json:"authConfig"`
	Version              string         `json:"version"`
	Revision             string         `json:"revision"`
	MaxTags              int            `json:"maxTags"`
	Edition              domain.Edition `json:"edition"`
	ConversionEndpoint   string         `json:"conversionEndpoint"`
	Storage              env.StoreType  `json:"storageProvider"`
	Location             string         `json:"location"`   // reserved for internal use
	Theme                string         `json:"theme"`      // default side-wide theme, user overrideble
	Configured           bool           `json:"configured"` // is Documize instance configured
	Locale               string         `json:"locale"`     // server default locale
	Locales              []string       `json:"locales"`    // available locale
}
