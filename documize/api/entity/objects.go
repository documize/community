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

// Package entity provides types that mirror database tables.
package entity

import (
	"fmt"
	"strings"
	"time"
)

// BaseEntity contains the database fields used in every table.
type BaseEntity struct {
	ID      uint64    `json:"-"`
	RefID   string    `json:"id"`
	Created time.Time `json:"created"`
	Revised time.Time `json:"revised"`
}

// BaseEntityObfuscated is a mirror of BaseEntity,
// but with the fields invisible to JSON.
type BaseEntityObfuscated struct {
	ID      uint64    `json:"-"`
	RefID   string    `json:"-"`
	Created time.Time `json:"-"`
	Revised time.Time `json:"-"`
}

// User defines a login.
type User struct {
	BaseEntity
	Firstname string    `json:"firstname"`
	Lastname  string    `json:"lastname"`
	Email     string    `json:"email"`
	Initials  string    `json:"initials"`
	Active    bool      `json:"active"`
	Editor    bool      `json:"editor"`
	Admin     bool      `json:"admin"`
	Password  string    `json:"-"`
	Salt      string    `json:"-"`
	Reset     string    `json:"-"`
	Accounts  []Account `json:"accounts"`
}

// ProtectSecrets blanks sensitive data.
func (user *User) ProtectSecrets() {
	user.Password = ""
	user.Salt = ""
	user.Reset = ""
}

// Fullname returns Firstname + Lastname.
func (user *User) Fullname() string {
	return fmt.Sprintf("%s %s", user.Firstname, user.Lastname)
}

// Organization defines a company that uses this app.
type Organization struct {
	BaseEntity
	Company              string `json:"-"`
	Title                string `json:"title"`
	Message              string `json:"message"`
	URL                  string `json:"url"`
	Domain               string `json:"domain"`
	Email                string `json:"email"`
	AllowAnonymousAccess bool   `json:"allowAnonymousAccess"`
	Serial               string `json:"-"`
	Active               bool   `json:"-"`
}

// Account links a User to an Organization.
type Account struct {
	BaseEntity
	Admin   bool   `json:"admin"`
	Editor  bool   `json:"editor"`
	UserID  string `json:"userId"`
	OrgID   string `json:"orgId"`
	Company string `json:"company"`
	Title   string `json:"title"`
	Message string `json:"message"`
	Domain  string `json:"domain"`
}

// Label defines a container for documents.
type Label struct {
	BaseEntity
	Name   string     `json:"name"`
	OrgID  string     `json:"orgId"`
	UserID string     `json:"userId"`
	Type   FolderType `json:"folderType"`
}

// FolderType determines folder visibility.
type FolderType int

const (
	// FolderTypePublic can be seen by anyone
	FolderTypePublic FolderType = 1

	// FolderTypePrivate can only be seen by the person who owns it
	FolderTypePrivate FolderType = 2

	// FolderTypeRestricted can be seen by selected users
	FolderTypeRestricted FolderType = 3
)

// IsPublic means the folder can be seen by anyone.
func (l *Label) IsPublic() bool {
	return l.Type == FolderTypePublic
}

// IsPrivate means the folder can only be seen by the person who owns it.
func (l *Label) IsPrivate() bool {
	return l.Type == FolderTypePrivate
}

// IsRestricted means the folder can be seen by selected users.
func (l *Label) IsRestricted() bool {
	return l.Type == FolderTypeRestricted
}

// LabelRole determines user permissions for a folder.
type LabelRole struct {
	BaseEntityObfuscated
	OrgID   string `json:"-"`
	LabelID string `json:"folderId"`
	UserID  string `json:"userId"`
	CanView bool   `json:"canView"`
	CanEdit bool   `json:"canEdit"`
}

// Document represents a document.
type Document struct {
	BaseEntity
	OrgID    string `json:"orgId"`
	LabelID  string `json:"folderId"`
	UserID   string `json:"userId"`
	Job      string `json:"job"`
	Location string `json:"location"`
	Title    string `json:"name"`
	Excerpt  string `json:"excerpt"`
	Slug     string `json:"-"`
	Tags     string `json:"tags"`
	Template bool   `json:"template"`
}

