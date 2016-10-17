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

// loadFile provides file load tests to be run locally or from the main Documize repo.
func loadFile(c *documize.Client, t *testing.T, testFolder, testFileName string) string {
	docID := "" //NOT-FOUND
	ret, err := c.LoadFile(testFolder, testFileName)
	if err != nil {
		t.Error(err)
	}
	if ret == nil {
		t.Error("nil pointer returned for LoadFile")
	} else {
		docID = ret.BaseEntity.RefID
	}
	_, err = c.LoadFile("XXX", testFileName)
	if err == nil {
		t.Error("did not error on bad folder")
	} else {
		t.Log("INFO: Bad folder error:", err)
	}
	_, err = c.LoadFile(testFolder, "XXX")
	if err == nil {
		t.Error("did not error on bad file name")
	} else {
		t.Log("INFO: Bad file name error:", err)
	}
	return docID
}
