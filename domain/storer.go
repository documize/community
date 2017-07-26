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
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/org"
	"github.com/documize/community/model/pin"
	"github.com/documize/community/model/space"
	"github.com/documize/community/model/user"
)

// Store provides access to data store (database)
type Store struct {
	Space        SpaceStorer
	User         UserStorer
	Account      AccountStorer
	Organization OrganizationStorer
	Pin          PinStorer
	Audit        AuditStorer
	Document     DocumentStorer
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
	GetOrganizationByDomain(ctx RequestContext, subdomain string) (org org.Organization, err error)
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
	MoveDocumentSpace(ctx RequestContext, id, move string) (err error)
}

// https://github.com/golang-sql/sqlexp/blob/c2488a8be21d20d31abf0d05c2735efd2d09afe4/quoter.go#L46
