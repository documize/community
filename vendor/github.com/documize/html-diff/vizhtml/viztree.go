// Package vizhtml provides a way to display html node trees for debug purposes.
package vizhtml

import (
	"strings"

	"golang.org/x/net/html"
)

// Tree provides a text visualisation of the given html.Node tree, one node per line, stopping at the target.
// It is intended for debugging.
func Tree(n, target *html.Node) string {
	r, _ := vizTree0(n, target, 0, "")
	return r
}

// nodeLevel returns the prefix to show the depth of the node
func nodeLevel(l int) (s string) {
	for i := 0; i < l; i++ {
		s += "-"
	}
	s += ">"
	return s
}

// vizTree0 is the recursive node tree walker.
func vizTree0(n, target *html.Node, l int, s string) (string, bool) {
	if n == nil {
		return s, true
	}
	s += nodeLevel(l)
	switch n.Type {
	case html.ErrorNode:
		s += " Error: "
	case html.TextNode:
		s += " Text: "
	case html.DocumentNode:
		s += "Document: "
	case html.ElementNode:
		s += "Element: "
	case html.CommentNode:
		s += "Comment: "
	case html.DoctypeNode:
		s += "DocType: "
	}
	if len(n.Data) > 10 {
		s += strings.Replace(n.Data[:10], "\n", "", -1)
	} else {
		s += strings.Replace(n.Data, "\n", "", -1)
	}
	if n == target {
		return s + " (Target)\n", true
	}
	s += "\n"
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		var found bool
		s, found = vizTree0(c, target, l+1, s)
		if found {
			return s, true
		}
	}
	return s, false
}
