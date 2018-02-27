// Copyright 2018 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

package group

import "github.com/documize/community/model"

// Group defines a user group.
type Group struct {
	model.BaseEntity
	OrgID   string `json:"orgId"`
	Name    string `json:"name"`
	Purpose string `json:"purpose"`
	Members int    `json:"members"`
}

// Member defines user membership of a user group.
type Member struct {
	OrgID  string `json:"orgId"`
	RoleID string `json:"roleId"`
	UserID string `json:"userId"`
}