// SetDefaults ensures on blanks and cleans.
func (d *Document) SetDefaults() {
	d.Title = strings.TrimSpace(d.Title)

	if len(d.Title) == 0 {
		d.Title = "Document"
	}
}

// Attachment represents an attachment to a document.
type Attachment struct {
	BaseEntity
	OrgID      string `json:"orgId"`
	DocumentID string `json:"documentId"`
	Job        string `json:"job"`
	FileID     string `json:"fileId"`
	Filename   string `json:"filename"`
	Data       []byte `json:"-"`
	Extension  string `json:"extension"`
}

// Page represents a section within a document.
type Page struct {
	BaseEntity
	OrgID       string  `json:"orgId"`
	DocumentID  string  `json:"documentId"`
	UserID      string  `json:"userId"`
	ContentType string  `json:"contentType"`
	Level       uint64  `json:"level"`
	Sequence    float64 `json:"sequence"`
	Title       string  `json:"title"`
	Body        string  `json:"body"`
	Revisions   uint64  `json:"revisions"`
}

// SetDefaults ensures no blank values.
func (p *Page) SetDefaults() {
	if len(p.ContentType) == 0 {
		p.ContentType = "wysiwyg"
	}

	p.Title = strings.TrimSpace(p.Title)
}

// PageMeta holds raw page data that is used to
// render the actual page data.
type PageMeta struct {
	ID             uint64    `json:"id"`
	Created        time.Time `json:"created"`
	Revised        time.Time `json:"revised"`
	OrgID          string    `json:"orgId"`
	UserID         string    `json:"userId"`
	DocumentID     string    `json:"documentId"`
	PageID         string    `json:"pageId"`
	RawBody        string    `json:"rawBody"`        // a blob of data
	Config         string    `json:"config"`         // JSON based custom config for this type
	ExternalSource bool      `json:"externalSource"` // true indicates data sourced externally
}

// SetDefaults ensures no blank values.
func (p *PageMeta) SetDefaults() {
	if len(p.Config) == 0 {
		p.Config = "{}"
	}
}

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
	PageID    string    `json:"pageId"`
	UserID    string    `json:"userId"`
	Action    string    `json:"action"`
	Created   time.Time `json:"created"`
	Firstname string    `json:"firstname"`
	Lastname  string    `json:"lastname"`
}

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

// SiteMeta holds information associated with an Organization.
type SiteMeta struct {
	OrgID                string `json:"orgId"`
	Title                string `json:"title"`
	Message              string `json:"message"`
	URL                  string `json:"url"`
	AllowAnonymousAccess bool   `json:"allowAnonymousAccess"`
	Version              string `json:"version"`
}

// Template is used to create a new document.
// Template can consist of content, attachments and
// have associated meta data indentifying author, version
// contact details and more.
type Template struct {
	ID          string       `json:"id"`
	Title       string       `json:"title"`
	Description string       `json:"description"`
	Author      string       `json:"author"`
	Type        TemplateType `json:"type"`
	Dated       time.Time    `json:"dated"`
}

// TemplateType determines who can see a template.
type TemplateType int

const (
	// TemplateTypePublic means anyone can see the template.
	TemplateTypePublic TemplateType = 1
	// TemplateTypePrivate means only the owner can see the template.
	TemplateTypePrivate TemplateType = 2
	// TemplateTypeRestricted means selected users can see the template.
	TemplateTypeRestricted TemplateType = 3
)

// IsPublic means anyone can see the template.
func (t *Template) IsPublic() bool {
	return t.Type == TemplateTypePublic
}

// IsPrivate means only the owner can see the template.
func (t *Template) IsPrivate() bool {
	return t.Type == TemplateTypePrivate
}

// IsRestricted means selected users can see the template.
func (t *Template) IsRestricted() bool {
	return t.Type == TemplateTypeRestricted
}

// FolderVisibility details who can see a particular folder
type FolderVisibility struct {
	Name      string `json:"name"`
	LabelID   string `json:"folderId"`
	Type      int    `json:"folderType"`
	UserID    string `json:"userId"`
	Firstname string `json:"firstname"`
	Lastname  string `json:"lastname"`
	Email     string `json:"email"`
}

// SitemapDocument details a document that can be exposed via Sitemap.
type SitemapDocument struct {
	DocumentID string
	Document   string
	FolderID   string
	Folder     string
	Revised    time.Time
}
