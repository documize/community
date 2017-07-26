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

// Package space handles API calls and persistence for spaces.
// Spaces in Documize contain documents.
package space

/*
// CanViewSpace returns if the user has permission to view the given spaceID.
func CanViewSpace(s domain.StoreContext, spaceID string) (hasPermission bool) {
	roles, err := GetRoles(s, spaceID)
	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		s.Runtime.Log.Error(fmt.Sprintf("check space permissions %s", spaceID), err)
		return false
	}

	for _, role := range roles {
		if role.LabelID == spaceID && (role.CanView || role.CanEdit) {
			return true
		}
	}

	return false
}

// CanViewSpaceDocuments returns if the user has permission to view a document within the specified space.
func CanViewSpaceDocuments(s domain.StoreContext, spaceID string) (hasPermission bool) {
	roles, err := GetRoles(s, spaceID)
	if err == sql.ErrNoRows {
		err = nil
	}

	if err != nil {
		s.Runtime.Log.Error(fmt.Sprintf("check space permissions %s", spaceID), err)
		return false
	}

	for _, role := range roles {
		if role.LabelID == spaceID && (role.CanView || role.CanEdit) {
			return true
		}
	}

	return false
}
*/
