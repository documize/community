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

// Package space handles API calls and persistence for spaces.
// Spaces in Documize contain documents.
package space

import (
	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
}

// Space defines a container for documents.
type Space struct {
	domain.BaseEntity
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

// Role determines user permissions for a folder.
type Role struct {
	domain.BaseEntityObfuscated
	OrgID   string `json:"-"`
	LabelID string `json:"folderId"`
	UserID  string `json:"userId"`
	CanView bool   `json:"canView"`
	CanEdit bool   `json:"canEdit"`
}

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
	Message string
	Roles   []Role
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
