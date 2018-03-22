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

// Package domain defines data structures for moving data between services.
package domain

import (
	"fmt"
	"net/http"
	"time"

	"github.com/jmoiron/sqlx"
)

// RequestContext provides per request scoped values required
// by HTTP handlers.
type RequestContext struct {
	AllowAnonymousAccess bool
	Authenticated        bool
	Administrator        bool
	Guest                bool
	Editor               bool
	Global               bool
	UserID               string
	OrgID                string
	OrgName              string
	SSL                  bool
	AppURL               string // e.g. https://{url}.documize.com
	Subdomain            string
	ClientIP             string
	Expires              time.Time
	Fullname             string
	Transaction          *sqlx.Tx
	AppVersion           string
}

//GetAppURL returns full HTTP url for the app
func (c *RequestContext) GetAppURL(endpoint string) string {
	scheme := "http://"
	if c.SSL {
		scheme = "https://"
	}

	return fmt.Sprintf("%s%s/%s", scheme, c.AppURL, endpoint)
}

type key string

// DocumizeContextKey prevents key name collisions.
const DocumizeContextKey key = "documize context key"

// GetRequestContext returns RequestContext from context.Context
func GetRequestContext(r *http.Request) (ctx RequestContext) {
	c := r.Context()
	if c != nil && c.Value(DocumizeContextKey) != nil {
		ctx = c.Value(DocumizeContextKey).(RequestContext)
		return
	}

	ctx = RequestContext{}
	ctx.AppURL = r.Host
	ctx.SSL = r.TLS != nil

	return
}
