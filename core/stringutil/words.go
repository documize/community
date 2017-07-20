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
	"unicode"

	nethtml "golang.org/x/net/html"
)

// Words returns a slice of words, where each word contains no whitespace, and each item of punctuation is its own word.
// This functionality is provided to enable verification of the text extraction algorithm across different implemntations.
func Words(ch HTML, inSqBr int, testMode bool) ([]string, int, error) {
	txt, err := ch.Text(testMode)
	if err != nil {
		return nil, inSqBr, err
	}
	txt = nethtml.UnescapeString(txt)

	words := []string{""}

	for _, c := range txt {
		if inSqBr > 0 {
			switch c {
			case ']':
				inSqBr--
			case '[':
				inSqBr++
			}
		} else {
			if c == rune(0x200B) { // http://en.wikipedia.org/wiki/Zero-width_space
				if testMode {
					c = ' ' // NOTE only replace with a space here if we are testing
				}
			}
			if c != rune(0x200B) { // http://en.wikipedia.org/wiki/Zero-width_space
				if c == '[' {
					inSqBr = 1
					words = append(words, "[") // open square bracket means potentially elided text
					words = append(words, "")
				} else {
					inSqBr = 0
					if unicode.IsPunct(c) || unicode.IsSymbol(c) || unicode.IsDigit(c) {
						if words[len(words)-1] == "" {
							words[len(words)-1] = string(c)
						} else {
							words = append(words, string(c))
						}
						words = append(words, "")
					} else {
						if unicode.IsGraphic(c) || unicode.IsSpace(c) {
							if unicode.IsSpace(c) {
								if words[len(words)-1] != "" {
									words = append(words, "")
								}
							} else {
								words[len(words)-1] += string(c)
							}
						}
					}
				}
			}
		}
	}
	if !testMode { // add dummy punctuation if not in test mode to avoid incorrect sentance concatanation
		words = append(words, ".")
	}
	return append(words, ""), inSqBr, nil // make sure there is always a blank entry at the end
}
