package exttest

import (
	"fmt"
	"strings"
	"testing"

	"github.com/documize/community/documize/api/endpoint/models"
	"github.com/documize/community/documize/api/entity"
	"github.com/documize/community/sdk"
)

func testPages(t *testing.T, c *documize.Client, testFolder, testFile, testData string) {

	lastSeq := 0.0
	dp, err := c.GetDocumentPages(testFile)
	if err != nil {
		t.Error(err)
	} else {
		var pageIDs []string
		for _, v := range dp {
			pageIDs = append(pageIDs, v.RefID)
			if v.Sequence > lastSeq {
				lastSeq = v.Sequence
			}
		}
		pageIDlist := strings.Join(pageIDs, ",")
		if dpb, err2 := c.GetDocumentPagesBatch(testFile, pageIDlist); err != nil {
			t.Error(err2)
		} else {
			for k, v := range dp {
				if v.Body != dpb[k].Body {
					t.Errorf("page %d from GetDocumentPages != from GetDocumentPagesBatch", k)
				}
			}
		}
	}

	const numPages = 100
	pagesAdded := make([]*entity.Page, 0, numPages)
	for i := 0; i < numPages; i++ {
		lastSeq += 1000.0
		pg := entity.Page{
			DocumentID:  testFile,
			Level:       1,
			Title:       "AddPage() title " + fmt.Sprintf("%d", i),
			Body:        "AddPage() body " + fmt.Sprintf("%d", i),
			ContentType: "wysiwyg",
			Sequence:    lastSeq,
		}
		if newPg, err2 := c.AddDocumentPage(testFile, &pg); err != nil {
			t.Error(err2)
		} else {
			pagesAdded = append(pagesAdded, newPg)
		}
	}

	if len(pagesAdded) < 2 {
		t.Error("Less than two pages added, cannot continue with pages test")
		return
	}

	err = c.ChangeDocumentPageLevel(testFile, &[]models.PageLevelRequestModel{
		{PageID: pagesAdded[0].RefID, Level: int(pagesAdded[0].Level + 42)},
	})
	if err != nil {
		t.Error(err)
	}

	err = c.ChangeDocumentPageSequence(testFile, &[]models.PageSequenceRequestModel{
		{PageID: pagesAdded[0].RefID, Sequence: pagesAdded[0].Sequence - 1.0},
	})
	if err != nil {
		t.Error(err)
	}

	pagesAdded[0].Body += " - Modified!"
	err = c.UpdateDocumentPage(pagesAdded[0])
	if err != nil {
		t.Error(err)
	}

	revs, err := c.GetDocumentPageRevisions(testFile, pagesAdded[0].RefID)
	if err != nil {
		t.Error(err)
	} else {
		diff, err2 := c.GetDocumentPageDiff(testFile, pagesAdded[0].RefID, revs[0].RefID)
		if err2 != nil {
			t.Error(err2)
		} else {
			t.Logf("INFO: Revised single doc page diff: %s", string(diff))
		}
		err = c.RollbackDocumentPage(testFile, pagesAdded[0].RefID, revs[0].RefID)
		if err != nil {
			t.Error(err)
		} else {
			t.Logf("INFO: Rolled-back revised single doc page %s", revs[0].RefID)
		}
	}

	err = c.DeleteDocumentPage(testFile, pagesAdded[0].RefID)
	if err != nil {
		t.Error(err)
	} else {
		t.Log("INFO: Deleted single doc page", pagesAdded[0].RefID)
	}

	delList := []string{pagesAdded[1].RefID}
	for k, v := range pagesAdded {
		if k > 1 {
			delList = append(delList, v.RefID)
		}
	}
	err = c.DeleteDocumentPages(testFile, delList)
	if err != nil {
		t.Error(err)
	} else {
		t.Log("INFO: Deleted multiple doc pages:", len(delList))
	}

}
