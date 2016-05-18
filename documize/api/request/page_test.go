package request
/* TODO(Elliott)
import (
	"strings"
	"testing"

	"github.com/documize/community/documize/api/endpoint/models"
	"github.com/documize/community/documize/api/entity"
)

func testAddPages(t *testing.T, p *Persister) []entity.Page {
	testPages := []entity.Page{
		{
			BaseEntity: entity.BaseEntity{RefID: "testPage1"},
			OrgID:      p.Context.OrgID,                               // string  `json:"orgId"`
			DocumentID: testDocID,                                     // string  `json:"documentId"`
			Level:      1,                                             //  uint64  `json:"level"`
			Title:      "Document title",                              // string  `json:"title"`
			Body:       "The quick brown fox jumps over the lazy dog", // string  `json:"body"`
			Sequence:   1.0,                                           // float64 `json:"sequence"`
			Revisions:  0,                                             //  uint64  `json:"revisions"`
		},
		{
			BaseEntity: entity.BaseEntity{RefID: "testPage2"},
			OrgID:      p.Context.OrgID,          // string  `json:"orgId"`
			DocumentID: testDocID,                // string  `json:"documentId"`
			Level:      2,                        //  uint64  `json:"level"`
			Title:      "Document sub-title one", // string  `json:"title"`
			Body: `
The Tao that can be spoken is not the eternal Tao
The name that can be named is not the eternal name
The nameless is the origin of Heaven and Earth
The named is the mother of myriad things
Thus, constantly without desire, one observes its essence
Constantly with desire, one observes its manifestations
These two emerge together but differ in name
The unity is said to be the mystery
Mystery of mysteries, the door to all wonders
`, // string  `json:"body"`
			Sequence:  2.0, // float64 `json:"sequence"`
			Revisions: 0,   //  uint64  `json:"revisions"`
		},
		{
			BaseEntity: entity.BaseEntity{RefID: "testPage3"},
			OrgID:      p.Context.OrgID,          // string  `json:"orgId"`
			DocumentID: testDocID,                // string  `json:"documentId"`
			Level:      2,                        //  uint64  `json:"level"`
			Title:      "Document sub-title two", // string  `json:"title"`
			Body: `
Bent double, like old beggars under sacks,
Knock-kneed, coughing like hags, we cursed through sludge,
Till on the haunting flares we turned our backs,
And towards our distant rest began to trudge.
Men marched asleep. Many had lost their boots,
But limped on, blood-shod. All went lame; all blind;
Drunk with fatigue; deaf even to the hoots
Of gas-shells dropping softly behind.

Gas! GAS! Quick, boys!—An ecstasy of fumbling
Fitting the clumsy helmets just in time,
But someone still was yelling out and stumbling
And flound’ring like a man in fire or lime.—
Dim through the misty panes and thick green light,
As under a green sea, I saw him drowning.

In all my dreams before my helpless sight,
He plunges at me, guttering, choking, drowning.

If in some smothering dreams, you too could pace
Behind the wagon that we flung him in,
And watch the white eyes writhing in his face,
His hanging face, like a devil’s sick of sin;
If you could hear, at every jolt, the blood
Come gargling from the froth-corrupted lungs,
Obscene as cancer, bitter as the cud
Of vile, incurable sores on innocent tongues,—
My friend, you would not tell with such high zest
To children ardent for some desperate glory,
The old Lie: Dulce et decorum est
Pro patria mori.
`, // string  `json:"body"`
			Sequence:  3.0, // float64 `json:"sequence"`
			Revisions: 0,   //  uint64  `json:"revisions"`
		},
	}

	for _, page := range testPages {
		err := p.AddPage(models.PageModel{Page: page})
		if err != nil {
			t.Error(err)
			t.Fail()
		}
		p.testCommit(t)
	}
	return testPages
}

func testDeletePages(t *testing.T, p *Persister, pages []entity.Page) {
	p.testNewTx(t) // so that we can use it reliably in defer
	for _, pg := range pages {
		_, err := p.DeletePage(testDocID, pg.RefID)
		if err != nil {
			t.Error(err)
			//t.Fail()
		}
		// this code is belt-and-braces, as document delete should also delete any pages 
		//if rows != 1 {
		//	t.Errorf("expected 1 page row deleted got %d", rows)
		//	//t.Fail()
		//}
		p.testCommit(t)
	}
}

func TestPage(t *testing.T) {
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

	// keep vars
	_ = org
	_ = user
	_ = acc
	_ = doc

	err := p.AddPage(models.PageModel{Page: pages[0]})
	if err == nil {
		t.Error("did not error on add of duplicate record")
	}
	p.testRollback(t)

	retpgs, err := p.GetPages(doc.RefID) // a bad ID just brings back 0 pages, so not tested
	if err != nil {
		t.Error(err)
	}
	if len(retpgs) != len(pages) {
		t.Errorf("wrong number of pages returned, expected %d got %d", len(pages), len(retpgs))
	} else {
		for l := range retpgs {
			if retpgs[l].Body != pages[l].Body {
				t.Errorf("wrong body content")
			}
		}
	}
	p.testRollback(t)

	retpgswoc, err := p.GetPagesWithoutContent(doc.RefID) // a bad ID just brings back 0 pages, so not tested
	if err != nil {
		t.Error(err)
	}
	if len(retpgswoc) != len(pages) {
		t.Errorf("wrong number of pages returned, expected %d got %d", len(pages), len(retpgswoc))
	} else {
		for l := range retpgswoc {
			if retpgswoc[l].Title != pages[l].Title {
				t.Errorf("wrong title content")
			}
		}
	}
	p.testRollback(t)

	retpgswi, err := p.GetPagesWhereIn(doc.RefID, pages[0].BaseEntity.RefID+","+pages[2].BaseEntity.RefID)
	if err != nil {
		t.Error(err)
	}
	if len(retpgswi) != 2 {
		t.Errorf("wrong number of pages returned, expected %d got %d", 2, len(retpgswi))
	} else {
		if retpgswi[1].Body != pages[2].Body {
			t.Errorf("wrong WhereIn content")
		}
	}
	p.testRollback(t)

	retpg, err := p.GetPage(pages[0].BaseEntity.RefID)
	if err != nil {
		t.Error(err)
	}
	if retpg.Body != pages[0].Body {
		t.Errorf("wrong page returned, expected body of `%s` got `%s`", pages[0].Body, retpg.Body)
	}
	p.testRollback(t)

	_, err = p.GetPage("XXXXXXXXXXX")
	if err == nil {
		t.Error("no error on unknown page")
	}
	p.testRollback(t)

	meaningOfLife := 42.0
	err = p.UpdatePageSequence(doc.RefID, "testPage3", meaningOfLife)
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)
	retpg, err = p.GetPage("testPage3")
	if err != nil {
		t.Error(err)
	}
	if retpg.Sequence != meaningOfLife {
		t.Errorf("wrong page returned, expected sequence of `%g` got `%g`", meaningOfLife, retpg.Sequence)
	}
	p.testRollback(t)

	err = p.UpdatePageLevel(doc.RefID, "testPage3", 3)
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)
	retpg, err = p.GetPage("testPage3")
	if err != nil {
		t.Error(err)
	}
	if retpg.Level != 3 {
		t.Errorf("wrong page returned, expected level of `3` got `%d`", retpg.Level)
	}
	p.testRollback(t)

	newPg := pages[0]
	newPg.Body += "!"
	err = p.UpdatePage(newPg, pages[0].BaseEntity.RefID, p.Context.UserID, false)
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)
	retpg, err = p.GetPage(pages[0].BaseEntity.RefID)
	if err != nil {
		t.Error(err)
	}
	if retpg.Body[len(retpg.Body)-1] != byte('!') {
		t.Errorf("wrong page returned, expected string ending in '!' got `%s`", retpg.Body)
	}
	p.testRollback(t)

	revs, err := p.GetPageRevisions(pages[0].BaseEntity.RefID)
	if err != nil {
		t.Error(err)
	}
	if len(revs) != 1 {
		t.Error("wrong number of page revisions")
		t.Fail()
	}
	if revs[0].Body != strings.TrimSuffix(pages[0].Body, "!") {
		t.Error("wrong revision data:", revs[0].Body)
	}
	p.testRollback(t)

	rev, err := p.GetPageRevision(revs[0].BaseEntity.RefID)
	if err != nil {
		t.Error(err)
	}
	if revs[0].Body != rev.Body {
		t.Error("wrong revision data:", revs[0].Body, rev.Body)
	}
	p.testRollback(t)
}
*/