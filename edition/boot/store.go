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
	attachment "github.com/documize/community/domain/attachment/mysql"
	audit "github.com/documize/community/domain/audit/mysql"
	doc "github.com/documize/community/domain/document/mysql"
	link "github.com/documize/community/domain/link/mysql"
	org "github.com/documize/community/domain/organization/mysql"
	page "github.com/documize/community/domain/page/mysql"
	pin "github.com/documize/community/domain/pin/mysql"
	setting "github.com/documize/community/domain/setting/mysql"
	space "github.com/documize/community/domain/space/mysql"
	user "github.com/documize/community/domain/user/mysql"
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
	s.Setting = setting.Scope{Runtime: r}
	s.Attachment = attachment.Scope{Runtime: r}
	s.Link = link.Scope{Runtime: r}
	s.Page = page.Scope{Runtime: r}
}

// https://github.com/golang-sql/sqlexp/blob/c2488a8be21d20d31abf0d05c2735efd2d09afe4/quoter.go#L46
