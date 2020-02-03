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

package activity

import "time"

// UserActivity represents an activity undertaken by a user.
type UserActivity struct {
	ID           uint64     `json:"id"`
	OrgID        string     `json:"orgId"`
	UserID       string     `json:"userId"`
	SpaceID      string     `json:"spaceId"`
	DocumentID   string     `json:"documentId"`
	SectionID    string     `json:"pageId"`
	ActivityType Type       `json:"activityType"`
	SourceType   SourceType `json:"sourceType"`
	Metadata     string     `json:"metadata"`
	Created      time.Time  `json:"created"`

	// Read-only outbound fields (e.g. for UI display)
	SourceName string `json:"sourceName"`
}

// DocumentActivity represents an activity taken against a document.
type DocumentActivity struct {
	ID           uint64    `json:"id"`
	OrgID        string    `json:"orgId"`
	SpaceID      string    `json:"spaceId"`
	DocumentID   string    `json:"documentId"`
	SectionID    string    `json:"pageId"`
	SectionName  string    `json:"pageTitle"`
	UserID       string    `json:"userId"`
	Firstname    string    `json:"firstname"`
	Lastname     string    `json:"lastname"`
	ActivityType int       `json:"activityType"`
	Metadata     string    `json:"metadata"`
	Created      time.Time `json:"created"`
}

// SourceType details where the activity occured.
type SourceType int

// Type determines type of user activity
type Type int

const (
	// SourceTypeSpace indicates activity against a space.
	SourceTypeSpace SourceType = 1

	// SourceTypeDocument indicates activity against a document.
	SourceTypeDocument SourceType = 2

	// SourceTypePage indicates activity against a document page.
	SourceTypePage SourceType = 3

	// SourceTypeSearch indicates activity on search page.
	SourceTypeSearch SourceType = 4
)

const (
	// TypeCreated records user object creation (document or space).
	TypeCreated Type = 1

	// TypeRead states user has consumed object (document or space).
	TypeRead Type = 2

	// TypeEdited states user has editing document.
	TypeEdited Type = 3

	// TypeDeleted records user deleting space/document.
	TypeDeleted Type = 4

	// TypeArchived records user archiving space/document.
	TypeArchived Type = 5

	// TypeApproved records user approval of document.
	TypeApproved Type = 6

	// TypeReverted records user content roll-back to previous document version.
	TypeReverted Type = 7

	// TypePublishedTemplate records user creating new document template.
	TypePublishedTemplate Type = 8

	// TypePublishedBlock records user creating reusable content block.
	TypePublishedBlock Type = 9

	// TypeCommented records user providing document feedback.
	TypeCommented Type = 10

	// TypeRejected records user rejecting document.
	TypeRejected Type = 11

	// TypeSentSecureLink records user sending secure document link via email.
	TypeSentSecureLink Type = 12

	// TypeDraft records user marking space/document as draft.
	TypeDraft Type = 13

	// TypeVersioned records user creating new document version.
	TypeVersioned Type = 14

	// TypeSearched records user performing document keyword search.
	// Metadata field should contain search terms.
	TypeSearched Type = 15

	// TypePublished happens when a document is moved from Draft to Live.
	TypePublished Type = 16

	// TypePinned happens when a document is pinned within space.
	TypePinned Type = 17

	// TypeUnpinned happens when a document is no longer pinned inside a space.
	TypeUnpinned Type = 18

	// TypePinSequence is when the order of sequenced documents is changed.
	TypePinSequence Type = 19
)

// TypeName returns one-work descriptor for activity type
func TypeName(t Type) string {
	switch t {
	case TypeCreated:
		return "Add"
	case TypeRead:
		return "View"
	case TypeEdited:
		return "Edit"
	case TypeDeleted:
		return "Delete"
	case TypeArchived:
		return "Archive"
	case TypeApproved:
		return "Approve"
	case TypeReverted:
		return "Revert"
	case TypePublishedTemplate:
		return "Publish"
	case TypePublishedBlock:
		return "Publish"
	case TypeCommented:
		return "Comment"
	case TypeRejected:
		return "Reject"
	case TypeSentSecureLink:
		return "Share"
	case TypeDraft:
		return "Draft"
	case TypeVersioned:
		return "Version"
	case TypeSearched:
		return "Search"
	case TypePublished:
		return "Publish"
	case TypePinned:
		return "Pinned"
	case TypeUnpinned:
		return "Unpinned"
	case TypePinSequence:
		return "Sequence"
	}

	return ""
}
