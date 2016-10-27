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

package util

import (
	"strings"

	"golang.org/x/net/html"

	"github.com/documize/community/core/api/entity"
)

// GetContentLinks returns Documize generated <a> links.
// such links have an identifying attribute e.g. <a data-documize='true'...
func GetContentLinks(body string) (links []entity.Link) {
	z := html.NewTokenizer(strings.NewReader(body))

	for {
		tt := z.Next()

		switch {
		case tt == html.ErrorToken:
			// End of the document, we're done
			return
		case tt == html.StartTagToken:
			t := z.Token()

			// Check if the token is an <a> tag
			isAnchor := t.Data == "a"
			if !isAnchor {
				continue
			}

			// Extract the content link
			ok, link := getLink(t)
			if ok {
				links = append(links, link)
			}
		}
	}
}

// Helper function to pull the href attribute from a Token
func getLink(t html.Token) (ok bool, link entity.Link) {
	ok = false

	// Iterate over all of the Token's attributes until we find an "href"
	for _, a := range t.Attr {
		switch a.Key {
		case "data-documize":
			ok = true
		case "data-link-id":
			link.RefID = strings.TrimSpace(a.Val)
		case "data-link-space-id":
			link.FolderID = strings.TrimSpace(a.Val)
		case "data-link-target-document-id":
			link.TargetDocumentID = strings.TrimSpace(a.Val)
		case "data-link-target-id":
			link.TargetPageID = strings.TrimSpace(a.Val)
		case "data-link-type":
			link.LinkType = strings.TrimSpace(a.Val)
		}
	}

	return
}
