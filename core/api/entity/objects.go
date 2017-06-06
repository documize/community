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
	Global    bool      `json:"global"`
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

// GetAccount returns matching org account using orgID
func (user *User) GetAccount(orgID string) (a Account, found bool) {
	for _, a := range user.Accounts {
		if a.OrgID == orgID {
			return a, true
		}
	}

	return a, false
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
	AuthProvider         string `json:"authProvider"`
	AuthConfig           string `json:"authConfig"`
	ConversionEndpoint   string `json:"conversionEndpoint"`
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
	Active  bool   `json:"active"`
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
	Layout   string `json:"layout"`
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
	PageType    string  `json:"pageType"`
	BlockID     string  `json:"blockId"`
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

// IsSectionType tells us that page is "words"
func (p *Page) IsSectionType() bool {
	return p.PageType == "section"
}

// IsTabType tells us that page is "SaaS data embed"
func (p *Page) IsTabType() bool {
	return p.PageType == "tab"
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

// Revision holds the previous version of a Page.
type Revision struct {
	BaseEntity
	OrgID       string `json:"orgId"`
	DocumentID  string `json:"documentId"`
	PageID      string `json:"pageId"`
	OwnerID     string `json:"ownerId"`
	UserID      string `json:"userId"`
	ContentType string `json:"contentType"`
	PageType    string `json:"pageType"`
	Title       string `json:"title"`
	Body        string `json:"body"`
	RawBody     string `json:"rawBody"`
	Config      string `json:"config"`
	Email       string `json:"email"`
	Firstname   string `json:"firstname"`
	Lastname    string `json:"lastname"`
	Initials    string `json:"initials"`
	Revisions   int    `json:"revisions"`
}

// Block represents a section that has been published as a reusable content block.
type Block struct {
	BaseEntity
	OrgID          string `json:"orgId"`
	LabelID        string `json:"folderId"`
	UserID         string `json:"userId"`
	ContentType    string `json:"contentType"`
	PageType       string `json:"pageType"`
	Title          string `json:"title"`
	Body           string `json:"body"`
	Excerpt        string `json:"excerpt"`
	RawBody        string `json:"rawBody"`        // a blob of data
	Config         string `json:"config"`         // JSON based custom config for this type
	ExternalSource bool   `json:"externalSource"` // true indicates data sourced externally
	Used           uint64 `json:"used"`
	Firstname      string `json:"firstname"`
	Lastname       string `json:"lastname"`
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
	AuthProvider         string `json:"authProvider"`
	AuthConfig           string `json:"authConfig"`
	Version              string `json:"version"`
	Edition              string `json:"edition"`
	Valid                bool   `json:"valid"`
	ConversionEndpoint   string `json:"conversionEndpoint"`
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

// Link defines a reference between a section and another document/section/attachment.
type Link struct {
	BaseEntity
	OrgID            string `json:"orgId"`
	FolderID         string `json:"folderId"`
	UserID           string `json:"userId"`
	LinkType         string `json:"linkType"`
	SourceDocumentID string `json:"sourceDocumentId"`
	SourcePageID     string `json:"sourcePageId"`
	TargetDocumentID string `json:"targetDocumentId"`
	TargetID         string `json:"targetId"`
	Orphan           bool   `json:"orphan"`
}

// LinkCandidate defines a potential link to a document/section/attachment.
type LinkCandidate struct {
	RefID      string `json:"id"`
	LinkType   string `json:"linkType"`
	FolderID   string `json:"folderId"`
	DocumentID string `json:"documentId"`
	TargetID   string `json:"targetId"`
	Title      string `json:"title"`   // what we label the link
	Context    string `json:"context"` // additional context (e.g. excerpt, parent, file extension)
}

// Pin defines a saved link to a document or space
type Pin struct {
	BaseEntity
	OrgID      string `json:"orgId"`
	UserID     string `json:"userId"`
	FolderID   string `json:"folderId"`
	DocumentID string `json:"documentId"`
	Pin        string `json:"pin"`
	Sequence   int    `json:"sequence"`
}

// UserActivity represents an activity undertaken by a user.
type UserActivity struct {
	ID           uint64             `json:"-"`
	OrgID        string             `json:"orgId"`
	UserID       string             `json:"userId"`
	LabelID      string             `json:"folderId"`
	SourceID     string             `json:"sourceId"`
	SourceName   string             `json:"sourceName"` // e.g. Document or Space name
	SourceType   ActivitySourceType `json:"sourceType"`
	ActivityType ActivityType       `json:"activityType"`
	Created      time.Time          `json:"created"`
}

// ActivitySourceType details where the activity occured.
type ActivitySourceType int

// ActivityType determines type of user activity
type ActivityType int

const (
	// ActivitySourceTypeSpace indicates activity against a space.
	ActivitySourceTypeSpace ActivitySourceType = 1

	// ActivitySourceTypeDocument indicates activity against a document.
	ActivitySourceTypeDocument ActivitySourceType = 2
)

const (
	// ActivityTypeCreated records user document creation
	ActivityTypeCreated ActivityType = 1

	// ActivityTypeRead states user has read document
	ActivityTypeRead ActivityType = 2

	// ActivityTypeEdited states user has editing document
	ActivityTypeEdited ActivityType = 3

	// ActivityTypeDeleted records user deleting space/document
	ActivityTypeDeleted ActivityType = 4

	// ActivityTypeArchived records user archiving space/document
	ActivityTypeArchived ActivityType = 5

	// ActivityTypeApproved records user approval of document
	ActivityTypeApproved ActivityType = 6

	// ActivityTypeReverted records user content roll-back to previous version
	ActivityTypeReverted ActivityType = 7

	// ActivityTypePublishedTemplate records user creating new document template
	ActivityTypePublishedTemplate ActivityType = 8

	// ActivityTypePublishedBlock records user creating reusable content block
	ActivityTypePublishedBlock ActivityType = 9

	// ActivityTypeFeedback records user providing document feedback
	ActivityTypeFeedback ActivityType = 10
)

// AppEvent represents an event initiated by a user.
type AppEvent struct {
	ID      uint64    `json:"-"`
	OrgID   string    `json:"orgId"`
	UserID  string    `json:"userId"`
	Type    string    `json:"eventType"`
	IP      string    `json:"ip"`
	Created time.Time `json:"created"`
}

// EventType defines valid event entry types
type EventType string

const (
	EventTypeDocumentAdd        EventType = "added-document"
	EventTypeDocumentUpload     EventType = "uploaded-document"
	EventTypeDocumentView       EventType = "viewed-document"
	EventTypeDocumentUpdate     EventType = "updated-document"
	EventTypeDocumentDelete     EventType = "removed-document"
	EventTypeDocumentRevisions  EventType = "viewed-document-revisions"
	EventTypeSpaceAdd           EventType = "added-space"
	EventTypeSpaceUpdate        EventType = "updated-space"
	EventTypeSpaceDelete        EventType = "removed-space"
	EventTypeSpacePermission    EventType = "changed-space-permissions"
	EventTypeSpaceJoin          EventType = "joined-space"
	EventTypeSpaceInvite        EventType = "invited-space"
	EventTypeSectionAdd         EventType = "added-document-section"
	EventTypeSectionUpdate      EventType = "updated-document-section"
	EventTypeSectionDelete      EventType = "removed-document-section"
	EventTypeSectionRollback    EventType = "rolled-back-document-section"
	EventTypeSectionResequence  EventType = "resequenced-document-section"
	EventTypeSectionCopy        EventType = "copied-document-section"
	EventTypeAttachmentAdd      EventType = "added-attachment"
	EventTypeAttachmentDownload EventType = "downloaded-attachment"
	EventTypeAttachmentDelete   EventType = "removed-attachment"
	EventTypePinAdd             EventType = "added-pin"
	EventTypePinDelete          EventType = "removed-pin"
	EventTypePinResequence      EventType = "resequenced-pin"
	EventTypeBlockAdd           EventType = "added-reusable-block"
	EventTypeBlockUpdate        EventType = "updated-reusable-block"
	EventTypeBlockDelete        EventType = "removed-reusable-block"
	EventTypeTemplateAdd        EventType = "added-document-template"
	EventTypeTemplateUse        EventType = "used-document-template"
	EventTypeUserAdd            EventType = "added-user"
	EventTypeUserUpdate         EventType = "updated-user"
	EventTypeUserDelete         EventType = "removed-user"
	EventTypeUserPasswordReset  EventType = "reset-user-password"
	EventTypeAccountAdd         EventType = "added-account"
	EventTypeSystemLicense      EventType = "changed-system-license"
	EventTypeSystemAuth         EventType = "changed-system-auth"
	EventTypeSystemSMTP         EventType = "changed-system-smtp"
	EventTypeSessionStart       EventType = "started-session"
	EventTypeSearch             EventType = "searched"
)
