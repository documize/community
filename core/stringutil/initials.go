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

import (
	"strings"
)

// MakeInitials returns user initials from firstname and lastname.
func MakeInitials(firstname, lastname string) string {
	firstname = strings.TrimSpace(firstname)
	lastname = strings.TrimSpace(lastname)
	a := ""
	b := ""

	if len(firstname) > 0 {
		a = string([]rune(firstname)[:1])
	}

	if len(lastname) > 0 {
		b = string([]rune(lastname)[:1])
	}

	return strings.ToUpper(a + b)
}
