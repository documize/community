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

package page

import (
	"fmt"
)

// Numberize calculates numbers for pages, e.g. 1, 1.1, 2.2.1
// for the document's Table of Contents.
func Numberize(pages []Page) {
	var prevPageLevel uint64
	parts := []int{1} // we store 1, 1, 2, and then generate numbering as "1.1.2"

	for i, p := range pages {
		// handle bad data
		if p.Level == 0 {
			p.Level = 1
		}

		if i != 0 {
			// we ...
			if p.Level > prevPageLevel {
				parts = append(parts, 1)
			}

			if p.Level == prevPageLevel {
				parts[len(parts)-1]++
			}

			if p.Level < prevPageLevel {
				end := (prevPageLevel - p.Level)
				if int(end) > len(parts) {
					end = uint64(len(parts))
				}
				parts = parts[0 : len(parts)-int(end)]

				i := len(parts) - 1
				if i < 0 {
					i = 0
				}
				parts[i]++
			}
		}

		// generate numbering for page using parts array
		numbering := ""
		for i, v := range parts {
			dot := ""
			if i != len(parts)-1 {
				dot = "."
			}
			numbering = fmt.Sprintf("%s%d%s", numbering, v, dot)
		}
		pages[i].Numbering = numbering

		// update state
		prevPageLevel = p.Level
	}
}
