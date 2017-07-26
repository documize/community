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

package mysql

import (
	"fmt"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/model/page"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// GetPagesWithoutContent returns a slice containing all the page records for a given documentID, in presentation sequence,
// but without the body field (which holds the HTML content).
func (s Scope) GetPagesWithoutContent(ctx domain.RequestContext, documentID string) (pages []page.Page, err error) {
	err = s.Runtime.Db.Select(&pages, "SELECT id, refid, orgid, documentid, userid, contenttype, pagetype, sequence, level, title, revisions, blockid, created, revised FROM page WHERE orgid=? AND documentid=? ORDER BY sequence", ctx.OrgID, documentID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("Unable to execute select pages for org %s and document %s", ctx.OrgID, documentID))
		return
	}

	return
}
