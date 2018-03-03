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

// DocumentRecord represents space permissions for a user on a document.
// This data structure is made from database permission records for the document,
// and it is designed to be sent to HTTP clients (web, mobile).
type DocumentRecord struct {
	OrgID               string  `json:"orgId"`
	DocumentID          string  `json:"documentId"`
	WhoID               string  `json:"whoId"`
	Who                 WhoType `json:"who"`
	DocumentRoleEdit    bool    `json:"documentRoleEdit"`
	DocumentRoleApprove bool    `json:"documentRoleApprove"`
}

// DecodeUserDocumentPermissions returns a flat, usable permission summary record
// from multiple user permission records for a given document.
func DecodeUserDocumentPermissions(perm []Permission) (r DocumentRecord) {
	r = DocumentRecord{}

	if len(perm) > 0 {
		r.OrgID = perm[0].OrgID
		r.WhoID = perm[0].WhoID
		r.Who = perm[0].Who
		r.DocumentID = perm[0].RefID
	}

	for _, p := range perm {
		switch p.Action {
		case DocumentEdit:
			r.DocumentRoleEdit = true
		case DocumentApprove:
			r.DocumentRoleApprove = true
		}
	}

	return
}

// EncodeUserDocumentPermissions returns multiple user permission records
// for a given document, using flat permission summary record.
func EncodeUserDocumentPermissions(r DocumentRecord) (perm []Permission) {
	if r.DocumentRoleEdit {
		perm = append(perm, EncodeDocumentRecord(r, DocumentEdit))
	}
	if r.DocumentRoleApprove {
		perm = append(perm, EncodeDocumentRecord(r, DocumentApprove))
	}

	return
}

// HasAnyDocumentPermission returns true if user has at least one permission.
func HasAnyDocumentPermission(p DocumentRecord) bool {
	return p.DocumentRoleEdit || p.DocumentRoleApprove
}

// EncodeDocumentRecord creates standard permission record representing user permissions for a document.
func EncodeDocumentRecord(r DocumentRecord, a Action) (p Permission) {
	p = Permission{}
	p.OrgID = r.OrgID
	p.WhoID = r.WhoID
	p.Who = r.Who
	p.Location = LocationDocument
	p.RefID = r.DocumentID
	p.Action = a
	p.Scope = ScopeRow

	return
}
