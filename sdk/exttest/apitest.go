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

package exttest

import (
	"bytes"
	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/sdk"
	"io/ioutil"
	"os"
	"strings"
	"testing"
)

var testFileName string

func setupTestFile() error {
	testFileName = os.TempDir()
	if !strings.HasSuffix(testFileName, string(os.PathSeparator)) {
		testFileName += string(os.PathSeparator)
	}
	testFileName += "TESTDATA.html"
	return ioutil.WriteFile(testFileName, []byte(`
<!DOCTYPE html>
<html>
<head>
	<title>TESTDATA Title</title>
</head>
<body>
	<h1>TESTDATA Heading</h1>
	<p>TESTDATA paragraph.</p>
</body>
</html>
    `), os.ModePerm)
}

// APItest is the main entry point for the test code, it is called by both internal and external tests.
func APItest(t *testing.T) {
	setupTestFile()
	defer os.Remove(testFileName) // ignore error

	c, err := auth(t)
	if err != nil {
		t.Error(err)
		t.Fail()
		return
	}
	if c == nil {
		t.Error("unable to log-in to Documize, nil pointer returned")
		t.Fail()
		return
	}
	t.Logf("INFO: Auth client=%#v\n", *c)

	testMeta(t, c)

	// create a testing folder here, with a defer to remove it
	myFolder := &entity.Label{
		Name: "Folder created during Go unit tests",
		// OrgID is set by the endpoint
		UserID: c.Auth.User.RefID,
		Type:   2, // only the user can see it
	}
	err = c.AddFolder(myFolder)
	if err != nil {
		t.Error("c.AddFolder():", err)
		t.Fail()
		return
	}
	// find a folder to move the deleted myFolder's contents to
	fids, err := c.GetNamedFolderIDs("Test")
	if err != nil {
		t.Error("c.GetNamedFolderIDs():", err)
		t.Fail()
	}
	if len(fids) == 0 {
		t.Error("can't find a folder named Test")
		t.Fail()
	}
	reserveFolder := fids[0] // use the 1st we found
	defer func() {
		err = c.RemoveFolder(myFolder.RefID, reserveFolder)
		if err != nil {
			t.Error(err)
		}
	}()

	testFolder := myFolder.RefID
	if testFolder == "" {
		t.Error("myFolder.RefID is empty!")
		t.Fail()
		return
	}
	t.Log("INFO: myFolder.RefID='" + testFolder + "'")

	testFile := loadFile(c, t, testFolder, testFileName)
	testData := loadData(c, t, testFolder)

	testPages(t, c, testFolder, testFile, testData)

	testFolderAPI(t, c, testFolder, testFile)
	testSearch(t, c, testFolder, testFile)
	testDownload(t, c, testFolder, testFile)

	testGetUpdDocument(t, c, testFile, testData)
	testGetDocumentMeta(t, c, testFile, testData)
	testDocAttachments(t, c, testFile, testData)
	testTemplates(t, c, testFolder, testFile, testData)
	testDelete(t, c, testFile, testData)

	testOrg(t, c)
	testFolders(t, c, myFolder)
	testUsers(t, c)

}

func testOrg(t *testing.T, c *documize.Client) {
	orgs, err := c.GetOrganizations()
	if err != nil {
		t.Error(err)
	} else {
		t.Logf("INFO: organizations = %#v", orgs)
	}
	if len(orgs) > 0 {
		err = c.UpdateOrganization(&orgs[0])
		if err != nil {
			t.Error(err)
		}
		// TODO actually check that the update did what we expected
	}
}

func testGetUpdDocument(t *testing.T, c *documize.Client, testFile, testData string) {
	var err error
	doc, err := c.GetDocument(testFile)
	if err != nil {
		t.Error(err)
	} else {
		if doc.RefID != testFile {
			t.Error("wrong RefId got", doc.RefID, "want", testFile)
		}
	}

	err = c.UpdateDocument(doc)
	if err != nil {
		t.Error(err)
	}
	// NOTE updates to unknown documents do not generate errors

	docData, err := c.GetDocument(testData)
	if err != nil {
		t.Error(err)
	}
	if docData.BaseEntity.RefID != testData {
		t.Error("wrong RefID want", testData, "got", docData.RefID)
	}
	if _, err = c.GetDocument(""); err == nil {
		t.Error("GetDocument did not error on empty DocumentID")
	} else {
		t.Log("INFO: GetDocument emptyDocID msg:", err)
	}
	if _, err = c.GetDocument("XXXXXXXXXXXXX"); err == nil {
		t.Error("GetDocument did not error on bad DocumentID")
	} else {
		t.Log("INFO: GetDocument badDocID msg:", err)
	}
}

