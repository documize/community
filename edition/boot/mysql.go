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
	activity "github.com/documize/community/domain/activity/mysql"
	attachment "github.com/documize/community/domain/attachment/mysql"
	audit "github.com/documize/community/domain/audit/mysql"
	block "github.com/documize/community/domain/block/mysql"
	doc "github.com/documize/community/domain/document/mysql"
	link "github.com/documize/community/domain/link/mysql"
	org "github.com/documize/community/domain/organization/mysql"
	page "github.com/documize/community/domain/page/mysql"
	pin "github.com/documize/community/domain/pin/mysql"
	search "github.com/documize/community/domain/search/mysql"
	setting "github.com/documize/community/domain/setting/mysql"
	space "github.com/documize/community/domain/space/mysql"
	user "github.com/documize/community/domain/user/mysql"
)

// StoreMySQL creates MySQL provider
func StoreMySQL(r *env.Runtime, s *domain.Store) {
	s.Account = account.Scope{Runtime: r}
	s.Activity = activity.Scope{Runtime: r}
	s.Attachment = attachment.Scope{Runtime: r}
	s.Audit = audit.Scope{Runtime: r}
	s.Block = block.Scope{Runtime: r}
	s.Document = doc.Scope{Runtime: r}
	s.Link = link.Scope{Runtime: r}
	s.Organization = org.Scope{Runtime: r}
	s.Page = page.Scope{Runtime: r}
	s.Pin = pin.Scope{Runtime: r}
	s.Search = search.Scope{Runtime: r}
	s.Setting = setting.Scope{Runtime: r}
	s.Space = space.Scope{Runtime: r}
	s.User = user.Scope{Runtime: r}
}
