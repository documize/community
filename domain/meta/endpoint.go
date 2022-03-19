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

package meta

import (
	"bytes"
	"database/sql"
	"encoding/base64"
	"fmt"
	"net/http"
	"strings"
	"text/template"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/i18n"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/auth"
	"github.com/documize/community/domain/organization"
	indexer "github.com/documize/community/domain/search"
	"github.com/documize/community/domain/setting"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/org"
	"github.com/documize/community/model/space"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
	Indexer indexer.Indexer
}

// Meta provides org meta data based upon request domain (e.g. acme.documize.com).
func (h *Handler) Meta(w http.ResponseWriter, r *http.Request) {
	data := org.SiteMeta{}
	data.URL = organization.GetSubdomainFromHost(r)

	org, err := h.Store.Organization.GetOrganizationByDomain(data.URL)
	if err != nil {
		h.Runtime.Log.Info("unable to fetch request meta for " + data.URL)
		response.WriteNotFound(w)
		return
	}

	data.OrgID = org.RefID
	data.Title = org.Title
	data.Message = org.Message
	data.AllowAnonymousAccess = org.AllowAnonymousAccess
	data.AuthProvider = strings.TrimSpace(org.AuthProvider)
	data.AuthConfig = org.AuthConfig
	data.MaxTags = org.MaxTags
	data.Theme = org.Theme
	data.Version = h.Runtime.Product.Version
	data.Revision = h.Runtime.Product.Revision
	data.Edition = h.Runtime.Product.Edition
	data.ConversionEndpoint = org.ConversionEndpoint
	data.Storage = h.Runtime.StoreProvider.Type()
	data.Location = h.Runtime.Flags.Location // reserved
	data.Locale = org.Locale
	data.Locales = i18n.SupportedLocales()
	if len(data.Locale) == 0 {
		data.Locale = i18n.DefaultLocale
	}

	// Is product setup complete? SMTP in this case.
	data.Configured = true
	cfg := setting.GetSMTPConfig(h.Store)
	if len(cfg.Host) == 0 {
		data.Configured = false
	}

	// Strip secrets
	data.AuthConfig = auth.StripAuthSecrets(h.Runtime, org.AuthProvider, org.AuthConfig)

	response.WriteJSON(w, data)
}

// RobotsTxt returns robots.txt depending on site configuration.
// Did we allow anonymouse access?
func (h *Handler) RobotsTxt(w http.ResponseWriter, r *http.Request) {
	method := "GetRobots"
	ctx := domain.GetRequestContext(r)

	// default is to deny
	robots :=
		`User-agent: *
		Disallow: /
		`

	dom := organization.GetSubdomainFromHost(r)
	o, err := h.Store.Organization.GetOrganizationByDomain(dom)

	if err != nil {
		if err != sql.ErrNoRows {
			// Log error if query was not empty
			h.Runtime.Log.Info(fmt.Sprintf("%s failed to get Organization for domain %s", method, dom))
		}
		o = org.Organization{}
		o.AllowAnonymousAccess = false
	}

	// Anonymous access would mean we allow bots to crawl.
	if o.AllowAnonymousAccess {
		sitemap := ctx.GetAppURL("sitemap.xml")
		robots = fmt.Sprintf(`User-agent: *
Disallow: /settings/
Disallow: /settings/*
Disallow: /profile/
Disallow: /profile/*
Disallow: /auth/login/
Disallow: /auth/login/
Disallow: /auth/logout/
Disallow: /auth/logout/*
Disallow: /auth/reset/*
Disallow: /auth/reset/*
Disallow: /auth/sso/
Disallow: /auth/sso/*
Disallow: /auth/*
Disallow: /auth/**
Disallow: /share
Disallow: /share/*
Disallow: /attachments
Disallow: /attachments/*
Disallow: /attachment
Disallow: /attachment/*
Sitemap: %s`, sitemap)
	}

	response.WriteBytes(w, []byte(robots))
}

