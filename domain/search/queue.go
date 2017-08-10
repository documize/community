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
	"errors"
	"fmt"
	"sync"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/model/page"
)

// Indexer type provides the datastructure for the queues of activity to be serialized through a single background goroutine.
// NOTE if the queue becomes full, the system will trigger the rebuilding entire files in order to clear the backlog.
type Indexer struct {
	queue        chan queueEntry
	rebuild      map[string]bool
	rebuildLock  sync.RWMutex
	givenWarning bool
	runtime      *env.Runtime
	store        *domain.Store
}

type queueEntry struct {
	action    func(domain.RequestContext, page.Page) error
	isRebuild bool
	page.Page
	ctx domain.RequestContext
}

const searchQueueLength = 2048 // NOTE the largest 15Mb docx in the test set generates 2142 queue entries, but the queue is constantly emptied

// NewIndexer provides background search indexer
func NewIndexer(rt *env.Runtime, s *domain.Store) (i Indexer) {
	i = Indexer{}
	i.queue = make(chan queueEntry, searchQueueLength) // provide some decoupling
	i.rebuild = make(map[string]bool)
	i.runtime = rt
	i.store = s

	go i.processQueue()

	return
}

// processQueue is run as a goroutine, it processes the queue of search index update requests.
func (m *Indexer) processQueue() {
	for {
		//fmt.Println("DEBUG queue length=", len(Searches.queue))
		if len(m.queue) <= searchQueueLength/20 { // on a busy server, the queue may never get to zero - so use 5%
			m.rebuildLock.Lock()
			for docid := range m.rebuild {
				m.queue <- queueEntry{
					action:    m.store.Search.Rebuild,
					isRebuild: true,
					Page:      page.Page{DocumentID: docid},
				}
				delete(m.rebuild, docid)
			}
			m.rebuildLock.Unlock()
		}

		qe := <-m.queue
		doit := true

		if len(qe.DocumentID) > 0 {
			m.rebuildLock.RLock()
			if m.rebuild[qe.DocumentID] {
				doit = false // don't execute an action on a document queued to be rebuilt
			}
			m.rebuildLock.RUnlock()
		}

		if doit {
			tx, err := m.runtime.Db.Beginx()
			if err != nil {
			} else {
				ctx := qe.ctx
				ctx.Transaction = tx
				err = qe.action(ctx, qe.Page)
				if err != nil {
					tx.Rollback()
					// This action has failed, so re-build indexes for the entire document,
					// provided it was not a re-build command that failed and we know the documentId.
					if !qe.isRebuild && len(qe.DocumentID) > 0 {
						m.rebuildLock.Lock()
						m.rebuild[qe.DocumentID] = true
						m.rebuildLock.Unlock()
					}
				} else {
					tx.Commit()
				}
			}
		}
	}
}

func (m *Indexer) addQueue(qe queueEntry) error {
	lsq := len(m.queue)

	if lsq >= (searchQueueLength - 1) {
		if qe.DocumentID != "" {
			m.rebuildLock.Lock()
			if !m.rebuild[qe.DocumentID] {
				m.runtime.Log.Info(fmt.Sprintf("WARNING: Search Queue Has No Space! Marked rebuild index for document id %s", qe.DocumentID))
			}
			m.rebuild[qe.DocumentID] = true
			m.rebuildLock.Unlock()
		} else {
			m.runtime.Log.Error("addQueue", errors.New("WARNING: Search Queue Has No Space! But unable to index unknown document id"))
		}

		return nil
	}

	if lsq > ((8 * searchQueueLength) / 10) {
		if !m.givenWarning {
			m.runtime.Log.Info(fmt.Sprintf("WARNING: Searches.queue length %d exceeds 80%% of capacity", lsq))
			m.givenWarning = true
		}
	} else {
		if m.givenWarning {
			m.runtime.Log.Info(fmt.Sprintf("INFO: Searches.queue length %d now below 80%% of capacity", lsq))
			m.givenWarning = false
		}
	}

	m.queue <- qe

	return nil
}
