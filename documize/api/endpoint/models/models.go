package models

// Models are not persisted entities - they are object models that are marshalled between the
// backend and the consumer (UI)

import (
	"github.com/documize/community/documize/api/entity"
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
