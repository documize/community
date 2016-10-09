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

package database

import "testing"

// go test github.com/documize/community/core/database -run TestVersionExtract
func TestVersionExtract(t *testing.T) {
	ts(t, "5", 5)
	ts(t, "45-0ubuntu0-12.12.3", 45)
	ts(t, "untu0-12.12.3", 0)
	ts(t, "junk-string", 0)
	ts(t, "somethingstring", 0)
}

func ts(t *testing.T, in string, out int) {
	got := ExtractVersionNumber(in)

	if got != out {
		t.Errorf("version input `%s` got `%d` expected `%d`\n", in, got, out)
	}
}
