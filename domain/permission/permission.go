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
	"github.com/documize/community/domain/store"
	group "github.com/documize/community/model/group"
	pm "github.com/documize/community/model/permission"
	u "github.com/documize/community/model/user"
)

// CanViewSpaceDocument returns if the user has permission to view a document within the specified folder.
func CanViewSpaceDocument(ctx domain.RequestContext, s store.Store, labelID string) bool {
	roles, err := s.Permission.GetUserSpacePermissions(ctx, labelID)
	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	for _, role := range roles {
		if role.RefID == labelID && role.Location == pm.LocationSpace && role.Scope == pm.ScopeRow &&
			pm.ContainsPermission(role.Action, pm.SpaceView, pm.SpaceManage, pm.SpaceOwner) {
			return true
		}
	}

	return false
}

// CanViewDocument returns if the client has permission to view a given document.
func CanViewDocument(ctx domain.RequestContext, s store.Store, documentID string) bool {
	document, err := s.Document.Get(ctx, documentID)
	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	roles, err := s.Permission.GetUserSpacePermissions(ctx, document.SpaceID)
	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	for _, role := range roles {
		if role.RefID == document.SpaceID && role.Location == pm.LocationSpace && role.Scope == pm.ScopeRow &&
			pm.ContainsPermission(role.Action, pm.SpaceView, pm.SpaceManage, pm.SpaceOwner) {
			return true
		}
	}

	return false
}

// CanChangeDocument returns if the client has permission to change a given document.
func CanChangeDocument(ctx domain.RequestContext, s store.Store, documentID string) bool {
	document, err := s.Document.Get(ctx, documentID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	roles, err := s.Permission.GetUserSpacePermissions(ctx, document.SpaceID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	for _, role := range roles {
		if role.RefID == document.SpaceID && role.Location == pm.LocationSpace && role.Scope == pm.ScopeRow && role.Action == pm.DocumentEdit {
			return true
		}
	}

	return false
}

// CanDeleteDocument returns if the client has permission to change a given document.
func CanDeleteDocument(ctx domain.RequestContext, s store.Store, documentID string) bool {
	document, err := s.Document.Get(ctx, documentID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	roles, err := s.Permission.GetUserSpacePermissions(ctx, document.SpaceID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	for _, role := range roles {
		if role.RefID == document.SpaceID && role.Location == "space" && role.Scope == "object" && role.Action == pm.DocumentDelete {
			return true
		}
	}

	return false
}

// CanUploadDocument returns if the client has permission to upload documents to the given space.
func CanUploadDocument(ctx domain.RequestContext, s store.Store, spaceID string) bool {
	roles, err := s.Permission.GetUserSpacePermissions(ctx, spaceID)
	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	for _, role := range roles {
		if role.RefID == spaceID && role.Location == pm.LocationSpace && role.Scope == pm.ScopeRow &&
			pm.ContainsPermission(role.Action, pm.DocumentAdd) {
			return true
		}
	}

	return false
}

// CanManageSpace returns if the user has permission to manage the given space.
func CanManageSpace(ctx domain.RequestContext, s store.Store, spaceID string) bool {
	roles, err := s.Permission.GetUserSpacePermissions(ctx, spaceID)
	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}
	for _, role := range roles {
		if role.RefID == spaceID && role.Location == pm.LocationSpace && role.Scope == pm.ScopeRow &&
			pm.ContainsPermission(role.Action, pm.SpaceManage, pm.SpaceOwner) {
			return true
		}
	}

	return false
}

// CanViewSpace returns if the user has permission to view the given spaceID.
func CanViewSpace(ctx domain.RequestContext, s store.Store, spaceID string) bool {
	roles, err := s.Permission.GetUserSpacePermissions(ctx, spaceID)
	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}
	for _, role := range roles {
		if role.RefID == spaceID && role.Location == pm.LocationSpace && role.Scope == pm.ScopeRow &&
			pm.ContainsPermission(role.Action, pm.SpaceView, pm.SpaceManage, pm.SpaceOwner) {
			return true
		}
	}

	return false
}

// CanViewDrafts returns if the user has permission to view drafts in space.
func CanViewDrafts(ctx domain.RequestContext, s store.Store, spaceID string) bool {
	roles, err := s.Permission.GetUserSpacePermissions(ctx, spaceID)
	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}
	for _, role := range roles {
		if role.OrgID == ctx.OrgID && role.RefID == spaceID && role.Location == pm.LocationSpace && role.Scope == pm.ScopeRow &&
			pm.ContainsPermission(role.Action, pm.DocumentLifecycle) {
			return true
		}
	}

	return false
}

// CanManageVersion returns if the user has permission to manage versions in space.
func CanManageVersion(ctx domain.RequestContext, s store.Store, spaceID string) bool {
	roles, err := s.Permission.GetUserSpacePermissions(ctx, spaceID)
	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}
	for _, role := range roles {
		if role.OrgID == ctx.OrgID && role.RefID == spaceID && role.Location == pm.LocationSpace && role.Scope == pm.ScopeRow &&
			pm.ContainsPermission(role.Action, pm.DocumentVersion) {
			return true
		}
	}

	return false
}

