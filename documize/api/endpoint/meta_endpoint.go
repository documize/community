package endpoint

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"text/template"

	"github.com/documize/community/documize/api/entity"
	"github.com/documize/community/documize/api/request"
	"github.com/documize/community/wordsmith/log"
	"github.com/documize/community/wordsmith/utility"
)

// GetMeta provides org meta data based upon request domain (e.g. acme.documize.com).
func GetMeta(w http.ResponseWriter, r *http.Request) {
	method := "GetMeta"
	p := request.GetPersister(r)

	data := entity.SiteMeta{}
	data.URL = request.GetSubdomainFromHost(r)

	org, err := p.GetOrganizationByDomain(data.URL)

	if err != nil {
		log.Info(fmt.Sprintf("%s URL not found", data.URL))
		writeForbiddenError(w)
		return
	}

	data.OrgID = org.RefID
	data.Title = org.Title
	data.Message = org.Message
	data.AllowAnonymousAccess = org.AllowAnonymousAccess
	data.Version = AppVersion

	json, err := json.Marshal(data)

	if err != nil {
		writeJSONMarshalError(w, method, "meta", err)
		return
	}

	writeSuccessBytes(w, json)
}

// GetRobots returns robots.txt depending on site configuration.
// Did we allow anonymouse access?
func GetRobots(w http.ResponseWriter, r *http.Request) {
	method := "GetRobots"
	p := request.GetPersister(r)

	domain := request.GetSubdomainFromHost(r)
	org, err := p.GetOrganizationByDomain(domain)

	// default is to deny
	robots :=
		`User-agent: *
Disallow: /
`

	if err != nil {
		log.Error(fmt.Sprintf("%s failed to get Organization for domain %s", method, domain), err)
	}

	// Anonymous access would mean we allow bots to crawl.
	if org.AllowAnonymousAccess {
		sitemap := getAppURL(p.Context, "sitemap.xml")
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

	writeSuccessBytes(w, []byte(robots))
}

// GetSitemap returns URLs that can be indexed.
// We only include public folders and documents (e.g. can be seen by everyone).
func GetSitemap(w http.ResponseWriter, r *http.Request) {
	method := "GetSitemap"
	p := request.GetPersister(r)

	domain := request.GetSubdomainFromHost(r)
	org, err := p.GetOrganizationByDomain(domain)

	if err != nil {
		log.Error(fmt.Sprintf("%s failed to get Organization for domain %s", method, domain), err)
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
	if org.AllowAnonymousAccess {
		// Grab shared folders
		folders, err := p.GetPublicFolders(org.RefID)

		if err != nil {
			log.Error(fmt.Sprintf("%s failed to get folders for domain %s", method, domain), err)
		}

		for _, folder := range folders {
			var item sitemapItem
			item.URL = getAppURL(p.Context, fmt.Sprintf("s/%s/%s", folder.RefID, utility.MakeSlug(folder.Name)))
			item.Date = folder.Revised.Format("2006-01-02T15:04:05.999999-07:00")
			items = append(items, item)
		}

		// Grab documents from shared folders
		documents, err := p.GetPublicDocuments(org.RefID)

		if err != nil {
			log.Error(fmt.Sprintf("%s failed to get documents for domain %s", method, domain), err)
		}

		for _, document := range documents {
			var item sitemapItem
			item.URL = getAppURL(p.Context, fmt.Sprintf("s/%s/%s/d/%s/%s",
				document.FolderID, utility.MakeSlug(document.Folder), document.DocumentID, utility.MakeSlug(document.Document)))
			item.Date = document.Revised.Format("2006-01-02T15:04:05.999999-07:00")
			items = append(items, item)
		}

	}

	buffer := new(bytes.Buffer)
	t := template.Must(template.New("tmp").Parse(sitemap))
	log.IfErr(t.Execute(buffer, &items))

	writeSuccessBytes(w, buffer.Bytes())
}

// sitemapItem provides a means to teleport somewhere else for free.
// What did you think it did?
type sitemapItem struct {
	URL  string
	Date string
}
