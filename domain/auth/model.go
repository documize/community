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

package auth

import (
	"github.com/documize/community/core/env"
	"github.com/documize/community/domain/user"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime env.Runtime
}

// AuthenticationModel details authentication token and user details.
type AuthenticationModel struct {
	Token string    `json:"token"`
	User  user.User `json:"user"`
}
