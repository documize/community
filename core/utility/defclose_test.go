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

package utility

import "testing"
import "os"
import "github.com/documize/community/core/log"

func TestDefclose(t *testing.T) {
	var f *os.File
	log.TestIfErr = true
	Close(f)
	if log.TestIfErr {
		t.Error("Close() did not error when it should have")
	}
}
