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

package store

import (
	"github.com/documize/community/domain"
	"github.com/documize/community/model/account"
	"github.com/documize/community/model/activity"
	"github.com/documize/community/model/attachment"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/block"
	"github.com/documize/community/model/category"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/group"
	"github.com/documize/community/model/label"
	"github.com/documize/community/model/link"
	"github.com/documize/community/model/org"
	"github.com/documize/community/model/page"
	"github.com/documize/community/model/permission"
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
	Category     CategoryStorer
	Document     DocumentStorer
	Group        GroupStorer
	Link         LinkStorer
	Label        LabelStorer
	Meta         MetaStorer
	Organization OrganizationStorer
	Page         PageStorer
	Pin          PinStorer
	Permission   PermissionStorer
	Search       SearchStorer
	Setting      SettingStorer
	Space        SpaceStorer
	User         UserStorer
	Onboard      OnboardStorer
}

// SpaceStorer defines required methods for space management
type SpaceStorer interface {
	Add(ctx domain.RequestContext, sp space.Space) (err error)
	Get(ctx domain.RequestContext, id string) (sp space.Space, err error)
	PublicSpaces(ctx domain.RequestContext, orgID string) (sp []space.Space, err error)
	GetViewable(ctx domain.RequestContext) (sp []space.Space, err error)
	Update(ctx domain.RequestContext, sp space.Space) (err error)
	Delete(ctx domain.RequestContext, id string) (rows int64, err error)
	AdminList(ctx domain.RequestContext) (sp []space.Space, err error)
	SetStats(ctx domain.RequestContext, spaceID string) (err error)
}

// CategoryStorer defines required methods for category and category membership management
type CategoryStorer interface {
	Add(ctx domain.RequestContext, c category.Category) (err error)
	Update(ctx domain.RequestContext, c category.Category) (err error)
	Get(ctx domain.RequestContext, id string) (c category.Category, err error)
	GetBySpace(ctx domain.RequestContext, spaceID string) (c []category.Category, err error)
	GetAllBySpace(ctx domain.RequestContext, spaceID string) (c []category.Category, err error)
	GetSpaceCategorySummary(ctx domain.RequestContext, spaceID string) (c []category.SummaryModel, err error)
	Delete(ctx domain.RequestContext, id string) (rows int64, err error)
	AssociateDocument(ctx domain.RequestContext, m category.Member) (err error)
	DisassociateDocument(ctx domain.RequestContext, categoryID, documentID string) (rows int64, err error)
	RemoveCategoryMembership(ctx domain.RequestContext, categoryID string) (rows int64, err error)
	DeleteBySpace(ctx domain.RequestContext, spaceID string) (rows int64, err error)
	GetDocumentCategoryMembership(ctx domain.RequestContext, documentID string) (c []category.Category, err error)
	GetSpaceCategoryMembership(ctx domain.RequestContext, spaceID string) (c []category.Member, err error)
	RemoveDocumentCategories(ctx domain.RequestContext, documentID string) (rows int64, err error)
	RemoveSpaceCategoryMemberships(ctx domain.RequestContext, spaceID string) (rows int64, err error)
	GetByOrg(ctx domain.RequestContext, userID string) (c []category.Category, err error)
	GetOrgCategoryMembership(ctx domain.RequestContext, userID string) (c []category.Member, err error)
}

// PermissionStorer defines required methods for space/document permission management
type PermissionStorer interface {
	AddPermission(ctx domain.RequestContext, r permission.Permission) (err error)
	AddPermissions(ctx domain.RequestContext, r permission.Permission, actions ...permission.Action) (err error)
	GetUserSpacePermissions(ctx domain.RequestContext, spaceID string) (r []permission.Permission, err error)
	GetSpacePermissionsForUser(ctx domain.RequestContext, spaceID, userID string) (r []permission.Permission, err error)
	GetSpacePermissions(ctx domain.RequestContext, spaceID string) (r []permission.Permission, err error)
	GetCategoryPermissions(ctx domain.RequestContext, catID string) (r []permission.Permission, err error)
	GetCategoryUsers(ctx domain.RequestContext, catID string) (u []user.User, err error)
	GetUserCategoryPermissions(ctx domain.RequestContext, userID string) (r []permission.Permission, err error)
	GetUserDocumentPermissions(ctx domain.RequestContext, documentID string) (r []permission.Permission, err error)
	GetDocumentPermissions(ctx domain.RequestContext, documentID string) (r []permission.Permission, err error)
	DeleteDocumentPermissions(ctx domain.RequestContext, documentID string) (rows int64, err error)
	DeleteSpacePermissions(ctx domain.RequestContext, spaceID string) (rows int64, err error)
	DeleteUserSpacePermissions(ctx domain.RequestContext, spaceID, userID string) (rows int64, err error)
	DeleteUserPermissions(ctx domain.RequestContext, userID string) (rows int64, err error)
	DeleteCategoryPermissions(ctx domain.RequestContext, categoryID string) (rows int64, err error)
	DeleteSpaceCategoryPermissions(ctx domain.RequestContext, spaceID string) (rows int64, err error)
	DeleteGroupPermissions(ctx domain.RequestContext, groupID string) (rows int64, err error)
}

