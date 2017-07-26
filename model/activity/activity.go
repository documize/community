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
	ID           uint64     `json:"-"`
	OrgID        string     `json:"orgId"`
	UserID       string     `json:"userId"`
	LabelID      string     `json:"folderId"`
	SourceID     string     `json:"sourceId"`
	SourceName   string     `json:"sourceName"` // e.g. Document or Space name
	SourceType   SourceType `json:"sourceType"`
	ActivityType Type       `json:"activityType"`
	Created      time.Time  `json:"created"`
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
)

const (
	// TypeCreated records user document creation
	TypeCreated Type = 1

	// TypeRead states user has read document
	TypeRead Type = 2

	// TypeEdited states user has editing document
	TypeEdited Type = 3

	// TypeDeleted records user deleting space/document
	TypeDeleted Type = 4

	// TypeArchived records user archiving space/document
	TypeArchived Type = 5

	// TypeApproved records user approval of document
	TypeApproved Type = 6

	// TypeReverted records user content roll-back to previous version
	TypeReverted Type = 7

	// TypePublishedTemplate records user creating new document template
	TypePublishedTemplate Type = 8

	// TypePublishedBlock records user creating reusable content block
	TypePublishedBlock Type = 9

	// TypeFeedback records user providing document feedback
	TypeFeedback Type = 10
)
