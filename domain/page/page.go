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

package page

import (
	"github.com/documize/community/domain"
	"github.com/documize/community/model/page"
)

// LevelizeDocument generates level and sequence numbers for all document sections
func (h *Handler) LevelizeDocument(ctx domain.RequestContext, documentID string) {
	method := "page.LevelizeDocument"
	var err error
	ctx.Transaction.Commit()

	// Re-level all pages in document
	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		h.Runtime.Log.Error(method, err)
		return
	}

	p2, err := h.Store.Page.GetPages(ctx, documentID)
	if err != nil {
		ctx.Transaction.Rollback()
		h.Runtime.Log.Error(method, err)
		return
	}

	page.Levelize(p2)
	page.Sequenize(p2)

	for _, i := range p2 {
		err = h.Store.Page.UpdateLevelSequence(ctx, documentID, i.RefID, int(i.Level), i.Sequence)
		if err != nil {
			ctx.Transaction.Rollback()
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	ctx.Transaction.Commit()
}