// UserStorer defines required methods for user management
type UserStorer interface {
	Add(ctx domain.RequestContext, u user.User) (err error)
	Get(ctx domain.RequestContext, id string) (u user.User, err error)
	GetByDomain(ctx domain.RequestContext, domain, email string) (u user.User, err error)
	GetByEmail(ctx domain.RequestContext, email string) (u user.User, err error)
	GetByToken(ctx domain.RequestContext, token string) (u user.User, err error)
	GetBySerial(ctx domain.RequestContext, serial string) (u user.User, err error)
	GetActiveUsersForOrganization(ctx domain.RequestContext) (u []user.User, err error)
	GetUsersForOrganization(ctx domain.RequestContext, filter string, limit int) (u []user.User, err error)
	GetSpaceUsers(ctx domain.RequestContext, spaceID string) (u []user.User, err error)
	GetUsersForSpaces(ctx domain.RequestContext, spaces []string) (u []user.User, err error)
	UpdateUser(ctx domain.RequestContext, u user.User) (err error)
	UpdateUserPassword(ctx domain.RequestContext, userID, salt, password string) (err error)
	DeactiveUser(ctx domain.RequestContext, userID string) (err error)
	ForgotUserPassword(ctx domain.RequestContext, email, token string) (err error)
	CountActiveUsers() (c []domain.SubscriptionUserAccount)
	MatchUsers(ctx domain.RequestContext, text string, maxMatches int) (u []user.User, err error)
}

// AccountStorer defines required methods for account management
type AccountStorer interface {
	Add(ctx domain.RequestContext, account account.Account) (err error)
	GetUserAccount(ctx domain.RequestContext, userID string) (account account.Account, err error)
	GetUserAccounts(ctx domain.RequestContext, userID string) (t []account.Account, err error)
	GetAccountsByOrg(ctx domain.RequestContext) (t []account.Account, err error)
	DeleteAccount(ctx domain.RequestContext, ID string) (rows int64, err error)
	UpdateAccount(ctx domain.RequestContext, account account.Account) (err error)
	HasOrgAccount(ctx domain.RequestContext, orgID, userID string) bool
	CountOrgAccounts(ctx domain.RequestContext) int
}

// OrganizationStorer defines required methods for organization management
type OrganizationStorer interface {
	AddOrganization(ctx domain.RequestContext, org org.Organization) error
	GetOrganization(ctx domain.RequestContext, id string) (org org.Organization, err error)
	GetOrganizationByDomain(subdomain string) (org org.Organization, err error)
	UpdateOrganization(ctx domain.RequestContext, org org.Organization) (err error)
	DeleteOrganization(ctx domain.RequestContext, orgID string) (rows int64, err error)
	RemoveOrganization(ctx domain.RequestContext, orgID string) (err error)
	UpdateAuthConfig(ctx domain.RequestContext, org org.Organization) (err error)
	CheckDomain(ctx domain.RequestContext, domain string) string
	Logo(ctx domain.RequestContext, domain string) (l []byte, err error)
	UploadLogo(ctx domain.RequestContext, l []byte) (err error)
}

// PinStorer defines required methods for pin management
type PinStorer interface {
	Add(ctx domain.RequestContext, pin pin.Pin) (err error)
	GetPin(ctx domain.RequestContext, id string) (pin pin.Pin, err error)
	GetUserPins(ctx domain.RequestContext, userID string) (pins []pin.Pin, err error)
	UpdatePin(ctx domain.RequestContext, pin pin.Pin) (err error)
	UpdatePinSequence(ctx domain.RequestContext, pinID string, sequence int) (err error)
	DeletePin(ctx domain.RequestContext, id string) (rows int64, err error)
	DeletePinnedSpace(ctx domain.RequestContext, spaceID string) (rows int64, err error)
	DeletePinnedDocument(ctx domain.RequestContext, documentID string) (rows int64, err error)
}

// AuditStorer defines required methods for audit trails
type AuditStorer interface {
	// Record logs audit entry using own DB Transaction
	Record(ctx domain.RequestContext, t audit.EventType)
}

