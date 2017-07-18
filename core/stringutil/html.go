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
	"bytes"
	"fmt"
	"io"
	"strings"
	"unicode/utf8"

	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
)

// HTML describes a chunk of HTML, Text() method returns plain text.
type HTML string

// write out the textual element of the html node, if present, then iterate through the child nodes.
func writeText(n *html.Node, b io.Writer, isTest bool) {
	if !excluded(n) {
		switch n.Type {
		case html.TextNode:
			_, err := b.Write([]byte(n.Data + string(rune(0x200B)))) // + http://en.wikipedia.org/wiki/Zero-width_space
			if err != nil {
			}
			// TODO This use of zero-width-space (subsequently replaced by ' ' or ignored, depending on context)
			// TODO works well for in-word breaks, but at the expense of concatenating some words in error.
			// TODO It may be that better examination of the HTML structure could be used to determine
			// TODO when a space is, or is not, required. In that event we would not use zero-width-space.

		default:
			for c := n.FirstChild; c != nil; c = c.NextSibling {
				writeText(c, b, isTest)
			}
			switch n.DataAtom {
			case 0:
				if n.Data == "documize" {
					for _, a := range n.Attr {
						if a.Key == "type" {
							if isTest {
								var err error
								switch a.Val {
								case "field-start":
									_, err = b.Write([]byte(" [ "))
								case "field-end":
									_, err = b.Write([]byte(" ] "))
								default:
									_, err = b.Write([]byte(" [ ] "))
								}
								if err != nil {
								}
							}
							return
						}
					}
				}
			case atom.Span, atom.U, atom.B, atom.I, atom.Del, atom.Sub, atom.Sup:
				//NoOp
			default:
				_, err := b.Write([]byte(" ")) // add a space after each main element
				if err != nil {
				}
			}
		}
	}
}

func excluded(n *html.Node) bool {
	if n.DataAtom == atom.Div {
		for _, a := range n.Attr {
			if a.Key == "class" {
				switch a.Val {
				case "documize-first-page",
					"documize-exotic-image",
					"documize-footnote",
					"documize-graphictext",
					"documize-math":
					return true
				}
			}
		}
	}
	return false
}

// findBody finds the body HTML node if it exists in the tree. Required to bypass the page title text.
func findBody(n *html.Node) *html.Node {
	if n.DataAtom == atom.Body {
		return n
	}
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		r := findBody(c)
		if r != nil {
			return r
		}
	}
	return nil
}

// Text returns only the plain text elements of the HTML Chunk, concatanated with "\n",
// for use in the TOC or for text indexing.
func (ch HTML) Text(isTest bool) (string, error) {
	var b bytes.Buffer
	doc, err := html.Parse(strings.NewReader(string(ch)))
	if err != nil {
		return "", err
	}
	body := findBody(doc)
	if body == nil {
		body = doc
	}
	writeText(body, &b, isTest)
	return string(b.Bytes()), nil
}

// EscapeHTMLcomplexChars looks for "complex" characters within HTML
// and replaces them with the HTML escape codes which describe them.
// "Complex" characters are those encoded in more than one byte by UTF8.
func EscapeHTMLcomplexChars(s string) string {
	ret := ""
	for _, r := range s {
		if utf8.RuneLen(r) > 1 {
			ret += fmt.Sprintf("&#%d;", r)
		} else {
			ret += string(r)
		}
	}
	return ret
}

// EscapeHTMLcomplexCharsByte looks for "complex" characters within HTML
// and replaces them with the HTML escape codes which describe them.
// "Complex" characters are those encoded in more than one byte by UTF8.
func EscapeHTMLcomplexCharsByte(b []byte) []byte {
	var ret bytes.Buffer
	for len(b) > 0 {
		r, size := utf8.DecodeRune(b)
		if utf8.RuneLen(r) > 1 {
			fmt.Fprintf(&ret, "&#%d;", r)
		} else {
			_, err := ret.Write(b[:size])
			if err != nil {
			}
		}
		b = b[size:]
	}
	return ret.Bytes()
}
