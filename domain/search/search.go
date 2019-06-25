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
	"database/sql"
	"fmt"

	"github.com/documize/community/domain"
	"github.com/documize/community/model/attachment"
	"github.com/documize/community/model/category"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/page"
	sm "github.com/documize/community/model/search"
	"github.com/documize/community/model/workflow"
)

// IndexDocument adds search indesd entries for document inserting title, tags and attachments as
// searchable items. Any existing document entries are removed.
func (m *Indexer) IndexDocument(ctx domain.RequestContext, d doc.Document, a []attachment.Attachment) {
	method := "search.IndexDocument"
	var err error

	ok := true
	ctx.Transaction, ok = m.runtime.StartTx(sql.LevelReadUncommitted)
	if !ok {
		m.runtime.Log.Info("unable to start TX for " + method)
		return
	}

	err = m.store.Search.IndexDocument(ctx, d, a)
	if err != nil {
		m.runtime.Rollback(ctx.Transaction)
		m.runtime.Log.Error(method, err)
		return
	}

	m.runtime.Commit(ctx.Transaction)
}

// DeleteDocument removes all search entries for document.
func (m *Indexer) DeleteDocument(ctx domain.RequestContext, ID string) {
	method := "search.DeleteDocument"
	var err error

	ok := true
	ctx.Transaction, ok = m.runtime.StartTx(sql.LevelReadUncommitted)
	if !ok {
		m.runtime.Log.Info("unable to start TX for " + method)
		return
	}

	err = m.store.Search.DeleteDocument(ctx, ID)
	if err != nil {
		m.runtime.Rollback(ctx.Transaction)
		m.runtime.Log.Error(method, err)
		return
	}

	m.runtime.Commit(ctx.Transaction)
}

// IndexContent adds search index entry for document context.
// Any existing document entries are removed.
func (m *Indexer) IndexContent(ctx domain.RequestContext, p page.Page) {
	method := "search.IndexContent"
	var err error

	// we do not index pending pages
	if p.Status == workflow.ChangePending || p.Status == workflow.ChangePendingNew {
		return
	}

	ok := true
	ctx.Transaction, ok = m.runtime.StartTx(sql.LevelReadUncommitted)
	if !ok {
		m.runtime.Log.Info("unable to start TX for " + method)
		return
	}

	err = m.store.Search.IndexContent(ctx, p)
	if err != nil {
		m.runtime.Rollback(ctx.Transaction)
		m.runtime.Log.Error(method, err)
		return
	}

	m.runtime.Commit(ctx.Transaction)
}

// DeleteContent removes all search entries for specific document content.
func (m *Indexer) DeleteContent(ctx domain.RequestContext, pageID string) {
	method := "search.DeleteContent"
	var err error

	ok := true
	ctx.Transaction, ok = m.runtime.StartTx(sql.LevelReadUncommitted)
	if !ok {
		m.runtime.Log.Info("unable to start TX for " + method)
		return
	}

	err = m.store.Search.DeleteContent(ctx, pageID)
	if err != nil {
		m.runtime.Rollback(ctx.Transaction)
		m.runtime.Log.Error(method, err)
		return
	}

	m.runtime.Commit(ctx.Transaction)
}

// Rebuild recreates all search indexes.
func (m *Indexer) Rebuild(ctx domain.RequestContext) {
	method := "search.rebuildSearchIndex"

	docs, err := m.store.Meta.Documents(ctx)
	if err != nil {
		m.runtime.Log.Error(method, err)
		return
	}

	m.runtime.Log.Info(fmt.Sprintf("Search re-indexing started for %d documents", len(docs)))

	for i := range docs {
		d := docs[i]

		dc, err := m.store.Meta.Document(ctx, d)
		if err != nil {
			m.runtime.Log.Error(method, err)
			// continue
		}
		at, err := m.store.Meta.Attachments(ctx, d)
		if err != nil {
			m.runtime.Log.Error(method, err)
			// continue
		}

		m.IndexDocument(ctx, dc, at)

		pages, err := m.store.Meta.Pages(ctx, d)
		if err != nil {
			m.runtime.Log.Error(method, err)
			// continue
		}

		for j := range pages {
			m.IndexContent(ctx, pages[j])
		}

		// Log process every N documents.
		if i%100 == 0 {
			m.runtime.Log.Info(fmt.Sprintf("Search re-indexed %d documents...", i))
		}
	}

	m.runtime.Log.Info(fmt.Sprintf("Search re-indexing finished for %d documents", len(docs)))
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