// DocumentStorer defines required methods for document handling
type DocumentStorer interface {
	Add(ctx domain.RequestContext, document doc.Document) (err error)
	Get(ctx domain.RequestContext, id string) (document doc.Document, err error)
	GetBySpace(ctx domain.RequestContext, spaceID string) (documents []doc.Document, err error)
	TemplatesBySpace(ctx domain.RequestContext, spaceID string) (documents []doc.Document, err error)
	PublicDocuments(ctx domain.RequestContext, orgID string) (documents []doc.SitemapDocument, err error)
	Update(ctx domain.RequestContext, document doc.Document) (err error)
	UpdateRevised(ctx domain.RequestContext, docID string) (err error)
	UpdateGroup(ctx domain.RequestContext, document doc.Document) (err error)
	ChangeDocumentSpace(ctx domain.RequestContext, document, space string) (err error)
	MoveDocumentSpace(ctx domain.RequestContext, id, move string) (err error)
	Delete(ctx domain.RequestContext, documentID string) (rows int64, err error)
	DeleteBySpace(ctx domain.RequestContext, spaceID string) (rows int64, err error)
	GetVersions(ctx domain.RequestContext, groupID string) (v []doc.Version, err error)
	MoveActivity(ctx domain.RequestContext, documentID, oldSpaceID, newSpaceID string) (err error)
	Pin(ctx domain.RequestContext, documentID string, seq int) (err error)
	Unpin(ctx domain.RequestContext, documentID string) (err error)
	PinSequence(ctx domain.RequestContext, spaceID string) (max int, err error)
	Pinned(ctx domain.RequestContext, spaceID string) (d []doc.Document, err error)
}

// SettingStorer defines required methods for persisting global and user level settings
type SettingStorer interface {
	Get(area, path string) (val string, err error)
	Set(area, value string) error
	GetUser(orgID, userID, area, path string) (val string, err error)
	SetUser(orgID, userID, area, json string) error
}

// AttachmentStorer defines required methods for persisting document attachments
type AttachmentStorer interface {
	Add(ctx domain.RequestContext, a attachment.Attachment) (err error)
	GetAttachment(ctx domain.RequestContext, orgID, attachmentID string) (a attachment.Attachment, err error)
	GetAttachments(ctx domain.RequestContext, docID string) (a []attachment.Attachment, err error)
	GetSectionAttachments(ctx domain.RequestContext, sectionID string) (a []attachment.Attachment, err error)
	GetAttachmentsWithData(ctx domain.RequestContext, docID string) (a []attachment.Attachment, err error)
	Delete(ctx domain.RequestContext, id string) (rows int64, err error)
	DeleteSection(ctx domain.RequestContext, id string) (rows int64, err error)
}

// LinkStorer defines required methods for persisting content links
type LinkStorer interface {
	Add(ctx domain.RequestContext, l link.Link) (err error)
	SearchCandidates(ctx domain.RequestContext, keywords string) (docs []link.Candidate, pages []link.Candidate, attachments []link.Candidate, err error)
	GetLink(ctx domain.RequestContext, linkID string) (l link.Link, err error)
	GetDocumentOutboundLinks(ctx domain.RequestContext, documentID string) (links []link.Link, err error)
	GetPageLinks(ctx domain.RequestContext, documentID, pageID string) (links []link.Link, err error)
	MarkOrphanDocumentLink(ctx domain.RequestContext, documentID string) (err error)
	MarkOrphanPageLink(ctx domain.RequestContext, pageID string) (err error)
	MarkOrphanAttachmentLink(ctx domain.RequestContext, attachmentID string) (err error)
	DeleteSourcePageLinks(ctx domain.RequestContext, pageID string) (rows int64, err error)
	DeleteSourceDocumentLinks(ctx domain.RequestContext, documentID string) (rows int64, err error)
	DeleteLink(ctx domain.RequestContext, id string) (rows int64, err error)
}

// ActivityStorer defines required methods for persisting document activity
type ActivityStorer interface {
	RecordUserActivity(ctx domain.RequestContext, activity activity.UserActivity)
	GetDocumentActivity(ctx domain.RequestContext, id string) (a []activity.DocumentActivity, err error)
	DeleteDocumentChangeActivity(ctx domain.RequestContext, id string) (rows int64, err error)
}

// SearchStorer defines required methods for persisting search queries
type SearchStorer interface {
	IndexDocument(ctx domain.RequestContext, doc doc.Document, a []attachment.Attachment) (err error)
	DeleteDocument(ctx domain.RequestContext, ID string) (err error)
	IndexContent(ctx domain.RequestContext, p page.Page) (err error)
	DeleteContent(ctx domain.RequestContext, pageID string) (err error)
	Documents(ctx domain.RequestContext, q search.QueryOptions) (results []search.QueryResult, err error)
}

