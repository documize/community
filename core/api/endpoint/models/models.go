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

// Package models describes the communication format between JS snd Go.
// Models are not persisted entities - they are object models that are marshalled between the
// backend and the consumer (UI).
package models

import (
	"github.com/documize/community/core/api/entity"
)

// PageSequenceRequestModel details a page ID and its sequence within the document.
type PageSequenceRequestModel struct {
	PageID   string  `json:"pageId"`
	Sequence float64 `json:"sequence"`
}

// PageLevelRequestModel details a page ID and level.
type PageLevelRequestModel struct {
	PageID string `json:"pageId"`
	Level  int    `json:"level"`
}

// AuthenticationModel details authentication token and user details.
type AuthenticationModel struct {
	Token string      `json:"token"`
	User  entity.User `json:"user"`
}

// DocumentUploadModel details the job ID of an uploaded document.
type DocumentUploadModel struct {
	JobID string `json:"jobId"`
}

// FolderInvitationModel details which users have been invited to a folder.
type FolderInvitationModel struct {
	Message    string
	Recipients []string
}

// FolderRolesModel details which users have what permissions on a given folder.
type FolderRolesModel struct {
	Message string
	Roles   []entity.LabelRole
}

// AcceptSharedFolderModel is used to setup a user who has accepted a shared folder.
type AcceptSharedFolderModel struct {
	Serial    string `json:"serial"`
	Firstname string `json:"firstname"`
	Lastname  string `json:"lastname"`
	Password  string `json:"password"`
}

// PageModel contains the page and associated meta.
type PageModel struct {
	Page entity.Page     `json:"page"`
	Meta entity.PageMeta `json:"meta"`
}
