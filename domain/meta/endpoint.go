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
	"fmt"
	"net/http"
	"text/template"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/auth"
	"github.com/documize/community/domain/organization"
	indexer "github.com/documize/community/domain/search"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/org"
	"github.com/documize/community/model/space"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *domain.Store
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
	data.AuthProvider = org.AuthProvider
	data.AuthConfig = org.AuthConfig
	data.MaxTags = org.MaxTags
	data.Version = h.Runtime.Product.Version
	data.Edition = h.Runtime.Product.License.Edition
	data.Valid = h.Runtime.Product.License.Valid
	data.ConversionEndpoint = org.ConversionEndpoint
	data.License = h.Runtime.Product.License

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
		robots = fmt.Sprintf(
			`User-agent: *
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
			Disallow: /share
			Disallow: /share/*
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
				document.SpaceID, stringutil.MakeSlug(document.Folder), document.DocumentID, stringutil.MakeSlug(document.Document)))
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
		h.Runtime.Log.Info(fmt.Sprintf("%s attempted search reindex"))
		return
	}

	go h.rebuildSearchIndex(ctx)

	response.WriteEmpty(w)
}

// rebuildSearchIndex indexes all documents and attachments.
func (h *Handler) rebuildSearchIndex(ctx domain.RequestContext) {
	method := "meta.rebuildSearchIndex"

	docs, err := h.Store.Meta.GetDocumentsID(ctx)
	if err != nil {
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Runtime.Log.Info(fmt.Sprintf("Search re-index started for %d documents", len(docs)))

	for i := range docs {
		d := docs[i]

		pages, err := h.Store.Meta.GetDocumentPages(ctx, d)
		if err != nil {
			h.Runtime.Log.Error(method, err)
			return
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
		h.Runtime.Log.Info(fmt.Sprintf("%s attempted get of search status"))
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