// Indexer defines required methods for managing search indexing process
type Indexer interface {
	IndexDocument(ctx domain.RequestContext, d doc.Document, a []attachment.Attachment)
	DeleteDocument(ctx domain.RequestContext, ID string)
	IndexContent(ctx domain.RequestContext, p page.Page)
	DeleteContent(ctx domain.RequestContext, pageID string)
}

// BlockStorer defines required methods for persisting reusable content blocks
type BlockStorer interface {
	Add(ctx domain.RequestContext, b block.Block) (err error)
	Get(ctx domain.RequestContext, id string) (b block.Block, err error)
	GetBySpace(ctx domain.RequestContext, spaceID string) (b []block.Block, err error)
	IncrementUsage(ctx domain.RequestContext, id string) (err error)
	DecrementUsage(ctx domain.RequestContext, id string) (err error)
	RemoveReference(ctx domain.RequestContext, id string) (err error)
	Update(ctx domain.RequestContext, b block.Block) (err error)
	Delete(ctx domain.RequestContext, id string) (rows int64, err error)
}

// PageStorer defines required methods for persisting document pages
type PageStorer interface {
	Add(ctx domain.RequestContext, model page.NewPage) (err error)
	Get(ctx domain.RequestContext, pageID string) (p page.Page, err error)
	GetPages(ctx domain.RequestContext, documentID string) (p []page.Page, err error)
	GetUnpublishedPages(ctx domain.RequestContext, documentID string) (p []page.Page, err error)
	GetPagesWithoutContent(ctx domain.RequestContext, documentID string) (pages []page.Page, err error)
	Update(ctx domain.RequestContext, page page.Page, refID, userID string, skipRevision bool) (err error)
	Delete(ctx domain.RequestContext, documentID, pageID string) (rows int64, err error)
	GetPageMeta(ctx domain.RequestContext, pageID string) (meta page.Meta, err error)
	GetDocumentPageMeta(ctx domain.RequestContext, documentID string, externalSourceOnly bool) (meta []page.Meta, err error)
	UpdateMeta(ctx domain.RequestContext, meta page.Meta, updateUserID bool) (err error)
	UpdateSequence(ctx domain.RequestContext, documentID, pageID string, sequence float64) (err error)
	UpdateLevel(ctx domain.RequestContext, documentID, pageID string, level int) (err error)
	UpdateLevelSequence(ctx domain.RequestContext, documentID, pageID string, level int, sequence float64) (err error)
	GetNextPageSequence(ctx domain.RequestContext, documentID string) (maxSeq float64, err error)
	GetPageRevision(ctx domain.RequestContext, revisionID string) (revision page.Revision, err error)
	GetPageRevisions(ctx domain.RequestContext, pageID string) (revisions []page.Revision, err error)
	GetDocumentRevisions(ctx domain.RequestContext, documentID string) (revisions []page.Revision, err error)
	DeletePageRevisions(ctx domain.RequestContext, pageID string) (rows int64, err error)
}

// GroupStorer defines required methods for persisting user groups and memberships
type GroupStorer interface {
	Add(ctx domain.RequestContext, g group.Group) (err error)
	Get(ctx domain.RequestContext, refID string) (g group.Group, err error)
	GetAll(ctx domain.RequestContext) (g []group.Group, err error)
	Update(ctx domain.RequestContext, g group.Group) (err error)
	Delete(ctx domain.RequestContext, refID string) (rows int64, err error)
	GetGroupMembers(ctx domain.RequestContext, groupID string) (m []group.Member, err error)
	GetMembers(ctx domain.RequestContext) (r []group.Record, err error)
	JoinGroup(ctx domain.RequestContext, groupID, userID string) (err error)
	LeaveGroup(ctx domain.RequestContext, groupID, userID string) (err error)
	RemoveUserGroups(ctx domain.RequestContext, userID string) (err error)
}

// MetaStorer provide specialist methods for global administrators.
type MetaStorer interface {
	Documents(ctx domain.RequestContext) (documents []string, err error)
	Document(ctx domain.RequestContext, documentID string) (d doc.Document, err error)
	Pages(ctx domain.RequestContext, documentID string) (p []page.Page, err error)
	Attachments(ctx domain.RequestContext, docID string) (a []attachment.Attachment, err error)
	SearchIndexCount(ctx domain.RequestContext) (c int, err error)
}

// LabelStorer defines required methods for space label management
type LabelStorer interface {
	Add(ctx domain.RequestContext, l label.Label) (err error)
	Get(ctx domain.RequestContext) (l []label.Label, err error)
	Update(ctx domain.RequestContext, l label.Label) (err error)
	Delete(ctx domain.RequestContext, id string) (rows int64, err error)
	RemoveReference(ctx domain.RequestContext, labelID string) (err error)
}

// OnboardStorer defines required methods for enterprise customer onboarding process.
type OnboardStorer interface {
	ContentCounts(orgID string) (spaces, docs int)
}
