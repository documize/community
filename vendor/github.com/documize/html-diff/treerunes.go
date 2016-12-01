package htmldiff

import (
	"github.com/mb0/diff"

	"golang.org/x/net/html"
)

// treeRune holds an individual rune in the HTML along with the node it is in and, for convienience, its position (if in a container).
type treeRune struct {
	leaf   *html.Node
	letter rune
	pos    posT
}

// diffData is a type that exists in order to provide a diff.Data interface. It holds the two sets of treeRunes to difference.
type diffData struct {
	a, b *[]treeRune
}

// Equal exists to fulfill the diff.Data interface.
// NOTE: this is usually the most called function in the package!
func (dd diffData) Equal(i, j int) bool {
	if (*dd.a)[i].letter != (*dd.b)[j].letter {
		return false
	}
	if !posEqual((*dd.a)[i].pos, (*dd.b)[j].pos) {
		return false
	}
	return nodeBranchesEqual((*dd.a)[i].leaf, (*dd.b)[j].leaf)
}

// nodeBranchesEqual checks that two leaves come from branches that can be compared.
func nodeBranchesEqual(leafA, leafB *html.Node) bool {
	if !nodeEqualExText(leafA, leafB) {
		return false
	}
	if leafA.Parent == nil && leafB.Parent == nil {
		return true // at the top of the tree
	}
	if leafA.Parent != nil && leafB.Parent != nil {
		return nodeEqualExText(leafA.Parent, leafB.Parent) // go up to the next level
	}
	return false // one of the leaves has a parent, the other does not
}

// attrEqual checks that the attributes of two nodes are the same.
func attrEqual(base, comp *html.Node) bool {
	if len(comp.Attr) != len(base.Attr) {
		return false
	}
	for a := range comp.Attr {
		if comp.Attr[a].Key != base.Attr[a].Key ||
			comp.Attr[a].Namespace != base.Attr[a].Namespace ||
			comp.Attr[a].Val != base.Attr[a].Val {
			return false
		}
	}
	return true
}

// compares nodes excluding their text
func nodeEqualExText(base, comp *html.Node) bool {
	if comp.DataAtom != base.DataAtom ||
		comp.Namespace != base.Namespace ||
		comp.Type != base.Type {
		return false
	}
	return attrEqual(base, comp)
}

// renders a tree of nodes into a slice of treeRunes.
func renderTreeRunes(n *html.Node, tr *[]treeRune) {
	p := getPos(n)
	if n.FirstChild == nil { // it is a leaf node
		switch n.Type {
		case html.TextNode:
			if len(n.Data) == 0 {
				*tr = append(*tr, treeRune{leaf: n, letter: '\u200b' /* zero-width space */, pos: p}) // make sure we catch the node, even if no data
			} else {
				for _, r := range []rune(n.Data) {
					*tr = append(*tr, treeRune{leaf: n, letter: r, pos: p})
				}
			}
		default:
			*tr = append(*tr, treeRune{leaf: n, letter: 0, pos: p})
		}
	} else {
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			renderTreeRunes(c, tr)
		}
	}
}

// wrapper for diff.Granular() -- should only concatanate changes for similar text nodes
func granular(gran int, dd diffData, changes []diff.Change) []diff.Change {
	ret := make([]diff.Change, 0, len(changes))
	startSame := 0
	changeCount := 0
	lastAleaf, lastBleaf := (*dd.a)[0].leaf, (*dd.b)[0].leaf
	for c, cc := range changes {
		if cc.A < len(*dd.a) && cc.B < len(*dd.b) &&
			lastAleaf.Type == html.TextNode && lastBleaf.Type == html.TextNode &&
			(*dd.a)[cc.A].leaf == lastAleaf && (*dd.b)[cc.B].leaf == lastBleaf &&
			nodeEqualExText(lastAleaf, lastBleaf) { // TODO is this last constraint required?
			// do nothing yet, queue it up until there is a difference
			changeCount++
		} else { // no match
			if changeCount > 0 { // flush
				ret = append(ret, diff.Granular(gran, changes[startSame:startSame+changeCount])...)
			}
			ret = append(ret, cc)
			startSame = c + 1 // the one after this
			changeCount = 0
			if cc.A < len(*dd.a) && cc.B < len(*dd.b) {
				lastAleaf, lastBleaf = (*dd.a)[cc.A].leaf, (*dd.b)[cc.B].leaf
			}
		}
	}
	if changeCount > 0 { // flush
		ret = append(ret, diff.Granular(gran, changes[startSame:])...)
	}
	return ret
}
