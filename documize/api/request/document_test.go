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

package request
/* TODO(Elliott)
import (
	"github.com/documize/community/documize/api/entity"
	"github.com/documize/community/wordsmith/environment"
	"testing"
	"time"
)

const testDocID = "testDocID"
const testLabelID = "testLabelID"
const testJobID = "testJobID"

func testAddDocument(t *testing.T, p *Persister) entity.Document {
	doc := entity.Document{
		BaseEntity: entity.BaseEntity{RefID: testDocID},
		OrgID:      p.Context.OrgID, // string `json:"orgId"`
		LabelID:    testLabelID,     // string `json:"folderId"`
		Job:        testJobID,       // string `json:"job"`
		Location:   "testLocation",  // string `json:"location"`
		Title:      "testTitle",     // string `json:"name"`
		Excerpt:    "testExcerpt",   // string `json:"excerpt"`
		Slug:       "testSlig",      // string `json:"-"`
		Tags:       "",              // string `json:"-"`
		Template:   false,           // bool   `json:"template"`
	}
	err := p.AddDocument(doc)
	if err != nil {
		t.Error(err)
		t.Fail()
	}
	p.testCommit(t)
	return doc
}

func testDeleteDocument(t *testing.T, p *Persister) {
	p.testNewTx(t) // so that we can use it reliably in defer
	rows, err := p.DeleteDocument(testDocID)
	if err != nil {
		t.Error(err)
		t.Fail()
	}
	if rows != 1 {
		t.Errorf("expected 1 row deleted got %d", rows)
		t.Fail()
	}
	p.testCommit(t)
}

func TestDocument(t *testing.T) {
	environment.Parse("db")
	p := newTestPersister(t)
	defer deleteTestAuditTrail(t, p)
	org := testAddOrganization(t, p)
	defer testDeleteOrganization(t, p)
	user := testAddUser(t, p)
	defer testDeleteUser(t, p)
	acc := testAddAccount(t, p)
	defer testDeleteAccount(t, p)
	doc := testAddDocument(t, p)
	defer testDeleteDocument(t, p)
	pages := testAddPages(t, p)
	defer testDeletePages(t, p, pages)
	lab := testAddLabel(t, p)
	defer testDeleteLabel(t, p)
	labrole := testAddLabelRole(t, p)
	defer testDeleteLabelRole(t, p)

	// keep vars
	_ = org
	_ = user
	_ = acc
	_ = doc
	_ = lab
	_ = labrole

	publ, err := p.GetPublicDocuments(org.RefID)
	if err != nil {
		t.Error(err)
	}
	if len(publ) != 1 || publ[0].Document != "testTitle" {
		t.Errorf("wrong data found: %#v", publ)
	}
	p.testRollback(t)

	lab.Type = entity.FolderTypePrivate
	err = p.UpdateLabel(lab)
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)
	for len(searches.queue) > 0 {
		time.Sleep(time.Second) // let the search indexing happen
	}
	dss, err := p.SearchDocument("manifestations")
	if err != nil {
		t.Error(err)
	}
	if len(dss) != 1 {
		t.Error("wrong number of documents found:", len(dss))
	} else {
		if dss[0].DocumentID != testDocID {
			t.Error("wrong document found:", dss[0])
		}
	}
	p.testRollback(t)

	dss, err = p.SearchDocument("XXXXXXXXX")
	if err != nil {
		t.Error(err)
	}
	if len(dss) != 0 {
		t.Error("wrong number of documents found:", len(dss))
	}
	p.testRollback(t)

	err = p.AddDocument(entity.Document{BaseEntity: entity.BaseEntity{RefID: testDocID}})
	if err == nil {
		t.Error("add duplicate document did not error")
	}
	p.testRollback(t)

	rows, err := p.DeleteDocument("XXXXXXXXXXXX")
	if rows != 0 || err != nil {
		t.Error("delete unknown document did not affect 0 rows or had an error ", rows, err)
	}
	p.testRollback(t)

	doc1, err := p.GetDocument(testDocID)
	if err != nil {
		t.Error(err)
	}
	if doc.Job != doc1.Job {
		t.Error("wrong data found:", doc.Job, doc1.Job)
	}
	p.testRollback(t)

	_, err = p.GetDocument("XXXXXXXXXXXXXXX")
	if err == nil {
		t.Error("get unknown document did not error")
	}
	p.testRollback(t)

	doc1m, err := p.GetDocumentMeta(testDocID)
	if err != nil {
		t.Error(err)
	}
	if len(doc1m.Viewers) != 1 {
		t.Errorf("wrong data found, len(viewers) != 1 : %#v", doc1m)
	} else {
		if doc1m.Viewers[0].UserID != user.RefID {
			t.Errorf("wrong data found, userid != `%s`: %#v", user.RefID, doc1m)
		}
	}
	p.testRollback(t)

	docs, err := p.GetDocuments()
	if err != nil {
		t.Error(err)
	}
	if len(docs) != 1 {
		t.Errorf("wrong data found, wrong number of records: %#v", docs)
	} else {
		if docs[0].Job != doc.Job {
			t.Errorf("wrong data found: %#v", docs)
		}
	}
	p.testRollback(t)

	docs2, err := p.GetDocumentsByFolder(testLabelID)
	if err != nil {
		t.Error(err)
	}
	if len(docs2) != 1 {
		t.Errorf("wrong data found, wrong number of records: %#v", docs2)
	} else {
		if docs2[0].Job != doc.Job {
			t.Errorf("wrong data found: %#v", docs2)
		}
	}
	p.testRollback(t)

	templ, err := p.GetDocumentTemplates()
	if err != nil {
		t.Error(err)
	}
	if len(templ) != 0 {
		t.Errorf("wrong data found, should be no templates in test DB for org: %#v", templ)
	}
	p.testRollback(t)

	doc1.Job += "42"
	err = p.UpdateDocument(doc1)
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)
	doc2, err := p.GetDocument(testDocID)
	if err != nil {
		t.Error(err)
	}
	if doc2.Job != doc1.Job {
		t.Error("wrong data for job, wanted:", doc1.Job, "got:", doc2.Job)
	}
	p.testRollback(t)

	_, err = p.GetDocument("XXXXXXXXXXXXXXXXXXX")
	if err == nil {
		t.Error("did not error when getting unknown document")
	}
	p.testRollback(t)

	err = p.ChangeDocumentLabel("XXXXXXXXXXXXXX", "YYYYYYYYYYYYYYYY")
	if err == nil {
		t.Error("did not error when updating unknown document label")
	}
	p.testRollback(t)

	err = p.ChangeDocumentLabel(testDocID, "Dickens")
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)
	err = p.MoveDocumentLabel("Dickens", "Asimov")
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)
	doc3, err := p.GetDocument(testDocID)
	if err != nil {
		t.Error(err)
	}
	if doc3.LabelID != "Asimov" {
		t.Error("wrong data for LabelID:", doc3.LabelID)
	}
	p.testRollback(t)
	err = p.ChangeDocumentLabel(testDocID, testLabelID) // put it back
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)

}
*/
