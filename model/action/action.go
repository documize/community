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

package action

import (
	"time"

	"github.com/documize/community/core/timeutil"
	"github.com/documize/community/model"
)

// UserAction represents an action that a user should perform on a document.
type UserAction struct {
	model.BaseEntity
	OrgID       string            `json:"orgId"`
	DocumentID  string            `json:"documentId"`
	UserID      string            `json:"userId"`
	ActionType  Type              `json:"actionType"`
	RefType     string            `json:"refType"`   // page or attachment
	RefTypeID   string            `json:"refTypeId"` // page or attachment ID
	Note        string            `json:"note"`
	RequestorID string            `json:"requestorId"`
	Requested   time.Time         `json:"requestedDate"`
	Due         time.Time         `json:"dueDate"`
	Completed   timeutil.NullTime `json:"completedDate"`
	IsComplete  bool              `json:"isComplete"`
}

// Type determines type of action that has been requested of a user
type Type int

const (
	// ActionTypeRead document
	ActionTypeRead Type = 1

	// ActionTypeFeedback for a document
	ActionTypeFeedback Type = 2

	// ActionTypeContribute to document
	ActionTypeContribute Type = 3

	// ActionTypeApprovalRequest for a section change
	ActionTypeApprovalRequest Type = 4

	// ActionTypeApproved section change
	ActionTypeApproved Type = 5

	// ActionTypeRejected section change
	ActionTypeRejected Type = 6

	// ActionTypePublish content as Live
	ActionTypePublish Type = 7
)
