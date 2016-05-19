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

func TestSlug(t *testing.T) {
	st(t, " Zip--up ", "zip-up")
}

func st(t *testing.T, in, out string) {
	got := MakeSlug(in)
	if got != out {
		t.Errorf("slug input `%s` got `%s` expected `%s`\n", in, got, out)
	}
}
