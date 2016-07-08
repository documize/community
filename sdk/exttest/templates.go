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
	"testing"

	"github.com/documize/community/sdk"
)

func testTemplates(t *testing.T, c *documize.Client, testFolder, testFile, testData string) {

	temps, err := c.GetTemplates(true)
	if err != nil {
		t.Error(err)
	} else {
		if len(temps) == 0 {
			t.Log("INFO: no stock templates found in the database")
		} else {
			t.Logf("INFO: testing with stock template %#v", temps[0])
			docID, errStart := c.StartDocumentFromTemplate(true, temps[0].ID, testFolder)
			if errStart != nil {
				t.Error(errStart)
			} else {
				t.Log("INFO: created document", docID)
				err = c.DeleteDocument(docID)
				if err != nil {
					t.Error(err)
				}
			}
		}
	}

	temps, err = c.GetTemplates(false)
	if err != nil {
		t.Error(err)
	} else {
		if len(temps) == 0 {
			t.Log("INFO: no saved templates found in the database")
		} else {
			t.Logf("INFO: testing with saved template %#v", temps[0])
			docID, err := c.StartDocumentFromTemplate(false, temps[0].ID, testFolder)
			if err != nil {
				t.Error(err)
			} else {
				t.Log("INFO: created document", docID)
				err = c.DeleteDocument(docID)
				if err != nil {
					t.Error(err)
				}
			}
		}
	}

}
