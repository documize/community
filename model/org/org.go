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
	"github.com/documize/community/model"
)

// Organization defines a tenant that uses this app.
type Organization struct {
	model.BaseEntity
	Company              string `json:"company"`
	Title                string `json:"title"`
	Message              string `json:"message"`
	Domain               string `json:"domain"`
	Email                string `json:"email"`
	AllowAnonymousAccess bool   `json:"allowAnonymousAccess"`
	AuthProvider         string `json:"authProvider"`
	AuthConfig           string `json:"authConfig"`
	ConversionEndpoint   string `json:"conversionEndpoint"`
	MaxTags              int    `json:"maxTags"`
	Serial               string `json:"serial"`
	Active               bool   `json:"active"`
	Subscription         string `json:"subscription"`
	Theme                string `json:"theme"`
	Locale               string `json:"locale"`
}

// StripSecrets removes sensitive information.
func (o *Organization) StripSecrets() {
	o.Subscription = ""
}
