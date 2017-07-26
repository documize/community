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

// Package boot prepares runtime environment.
package boot

import (
	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	account "github.com/documize/community/domain/account/mysql"
	audit "github.com/documize/community/domain/audit/mysql"
	org "github.com/documize/community/domain/organization/mysql"
	pin "github.com/documize/community/domain/pin/mysql"
	space "github.com/documize/community/domain/space/mysql"
	user "github.com/documize/community/domain/user/mysql"
	doc "github.com/documize/community/domain/document/mysql"
)

// AttachStore selects database persistence layer
func AttachStore(r *env.Runtime, s *domain.Store) {
	s.Space = space.Scope{Runtime: r}
	s.Account = account.Scope{Runtime: r}
	s.Organization = org.Scope{Runtime: r}
	s.User = user.Scope{Runtime: r}
	s.Pin = pin.Scope{Runtime: r}
	s.Audit = audit.Scope{Runtime: r}
	s.Document = doc.Scope{Runtime: r}
}