// HasPermission returns if current user can perform specified actions.
func HasPermission(ctx domain.RequestContext, s store.Store, spaceID string, actions ...pm.Action) bool {
	roles, err := s.Permission.GetUserSpacePermissions(ctx, spaceID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	for _, role := range roles {
		if role.RefID == spaceID && role.Location == pm.LocationSpace && role.Scope == pm.ScopeRow {
			for _, a := range actions {
				if role.Action == a {
					return true
				}
			}
		}
	}

	return false
}

// CheckPermission returns if specified user can perform specified actions.
func CheckPermission(ctx domain.RequestContext, s store.Store, spaceID string, userID string, actions ...pm.Action) bool {
	roles, err := s.Permission.GetSpacePermissionsForUser(ctx, spaceID, userID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	for _, role := range roles {
		if role.RefID == spaceID && role.Location == pm.LocationSpace && role.Scope == pm.ScopeRow {
			for _, a := range actions {
				if role.Action == a {
					return true
				}
			}
		}
	}

	return false
}

// GetUsersWithDocumentPermission returns list of users who have specified document permission in given space
func GetUsersWithDocumentPermission(ctx domain.RequestContext, s store.Store, spaceID, documentID string, permissionRequired pm.Action) (users []u.User, err error) {
	users = []u.User{}
	prev := make(map[string]bool) // used to ensure we only process user once

	// Permissions can be assigned to both groups and individual users.
	// Pre-fetch users with group membership to help us work out
	// if user belongs to a group with permissions.
	groupMembers, err := s.Group.GetMembers(ctx)
	if err != nil {
		return users, err
	}

	// space permissions
	sp, err := s.Permission.GetSpacePermissions(ctx, spaceID)
	if err != nil {
		return users, err
	}
	// document permissions
	dp, err := s.Permission.GetDocumentPermissions(ctx, documentID)
	if err != nil {
		return users, err
	}

	// all permissions
	all := sp
	all = append(all, dp...)

	for _, p := range all {
		// only approvers
		if p.Action != permissionRequired {
			continue
		}

		if p.Who == pm.GroupPermission {
			// get group records for just this group
			groupRecords := group.FilterGroupRecords(groupMembers, p.WhoID)

			for i := range groupRecords {
				user, err := s.User.Get(ctx, groupRecords[i].UserID)
				if err != nil {
					return users, err
				}
				if _, isExisting := prev[user.RefID]; !isExisting {
					users = append(users, user)
					prev[user.RefID] = true
				}
			}
		}

		if p.Who == pm.UserPermission {
			user, err := s.User.Get(ctx, p.WhoID)
			if err != nil {
				return users, err
			}

			if _, isExisting := prev[user.RefID]; !isExisting {
				users = append(users, user)
				prev[user.RefID] = true
			}
		}
	}

	return users, err
}
