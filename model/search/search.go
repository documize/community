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

import "time"

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

// DocumentSearch represents 'presentable' search results.
type DocumentSearch struct {
	ID              string `json:"id"`
	DocumentID      string `json:"documentId"`
	DocumentTitle   string `json:"documentTitle"`
	DocumentSlug    string `json:"documentSlug"`
	DocumentExcerpt string `json:"documentExcerpt"`
	Tags            string `json:"documentTags"`
	PageTitle       string `json:"pageTitle"`
	LabelID         string `json:"folderId"`
	LabelName       string `json:"folderName"`
	FolderSlug      string `json:"folderSlug"`
}
