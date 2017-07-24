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

package organization

import (
	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime env.Runtime
}

// Organization defines a company that uses this app.
type Organization struct {
	domain.BaseEntity
	Company              string `json:"-"`
	Title                string `json:"title"`
	Message              string `json:"message"`
	URL                  string `json:"url"`
	Domain               string `json:"domain"`
	Email                string `json:"email"`
	AllowAnonymousAccess bool   `json:"allowAnonymousAccess"`
	AuthProvider         string `json:"authProvider"`
	AuthConfig           string `json:"authConfig"`
	ConversionEndpoint   string `json:"conversionEndpoint"`
	Serial               string `json:"-"`
	Active               bool   `json:"-"`
}
