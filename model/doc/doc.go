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

package doc

import (
	"strings"
	"time"

	"github.com/documize/community/model"
	"github.com/documize/community/model/workflow"
)

// Document represents the purpose of Documize.
type Document struct {
	model.BaseEntity
	OrgID        string              `json:"orgId"`
	SpaceID      string              `json:"spaceId"`
	UserID       string              `json:"userId"`
	Job          string              `json:"job"`
	Location     string              `json:"location"`
	Name         string              `json:"name"`
	Excerpt      string              `json:"excerpt"`
	Slug         string              `json:"-"`
	Tags         string              `json:"tags"`
	Template     bool                `json:"template"`
	Protection   workflow.Protection `json:"protection"`
	Approval     workflow.Approval   `json:"approval"`
	Lifecycle    workflow.Lifecycle  `json:"lifecycle"`
	Versioned    bool                `json:"versioned"`
	VersionID    string              `json:"versionId"`
	VersionOrder int                 `json:"versionOrder"`
	Sequence     int                 `json:"sequence"`
	GroupID      string              `json:"groupId"`

	// Read-only presentation only data
	Category []string `json:"category"`
}

// SetDefaults ensures on blanks and cleans.
func (d *Document) SetDefaults() {
	d.Name = strings.TrimSpace(d.Name)

	if len(d.Name) == 0 {
		d.Name = "Document"
	}
}

// ByName sorts a collection of documents by document name.
type ByName []Document

func (a ByName) Len() int           { return len(a) }
func (a ByName) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ByName) Less(i, j int) bool { return strings.ToLower(a[i].Name) < strings.ToLower(a[j].Name) }

// ByID sorts a collection of documents by document ID.
type ByID []Document

func (a ByID) Len() int           { return len(a) }
func (a ByID) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ByID) Less(i, j int) bool { return a[i].RefID > a[j].RefID }

// BySeq sorts a collection of documents by sequenced number.
type BySeq []Document

func (a BySeq) Len() int           { return len(a) }
func (a BySeq) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a BySeq) Less(i, j int) bool { return a[i].Sequence < a[j].Sequence }

// DocumentMeta details who viewed the document.
type DocumentMeta struct {
	Viewers []DocumentMetaViewer `json:"viewers"`
	Editors []DocumentMetaEditor `json:"editors"`
}

// DocumentMetaViewer contains the "view" metatdata content.
type DocumentMetaViewer struct {
	UserID    string    `json:"userId"`
	Created   time.Time `json:"created"`
	Firstname string    `json:"firstname"`
	Lastname  string    `json:"lastname"`
}

// DocumentMetaEditor contains the "edit" metatdata content.
type DocumentMetaEditor struct {
	SectionID string    `json:"pageId"`
	UserID    string    `json:"userId"`
	Action    string    `json:"action"`
	Created   time.Time `json:"created"`
	Firstname string    `json:"firstname"`
	Lastname  string    `json:"lastname"`
}

// UploadModel details the job ID of an uploaded document.
type UploadModel struct {
	JobID string `json:"jobId"`
}

// SitemapDocument details a document that can be exposed via Sitemap.
type SitemapDocument struct {
	DocumentID string
	Document   string
	SpaceID    string
	Space      string
	Revised    time.Time
}

// Version points to a version of a document.
type Version struct {
	VersionID  string             `json:"versionId"`
	DocumentID string             `json:"documentId"`
	Lifecycle  workflow.Lifecycle `json:"lifecycle"`
}

// DuplicateModel is used to create a copy of a document.
type DuplicateModel struct {
	SpaceID    string `json:"spaceId"`
	DocumentID string `json:"documentId"`
	Name       string `json:"documentName"`
}

// SortedDocs provides list od pinned and unpinned documents
// sorted by sequence and name respectively.
type SortedDocs struct {
	Pinned   []Document `json:"pinned"`
	Unpinned []Document `json:"unpinned"`
}

const (
	// Unsequenced tells us if document is pinned or not
	Unsequenced int = 99999
)
