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

package stringutil

import "testing"

func TestBeautify(t *testing.T) {
	bs(t, "DooDah$day.zip", "Doo Dah Day")
}

func bs(t *testing.T, in, out string) {
	got := BeautifyFilename(in)
	if got != out {
		t.Errorf("BeautifyFilename input `%s` got `%s` expected `%s`\n", in, got, out)
	}
}
