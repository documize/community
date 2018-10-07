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

package page

import (
	"strings"
	"time"

	"github.com/documize/community/model"
	"github.com/documize/community/model/workflow"
)

// Page represents a section within a document.
type Page struct {
	model.BaseEntity
	OrgID       string                `json:"orgId"`
	DocumentID  string                `json:"documentId"`
	UserID      string                `json:"userId"`
	ContentType string                `json:"contentType"`
	Type        string                `json:"pageType"`
	TemplateID  string                `json:"blockId"`
	Level       uint64                `json:"level"`
	Sequence    float64               `json:"sequence"`
	Numbering   string                `json:"numbering"`
	Name        string                `json:"title"`
	Body        string                `json:"body"`
	Revisions   uint64                `json:"revisions"`
	Status      workflow.ChangeStatus `json:"status"`
	RelativeID  string                `json:"relativeId"` // links page to pending page edits
}

// SetDefaults ensures no blank values.
func (p *Page) SetDefaults() {
	if len(p.ContentType) == 0 {
		p.ContentType = "wysiwyg"
	}

	if p.Level == 0 {
		p.Level = 1
	}

	p.Name = strings.TrimSpace(p.Name)
}

// IsSectionType tells us that page is "words"
func (p *Page) IsSectionType() bool {
	return p.Type == "section"
}

// IsTabType tells us that page is "SaaS data embed"
func (p *Page) IsTabType() bool {
	return p.Type == "tab"
}

// Meta holds raw page data that is used to
// render the actual page data.
type Meta struct {
	ID             uint64    `json:"id"`
	Created        time.Time `json:"created"`
	Revised        time.Time `json:"revised"`
	OrgID          string    `json:"orgId"`
	UserID         string    `json:"userId"`
	DocumentID     string    `json:"documentId"`
	SectionID      string    `json:"pageId"`
	RawBody        string    `json:"rawBody"`        // a blob of data
	Config         string    `json:"config"`         // JSON based custom config for this type
	ExternalSource bool      `json:"externalSource"` // true indicates data sourced externally
}

// SetDefaults ensures no blank values.
func (p *Meta) SetDefaults() {
	if len(p.Config) == 0 {
		p.Config = "{}"
	}
}

// Revision holds the previous version of a Page.
type Revision struct {
	model.BaseEntity
	OrgID       string `json:"orgId"`
	DocumentID  string `json:"documentId"`
	SectionID   string `json:"pageId"`
	OwnerID     string `json:"ownerId"`
	UserID      string `json:"userId"`
	ContentType string `json:"contentType"`
	Type        string `json:"pageType"`
	Name        string `json:"title"`
	Body        string `json:"body"`
	RawBody     string `json:"rawBody"`
	Config      string `json:"config"`
	Email       string `json:"email"`
	Firstname   string `json:"firstname"`
	Lastname    string `json:"lastname"`
	Initials    string `json:"initials"`
	Revisions   int    `json:"revisions"`
}

// NewPage contains the page and associated meta.
type NewPage struct {
	Page Page `json:"page"`
	Meta Meta `json:"meta"`
}

// SequenceRequest details a page ID and its sequence within the document.
type SequenceRequest struct {
	SectionID string  `json:"pageId"`
	Sequence  float64 `json:"sequence"`
}

// LevelRequest details a page ID and level.
type LevelRequest struct {
	SectionID string `json:"pageId"`
	Level     int    `json:"level"`
}

// BulkRequest details page, it's meta, pending page changes.
// Used to bulk load data by GUI so as to reduce network requests.
type BulkRequest struct {
	ID      string        `json:"id"`
	Page    Page          `json:"page"`
	Meta    Meta          `json:"meta"`
	Pending []PendingPage `json:"pending"`
}

// PendingPage details page that is yet to be published
type PendingPage struct {
	Page  Page   `json:"page"`
	Meta  Meta   `json:"meta"`
	Owner string `json:"owner"`
}
