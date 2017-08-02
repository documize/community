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

// Package domain ...
package domain

import (
	"github.com/documize/community/model/account"
	"github.com/documize/community/model/activity"
	"github.com/documize/community/model/attachment"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/block"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/link"
	"github.com/documize/community/model/org"
	"github.com/documize/community/model/page"
	"github.com/documize/community/model/pin"
	"github.com/documize/community/model/search"
	"github.com/documize/community/model/space"
	"github.com/documize/community/model/user"
)

// Store provides access to data store (database)
type Store struct {
	Account      AccountStorer
	Activity     ActivityStorer
	Attachment   AttachmentStorer
	Audit        AuditStorer
	Block        BlockStorer
	Document     DocumentStorer
	Link         LinkStorer
	Organization OrganizationStorer
	Page         PageStorer
	Pin          PinStorer
	Search       SearchStorer
	Setting      SettingStorer
	Space        SpaceStorer
	User         UserStorer
}

// SpaceStorer defines required methods for space management
type SpaceStorer interface {
	Add(ctx RequestContext, sp space.Space) (err error)
	Get(ctx RequestContext, id string) (sp space.Space, err error)
	PublicSpaces(ctx RequestContext, orgID string) (sp []space.Space, err error)
	GetAll(ctx RequestContext) (sp []space.Space, err error)
	Update(ctx RequestContext, sp space.Space) (err error)
	ChangeOwner(ctx RequestContext, currentOwner, newOwner string) (err error)
	Viewers(ctx RequestContext) (v []space.Viewer, err error)
	Delete(ctx RequestContext, id string) (rows int64, err error)
	AddRole(ctx RequestContext, r space.Role) (err error)
	GetRoles(ctx RequestContext, labelID string) (r []space.Role, err error)
	GetUserRoles(ctx RequestContext) (r []space.Role, err error)
	DeleteRole(ctx RequestContext, roleID string) (rows int64, err error)
	DeleteSpaceRoles(ctx RequestContext, spaceID string) (rows int64, err error)
	DeleteUserSpaceRoles(ctx RequestContext, spaceID, userID string) (rows int64, err error)
	MoveSpaceRoles(ctx RequestContext, previousLabel, newLabel string) (err error)
}

// UserStorer defines required methods for user management
type UserStorer interface {
	Add(ctx RequestContext, u user.User) (err error)
	Get(ctx RequestContext, id string) (u user.User, err error)
	GetByDomain(ctx RequestContext, domain, email string) (u user.User, err error)
	GetByEmail(ctx RequestContext, email string) (u user.User, err error)
	GetByToken(ctx RequestContext, token string) (u user.User, err error)
	GetBySerial(ctx RequestContext, serial string) (u user.User, err error)
	GetActiveUsersForOrganization(ctx RequestContext) (u []user.User, err error)
	GetUsersForOrganization(ctx RequestContext) (u []user.User, err error)
	GetSpaceUsers(ctx RequestContext, folderID string) (u []user.User, err error)
	UpdateUser(ctx RequestContext, u user.User) (err error)
	UpdateUserPassword(ctx RequestContext, userID, salt, password string) (err error)
	DeactiveUser(ctx RequestContext, userID string) (err error)
	ForgotUserPassword(ctx RequestContext, email, token string) (err error)
	CountActiveUsers(ctx RequestContext) (c int)
}

// AccountStorer defines required methods for account management
type AccountStorer interface {
	Add(ctx RequestContext, account account.Account) (err error)
	GetUserAccount(ctx RequestContext, userID string) (account account.Account, err error)
	GetUserAccounts(ctx RequestContext, userID string) (t []account.Account, err error)
	GetAccountsByOrg(ctx RequestContext) (t []account.Account, err error)
	DeleteAccount(ctx RequestContext, ID string) (rows int64, err error)
	UpdateAccount(ctx RequestContext, account account.Account) (err error)
	HasOrgAccount(ctx RequestContext, orgID, userID string) bool
	CountOrgAccounts(ctx RequestContext) int
}

