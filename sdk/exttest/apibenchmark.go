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
	"errors"
	"os"

	"github.com/documize/community/sdk"
)

// APIbenchmark is the main entry point for the benchmark code, it is called by both internal and external tests.
func APIbenchmark() error {
	testEndPt := os.Getenv("DOCUMIZEAPI")             //e.g. "http://localhost:5002"
	testAuth := os.Getenv("DOCUMIZEAUTH")             //e.g. "demo1:jim@davidson.com:demo123"
	c, err := documize.NewClient(testEndPt, testAuth) // should work
	if err != nil {
		return err
	}
	folders, err := c.GetNamedFolderIDs("Test")
	if err != nil {
		return err
	}
	if len(folders) == 0 {
		return errors.New("no Test folder for test user")
	}
	testFolder := folders[0]
	_ = testFolder
	// TODO add benchmark code
	return nil
}
