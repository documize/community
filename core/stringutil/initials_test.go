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

// go test github.com/documize/community/core/stringutil -run TestInitials
func TestInitials(t *testing.T) {
	in(t, "Harvey", "Kandola", "HK")
	in(t, "Harvey", "", "H")
	in(t, "", "Kandola", "K")
	in(t, "", "", "")
	in(t, "Иванов", "Иванов", "ИИ")
}

func in(t *testing.T, firstname, lastname, expecting string) {
	initials := MakeInitials(firstname, lastname)
	if initials != expecting {
		t.Errorf("expecting initials of `%s` got `%s`\n", expecting, initials)
	}
}
