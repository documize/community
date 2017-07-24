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

import (
	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
}

// Account links a User to an Organization.
type Account struct {
	domain.BaseEntity
	Admin   bool   `json:"admin"`
	Editor  bool   `json:"editor"`
	UserID  string `json:"userId"`
	OrgID   string `json:"orgId"`
	Company string `json:"company"`
	Title   string `json:"title"`
	Message string `json:"message"`
	Domain  string `json:"domain"`
	Active  bool   `json:"active"`
}
