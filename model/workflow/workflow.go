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

package workflow

// Protection tell us how to handle data item changes
type Protection int

const (
	// ProtectionNone means no protection so data item changes are permitted
	ProtectionNone Protection = 0

	// ProtectionLock means no data itme changes
	ProtectionLock Protection = 1

	// ProtectionReview means changes must be reviewed and approved
	ProtectionReview Protection = 2
)

// Approval tells us how some data item change is to be approved
type Approval int

const (
	// ApprovalNone means no approval necessary
	ApprovalNone Approval = 0

	// ApprovalAnybody can approve data item change
	ApprovalAnybody Approval = 1

	// ApprovalMajority must approve data item change
	ApprovalMajority Approval = 2

	// ApprovalUnanimous approval must be given for data item change
	ApprovalUnanimous Approval = 3
)

// ChangeStatus tells us the state of a data item
type ChangeStatus int

const (
	// ChangePublished means data item is visible all
	ChangePublished ChangeStatus = 0

	// ChangePending means data item is still being edited and not yet requesting review
	ChangePending ChangeStatus = 1

	// ChangeUnderReview means data item is being reviewed
	// Next step would be to mark data item as either
	// Published or Rejected
	ChangeUnderReview ChangeStatus = 2

	// ChangeRejected means data item was not approved for publication
	ChangeRejected ChangeStatus = 3

	// ChangePendingNew means a new section to a document is pending review
	ChangePendingNew ChangeStatus = 4
)

// Lifecycle tells us if document is in Draft, Live, Archived
type Lifecycle int

const (
	// LifecycleDraft means document is in draft mode with restricted viewing
	LifecycleDraft Lifecycle = 0

	// LifecycleLive means document can be seen by all
	LifecycleLive Lifecycle = 1

	// LifecycleArchived means document has been archived
	LifecycleArchived Lifecycle = 2
)
