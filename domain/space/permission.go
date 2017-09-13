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

import (
	"database/sql"

	"github.com/documize/community/domain"
	"github.com/documize/community/model/space"
)

// CanViewSpace returns if the user has permission to view the given spaceID.
func CanViewSpace(ctx domain.RequestContext, s domain.Store, spaceID string) bool {
	roles, err := s.Space.GetUserPermissions(ctx, spaceID)
	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	for _, role := range roles {
		if role.RefID == spaceID && role.Location == "space" && role.Scope == "object" &&
			space.HasPermission(role.Action, space.SpaceView, space.SpaceManage, space.SpaceOwner) {
			return true
		}
	}

	return false
}
