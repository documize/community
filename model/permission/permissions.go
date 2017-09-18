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
	OrgID    string    `json:"-"`
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
)

// Record represents space permissions for a user on a space.
// This data structure is made from database permission records for the space,
// and it is designed to be sent to HTTP clients (web, mobile).
type Record struct {
	OrgID            string `json:"orgId"`
	SpaceID          string `json:"folderId"`
	UserID           string `json:"userId"`
	SpaceView        bool   `json:"spaceView"`
	SpaceManage      bool   `json:"spaceManage"`
	SpaceOwner       bool   `json:"spaceOwner"`
	DocumentAdd      bool   `json:"documentAdd"`
	DocumentEdit     bool   `json:"documentEdit"`
	DocumentDelete   bool   `json:"documentDelete"`
	DocumentMove     bool   `json:"documentMove"`
	DocumentCopy     bool   `json:"documentCopy"`
	DocumentTemplate bool   `json:"documentTemplate"`
}

// DecodeUserPermissions returns a flat, usable permission summary record
// from multiple user permission records for a given space.
func DecodeUserPermissions(perm []Permission) (r Record) {
	r = Record{}

	if len(perm) > 0 {
		r.OrgID = perm[0].OrgID
		r.UserID = perm[0].WhoID
		r.SpaceID = perm[0].RefID
	}

	for _, p := range perm {
		switch p.Action {
		case SpaceView:
			r.SpaceView = true
		case SpaceManage:
			r.SpaceManage = true
		case SpaceOwner:
			r.SpaceOwner = true

		case DocumentAdd:
			r.DocumentAdd = true
		case DocumentEdit:
			r.DocumentEdit = true
		case DocumentDelete:
			r.DocumentDelete = true
		case DocumentMove:
			r.DocumentMove = true
		case DocumentCopy:
			r.DocumentCopy = true
		case DocumentTemplate:
			r.DocumentTemplate = true
		}
	}

	return
}

// PermissionsModel details which users have what permissions on a given space.
type PermissionsModel struct {
	Message     string
	Permissions []Record
}

// HasPermission checks if action matches one of the required actions?
func HasPermission(action Action, actions ...Action) bool {
	for _, a := range actions {
		if action == a {
			return true
		}
	}

	return false
}

// EncodeUserPermissions returns multiple user permission records
// for a given space, using flat permission summary record.
func EncodeUserPermissions(r Record) (perm []Permission) {
	if r.SpaceView {
		perm = append(perm, EncodeRecord(r, SpaceView))
	}
	if r.SpaceManage {
		perm = append(perm, EncodeRecord(r, SpaceManage))
	}
	if r.SpaceOwner {
		perm = append(perm, EncodeRecord(r, SpaceOwner))
	}

	if r.DocumentAdd {
		perm = append(perm, EncodeRecord(r, DocumentAdd))
	}
	if r.DocumentEdit {
		perm = append(perm, EncodeRecord(r, DocumentEdit))
	}
	if r.DocumentDelete {
		perm = append(perm, EncodeRecord(r, DocumentDelete))
	}
	if r.DocumentMove {
		perm = append(perm, EncodeRecord(r, DocumentMove))
	}
	if r.DocumentCopy {
		perm = append(perm, EncodeRecord(r, DocumentCopy))
	}
	if r.DocumentTemplate {
		perm = append(perm, EncodeRecord(r, DocumentTemplate))
	}

	return
}

// HasAnyPermission returns true if user has at least one permission.
func HasAnyPermission(p Record) bool {
	return p.SpaceView || p.SpaceManage || p.SpaceOwner || p.DocumentAdd || p.DocumentEdit ||
		p.DocumentDelete || p.DocumentMove || p.DocumentCopy || p.DocumentTemplate
}

// EncodeRecord creates standard permission record representing user permissions for a space.
func EncodeRecord(r Record, a Action) (p Permission) {
	p = Permission{}
	p.OrgID = r.OrgID
	p.Who = "user"
	p.WhoID = r.UserID
	p.Location = "space"
	p.RefID = r.SpaceID
	p.Action = a
	p.Scope = "object" // default to row level permission

	return
}
