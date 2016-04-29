package request

import (
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	_ "github.com/go-sql-driver/mysql" // required for sqlx but not directly called
	"github.com/jmoiron/sqlx"

	"github.com/documize/community/documize/api/entity"
	"github.com/documize/community/wordsmith/log"
	"github.com/documize/community/wordsmith/utility"
)

// SearchManager type provides the datastructure for the queues of activity to be serialized through a single background goroutine.
// NOTE if the queue becomes full, the system will trigger the rebuilding entire files in order to clear the backlog.
type SearchManager struct {
	queue        chan queueEntry
	rebuild      map[string]bool
	rebuildLock  sync.RWMutex
	givenWarning bool
}

const searchQueueLength = 2048 // NOTE the largest 15Mb docx in the test set generates 2142 queue entries, but the queue is constantly emptied

type queueEntry struct {
	action    func(*databaseRequest, entity.Page) error
	isRebuild bool
	entity.Page
}

func init() {
	searches = &SearchManager{}
	searches.queue = make(chan queueEntry, searchQueueLength) // provide some decoupling
	searches.rebuild = make(map[string]bool)
	go searches.searchProcessQueue()
}

// searchProcessQueue is run as a goroutine, it processes the queue of search index update requests.
func (m *SearchManager) searchProcessQueue() {
	for {
		//fmt.Println("DEBUG queue length=", len(Searches.queue))
		if len(m.queue) <= searchQueueLength/20 { // on a busy server, the queue may never get to zero - so use 5%
			m.rebuildLock.Lock()
			for docid := range m.rebuild {
				m.queue <- queueEntry{
					action:    searchRebuild,
					isRebuild: true,
					Page:      entity.Page{DocumentID: docid},
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
			tx, err := Db.Beginx()
			if err != nil {
				log.Error("Search Queue Beginx()", err)
			} else {
				dbRequest := &databaseRequest{Transaction: tx, OrgID: qe.Page.OrgID}
				err = qe.action(dbRequest, qe.Page)
				if err != nil {
					log.Error("Search Queue action()", err)
					log.IfErr(tx.Rollback())
					// This action has failed, so re-build indexes for the entire document,
					// provided it was not a re-build command that failed and we know the documentId.
					if !qe.isRebuild && len(qe.DocumentID) > 0 {
						m.rebuildLock.Lock()
						m.rebuild[qe.DocumentID] = true
						m.rebuildLock.Unlock()
					}
				} else {
					log.IfErr(tx.Commit())
				}
			}
		}
	}
}

func (m *SearchManager) addQueue(request *databaseRequest, qe queueEntry) error {
	lsq := len(m.queue)
	if lsq >= (searchQueueLength - 1) {
		if qe.DocumentID != "" {
			m.rebuildLock.Lock()
			if !m.rebuild[qe.DocumentID] {
				log.Info(fmt.Sprintf("WARNING: Search Queue Has No Space! Marked rebuild index for document id %s", qe.DocumentID))
			}
			m.rebuild[qe.DocumentID] = true
			m.rebuildLock.Unlock()
		} else {
			log.Error("addQueue", errors.New("WARNING: Search Queue Has No Space! But unable to index unknown document id"))
		}
		return nil
	}
	if lsq > ((8 * searchQueueLength) / 10) {
		if !m.givenWarning {
			log.Info(fmt.Sprintf("WARNING: Searches.queue length %d exceeds 80%% of capacity", lsq))
			m.givenWarning = true
		}
	} else {
		if m.givenWarning {
			log.Info(fmt.Sprintf("INFO: Searches.queue length %d now below 80%% of capacity", lsq))
			m.givenWarning = false
		}
	}
	m.queue <- qe
	return nil
}

// Add should be called when a new page is added to a document.
func (m *SearchManager) Add(request *databaseRequest, page entity.Page, id string) (err error) {
	page.RefID = id
	err = m.addQueue(request, queueEntry{
		action: searchAdd,
		Page:   page,
	})
	return
}

func searchAdd(request *databaseRequest, page entity.Page) (err error) {
	id := page.RefID
	// translate the html into text for the search
	nonHTML, err := utility.HTML(page.Body).Text(false)
	if err != nil {
		log.Error("Unable to decode the html for searching", err)
		return
	}
	// insert into the search table, getting the document title along the way
	var stmt *sqlx.Stmt
	stmt, err = request.Transaction.Preparex(
		"INSERT INTO search (id, orgid, documentid, level, sequence, documenttitle, slug, pagetitle, body, created, revised) " +
			" SELECT page.refid,page.orgid,document.refid,page.level,page.sequence,document.title,document.slug,page.title,?,page.created,page.revised " +
			" FROM document,page WHERE page.refid=? AND document.refid=page.documentid")
	if err != nil {
		log.Error("Unable to prepare insert for search", err)
		return
	}
	defer utility.Close(stmt)

	_, err = stmt.Exec(nonHTML, id)
	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute insert for search"), err)
		return
	}
	return
}

// Update should be called after a page record has been updated.
func (m *SearchManager) Update(request *databaseRequest, page entity.Page) (err error) {
	err = m.addQueue(request, queueEntry{
		action: searchUpdate,
		Page:   page,
	})
	return
}

func searchUpdate(request *databaseRequest, page entity.Page) (err error) {
	// translate the html into text for the search
	nonHTML, err := utility.HTML(page.Body).Text(false)
	if err != nil {
		log.Error("Unable to decode the html for searching", err)
		return
	}
	su, err := request.Transaction.Preparex(
		"UPDATE search SET pagetitle=?,body=?,sequence=?,level=?,revised=? WHERE id=?")
	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare search update for page %s", page.RefID), err)
		return err // could have been redefined
	}
	defer utility.Close(su)

	_, err = su.Exec(page.Title, nonHTML, page.Sequence, page.Level, page.Revised, page.RefID)
	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute search update for page %s", page.RefID), err)
		return
	}
	return
}

