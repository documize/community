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

package search

import (
	"github.com/documize/community/domain"
	"github.com/documize/community/model/attachment"
	"github.com/documize/community/model/category"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/page"
	sm "github.com/documize/community/model/search"
)

// IndexDocument adds search indesd entries for document inserting title, tags and attachments as
// searchable items. Any existing document entries are removed.
func (m *Indexer) IndexDocument(ctx domain.RequestContext, d doc.Document, a []attachment.Attachment) {
	method := "search.IndexDocument"
	var err error

	ctx.Transaction, err = m.runtime.Db.Beginx()
	if err != nil {
		m.runtime.Log.Error(method, err)
		return
	}

	err = m.store.Search.IndexDocument(ctx, d, a)
	if err != nil {
		ctx.Transaction.Rollback()
		m.runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()
}

// DeleteDocument removes all search entries for document.
func (m *Indexer) DeleteDocument(ctx domain.RequestContext, ID string) {
	method := "search.DeleteDocument"
	var err error

	ctx.Transaction, err = m.runtime.Db.Beginx()
	if err != nil {
		m.runtime.Log.Error(method, err)
		return
	}

	err = m.store.Search.DeleteDocument(ctx, ID)
	if err != nil {
		ctx.Transaction.Rollback()
		m.runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()
}

// IndexContent adds search index entry for document context.
// Any existing document entries are removed.
func (m *Indexer) IndexContent(ctx domain.RequestContext, p page.Page) {
	method := "search.IndexContent"
	var err error

	ctx.Transaction, err = m.runtime.Db.Beginx()
	if err != nil {
		m.runtime.Log.Error(method, err)
		return
	}

	err = m.store.Search.IndexContent(ctx, p)
	if err != nil {
		ctx.Transaction.Rollback()
		m.runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()
}

// DeleteContent removes all search entries for specific document content.
func (m *Indexer) DeleteContent(ctx domain.RequestContext, pageID string) {
	method := "search.DeleteContent"
	var err error

	ctx.Transaction, err = m.runtime.Db.Beginx()
	if err != nil {
		m.runtime.Log.Error(method, err)
		return
	}

	err = m.store.Search.DeleteContent(ctx, pageID)
	if err != nil {
		ctx.Transaction.Rollback()
		m.runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()
}

// FilterCategoryProtected removes search results that cannot be seen by user
// due to document cateogory viewing permissions.
func FilterCategoryProtected(results []sm.QueryResult, cats []category.Category, members []category.Member) (filtered []sm.QueryResult) {
	filtered = []sm.QueryResult{}

	for _, result := range results {
		hasCategory := false
		canSeeCategory := false

	OUTER:

		for _, m := range members {
			if m.DocumentID == result.DocumentID {
				hasCategory = true
				for _, cat := range cats {
					if cat.RefID == m.CategoryID {
						canSeeCategory = true
						continue OUTER
					}
				}
			}
		}

		if !hasCategory || canSeeCategory {
			filtered = append(filtered, result)
		}
	}

	return
}
