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

package space

import (
	"time"

	"github.com/documize/community/model"
)

// Space defines a container for documents.
type Space struct {
	model.BaseEntity
	Name   string `json:"name"`
	OrgID  string `json:"orgId"`
	UserID string `json:"userId"`
	Type   Scope  `json:"folderType"`
}

// Scope determines folder visibility.
type Scope int

const (
	// ScopePublic can be seen by anyone
	ScopePublic Scope = 1

	// ScopePrivate can only be seen by the person who owns it
	ScopePrivate Scope = 2

	// ScopeRestricted can be seen by selected users
	ScopeRestricted Scope = 3
)

// IsPublic means the folder can be seen by anyone.
func (l *Space) IsPublic() bool {
	return l.Type == ScopePublic
}

// IsPrivate means the folder can only be seen by the person who owns it.
func (l *Space) IsPrivate() bool {
	return l.Type == ScopePrivate
}

// IsRestricted means the folder can be seen by selected users.
func (l *Space) IsRestricted() bool {
	return l.Type == ScopeRestricted
}

// Permission represents a permission for a space and is persisted to the database.
type Permission struct {
	ID       uint64           `json:"id"`
	OrgID    string           `json:"-"`
	Who      string           `json:"who"`      // user, role
	WhoID    string           `json:"whoId"`    // either a user or role ID
	Action   PermissionAction `json:"action"`   // view, edit, delete
	Scope    string           `json:"scope"`    // object, table
	Location string           `json:"location"` // table name
	RefID    string           `json:"refId"`    // id of row in table / blank when scope=table
	Created  time.Time        `json:"created"`
}

// PermissionAction details type of action
type PermissionAction string

const (
	// SpaceView action means you can view a space and documents therein
	SpaceView PermissionAction = "view"
	// SpaceManage action means you can add, remove users, set permissions, but not delete that space
	SpaceManage PermissionAction = "manage"
	// SpaceOwner action means you can delete a space and do all SpaceManage functions
	SpaceOwner PermissionAction = "own"

	// DocumentAdd action means you can create/upload documents to a space
	DocumentAdd PermissionAction = "doc-add"
	// DocumentEdit action means you can edit documents in a space
	DocumentEdit PermissionAction = "doc-edit"
	// DocumentDelete means you can delete documents in a space
	DocumentDelete PermissionAction = "doc-delete"
	// DocumentMove means you can move documents between spaces
	DocumentMove PermissionAction = "doc-move"
	// DocumentCopy means you can copy documents within and between spaces
	DocumentCopy PermissionAction = "doc-copy"
	// DocumentTemplate means you can create, edit and delete document templates and content blocks
	DocumentTemplate PermissionAction = "doc-template"
)

// Viewer details who can see a particular space
type Viewer struct {
	Name      string `json:"name"`
	LabelID   string `json:"folderId"`
	Type      int    `json:"folderType"`
	UserID    string `json:"userId"`
	Firstname string `json:"firstname"`
	Lastname  string `json:"lastname"`
	Email     string `json:"email"`
}

// RolesModel details which users have what permissions on a given space.
type RolesModel struct {
	Message     string
	Permissions []Permission
}

// AcceptShareModel is used to setup a user who has accepted a shared space.
type AcceptShareModel struct {
	Serial    string `json:"serial"`
	Firstname string `json:"firstname"`
	Lastname  string `json:"lastname"`
	Password  string `json:"password"`
}

// InvitationModel details which users have been invited to a space.
type InvitationModel struct {
	Message    string
	Recipients []string
}

// NewSpaceRequest details the new space to create.
type NewSpaceRequest struct {
	Name           string `json:"name"`
	CloneID        string `json:"cloneID"`        // existing space to clone, empty = no cloning
	CopyTemplate   bool   `json:"copyTemplate"`   // copy templates and reusable content blocks
	CopyPermission bool   `json:"copyPermission"` // copy uer permissions
	CopyDocument   bool   `json:"copyDocument"`   // copy all documents!
}

// HasPermission checks if action matches one of the required actions?
func HasPermission(action PermissionAction, actions ...PermissionAction) bool {
	for _, a := range actions {
		if action == a {
			return true
		}
	}

	return false
}