// OrganizationStorer defines required methods for organization management
type OrganizationStorer interface {
	AddOrganization(ctx RequestContext, org org.Organization) error
	GetOrganization(ctx RequestContext, id string) (org org.Organization, err error)
	GetOrganizationByDomain(subdomain string) (org org.Organization, err error)
	UpdateOrganization(ctx RequestContext, org org.Organization) (err error)
	DeleteOrganization(ctx RequestContext, orgID string) (rows int64, err error)
	RemoveOrganization(ctx RequestContext, orgID string) (err error)
	UpdateAuthConfig(ctx RequestContext, org org.Organization) (err error)
	CheckDomain(ctx RequestContext, domain string) string
}

// PinStorer defines required methods for pin management
type PinStorer interface {
	Add(ctx RequestContext, pin pin.Pin) (err error)
	GetPin(ctx RequestContext, id string) (pin pin.Pin, err error)
	GetUserPins(ctx RequestContext, userID string) (pins []pin.Pin, err error)
	UpdatePin(ctx RequestContext, pin pin.Pin) (err error)
	UpdatePinSequence(ctx RequestContext, pinID string, sequence int) (err error)
	DeletePin(ctx RequestContext, id string) (rows int64, err error)
	DeletePinnedSpace(ctx RequestContext, spaceID string) (rows int64, err error)
	DeletePinnedDocument(ctx RequestContext, documentID string) (rows int64, err error)
}

// AuditStorer defines required methods for audit trails
type AuditStorer interface {
	Record(ctx RequestContext, t audit.EventType)
}

// DocumentStorer defines required methods for document handling
type DocumentStorer interface {
	Add(ctx RequestContext, document doc.Document) (err error)
	Get(ctx RequestContext, id string) (document doc.Document, err error)
	GetAll() (ctx RequestContext, documents []doc.Document, err error)
	GetBySpace(ctx RequestContext, folderID string) (documents []doc.Document, err error)
	GetByTag(ctx RequestContext, tag string) (documents []doc.Document, err error)
	DocumentList(ctx RequestContext) (documents []doc.Document, err error)
	Templates(ctx RequestContext) (documents []doc.Document, err error)
	DocumentMeta(ctx RequestContext, id string) (meta doc.DocumentMeta, err error)
	PublicDocuments(ctx RequestContext, orgID string) (documents []doc.SitemapDocument, err error)
	Update(ctx RequestContext, document doc.Document) (err error)
	ChangeDocumentSpace(ctx RequestContext, document, space string) (err error)
	MoveDocumentSpace(ctx RequestContext, id, move string) (err error)
	Delete(ctx RequestContext, documentID string) (rows int64, err error)
}

// SettingStorer defines required methods for persisting global and user level settings
type SettingStorer interface {
	Get(area, path string) string
	Set(area, value string) error
	GetUser(orgID, userID, area, path string) string
	SetUser(orgID, userID, area, json string) error
}

// AttachmentStorer defines required methods for persisting document attachments
type AttachmentStorer interface {
	Add(ctx RequestContext, a attachment.Attachment) (err error)
	GetAttachment(ctx RequestContext, orgID, attachmentID string) (a attachment.Attachment, err error)
	GetAttachments(ctx RequestContext, docID string) (a []attachment.Attachment, err error)
	GetAttachmentsWithData(ctx RequestContext, docID string) (a []attachment.Attachment, err error)
	Delete(ctx RequestContext, id string) (rows int64, err error)
}

// LinkStorer defines required methods for persisting content links
type LinkStorer interface {
	Add(ctx RequestContext, l link.Link) (err error)
	SearchCandidates(ctx RequestContext, keywords string) (docs []link.Candidate, pages []link.Candidate, attachments []link.Candidate, err error)
	GetDocumentOutboundLinks(ctx RequestContext, documentID string) (links []link.Link, err error)
	GetPageLinks(ctx RequestContext, documentID, pageID string) (links []link.Link, err error)
	MarkOrphanDocumentLink(ctx RequestContext, documentID string) (err error)
	MarkOrphanPageLink(ctx RequestContext, pageID string) (err error)
	MarkOrphanAttachmentLink(ctx RequestContext, attachmentID string) (err error)
	DeleteSourcePageLinks(ctx RequestContext, pageID string) (rows int64, err error)
	DeleteSourceDocumentLinks(ctx RequestContext, documentID string) (rows int64, err error)
	DeleteLink(ctx RequestContext, id string) (rows int64, err error)
}

