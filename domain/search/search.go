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
	"github.com/documize/community/model"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/page"
)

// Add should be called when a new page is added to a document.
func (m *Indexer) Add(ctx domain.RequestContext, page page.Page, id string) (err error) {
	page.RefID = id

	err = m.addQueue(queueEntry{
		action: m.store.Search.Add,
		Page:   page,
		ctx:    ctx,
	})

	return
}

// Update should be called after a page record has been updated.
func (m *Indexer) Update(ctx domain.RequestContext, page page.Page) (err error) {
	err = m.addQueue(queueEntry{
		action: m.store.Search.Update,
		Page:   page,
		ctx:    ctx,
	})

	return
}

// UpdateDocument should be called after a document record has been updated.
func (m *Indexer) UpdateDocument(ctx domain.RequestContext, document doc.Document) (err error) {
	err = m.addQueue(queueEntry{
		action: m.store.Search.UpdateDocument,
		Page: page.Page{
			DocumentID: document.RefID,
			Title:      document.Title,
			Body:       document.Slug, // NOTE body==slug in this context
		},
		ctx: ctx,
	})

	return
}

// DeleteDocument should be called after a document record has been deleted.
func (m *Indexer) DeleteDocument(ctx domain.RequestContext, documentID string) (err error) {
	if len(documentID) > 0 {
		m.queue <- queueEntry{
			action: m.store.Search.DeleteDocument,
			Page:   page.Page{DocumentID: documentID},
			ctx:    ctx,
		}
	}
	return
}

// UpdateSequence should be called after a page record has been resequenced.
func (m *Indexer) UpdateSequence(ctx domain.RequestContext, documentID, pageID string, sequence float64) (err error) {
	err = m.addQueue(queueEntry{
		action: m.store.Search.UpdateSequence,
		Page: page.Page{
			BaseEntity: model.BaseEntity{RefID: pageID},
			Sequence:   sequence,
			DocumentID: documentID,
		},
		ctx: ctx,
	})

	return
}

// UpdateLevel should be called after the level of a page has been changed.
func (m *Indexer) UpdateLevel(ctx domain.RequestContext, documentID, pageID string, level int) (err error) {
	err = m.addQueue(queueEntry{
		action: m.store.Search.UpdateLevel,
		Page: page.Page{
			BaseEntity: model.BaseEntity{RefID: pageID},
			Level:      uint64(level),
			DocumentID: documentID,
		},
		ctx: ctx,
	})

	return
}

// Delete should be called after a page has been deleted.
func (m *Indexer) Delete(ctx domain.RequestContext, documentID, pageID string) (rows int64, err error) {
	err = m.addQueue(queueEntry{
		action: m.store.Search.Delete,
		Page: page.Page{
			BaseEntity: model.BaseEntity{RefID: pageID},
			DocumentID: documentID,
		},
		ctx: ctx,
	})

	return
}
