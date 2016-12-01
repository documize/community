package htmldiff

import "golang.org/x/net/html"

// posTT gives the relative position within one level of a nested container.
type posTT struct {
	nodesBefore int
	node        *html.Node
}

// posT gives the relative position within a nested set of containers.
type posT []posTT

// getPos returns the relative posion of this node within the enclosing containers, if there are any.
func getPos(n *html.Node) posT {
	if n == nil {
		return nil
	}
	depth := 0
	for root := n; inContainer(root); root = root.Parent {
		depth++
	}
	ret := make([]posTT, 0, depth) // for speed
	for root := n; depth > 0; root = root.Parent {
		var before int
		for sib := root.Parent.FirstChild; sib != root; sib = sib.NextSibling {
			if sib.Type == html.ElementNode {
				before++
			}
		}
		ret = append(ret, posTT{before, root})
		depth--
	}
	return ret
}

func posEqual(a, b posT) bool {
	if len(a) != len(b) {
		return false
	}
	for i, aa := range a {
		if aa.nodesBefore != b[i].nodesBefore {
			return false
		}
	}
	return true
}