// ActivityStorer defines required methods for persisting document activity
type ActivityStorer interface {
	RecordUserActivity(ctx RequestContext, activity activity.UserActivity) (err error)
	GetDocumentActivity(ctx RequestContext, id string) (a []activity.DocumentActivity, err error)
}

// SearchStorer defines required methods for persisting search queries
type SearchStorer interface {
	Add(ctx RequestContext, page page.Page) (err error)
	Update(ctx RequestContext, page page.Page) (err error)
	UpdateDocument(ctx RequestContext, page page.Page) (err error)
	DeleteDocument(ctx RequestContext, page page.Page) (err error)
	Rebuild(ctx RequestContext, p page.Page) (err error)
	UpdateSequence(ctx RequestContext, page page.Page) (err error)
	UpdateLevel(ctx RequestContext, page page.Page) (err error)
	Delete(ctx RequestContext, page page.Page) (err error)
	Documents(ctx RequestContext, keywords string) (results []search.DocumentSearch, err error)
}

// Indexer defines required methods for managing search indexing process
type Indexer interface {
	Add(ctx RequestContext, page page.Page, id string) (err error)
	Update(ctx RequestContext, page page.Page) (err error)
	UpdateDocument(ctx RequestContext, page page.Page) (err error)
	DeleteDocument(ctx RequestContext, documentID string) (err error)
	UpdateSequence(ctx RequestContext, documentID, pageID string, sequence float64) (err error)
	UpdateLevel(ctx RequestContext, documentID, pageID string, level int) (err error)
	Delete(ctx RequestContext, documentID, pageID string) (err error)
}

// BlockStorer defines required methods for persisting reusable content blocks
type BlockStorer interface {
	Add(ctx RequestContext, b block.Block) (err error)
	Get(ctx RequestContext, id string) (b block.Block, err error)
	GetBySpace(ctx RequestContext, spaceID string) (b []block.Block, err error)
	IncrementUsage(ctx RequestContext, id string) (err error)
	DecrementUsage(ctx RequestContext, id string) (err error)
	RemoveReference(ctx RequestContext, id string) (err error)
	Update(ctx RequestContext, b block.Block) (err error)
	Delete(ctx RequestContext, id string) (rows int64, err error)
}

// PageStorer defines required methods for persisting document pages
type PageStorer interface {
	Add(ctx RequestContext, model page.NewPage) (err error)
	Get(ctx RequestContext, pageID string) (p page.Page, err error)
	GetPages(ctx RequestContext, documentID string) (p []page.Page, err error)
	GetPagesWhereIn(ctx RequestContext, documentID, inPages string) (p []page.Page, err error)
	GetPagesWithoutContent(ctx RequestContext, documentID string) (pages []page.Page, err error)
	Update(ctx RequestContext, page page.Page, refID, userID string, skipRevision bool) (err error)
	UpdateMeta(ctx RequestContext, meta page.Meta, updateUserID bool) (err error)
	UpdateSequence(ctx RequestContext, documentID, pageID string, sequence float64) (err error)
	UpdateLevel(ctx RequestContext, documentID, pageID string, level int) (err error)
	Delete(ctx RequestContext, documentID, pageID string) (rows int64, err error)
	GetPageMeta(ctx RequestContext, pageID string) (meta page.Meta, err error)
	GetPageRevision(ctx RequestContext, revisionID string) (revision page.Revision, err error)
	GetPageRevisions(ctx RequestContext, pageID string) (revisions []page.Revision, err error)
	GetDocumentRevisions(ctx RequestContext, documentID string) (revisions []page.Revision, err error)
	GetDocumentPageMeta(ctx RequestContext, documentID string, externalSourceOnly bool) (meta []page.Meta, err error)
	DeletePageRevisions(ctx RequestContext, pageID string) (rows int64, err error)
	GetNextPageSequence(ctx RequestContext, documentID string) (maxSeq float64, err error)
}
