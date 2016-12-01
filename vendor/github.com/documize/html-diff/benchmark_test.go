package htmldiff_test

import (
	"strings"
	"testing"

	"github.com/documize/html-diff"
)

var cfgBench = &htmldiff.Config{
	Granularity:  6,
	InsertedSpan: []htmldiff.Attribute{{Key: "style", Val: "background-color: palegreen; text-decoration: underline;"}},
	DeletedSpan:  []htmldiff.Attribute{{Key: "style", Val: "background-color: lightpink; text-decoration: line-through;"}},
	ReplacedSpan: []htmldiff.Attribute{{Key: "style", Val: "background-color: lightskyblue; text-decoration: overline;"}},
	CleanTags:    []string{"documize"},
}

func BenchmarkHTMLdiff(b *testing.B) {
	bbc := bbcNews1 + bbcNews2
	bbclc := strings.ToLower(bbc)
	args := []string{bbc, bbclc}
	for n := 0; n < b.N; n++ {
		_, err := cfgBench.HTMLdiff(args) // don't care about the result as we are looking at speed
		if err != nil {
			b.Errorf("comparing BBC news with its lower-case self error: %s", err)
		}
	}
}
