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

// Package eventing records and propagates events based on user actions.
package audit

import "time"

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
	EventTypeCategoryAdd        EventType = "added-category"
	EventTypeCategoryDelete     EventType = "removed-category"
	EventTypeCategoryUpdate     EventType = "updated-category"
	EventTypeCategoryLink       EventType = "linked-category"
	EventTypeCategoryUnlink     EventType = "unlinked-category"
)