// Sitemap returns URLs that can be indexed.
// We only include public folders and documents (e.g. can be seen by everyone).
func (h *Handler) Sitemap(w http.ResponseWriter, r *http.Request) {
	method := "meta.Sitemap"
	ctx := domain.GetRequestContext(r)

	dom := organization.GetSubdomainFromHost(r)
	o, err := h.Store.Organization.GetOrganizationByDomain(dom)

	if err != nil {
		h.Runtime.Log.Info(fmt.Sprintf("%s failed to get Organization for domain %s", method, dom))
		o = org.Organization{}
		o.AllowAnonymousAccess = false
	}

	sitemap :=
		`<?xml version="1.0" encoding="UTF-8"?>
		<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
			{{range .}}<url>
				<loc>{{ .URL }}</loc>
				<lastmod>{{ .Date }}</lastmod>
			</url>{{end}}
		</urlset>`

	var items []sitemapItem

	// Anonymous access means we announce folders/documents shared with 'Everyone'.
	if o.AllowAnonymousAccess {
		// Grab shared folders
		folders, err := h.Store.Space.PublicSpaces(ctx, o.RefID)
		if err != nil {
			folders = []space.Space{}
			h.Runtime.Log.Error(fmt.Sprintf("%s failed to get folders for domain %s", method, dom), err)
		}

		for _, folder := range folders {
			var item sitemapItem
			item.URL = ctx.GetAppURL(fmt.Sprintf("s/%s/%s", folder.RefID, stringutil.MakeSlug(folder.Name)))
			item.Date = folder.Revised.Format("2006-01-02T15:04:05.999999-07:00")
			items = append(items, item)
		}

		// Grab documents from shared folders
		var documents []doc.SitemapDocument
		documents, err = h.Store.Document.PublicDocuments(ctx, o.RefID)
		if err != nil {
			documents = []doc.SitemapDocument{}
			h.Runtime.Log.Error(fmt.Sprintf("%s failed to get documents for domain %s", method, dom), err)
		}

		for _, document := range documents {
			var item sitemapItem
			item.URL = ctx.GetAppURL(fmt.Sprintf("s/%s/%s/d/%s/%s",
				document.SpaceID, stringutil.MakeSlug(document.Space), document.DocumentID, stringutil.MakeSlug(document.Document)))
			item.Date = document.Revised.Format("2006-01-02T15:04:05.999999-07:00")
			items = append(items, item)
		}

	}

	buffer := new(bytes.Buffer)
	t := template.Must(template.New("tmp").Parse(sitemap))
	t.Execute(buffer, &items)

	response.WriteBytes(w, buffer.Bytes())
}

type sitemapItem struct {
	URL  string
	Date string
}

// Themes returns list of installed UI themes.
func (h *Handler) Themes(w http.ResponseWriter, r *http.Request) {
	type theme struct {
		Name    string `json:"name"`
		Primary string `json:"primary"`
	}

	th := []theme{}
	th = append(th, theme{Name: "", Primary: "#280A42"})
	th = append(th, theme{Name: "Brave", Primary: "#BF360C"})
	th = append(th, theme{Name: "Conference", Primary: "#176091"})
	th = append(th, theme{Name: "Forest", Primary: "#00695C"})
	th = append(th, theme{Name: "Harvest", Primary: "#A65F20"})
	th = append(th, theme{Name: "Silver", Primary: "#AEBECC"})
	th = append(th, theme{Name: "Sunflower", Primary: "#D7B92F"})

	response.WriteJSON(w, th)
}

// Logo returns site logo based upon request domain (e.g. acme.documize.com).
// The default Documize logo is returned if organization has not uploaded
// their own logo.
func (h *Handler) Logo(w http.ResponseWriter, r *http.Request) {
	ctx := domain.GetRequestContext(r)
	d := organization.GetSubdomainFromHost(r)

	// If organization has logo, send it back by using specified subdomain.
	logo, err := h.Store.Organization.Logo(ctx, d)
	if err == nil && len(logo) > 0 {
		h.writeLogo(w, r, logo)
		return
	}

	// Sometimes people use subdomain like docs.example.org but backend
	// does not reflect that domain, e.g. dmz_org.c_domain is empty.
	logo, err = h.Store.Organization.Logo(ctx, "")
	if err == nil && len(logo) > 0 {
		h.writeLogo(w, r, logo)
		return
	}
	if err != nil {
		h.Runtime.Log.Infof("unable to fetch logo for domain %s", d)
	}

	// Otherwise, we send back default logo.
	h.DefaultLogo(w, r)
}

// DefaultLogo write the default Documize logo to the HTTP response.
func (h *Handler) DefaultLogo(w http.ResponseWriter, r *http.Request) {
	logo, err := base64.StdEncoding.DecodeString(defaultLogo)
	if err != nil {
		h.Runtime.Log.Error("unable to decode default logo", err)
		response.WriteEmpty(w)
		return
	}

	h.writeLogo(w, r, logo)
}

// writeLogo writes byte array as logo to HTTP response stream.
func (h *Handler) writeLogo(w http.ResponseWriter, r *http.Request, logo []byte) {
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(logo)))
	w.WriteHeader(http.StatusOK)

	_, err := w.Write(logo)
	if err != nil {
		h.Runtime.Log.Error("failed to write logo", err)
		return
	}
}

var defaultLogo = `
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
`

// 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
