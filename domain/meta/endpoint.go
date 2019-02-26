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
	"encoding/base64"
	"fmt"
	"net/http"
	"strings"
	"text/template"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/auth"
	"github.com/documize/community/domain/organization"
	indexer "github.com/documize/community/domain/search"
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

	// Strip secrets
	data.AuthConfig = auth.StripAuthSecrets(h.Runtime, org.AuthProvider, org.AuthConfig)

	response.WriteJSON(w, data)
}

// RobotsTxt returns robots.txt depending on site configuration.
// Did we allow anonymouse access?
func (h *Handler) RobotsTxt(w http.ResponseWriter, r *http.Request) {
	method := "GetRobots"
	ctx := domain.GetRequestContext(r)

	dom := organization.GetSubdomainFromHost(r)
	o, err := h.Store.Organization.GetOrganizationByDomain(dom)

	// default is to deny
	robots :=
		`User-agent: *
		Disallow: /
		`

	if err != nil {
		h.Runtime.Log.Info(fmt.Sprintf("%s failed to get Organization for domain %s", method, dom))
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

// Reindex indexes all documents and attachments.
func (h *Handler) Reindex(w http.ResponseWriter, r *http.Request) {
	ctx := domain.GetRequestContext(r)

	if !ctx.GlobalAdmin {
		response.WriteForbiddenError(w)
		h.Runtime.Log.Info(fmt.Sprintf("%s attempted search reindex", ctx.UserID))
		return
	}

	go h.rebuildSearchIndex(ctx)

	response.WriteEmpty(w)
}

// rebuildSearchIndex indexes all documents and attachments.
func (h *Handler) rebuildSearchIndex(ctx domain.RequestContext) {
	method := "meta.rebuildSearchIndex"

	docs, err := h.Store.Meta.Documents(ctx)
	if err != nil {
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Runtime.Log.Info(fmt.Sprintf("Search re-index started for %d documents", len(docs)))

	for i := range docs {
		d := docs[i]

		dc, err := h.Store.Meta.Document(ctx, d)
		if err != nil {
			h.Runtime.Log.Error(method, err)
			// continue
		}
		at, err := h.Store.Meta.Attachments(ctx, d)
		if err != nil {
			h.Runtime.Log.Error(method, err)
			// continue
		}

		h.Indexer.IndexDocument(ctx, dc, at)

		pages, err := h.Store.Meta.Pages(ctx, d)
		if err != nil {
			h.Runtime.Log.Error(method, err)
			// continue
		}

		for j := range pages {
			h.Indexer.IndexContent(ctx, pages[j])
		}

		// Log process every N documents.
		if i%100 == 0 {
			h.Runtime.Log.Info(fmt.Sprintf("Search re-indexed %d documents...", i))
		}
	}

	h.Runtime.Log.Info(fmt.Sprintf("Search re-index finished for %d documents", len(docs)))
}

// SearchStatus returns state of search index
func (h *Handler) SearchStatus(w http.ResponseWriter, r *http.Request) {
	method := "meta.SearchStatus"
	ctx := domain.GetRequestContext(r)

	if !ctx.GlobalAdmin {
		response.WriteForbiddenError(w)
		h.Runtime.Log.Info(fmt.Sprintf("%s attempted get of search status", ctx.UserID))
		return
	}

	count, err := h.Store.Meta.SearchIndexCount(ctx)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	var ss = searchStatus{Entries: count}

	response.WriteJSON(w, ss)
}

type sitemapItem struct {
	URL  string
	Date string
}

type searchStatus struct {
	Entries int `json:"entries"`
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
