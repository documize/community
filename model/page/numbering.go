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
		if p.Level == 0 || (i == 0 && p.Level > 1) {
			p.Level = 1
		}

		if i != 0 {
			// we ...
			if p.Level > prevPageLevel {
				parts = append(parts, 1)
			}

			if p.Level == prevPageLevel {
				j := len(parts) - 1
				if j >= 0 {
					parts[j]++
				}
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
				if i >= 0 && i < len(parts) {
					parts[i]++
				}
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

		// Troubleshooting help
		if len(numbering) == 0 {
			fmt.Println(fmt.Sprintf("No number allocated to page %s ('%s')",
				pages[i].RefID, pages[i].Name))
		}

		// update state
		prevPageLevel = p.Level
	}
}

// Levelize ensure page level increments are consistent
// after a page is inserted or removed.
//
// Valid: 1, 2, 3, 4, 4, 4, 2, 1
// Invalid: 1, 2, 4, 4, 2, 1 (note the jump from 2 --> 4)
//
// Rules:
// 1. levels can increase by 1 only (e.g. from 1 to 2 to 3 to 4)
// 2. levels can decrease by any amount (e.g. drop from 4 to 1)
func Levelize(pages []Page) {
	var prevLevel uint64
	prevLevel = 1

	for i := 0; i < len(pages); i++ {
		currLevel := pages[i].Level

		// handle deprecated level value of 0
		if pages[i].Level == 0 {
			pages[i].Level = 1
		}

		// first time thru
		if i == 0 {
			// first time thru
			pages[i].Level = 1
			prevLevel = 1
			continue
		}

		if currLevel == prevLevel {
			// nothing doing
			continue
		}

		if currLevel > prevLevel+1 {
			// bad data detected e.g. prevLevel=1 and pages[i].Level=3
			// so we re-level to pages[i].Level=2 and all child pages
			// and then increment i to correct point
			prevLevel++
			pages[i].Level = prevLevel

			// safety check before entering loop and renumbering child pages
			if i+1 <= len(pages) {

				for j := i + 1; j < len(pages); j++ {
					if pages[j].Level < prevLevel {
						i = j
						break
					}

					if pages[j].Level == currLevel {
						pages[j].Level = prevLevel
					} else if (pages[j].Level - prevLevel) > 1 {
						currLevel = pages[j].Level
						prevLevel++
						pages[j].Level = prevLevel
					}

					i = j
				}
			}
			continue
		}

		prevLevel = currLevel
	}
}

// Sequenize will re-generate page sequence numbers for a document
func Sequenize(p []Page) {
	var seq float64
	seq = 2048
	for i := range p {
		p[i].Sequence = seq
		seq = seq * 2
	}
}
