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

package permission

import "time"

// Permission represents a permission for a space and is persisted to the database.
type Permission struct {
	ID       uint64    `json:"id"`
	OrgID    string    `json:"orgId"`
	Who      string    `json:"who"`      // user, role
	WhoID    string    `json:"whoId"`    // either a user or role ID
	Action   Action    `json:"action"`   // view, edit, delete
	Scope    string    `json:"scope"`    // object, table
	Location string    `json:"location"` // table name
	RefID    string    `json:"refId"`    // id of row in table / blank when scope=table
	Created  time.Time `json:"created"`
}

// Action details type of action
type Action string

const (
	// SpaceView action means you can view a space and documents therein
	SpaceView Action = "view"

	// SpaceManage action means you can add, remove users, set permissions, but not delete that space
	SpaceManage Action = "manage"

	// SpaceOwner action means you can delete a space and do all SpaceManage functions
	SpaceOwner Action = "own"

	// DocumentAdd action means you can create/upload documents to a space
	DocumentAdd Action = "doc-add"

	// DocumentEdit action means you can edit documents in a space
	DocumentEdit Action = "doc-edit"

	// DocumentDelete means you can delete documents in a space
	DocumentDelete Action = "doc-delete"

	// DocumentMove means you can move documents between spaces
	DocumentMove Action = "doc-move"

	// DocumentCopy means you can copy documents within and between spaces
	DocumentCopy Action = "doc-copy"

	// DocumentTemplate means you can create, edit and delete document templates and content blocks
	DocumentTemplate Action = "doc-template"

	// DocumentApprove means you can approve a change to a document
	DocumentApprove Action = "doc-approve"

	// CategoryView action means you can view a category and documents therein
	CategoryView Action = "view"
)

// ContainsPermission checks if action matches one of the required actions?
func ContainsPermission(action Action, actions ...Action) bool {
	for _, a := range actions {
		if action == a {
			return true
		}
	}

	return false
}
