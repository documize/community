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
	"github.com/documize/community/model"
	"github.com/documize/community/model/workflow"
)

// Space defines a container for documents.
type Space struct {
	model.BaseEntity
	Name          string `json:"name"`
	Description   string `json:"desc"`
	OrgID         string `json:"orgId"`
	UserID        string `json:"userId"`
	LabelID       string `json:"labelId"`
	Type          Scope  `json:"spaceType"`
	CountCategory int    `json:"countCategory"`
	CountContent  int    `json:"countContent"`
	Icon          string `json:"icon"`

	// Lifecycle stores the default value all new documents are given upon creation.
	Lifecycle workflow.Lifecycle `json:"lifecycle"`

	// Likes stores the question to ask the user such as 'Did this help you?'.
	// An empty value tells us liking is not allowed.
	Likes string `json:"likes"`
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

// Viewer details who can see a particular space
type Viewer struct {
	Name      string `json:"name"`
	SpaceID   string `json:"spaceId"`
	Type      int    `json:"spaceType"`
	UserID    string `json:"userId"`
	Firstname string `json:"firstname"`
	Lastname  string `json:"lastname"`
	Email     string `json:"email"`
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
	Description    string `json:"desc"`
	LabelID        string `json:"labelId"`
	Icon           string `json:"icon"`
	CloneID        string `json:"cloneId"`        // existing space to clone, empty = no cloning
	CopyTemplate   bool   `json:"copyTemplate"`   // copy templates and reusable content blocks
	CopyPermission bool   `json:"copyPermission"` // copy uer permissions
	CopyDocument   bool   `json:"copyDocument"`   // copy all documents!
}
