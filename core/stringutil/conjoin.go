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

// Conjoin returns "Suzzane, Fatima and Brian" from string of items.
func Conjoin(conj string, items []string) string {
	if len(items) == 0 {
		return ""
	}
	if len(items) == 1 {
		return items[0]
	}
	if len(items) == 2 { // "a and b" not "a, and b"
		return items[0] + " " + conj + " " + items[1]
	}

	sep := ", "
	pieces := []string{items[0]}
	for _, item := range items[1 : len(items)-1] {
		pieces = append(pieces, sep, item)
	}
	pieces = append(pieces, sep, conj, " ", items[len(items)-1])

	return strings.Replace(strings.Join(pieces, ""), ", and ", " and ", 1)
}
