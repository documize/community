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

package space

// PermissionRecord represents space permissions for a user on a space.
// This data structure is made from database permission records for the space,
// and it is designed to be sent to HTTP clients (web, mobile).
type PermissionRecord struct {
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
func DecodeUserPermissions(perm []Permission) (r PermissionRecord) {
	r = PermissionRecord{}

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

// EncodeUserPermissions returns multiple user permission records
// for a given space, using flat permission summary record.
func EncodeUserPermissions(r PermissionRecord) (perm []Permission) {
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
func HasAnyPermission(p PermissionRecord) bool {
	return p.SpaceView || p.SpaceManage || p.SpaceOwner || p.DocumentAdd || p.DocumentEdit ||
		p.DocumentDelete || p.DocumentMove || p.DocumentCopy || p.DocumentTemplate
}

// EncodeRecord creates standard permission record representing user permissions for a space.
func EncodeRecord(r PermissionRecord, a PermissionAction) (p Permission) {
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
