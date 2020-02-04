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

// Package audit records and propagates events based on user actions.
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
	EventTypeDocumentAdd               EventType = "added-document"
	EventTypeDocumentUpload            EventType = "uploaded-document"
	EventTypeDocumentView              EventType = "viewed-document"
	EventTypeDocumentUpdate            EventType = "updated-document"
	EventTypeDocumentDelete            EventType = "removed-document"
	EventTypeDocumentRevisions         EventType = "viewed-document-revisions"
	EventTypeDocumentPermission        EventType = "changed-document-permissions"
	EventTypeSpaceAdd                  EventType = "added-space"
	EventTypeSpaceUpdate               EventType = "updated-space"
	EventTypeSpaceDelete               EventType = "removed-space"
	EventTypeSpacePermission           EventType = "changed-space-permissions"
	EventTypeSpaceJoin                 EventType = "joined-space"
	EventTypeSpaceInvite               EventType = "invited-space"
	EventTypeCategoryPermission        EventType = "changed-category-permissions"
	EventTypeSectionAdd                EventType = "added-document-section"
	EventTypeSectionUpdate             EventType = "updated-document-section"
	EventTypeSectionDelete             EventType = "removed-document-section"
	EventTypeSectionRollback           EventType = "rolled-back-document-section"
	EventTypeSectionResequence         EventType = "resequenced-document-section"
	EventTypeSectionCopy               EventType = "copied-document-section"
	EventTypeAttachmentAdd             EventType = "added-attachment"
	EventTypeAttachmentDownload        EventType = "downloaded-attachment"
	EventTypeAttachmentDelete          EventType = "removed-attachment"
	EventTypePinAdd                    EventType = "added-pin"
	EventTypePinDelete                 EventType = "removed-pin"
	EventTypePinResequence             EventType = "resequenced-pin"
	EventTypeBlockAdd                  EventType = "added-reusable-block"
	EventTypeBlockUpdate               EventType = "updated-reusable-block"
	EventTypeBlockDelete               EventType = "removed-reusable-block"
	EventTypeTemplateAdd               EventType = "added-document-template"
	EventTypeTemplateUse               EventType = "used-document-template"
	EventTypeUserAdd                   EventType = "added-user"
	EventTypeUserUpdate                EventType = "updated-user"
	EventTypeUserDelete                EventType = "removed-user"
	EventTypeUserPasswordReset         EventType = "reset-user-password"
	EventTypeAccountAdd                EventType = "added-account"
	EventTypeSystemLicense             EventType = "changed-system-license"
	EventTypeSystemAuth                EventType = "changed-system-auth"
	EventTypeSystemSMTP                EventType = "changed-system-smtp"
	EventTypeSessionStart              EventType = "started-session"
	EventTypeSearch                    EventType = "searched"
	EventTypeCategoryAdd               EventType = "added-category"
	EventTypeCategoryDelete            EventType = "removed-category"
	EventTypeCategoryUpdate            EventType = "updated-category"
	EventTypeCategoryLink              EventType = "linked-category"
	EventTypeCategoryUnlink            EventType = "unlinked-category"
	EventTypeGroupAdd                  EventType = "added-group"
	EventTypeGroupDelete               EventType = "removed-group"
	EventTypeGroupUpdate               EventType = "updated-group"
	EventTypeGroupJoin                 EventType = "joined-group"
	EventTypeGroupLeave                EventType = "left-group"
	EventTypeSecureShare               EventType = "shared-secure-document"
	EventTypeFeedbackAdd               EventType = "added-feedback"
	EventTypeFeedbackEdit              EventType = "edited-feedback"
	EventTypePDF                       EventType = "generated-pdf"
	EventTypeActionAdd                 EventType = "added-action"
	EventTypeActionUpdate              EventType = "updated-action"
	EventTypeActionView                EventType = "viewed-actions"
	EventTypeActionDelete              EventType = "removed-action"
	EventTypeWorkflowApprovalRequested EventType = "request-approval"
	EventTypeWorkflowApprovalWithdrawn EventType = "withdrew-approval"
	EventTypeWorkflowDiscardChanges    EventType = "discarded-changes"
	EventTypeWorkflowApprovedChange    EventType = "approved-change"
	EventTypeWorkflowRejectedChange    EventType = "rejected-change"
	EventTypeWorkflowPublishRequested  EventType = "requested-publication"
	EventTypeDatabaseBackup            EventType = "backedup-database"
	EventTypeDatabaseRestore           EventType = "restored-database"
	EventTypeAssumedSpaceOwnership     EventType = "assumed-space-ownership"
	EventTypeLabelAdd                  EventType = "added-label"
	EventTypeLabelUpdate               EventType = "updated-label"
	EventTypeLabelDelete               EventType = "removed-label"
	EventTypeOrganizationLogo          EventType = "uploaded-logo"
	EventTypeDocPinAdd                 EventType = "pinned-document"
	EventTypeDocPinRemove              EventType = "unpinned-document"
	EventTypeDocPinChange              EventType = "resequenced-document"

	// EventTypeVersionAdd records addition of version
	EventTypeVersionAdd EventType = "added-version"

	// EventTypeVersionRemove records removal of version
	EventTypeVersionRemove EventType = "removed-version"

	// EventTypeVersionUnversion records disassociation of document from versioning group
	EventTypeVersionUnversion EventType = "un-versioned-document"

	// EventTypeVersionReorder records reordering of versions
	EventTypeVersionReorder EventType = "reordered-version"
)