func testGetDocumentMeta(t *testing.T, c *documize.Client, testFile, testData string) {
	var err error
	docM, err := c.GetDocumentMeta(testFile)
	if err != nil {
		t.Error(err)
	} else {
		if len(docM.Editors) < 2 { // TODO review
			t.Error("wrong number of editors expected >=2 got", len(docM.Editors))
		}
	}
	docDataM, err := c.GetDocumentMeta(testData)
	if err != nil {
		t.Error(err)
	} else {
		if len(docDataM.Editors) != 2 { // TODO review
			t.Error("wrong number of editors expected 0 got", len(docDataM.Editors))
		}
	}
	if _, err = c.GetDocumentMeta(""); err == nil {
		t.Error("GetDocumentMeta did not error on empty DocumentID")
	} else {
		t.Log("INFO: GetDocumentMeta emptyDocID msg:", err)
	}
	/* TODO reivew
	if _, err = c.GetDocumentMeta("XXXXXXXXXXXXX"); err == nil {
		t.Error("GetDocumentMeta did not error on bad DocumentID")
	} else {
		t.Log("INFO: GetDocumentMeta badDocID msg:", err)
	}
	*/
}

func testDelete(t *testing.T, c *documize.Client, testFile, testData string) {
	var err error
	if err = c.DeleteDocument(testFile); err != nil {
		t.Error(err)
	}
	if err = c.DeleteDocument(testData); err != nil {
		t.Error(err)
	}
	if err = c.DeleteDocument(""); err == nil {
		t.Error("DeleteDocument did not error on empty DocumentID")
	} else {
		t.Log("INFO: Delete Doc emptyDocID msg:", err)
	}
	/* TODO reivew
	if err = c.DeleteDocument("XXXXXXXXXXXXX"); err == nil {
		t.Error("DeleteDocument did not error on bad DocumentID")
	} else {
		t.Log("Delete Doc badDocID msg:", err)
	}
	*/
}

func testMeta(t *testing.T, c *documize.Client) {
	sitemap, err := c.GetSitemap()
	if err != nil {
		t.Error(err)
	} else {
		if sitemap == nil {
			t.Error("sitemap []byte is nil")
		} else {
			if !bytes.Contains(sitemap, []byte("http://www.sitemaps.org/schemas/sitemap")) {
				t.Errorf("Incorrect Site Map: %#v", string(sitemap))
			}
		}
	}
	robots, err := c.GetRobots()
	if err != nil {
		t.Error(err)
	} else {
		if robots == nil {
			t.Error("robots []byte is nil")
		} else {
			if !bytes.HasPrefix(robots, []byte("User-agent:")) {
				t.Errorf("Incorrect Robots data: %#v", string(robots))
			}
		}
	}
}

func testFolderAPI(t *testing.T, c *documize.Client, testFolder, testFile string) {

	_, err := c.GetDocumentsByFolder("")
	if err == nil {
		t.Error("did not error on blank folder ID")
	} else {
		t.Log("INFO: ", err)
	}

	docs, err := c.GetDocumentsByFolder(testFolder)
	if err != nil {
		t.Error(err)
		return
	}
	for _, doc := range docs {
		if doc.RefID == testFile {
			goto foundDoc
		}
	}
	t.Error("Unable to find " + testFile + " in the test folder")
	return
foundDoc:

	docs2, err := c.GetDocumentsByFolder("什么都没有")
	if err == nil {
		t.Error("did not error on bad folder ID for GetDocumentsByFolder")
		if len(docs2) != 0 {
			t.Error("found documents in folder where there should be none")
		}
	} else {
		t.Log("INFO: " + err.Error())
	}
}

func testSearch(t *testing.T, c *documize.Client, testFolder, testFile string) {

	// NOTE: search does not error on blank search term
	srch, err := c.SearchDocuments("TESTDATA")
	if err != nil {
		t.Error(err)
	}
	for _, doc := range srch {
		//t.Logf("DEBUG search %#v", doc)
		if doc.DocumentID == testFile {
			goto foundSrch
		}
	}
	t.Error("Unable to find " + testFileName + " in the search list")
foundSrch:

	srch2, err := c.SearchDocuments("石磊先生是谁？")
	if err != nil {
		t.Error(err)
	}
	if len(srch2) != 0 {
		t.Error("found documents in search where there should be none")
	}
}

func testDownload(t *testing.T, c *documize.Client, testFolder, testFile string) {

	nam, content, err := c.GetDocumentAsDocx(testFile)
	if err != nil {
		t.Error(err)
	} else {
		/* TODO
		if !strings.HasPrefix(nam, "addpage") || len(content) < 10000 {
			t.Error(" docAsDocx not as expected", nam, len(content))
		}
		*/
	}

	nam, content, err = c.GetDocumentAsDocx("XXXXXXXXXX")
	if err == nil {
		t.Errorf("did not error on bad document id for get doc as docx, name: %s len(%d)",
			nam, len(content))
	} else {
		t.Log("INFO: get doc as docx bad doc id msg:", err)
	}

}
