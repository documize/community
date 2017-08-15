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

package search

import (
	"time"
)

// Search holds raw search results.
type Search struct {
	ID            string    `json:"id"`
	Created       time.Time `json:"created"`
	Revised       time.Time `json:"revised"`
	OrgID         string
	DocumentID    string
	Level         uint64
	Sequence      float64
	DocumentTitle string
	Slug          string
	PageTitle     string
	Body          string
}

// QueryOptions defines how we search.
type QueryOptions struct {
	Keywords   string `json:"keywords"`
	Doc        bool   `json:"doc"`
	Tag        bool   `json:"tag"`
	Attachment bool   `json:"attachment"`
	Content    bool   `json:"content"`
}

// QueryResult represents 'presentable' search results.
type QueryResult struct {
	ID           string `json:"id"`
	OrgID        string `json:"orgId"`
	ItemID       string `json:"itemId"`
	ItemType     string `json:"itemType"`
	DocumentID   string `json:"documentId"`
	DocumentSlug string `json:"documentSlug"`
	Document     string `json:"document"`
	Excerpt      string `json:"excerpt"`
	Tags         string `json:"tags"`
	SpaceID      string `json:"spaceId"`
	Space        string `json:"space"`
	SpaceSlug    string `json:"spaceSlug"`
}