// UpdateDocument should be called after a document record has been updated.
func (m *SearchManager) UpdateDocument(request *databaseRequest, document entity.Document) (err error) {
	err = m.addQueue(request, queueEntry{
		action: searchUpdateDocument,
		Page: entity.Page{
			DocumentID: document.RefID,
			Title:      document.Title,
			Body:       document.Slug, // NOTE body==slug in this context
		},
	})
	return
}

func searchUpdateDocument(request *databaseRequest, page entity.Page) (err error) {
	searchstmt, err := request.Transaction.Preparex(
		"UPDATE search SET documenttitle=?, slug=?, revised=? WHERE documentid=?")
	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare search update for document %s", page.DocumentID), err)
		return err // may have been redefined
	}
	defer utility.Close(searchstmt)

	_, err = searchstmt.Exec(page.Title, page.Body, time.Now().UTC(), page.DocumentID)
	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute search update for document %s", page.DocumentID), err)
		return err
	}

	return nil
}

// DeleteDocument should be called after a document record has been deleted.
func (m *SearchManager) DeleteDocument(request *databaseRequest, documentID string) (err error) {
	if len(documentID) > 0 {
		m.queue <- queueEntry{
			action: searchDeleteDocument,
			Page:   entity.Page{DocumentID: documentID},
		}
	}
	return
}

func searchDeleteDocument(request *databaseRequest, page entity.Page) (err error) {
	var bm = baseManager{}
	_, err = bm.DeleteWhere(request.Transaction,
		fmt.Sprintf("DELETE from search WHERE documentid='%s'", page.DocumentID))
	if err != nil {
		log.Error(fmt.Sprintf("Unable to delete search entries for docId %s", page.DocumentID), err)
	}
	return
}

func searchRebuild(request *databaseRequest, page entity.Page) (err error) {
	log.Info(fmt.Sprintf("SearchRebuild begin for docId %s", page.DocumentID))
	start := time.Now()

	var bm = baseManager{}

	_, err = bm.DeleteWhere(request.Transaction, fmt.Sprintf("DELETE from search WHERE documentid='%s'", page.DocumentID))
	if err != nil {
		log.Error(fmt.Sprintf("Unable to delete search entries for docId %s prior to rebuild",
			page.DocumentID), err)
		return err
	}

	var pages []struct{ ID string }
	stmt2, err := request.Transaction.Preparex("SELECT refid as id FROM page WHERE documentid=? ")
	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare searchRebuild select for docId %s", page.DocumentID), err)
		return err
	}
	defer utility.Close(stmt2)
	err = stmt2.Select(&pages, page.DocumentID)
	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute searchRebuild select for docId %s", page.DocumentID), err)
		return err
	}

	if len(pages) > 0 {
		for _, pg := range pages {
			err = searchAdd(request, entity.Page{BaseEntity: entity.BaseEntity{RefID: pg.ID}})
			if err != nil {
				log.Error(fmt.Sprintf("Unable to execute searchAdd from searchRebuild for docId %s pageID %s",
					page.DocumentID, pg.ID), err)
				return err
			}
		}

		// rebuild doc-level tags & excerpts
		//  get the 0'th page data and rewrite it

		target := entity.Page{}

		stmt1, err := request.Transaction.Preparex("SELECT * FROM page WHERE refid=?")
		if err != nil {
			log.Error(fmt.Sprintf("Unable to prepare select from searchRebuild for pageId %s", pages[0].ID), err)
			return err
		}
		defer utility.Close(stmt1)

		err = stmt1.Get(&target, pages[0].ID)
		if err != nil {
			log.Error(fmt.Sprintf("Unable to execute select from searchRebuild for pageId %s", pages[0].ID), err)
			return err
		}
		err = searchUpdate(request, target) // to rebuild the document-level tags + excerpt
		if err != nil {
			log.Error(fmt.Sprintf("Unable to run searchUpdate in searchRebuild for docId %s", target.DocumentID), err)
			return err
		}
	}

	log.Info(fmt.Sprintf("Time to rebuild all search data for documentId %s = %v", page.DocumentID,
		time.Since(start)))

	return
}

