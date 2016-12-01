package htmldiff_test

import (
	"fmt"

	"github.com/documize/html-diff"
)

func ExampleHTMLdiff() {
	previousHTML := `<p>Bullet list:</p><ul><li>first item</li><li>第二</li><li>3rd</li></ul>`
	latestHTML := `<p>Bullet <b>list:</b></p><ul><li>first item</li><li>number two</li><li>3rd</li></ul>`
	var cfg = &htmldiff.Config{
		Granularity:  5,
		InsertedSpan: []htmldiff.Attribute{{Key: "style", Val: "background-color: palegreen;"}},
		DeletedSpan:  []htmldiff.Attribute{{Key: "style", Val: "background-color: lightpink;"}},
		ReplacedSpan: []htmldiff.Attribute{{Key: "style", Val: "background-color: lightskyblue;"}},
		CleanTags:    []string{""},
	}

	res, err := cfg.HTMLdiff([]string{previousHTML, latestHTML})
	if err != nil {
		fmt.Println(err)
	}
	mergedHTML := res[0]

	fmt.Println(mergedHTML)
	// Output:
	// <p>Bullet <b><span style="background-color: lightskyblue;">list:</span></b></p><ul><li>first item</li><li><span style="background-color: lightpink;">第二</span><span style="background-color: palegreen;">number two</span></li><li>3rd</li></ul>
}
