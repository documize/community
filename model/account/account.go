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

package account

import "github.com/documize/community/model"

// Account links a User to an Organization.
type Account struct {
	model.BaseEntity
	Admin     bool   `json:"admin"`
	Editor    bool   `json:"editor"`
	Users     bool   `json:"viewUsers"` // either view all users or just users in your space
	Analytics bool   `json:"analytics"` // view content analytics
	UserID    string `json:"userId"`
	OrgID     string `json:"orgId"`
	Company   string `json:"company"`
	Title     string `json:"title"`
	Message   string `json:"message"`
	Domain    string `json:"domain"`
	Active    bool   `json:"active"`
	Theme     string `json:"theme"`
}
