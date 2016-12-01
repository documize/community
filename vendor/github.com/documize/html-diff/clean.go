package htmldiff

import (
	htm "html"
	"strings"
	"unicode/utf8"

	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
)

// delAttr() deletes an unwanted attribute.
func delAttr(attr []html.Attribute, ai int) (ret []html.Attribute) {
	if len(attr) <= 1 || ai >= len(attr) {
		return nil
	}
	return append(attr[:ai], attr[ai+1:]...)
}

// clean normalises styles/colspan and removes any CleanTags specified, along with newlines;
// but also makes all the character handling (for example "&#160;" as utf-8) the same.
// It returns the estimated number of treeRunes that will be used.
// TODO more cleaning of the input HTML, as required.
func (c *Config) clean(n *html.Node) int {
	size := 1
	switch n.Type {
	case html.ElementNode:
		for ai := 0; ai < len(n.Attr); ai++ {
			a := n.Attr[ai]
			switch {
			case strings.ToLower(a.Key) == "style":
				if strings.TrimSpace(a.Val) == "" { // delete empty styles
					n.Attr = delAttr(n.Attr, ai)
					ai--
				} else { // tidy non-empty styles
					// TODO there could be more here to make sure the style entries are in the same order etc.
					n.Attr[ai].Val = strings.Replace(a.Val, " ", "", -1)
					if !strings.HasSuffix(n.Attr[ai].Val, ";") {
						n.Attr[ai].Val += ";"
					}
				}
			case n.DataAtom == atom.Td &&
				strings.ToLower(a.Key) == "colspan" &&
				strings.TrimSpace(a.Val) == "1":
				n.Attr = delAttr(n.Attr, ai)
				ai--
			}
		}
	case html.TextNode:
		n.Data = htm.UnescapeString(n.Data)
		size += utf8.RuneCountInString(n.Data) - 1 // len(n.Data) would be faster, but use more memory
	}
searchChildren:
	for ch := n.FirstChild; ch != nil; ch = ch.NextSibling {
		switch ch.Type {
		case html.ElementNode:
			for _, rr := range c.CleanTags {
				if rr == ch.Data {
					n.RemoveChild(ch)
					goto searchChildren
				}
			}
		}
		size += c.clean(ch)
	}
	return size
}
