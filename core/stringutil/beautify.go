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
	"path/filepath"
	"strings"
	"unicode"
)

// BeautifyFilename takes a filename and attempts to turn it into a readable form,
// as TitleCase natural language, suitable for the top level of a Document.
func BeautifyFilename(fn string) string {
	_, file := filepath.Split(fn)
	splits := strings.Split(file, ".")
	r := []rune(strings.Join(splits[:len(splits)-1], "."))

	// make any non-letter/digit characters space
	for i := range r {
		if !(unicode.IsLetter(r[i]) || unicode.IsDigit(r[i]) || r[i] == '.') {
			r[i] = ' '
		}
	}

	// insert spaces in front of any Upper/Lowwer 2-letter combinations
addSpaces:
	for i := range r {
		if i > 1 { // do not insert a space at the start of the file name
			if unicode.IsLower(r[i]) && unicode.IsUpper(r[i-1]) && r[i-2] != ' ' {
				n := make([]rune, len(r)+1)
				for j := 0; j < i-1; j++ {
					n[j] = r[j]
				}
				n[i-1] = ' '
				for j := i - 1; j < len(r); j++ {
					n[j+1] = r[j]
				}
				r = n
				goto addSpaces
			}
		}
	}

	// make the first letter of each word upper case
	for i := range r {
		switch i {
		case 0:
			r[i] = unicode.ToUpper(r[i])
		case 1: // the zero element should never be space
		default:
			if r[i-1] == ' ' {
				r[i] = unicode.ToUpper(r[i])
			}
		}
	}
	return string(r)
}
