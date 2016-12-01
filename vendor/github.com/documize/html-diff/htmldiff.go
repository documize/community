package htmldiff

import (
	"bytes"
	"errors"
	"strings"
	"time"

	"github.com/mb0/diff"

	"golang.org/x/net/html"
)

// Attribute exists so that this package does not export html.Attribute, to allow vendoring of "golang.org/x/net/html".
type Attribute struct {
	Namespace, Key, Val string
}

// return the "golang.org/x/net/html" version of a slice of Attribute
func convertAttributes(atts []Attribute) []html.Attribute {
	ret := make([]html.Attribute, 0, len(atts))
	for _, a := range atts {
		ret = append(ret, html.Attribute{
			Namespace: a.Namespace,
			Key:       a.Key,
			Val:       a.Val,
		})
	}
	return ret
}

// Config describes the way that HTMLdiff works.
type Config struct {
	Granularity                             int         // how many letters to put together for a change, if possible
	InsertedSpan, DeletedSpan, ReplacedSpan []Attribute // the attributes for the span tags wrapping changes
	CleanTags                               []string    // HTML tags to clean from the input
}

// HTMLdiff finds all the differences in the versions of HTML snippits,
// versions[0] is the original, all other versions are the edits to be compared.
// The resulting merged HTML snippits are as many as there are edits to compare.
func (c *Config) HTMLdiff(versions []string) ([]string, error) {
	if len(versions) < 2 {
		return nil, errors.New("there must be at least two versions to diff, the 0th element is the base")
	}
	parallelErrors := make(chan error, len(versions))
	sourceTrees := make([]*html.Node, len(versions))
	sourceTreeRunes := make([]*[]treeRune, len(versions))
	firstLeaves := make([]int, len(versions))
	for v, vv := range versions {
		go func(v int, vv string) {
			var err error
			sourceTrees[v], err = html.Parse(strings.NewReader(vv))
			if err == nil {
				tr := make([]treeRune, 0, c.clean(sourceTrees[v]))
				sourceTreeRunes[v] = &tr
				renderTreeRunes(sourceTrees[v], &tr)
				leaf1, ok := firstLeaf(findBody(sourceTrees[v]))
				if leaf1 == nil || !ok {
					firstLeaves[v] = 0 // could be wrong, but correct for simple examples
				} else {
					for x, y := range tr {
						if y.leaf == leaf1 {
							firstLeaves[v] = x
							break
						}
					}
				}
			}
			parallelErrors <- err
		}(v, vv)
	}
	for range versions {
		if err := <-parallelErrors; err != nil {
			return nil, err
		}
	}

	// now all the input trees are buit, we can do the merge
	mergedHTMLs := make([]string, len(versions)-1)

	for m := range mergedHTMLs {
		go func(m int) {
			treeRuneLimit := 250000 // from initial testing
			if len(*sourceTreeRunes[0]) > treeRuneLimit || len(*sourceTreeRunes[m+1]) > treeRuneLimit {
				parallelErrors <- errors.New("input data too large")
				return
			}
			dd := diffData{a: sourceTreeRunes[0], b: sourceTreeRunes[m+1]}
			var changes []diff.Change
			ch := make(chan []diff.Change)
			go func(ch chan []diff.Change) {
				ch <- diff.Diff(len(*sourceTreeRunes[0]), len(*sourceTreeRunes[m+1]), dd)
			}(ch)
			to := time.After(time.Second * 3)
			select {
			case <-to:
				parallelErrors <- errors.New("diff.Diff() took too long")
				go func(ch chan []diff.Change) {
					<-ch // make sure the timed-out diff cleans-up
				}(ch)
				return
			case changes = <-ch:
				// we have the diff
				go func(to <-chan time.Time) {
					<-to // make sure we don't leak the timer goroutine
				}(to)
			}
			changes = granular(c.Granularity, dd, changes)
			mergedTree, err := c.walkChanges(changes, sourceTreeRunes[0], sourceTreeRunes[m+1], firstLeaves[0], firstLeaves[m+1])
			if err != nil {
				parallelErrors <- err
				return
			}
			var mergedHTMLbuff bytes.Buffer
			err = html.Render(&mergedHTMLbuff, mergedTree)
			if err != nil {
				parallelErrors <- err
				return
			}
			mergedHTML := mergedHTMLbuff.Bytes()
			pfx := []byte("<html><head></head><body>")
			sfx := []byte("</body></html>")
			if bytes.HasPrefix(mergedHTML, pfx) && bytes.HasSuffix(mergedHTML, sfx) {
				mergedHTML = bytes.TrimSuffix(bytes.TrimPrefix(mergedHTML, pfx), sfx)
				mergedHTMLs[m] = string(mergedHTML)
				parallelErrors <- nil
				return
			}
			parallelErrors <- errors.New("correct render wrapper HTML not found: " + string(mergedHTML))
		}(m)
	}
	for range mergedHTMLs {
		if err := <-parallelErrors; err != nil {
			return nil, err
		}
	}
	return mergedHTMLs, nil
}

// walkChanges goes through the changes identified by diff, identifies where a change is a repacement,
// then appends the changes to the output set. Once that set is complete, after ctx.flush(),
// they are finally resorted (to re-order those in containers) and written out using ctx.sortAndWrite().
func (c *Config) walkChanges(changes []diff.Change, ap, bp *[]treeRune, aIdx, bIdx int) (*html.Node, error) {
	mergedTree, err := html.Parse(strings.NewReader("<html><head></head><body></body></html>"))
	if err != nil {
		return nil, err
	}
	a := *ap
	b := *bp
	ctx := &appendContext{c: c, target: mergedTree}
	for _, change := range changes {
		for aIdx < change.A && bIdx < change.B {
			ctx.append('=', a, aIdx)
			aIdx++
			bIdx++
		}
		if change.Del == change.Ins && change.Del > 0 {
			for i := 0; i < change.Del; i++ {
				if aIdx+i >= len(a) || bIdx+i >= len(b) {
					goto textDifferent // defensive after fuzz testing
				}
				if a[aIdx+i].letter != b[bIdx+i].letter {
					goto textDifferent
				}
			}
			for i := 0; i < change.Del; i++ {
				ctx.append('~', b, bIdx)
				aIdx++
				bIdx++
			}
			goto textSame
		}
	textDifferent:
		for i := 0; i < change.Del; i++ {
			ctx.append('-', a, aIdx)
			aIdx++
		}
		for i := 0; i < change.Ins; i++ {
			ctx.append('+', b, bIdx)
			bIdx++
		}
	textSame:
	}
	for aIdx < len(a) && bIdx < len(b) {
		ctx.append('=', a, aIdx)
		aIdx++
		bIdx++
	}
	ctx.flush()
	ctx.sortAndWrite()
	return mergedTree, nil
}
