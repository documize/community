package exttest

import (
	"testing"

	"github.com/documize/community/sdk"
	"github.com/documize/community/wordsmith/api"
)

// loadData provides data-loading tests to be run locally or from the main Documize repo.
func loadData(c *documize.Client, t *testing.T, testFolder string) string {
	ret, err := c.LoadData(testFolder, "LoadDataTest", &api.DocumentConversionResponse{
		//Err           error
		PagesHTML: []byte{}, // If empty, use Pages
		Pages: []api.Page{
			{
				Level: 1,                                    // uint64 // overall document is level 1, <H1> => level 2
				Title: "Test Data Title top",                // string
				Body:  []byte("This is the body of page 0"), // []byte
			},
			{
				Level: 2,                                    // uint64 // overall document is level 1, <H1> => level 2
				Title: "Test Data Title second",             // string
				Body:  []byte("This is the body of page 1"), // []byte
			},
		},
		EmbeddedFiles: []api.EmbeddedFile{
			{
				ID:   "TestID1",
				Type: "txt",
				Name: "test.txt",                            // do not change, used in exttest
				Data: []byte("This is a test text file.\n"), // do not change, used in exttest
			},
			{
				ID:   "TestID2",
				Type: "go",
				Name: "blob.go",
				Data: []byte("// Package blob is a test go file.\npackage blob\n"),
			},
		},
		Excerpt: "Ext Test Load Data - Excerpt",
	})
	if err != nil {
		t.Error(err)
	}

	_, err = c.LoadData(testFolder, "LoadDataTest", &api.DocumentConversionResponse{
		//Err           error
		PagesHTML: []byte{}, // If empty, use Pages
		Pages: []api.Page{
			{
				Level: 1, // overall document is level 1, <H1> => level 2
				Title: "Test Data Title top",
				Body:  []byte("This is the body of page 0"),
			},
		},
		EmbeddedFiles: []api.EmbeddedFile{
			{
				ID:   "TestID1",
				Type: "txt",
				Name: "test", // wrong, does not have correct extension
				Data: []byte("This is a test text file.\n"),
			},
		},
		Excerpt: "Ext Test Load Data - Excerpt",
	})
	if err == nil {
		t.Error("data load did not error on bad embedded file name")
	} else {
		t.Log("INFO: Bad embedded file name error:", err)
	}

	_, err = c.LoadData(testFolder, "LoadDataTest", &api.DocumentConversionResponse{})
	if err == nil {
		t.Error("data load did not error on no pages ")
	} else {
		t.Log("INFO: No pages error:", err)
	}

	return ret.BaseEntity.RefID
}