// UpdateSequence should be called after a page record has been resequenced.
func (m *SearchManager) UpdateSequence(request *databaseRequest, documentID, pageID string, sequence float64) (err error) {
	err = m.addQueue(request, queueEntry{
		action: searchUpdateSequence,
		Page: entity.Page{
			BaseEntity: entity.BaseEntity{RefID: pageID},
			Sequence:   sequence,
			DocumentID: documentID,
		},
	})
	return
}

func searchUpdateSequence(request *databaseRequest, page entity.Page) (err error) {
	supdate, err := request.Transaction.Preparex(
		"UPDATE search SET sequence=?,revised=? WHERE id=?")
	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare search sequence update for page %s", page.RefID), err)
		return err
	}
	defer utility.Close(supdate)

	_, err = supdate.Exec(page.Sequence, time.Now().UTC(), page.RefID)
	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute search sequence update for page %s", page.RefID), err)
		return
	}

	return
}

// UpdateLevel should be called after the level of a page has been changed.
func (m *SearchManager) UpdateLevel(request *databaseRequest, documentID, pageID string, level int) (err error) {
	err = m.addQueue(request, queueEntry{
		action: searchUpdateLevel,
		Page: entity.Page{
			BaseEntity: entity.BaseEntity{RefID: pageID},
			Level:      uint64(level),
			DocumentID: documentID,
		},
	})
	return
}

func searchUpdateLevel(request *databaseRequest, page entity.Page) (err error) {
	pageID := page.RefID
	level := page.Level

	supdate, err := request.Transaction.Preparex(
		"UPDATE search SET level=?,revised=? WHERE id=?")
	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare search level update for page %s", pageID), err)
		return err
	}
	defer utility.Close(supdate)

	_, err = supdate.Exec(level, time.Now().UTC(), pageID)
	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute search level update for page %s", pageID), err)
		return
	}

	return
}

// Delete should be called after a page has been deleted.
func (m *SearchManager) Delete(request *databaseRequest, documentID, pageID string) (rows int64, err error) {
	err = m.addQueue(request, queueEntry{
		action: searchDelete,
		Page: entity.Page{
			BaseEntity: entity.BaseEntity{RefID: pageID},
			DocumentID: documentID,
		},
	})
	return
}
func searchDelete(request *databaseRequest, page entity.Page) (err error) {
	var bm = baseManager{}
	//_, err = bm.DeleteWhere(request.Transaction, fmt.Sprintf("DELETE FROM search WHERE orgid=\"%s\" AND pageid=\"%s\"", request.OrgID, page.RefID))
	_, err = bm.DeleteConstrainedWithID(request.Transaction, "search", request.OrgID, page.RefID)

	return
}

/******************
* Sort Page Context
*******************/

// GetPageContext is called to get the context of a page in terms of an headings hierarchy.
func (m *SearchManager) GetPageContext(request *databaseRequest, pageID string, existingContext []string) ([]string, error) {
	err := request.MakeTx()
	if err != nil {
		return nil, err
	}

	target := entity.Search{}

	stmt1, err := request.Transaction.Preparex("SELECT * FROM search WHERE id=?")
	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare setPageContext select for pageId %s", pageID), err)
		return nil, err
	}
	defer utility.Close(stmt1)

	err = stmt1.Get(&target, pageID)
	if err != nil {
		return existingContext, nil
	}

	context := append([]string{target.PageTitle}, existingContext...)

	if target.Level > 1 { // more levels to process

		var next struct{ ID string }
		// process the lower levels
		stmt2, err := request.Transaction.Preparex("SELECT id FROM search WHERE documentid=? " +
			"AND sequence=(SELECT max(sequence) FROM search " +
			"WHERE documentid=? AND sequence<? AND level=?)")
		if err != nil {
			log.Error(fmt.Sprintf("Unable to prepare GetPageContext next select for pageId %s", pageID), err)
			return nil, err
		}
		defer utility.Close(stmt2)

		err = stmt2.Get(&next, target.DocumentID, target.DocumentID, target.Sequence, target.Level-1)
		if err != nil {
			if strings.Contains(err.Error(), "no rows in result set") {
				return context, nil
			}
			log.Error(fmt.Sprintf("Unable to execute GetPageContext next select for pageId %s", pageID), err)
			return nil, err
		}

		if len(next.ID) > 0 {
			context, err = m.GetPageContext(request, next.ID, context)
			if err != nil {
				log.Error(fmt.Sprintf("Error calling recursive GetPageContext for pageId %s", pageID), err)
				return nil, err
			}
		} else {
			err = fmt.Errorf("search.ID<=0 : %s", next.ID)
			log.Error(fmt.Sprintf("Unexpected higher level ID in GetPageContext for pageId %s", pageID), err)
			return nil, err
		}
	}

	return context, nil
}
