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

import (
	"database/sql"

	"github.com/documize/community/domain"
	pm "github.com/documize/community/model/permission"
)

// CanViewSpaceDocument returns if the user has permission to view a document within the specified folder.
func CanViewSpaceDocument(ctx domain.RequestContext, s domain.Store, labelID string) bool {
	roles, err := s.Permission.GetUserSpacePermissions(ctx, labelID)
	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	for _, role := range roles {
		if role.RefID == labelID && role.Location == "space" && role.Scope == "object" &&
			pm.ContainsPermission(role.Action, pm.SpaceView, pm.SpaceManage, pm.SpaceOwner) {
			return true
		}
	}

	return false
}

// CanViewDocument returns if the client has permission to view a given document.
func CanViewDocument(ctx domain.RequestContext, s domain.Store, documentID string) bool {
	document, err := s.Document.Get(ctx, documentID)
	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	roles, err := s.Permission.GetUserSpacePermissions(ctx, document.LabelID)
	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	for _, role := range roles {
		if role.RefID == document.LabelID && role.Location == "space" && role.Scope == "object" &&
			pm.ContainsPermission(role.Action, pm.SpaceView, pm.SpaceManage, pm.SpaceOwner) {
			return true
		}
	}

	return false
}

// CanChangeDocument returns if the clinet has permission to change a given document.
func CanChangeDocument(ctx domain.RequestContext, s domain.Store, documentID string) bool {
	document, err := s.Document.Get(ctx, documentID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	roles, err := s.Permission.GetUserSpacePermissions(ctx, document.LabelID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	for _, role := range roles {
		if role.RefID == document.LabelID && role.Location == "space" && role.Scope == "object" && role.Action == pm.DocumentEdit {
			return true
		}
	}

	return false
}

// CanDeleteDocument returns if the clinet has permission to change a given document.
func CanDeleteDocument(ctx domain.RequestContext, s domain.Store, documentID string) bool {
	document, err := s.Document.Get(ctx, documentID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	roles, err := s.Permission.GetUserSpacePermissions(ctx, document.LabelID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	for _, role := range roles {
		if role.RefID == document.LabelID && role.Location == "space" && role.Scope == "object" && role.Action == pm.DocumentDelete {
			return true
		}
	}

	return false
}

// CanUploadDocument returns if the client has permission to upload documents to the given space.
func CanUploadDocument(ctx domain.RequestContext, s domain.Store, spaceID string) bool {
	roles, err := s.Permission.GetUserSpacePermissions(ctx, spaceID)
	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	for _, role := range roles {
		if role.RefID == spaceID && role.Location == "space" && role.Scope == "object" &&
			pm.ContainsPermission(role.Action, pm.DocumentAdd) {
			return true
		}
	}

	return false
}

// CanViewSpace returns if the user has permission to view the given spaceID.
func CanViewSpace(ctx domain.RequestContext, s domain.Store, spaceID string) bool {
	roles, err := s.Permission.GetUserSpacePermissions(ctx, spaceID)
	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	for _, role := range roles {
		if role.RefID == spaceID && role.Location == "space" && role.Scope == "object" &&
			pm.ContainsPermission(role.Action, pm.SpaceView, pm.SpaceManage, pm.SpaceOwner) {
			return true
		}
	}

	return false
}

// HasPermission returns if user can perform specified actions.
func HasPermission(ctx domain.RequestContext, s domain.Store, spaceID string, actions ...pm.Action) bool {
	roles, err := s.Permission.GetUserSpacePermissions(ctx, spaceID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	for _, role := range roles {
		if role.RefID == spaceID && role.Location == "space" && role.Scope == "object" {
			for _, a := range actions {
				if role.Action == a {
					return true
				}
			}
		}
	}

	return false
}
