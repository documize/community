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

// CategoryRecord represents space permissions for a user on a category.
// This data structure is made from database permission records for the category,
// and it is designed to be sent to HTTP clients (web, mobile).
type CategoryRecord struct {
	OrgID        string  `json:"orgId"`
	CategoryID   string  `json:"categoryId"`
	WhoID        string  `json:"whoId"`
	Who          WhoType `json:"who"`
	CategoryView bool    `json:"categoryView"`
	Name         string  `json:"name"` // read-only, user or group name
}

// DecodeUserCategoryPermissions returns a flat, usable permission summary record
// from multiple user permission records for a given category.
func DecodeUserCategoryPermissions(perm []Permission) (r CategoryRecord) {
	r = CategoryRecord{}

	if len(perm) > 0 {
		r.OrgID = perm[0].OrgID
		r.WhoID = perm[0].WhoID
		r.Who = perm[0].Who
		r.CategoryID = perm[0].RefID
	}

	for _, p := range perm {
		switch p.Action {
		case CategoryView:
			r.CategoryView = true
		}
	}

	return
}

// EncodeUserCategoryPermissions returns multiple user permission records
// for a given document, using flat permission summary record.
func EncodeUserCategoryPermissions(r CategoryRecord) (perm []Permission) {
	if r.CategoryView {
		perm = append(perm, EncodeCategoryRecord(r, CategoryView))
	}

	return
}

// HasAnyCategoryPermission returns true if user has at least one permission.
func HasAnyCategoryPermission(p CategoryRecord) bool {
	return p.CategoryView
}

// EncodeCategoryRecord creates standard permission record representing user permissions for a category.
func EncodeCategoryRecord(r CategoryRecord, a Action) (p Permission) {
	p = Permission{}
	p.OrgID = r.OrgID
	p.WhoID = r.WhoID
	p.Who = r.Who
	p.Location = LocationDocument
	p.RefID = r.CategoryID
	p.Action = a
	p.Scope = ScopeRow

	return
}
