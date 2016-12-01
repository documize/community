package htmldiff_test

import (
	"fmt"
	"io/ioutil"
	"os"
	"runtime"
	"strings"
	"testing"
	"time"

	"github.com/documize/html-diff"
)

var cfg = &htmldiff.Config{
	Granularity:  6,
	InsertedSpan: []htmldiff.Attribute{{Key: "style", Val: "background-color: palegreen; text-decoration: underline;"}},
	DeletedSpan:  []htmldiff.Attribute{{Key: "style", Val: "background-color: lightpink; text-decoration: line-through;"}},
	ReplacedSpan: []htmldiff.Attribute{{Key: "style", Val: "background-color: lightskyblue; text-decoration: overline;"}},
	CleanTags:    []string{"documize"},
}

type simpleTest struct {
	versions, diffs []string
}

var simpleTests = []simpleTest{

	{[]string{"chinese中文", `chinese<documize type="field-start"></documize>中文`, "中文", "chinese"},
		[]string{"chinese中文",
			`<span style="background-color: lightpink; text-decoration: line-through;">chinese</span>中文`,
			`chinese<span style="background-color: lightpink; text-decoration: line-through;">中文</span>`}},

	{[]string{"hElLo is that documize!", "Hello is that Documize?"},
		[]string{`<span style="background-color: lightpink; text-decoration: line-through;">hE</span><span style="background-color: palegreen; text-decoration: underline;">Hel</span>l<span style="background-color: lightpink; text-decoration: line-through;">L</span>o is that <span style="background-color: lightpink; text-decoration: line-through;">d</span><span style="background-color: palegreen; text-decoration: underline;">D</span>ocumize<span style="background-color: lightpink; text-decoration: line-through;">!</span><span style="background-color: palegreen; text-decoration: underline;">?</span>`}},

	{[]string{"abc", "<i>abc</i>", "<h1><i>abc</i></h1>"},
		[]string{`<i><span style="` + cfg.ReplacedSpan[0].Val + `">abc</span></i>`,
			`<h1><i><span style="` + cfg.ReplacedSpan[0].Val + `">abc</span></i></h1>`}},

	{[]string{"<p><span>def</span></p>", "def"},
		[]string{`<span style="` + cfg.ReplacedSpan[0].Val + `">def</span>`}},

	{[]string{`Documize Logo:<img src="http://documize.com/img/documize-logo.png" alt="Documize">`,
		"Documize Logo:", `<img src="http://documize.com/img/documize-logo.png" alt="Documize">`},
		[]string{`Documize Logo:<span style="background-color: lightpink; text-decoration: line-through;"><img src="http://documize.com/img/documize-logo.png" alt="Documize"/></span>`,
			`<span style="background-color: lightpink; text-decoration: line-through;">Documize Logo:</span><img src="http://documize.com/img/documize-logo.png" alt="Documize"/>`}},

	{[]string{"<ul><li>1</li><li>2</li><li>3</li></ul>",
		"<ul><li>one</li><li>two</li><li>three</li></ul>",
		"<ul><li>1</li><li><i>2</i></li><li>3</li><li>4</li></ul>"},
		[]string{`<ul><li><span style="background-color: lightpink; text-decoration: line-through;">1</span><span style="background-color: palegreen; text-decoration: underline;">one</span></li><li><span style="background-color: lightpink; text-decoration: line-through;">2</span><span style="background-color: palegreen; text-decoration: underline;">two</span></li><li><span style="background-color: lightpink; text-decoration: line-through;">3</span><span style="background-color: palegreen; text-decoration: underline;">three</span></li></ul>`,
			`<ul><li>1</li><li><i><span style="background-color: lightskyblue; text-decoration: overline;">2</span></i></li><li>3</li><li><span style="background-color: palegreen; text-decoration: underline;">4</span></li></ul>`}},

	{[]string{doc1 + doc2 + doc3 + doc4, doc1 + doc2 + doc3 + doc4, doc1 + doc3 + doc4, doc1 + "<i>" + doc2 + "</i>" + doc3 + doc4,
		doc1 + doc2 + "inserted" + doc3 + doc4, doc1 + doc2 + doc3 + "<div><p>New Div</p></div>" + doc4},
		[]string{``,
			`<li><span style="background-color: lightpink; text-decoration: line-through;">Automated document formatting</span></li>`,
			`<span style="background-color: lightskyblue; text-decoration: overline;">Automated document formatting</span>`,
			`<span style="background-color: palegreen; text-decoration: underline;">inserted</span>`,
			``}},

	{[]string{bbcNews1 + bbcNews2, bbcNews1 + "<div><i>HTML-Diff-Inserted</i></div>" + bbcNews2},
		[]string{`<div><i><span style="` + cfg.InsertedSpan[0].Val + `">HTML-Diff-Inserted</span></i></div>`}},

	{[]string{`<table border="1" style="width:100%">
  <tr>
    <td>Jack</td>
    <td>and</td> 
    <td>Jill</td>
  </tr>
  <tr>
    <td>Derby</td>
    <td>and</td> 
    <td>Joan</td>
  </tr>
</table>`,
		`<table border="1" style="width:100%">
  <tr>
    <td colspan="1">Jack</td>
    <td><b>and</b></td> 
    <td>Vera</td>
  </tr>
  <tr>
    <td>Derby</td>
    <td><i>locomotive</i></td> 
    <td>works</td>
  </tr>
</table>`,
		`<table border="1" style="width:100%">
  <tr>
    <td>Jack</td>
    <td>and</td> 
    <td>Jill</td>
  </tr>
  <tr>
    <td>Samson</td>
    <td>and</td> 
    <td>Delilah</td>
  </tr>
  <tr>
    <td>Derby</td>
    <td>and</td> 
    <td>Joan</td>
  </tr>
</table>`,
		`<table border="1" style="width:100%">
  <tr>
    <td>Jack</td>
    <td>and</td> 
    <td>Jill</td>
  </tr>
  <tr>
    <td>Samson</td>
    <td>and</td> 
    <td>Delilah</td>
  </tr>
  <tr>
    <td>Derby</td>
    <td>and</td> 
    <td>Joan</td>
  </tr>
  <tr>
    <td>Tweedledum</td>
    <td>and</td> 
    <td>Tweedledee</td>
  </tr>
</table>`, `<div><b><i>...and now for something completely different.</i></b></div>`},
		[]string{`<table border="1" style="width:100%;">
  <tbody><tr>
    <td>Jack</td>
    <td><b><span style="background-color: lightskyblue; text-decoration: overline;">and</span></b></td> 
    <td><span style="background-color: lightpink; text-decoration: line-through;">Jill</span><span style="background-color: palegreen; text-decoration: underline;">Vera</span></td>
  </tr>
  <tr>
    <td>Derby</td>
    <td><span style="background-color: lightpink; text-decoration: line-through;">and</span><i><span style="background-color: palegreen; text-decoration: underline;">locomotive</span></i></td> 
    <td><span style="background-color: lightpink; text-decoration: line-through;">J</span><span style="background-color: palegreen; text-decoration: underline;">w</span>o<span style="background-color: lightpink; text-decoration: line-through;">an</span><span style="background-color: palegreen; text-decoration: underline;">rks</span></td>
  </tr>
</tbody></table>`,
			`<table border="1" style="width:100%;">
  <tbody><tr>
    <td>Jack</td>
    <td>and</td> 
    <td>Jill</td>
  </tr>
  <tr>
    <td><span style="background-color: lightpink; text-decoration: line-through;">Derby</span><span style="background-color: palegreen; text-decoration: underline;">Samson</span></td>
    <td>and</td> 
    <td><span style="background-color: lightpink; text-decoration: line-through;">Jo</span><span style="background-color: palegreen; text-decoration: underline;">Delil</span>a<span style="background-color: lightpink; text-decoration: line-through;">n</span><span style="background-color: palegreen; text-decoration: underline;">h</span></td>
  </tr>
<span style="background-color: palegreen; text-decoration: underline;">  </span><tr><span style="background-color: palegreen; text-decoration: underline;">
    </span><td><span style="background-color: palegreen; text-decoration: underline;">Derby</span></td><span style="background-color: palegreen; text-decoration: underline;">
    </span><td><span style="background-color: palegreen; text-decoration: underline;">and</span></td><span style="background-color: palegreen; text-decoration: underline;"> 
    </span><td><span style="background-color: palegreen; text-decoration: underline;">Joan</span></td><span style="background-color: palegreen; text-decoration: underline;">
  </span></tr><span style="background-color: palegreen; text-decoration: underline;">
</span></tbody></table>`,
			`<table border="1" style="width:100%;">
  <tbody><tr>
    <td>Jack</td>
    <td>and</td> 
    <td>Jill</td>
  </tr>
  <tr>
    <td><span style="background-color: lightpink; text-decoration: line-through;">Derby</span><span style="background-color: palegreen; text-decoration: underline;">Samson</span></td>
    <td>and</td> 
    <td><span style="background-color: lightpink; text-decoration: line-through;">Jo</span><span style="background-color: palegreen; text-decoration: underline;">Delil</span>a<span style="background-color: lightpink; text-decoration: line-through;">n</span><span style="background-color: palegreen; text-decoration: underline;">h</span></td>
  </tr>
<span style="background-color: palegreen; text-decoration: underline;">  </span><tr><span style="background-color: palegreen; text-decoration: underline;">
    </span><td><span style="background-color: palegreen; text-decoration: underline;">Derby</span></td><span style="background-color: palegreen; text-decoration: underline;">
    </span><td><span style="background-color: palegreen; text-decoration: underline;">and</span></td><span style="background-color: palegreen; text-decoration: underline;"> 
    </span><td><span style="background-color: palegreen; text-decoration: underline;">Joan</span></td><span style="background-color: palegreen; text-decoration: underline;">
  </span></tr><span style="background-color: palegreen; text-decoration: underline;">
  </span><tr><span style="background-color: palegreen; text-decoration: underline;">
    </span><td><span style="background-color: palegreen; text-decoration: underline;">Tweedledum</span></td><span style="background-color: palegreen; text-decoration: underline;">
    </span><td><span style="background-color: palegreen; text-decoration: underline;">and</span></td><span style="background-color: palegreen; text-decoration: underline;"> 
    </span><td><span style="background-color: palegreen; text-decoration: underline;">Tweedledee</span></td><span style="background-color: palegreen; text-decoration: underline;">
  </span></tr><span style="background-color: palegreen; text-decoration: underline;">
</span></tbody></table>`,
			`<table border="1" style="width:100%;"><span style="background-color: lightpink; text-decoration: line-through;">
  </span><tbody><tr><span style="background-color: lightpink; text-decoration: line-through;">
    </span><td><span style="background-color: lightpink; text-decoration: line-through;">Jack</span></td><span style="background-color: lightpink; text-decoration: line-through;">
    </span><td><span style="background-color: lightpink; text-decoration: line-through;">and</span></td><span style="background-color: lightpink; text-decoration: line-through;"> 
    </span><td><span style="background-color: lightpink; text-decoration: line-through;">Jill</span></td><span style="background-color: lightpink; text-decoration: line-through;">
  </span></tr><span style="background-color: lightpink; text-decoration: line-through;">
  </span><tr><span style="background-color: lightpink; text-decoration: line-through;">
    </span><td><span style="background-color: lightpink; text-decoration: line-through;">Derby</span></td><span style="background-color: lightpink; text-decoration: line-through;">
    </span><td><span style="background-color: lightpink; text-decoration: line-through;">and</span></td><span style="background-color: lightpink; text-decoration: line-through;"> 
    </span><td><span style="background-color: lightpink; text-decoration: line-through;">Joan</span></td><span style="background-color: lightpink; text-decoration: line-through;">
  </span></tr><span style="background-color: lightpink; text-decoration: line-through;">
</span></tbody></table><div><b><i><span style="background-color: palegreen; text-decoration: underline;">...and now for something completely different.</span></i></b></div>`}},

	{[]string{"", `<ul><li>A</li><li>B</li><li>C</li></ul>`},
		[]string{`<ul><li><span style="background-color: palegreen; text-decoration: underline;">A</span></li><li><span style="background-color: palegreen; text-decoration: underline;">B</span></li><li><span style="background-color: palegreen; text-decoration: underline;">C</span></li></ul>`}},

	{[]string{`<p style="">The following typographical conventions are used in this Standard:</p><div style="padding-left:30px;text-indent:-10px">&bull; The first occurrence of a new term is written in italics. [<i>Example</i>: &#8230; is considered <i>normative</i>. <i>end example</i>]</div><div style="padding-left:30px;text-indent:-10px">&bull; A term defined as a basic definition is written in bold. [<i>Example</i>: <b>behavior</b> &#8212; External &#8230; <i>end example</i>]</div><div style="padding-left:30px;text-indent:-10px">&bull; The name of an XML element is written using an Element style. [<i>Example</i>: The root element is document.<i> end example</i>]</div><div style="padding-left:30px;text-indent:-10px">&bull; The name of an XML element attribute is written using an Attribute style. [<i>Example</i>: &#8230; an id attribute.<i> end example</i>]</div><div style="padding-left:30px;text-indent:-10px">&bull; An XML element attribute value is written using a constant-width style. [<i>Example</i>: &#8230; value of CommentReference.<i> end example</i>]</div><div style="padding-left:30px;text-indent:-10px">&bull; An XML element type name is written using a Type style. [<i>Example</i>: &#8230; as values of the xsd:anyURI data type.<i> end example</i>]</div>`,
		`<p>The following typographical conventions are used in this Standard:</p>
<div style="padding-left: 30px; text-indent: -10px;">• The first occurrence of a new term is written in italics. [<i>Example</i>: … is considered <i>normative</i>. <i>end example</i>]</div>
<div style="padding-left: 30px; text-indent: -10px;">• A term defined as a basic definition is written in bold. [<i>Example</i>: <b>behavior</b> — <b>External</b> … <i>end example</i>]</div>
<div style="padding-left: 30px; text-indent: -10px;">• The name of an XML element attribute is written using an Attribute style. [<i>Example</i>: … an id attribute.<i> end example</i>]</div>
<div style="padding-left: 30px; text-indent: -10px;">• And here is another entry in the list!</div>
<div style="padding-left: 30px; text-indent: -10px;">• An XML element attribute value is written using a constant-width style. [<i>Example</i>: … value of CommentReference.<i> end example</i>]</div>
<div style="padding-left: 30px; text-indent: -10px;">• An XML element type name is written using a Type style. [<i>Example</i>: … as values of the xsd:anyURI data type.<i> end example</i>]</div>
<div style="padding-left: 30px; text-indent: -10px;"> </div>
<div style="padding-left: 30px; text-indent: -10px;">elephant.</div>`},
		[]string{`<p>The following typographical conventions are used in this Standard:</p><span style="background-color: palegreen; text-decoration: underline;">
</span><div style="padding-left:30px;text-indent:-10px;">• The first occurrence of a new term is written in italics. [<i>Example</i>: … is considered <i>normative</i>. <i>end example</i>]</div><span style="background-color: palegreen; text-decoration: underline;">
</span><div style="padding-left:30px;text-indent:-10px;">• A term defined as a basic definition is written in bold. [<i>Example</i>: <b>behavior</b> — <b><span style="background-color: lightskyblue; text-decoration: overline;">External</span></b> … <i>end example</i>]</div><span style="background-color: palegreen; text-decoration: underline;">
</span><div style="padding-left:30px;text-indent:-10px;">• The name of an XML element <span style="background-color: lightpink; text-decoration: line-through;">is written using </span>a<span style="background-color: lightpink; text-decoration: line-through;">n Element style. [</span><i><span style="background-color: lightpink; text-decoration: line-through;">Example</span></i><span style="background-color: lightpink; text-decoration: line-through;">: The </span><span style="background-color: palegreen; text-decoration: underline;">tt</span>r<span style="background-color: lightpink; text-decoration: line-through;">oot element </span>i<span style="background-color: lightpink; text-decoration: line-through;">s document.</span><i><span style="background-color: lightpink; text-decoration: line-through;"> end example</span></i><span style="background-color: lightpink; text-decoration: line-through;">]</span><span style="background-color: lightpink; text-decoration: line-through;">• The name of an XML element attri</span>bute is written using an Attribute style. [<i>Example</i>: … an id attribute.<i> end example</i>]</div><span style="background-color: palegreen; text-decoration: underline;">
</span><div style="padding-left:30px;text-indent:-10px;">• An<span style="background-color: palegreen; text-decoration: underline;">d</span> <span style="background-color: palegreen; text-decoration: underline;">here is another entry in the list!</span></div><span style="background-color: palegreen; text-decoration: underline;">
</span><div style="padding-left:30px;text-indent:-10px;"><span style="background-color: palegreen; text-decoration: underline;">• An </span>XML element attribute value is written using a constant-width style. [<i>Example</i>: … value of CommentReference.<i> end example</i>]</div><span style="background-color: palegreen; text-decoration: underline;">
</span><div style="padding-left:30px;text-indent:-10px;">• An XML element type name is written using a Type style. [<i>Example</i>: … as values of the xsd:anyURI data type.<i> end example</i>]</div><span style="background-color: palegreen; text-decoration: underline;">
</span><div style="padding-left:30px;text-indent:-10px;"><span style="background-color: palegreen; text-decoration: underline;"> </span></div><span style="background-color: palegreen; text-decoration: underline;">
</span><div style="padding-left:30px;text-indent:-10px;"><span style="background-color: palegreen; text-decoration: underline;">elephant.</span></div>`}},

	{[]string{`

<p>The Graph that Generates Stories</p>

<p>StoryGraph is a graph designed to generate and narrate the causal interactions between things in a world. The graph can be populated with entities and expressive rules about the interactions between specific entities or different classes of entities. General rules can create new entities in the graph populated with the specific entities that triggered the rule and attributes defined by those entities. Entities have lifetimes and (coming soon) behaviors that trigger events over time.</p>

<p>Story graph is inspired by <a href="http://www.cs.cmu.edu/~cmartens/thesis/">progamming interactive worlds with linear logic</a> by <a href="http://www.cs.cmu.edu/~cmartens/index.html">Chris Martens</a> although it doesn&#8217;t realize any of the specific principles she develops in that thesis.</p>

<p>There is a more or less fleshed out example in ./example.js that produces sometimes surreal interactions in a snowy forest. To run that example, clone the repo and run the example directly with node.js:</p>

<pre><code class="language-shell">$ node example.js
</code></pre>

<p>You will see output something like this:</p>

<pre><code>The river joins with the shadow for a moment. The river does a whirling dance with the shadow. A bluejay discovers the river dancing with the shadow. A bluejay observes the patterns of the river dancing with the shadow. A bluejay dwells in the stillness of life. A duck approaches the whisper. A duck and the whisper pass eachother quietly.
</code></pre>

<p>This project is licensed under the terms of the MIT license.</p>

<p>##Types</p>

<p>The first step is to define types. While it is possible to make rules that apply to specific things, you&#8217;ll probably want to make general rules that apply to classes of things. First the basics:</p>

`, `<p>The Graph that Generates Stories</p>
<p>StoryGraph is a graph designed to generate and narrate the causal interactions between things in a world. The graph can be populated with entities and expressive rules about the interactions between specific entities or different classes of entities. General rules can create new entities in the graph populated with the specific entities that triggered the rule and attributes defined by those entities. Entities have lifetimes and (coming soon) behaviors that trigger events over time.</p>
<p>Story graph is inspired by <a href="http://www.cs.cmu.edu/~cmartens/thesis/">progamming interactive worlds with linear logic</a> by <a href="http://www.cs.cmu.edu/~cmartens/index.html">Chris Martens</a> although it doesn’t realize any of the specific principles she develops in that thesis.</p>
<p>There is a more or less fleshed out example in ./example.js that produces sometimes surreal interactions in a snowy forest. To run that example, clone the repo and run the example directly with node.js:</p>
<pre><code class="language-shell">$ node example.js
</code></pre>
<p>Elliott has input another line.</p>
<p>You will see output something like this:</p>
<pre><code>The river joins with the shadow for a moment. The river does a whirling dance with the shadow. A bluejay discovers the river dancing with the shadow. A bluejay observes the patterns of the river dancing with the shadow. A bluejay dwells in the stillness of life. A duck approaches the whisper. A duck and the whisper pass eachother quietly.
</code></pre>
<p>This project is licensed under the terms of the MIT license.</p>
<p>##Types</p>
<p>The first step is to define types. While it is possible to make rules that apply to specific things, you’ll probably want to make general rules that apply to classes of things. First the basics:</p>`},
		[]string{`<p>The Graph that Generates Stories</p>
<span style="background-color: lightpink; text-decoration: line-through;">
</span><p>StoryGraph is a graph designed to generate and narrate the causal interactions between things in a world. The graph can be populated with entities and expressive rules about the interactions between specific entities or different classes of entities. General rules can create new entities in the graph populated with the specific entities that triggered the rule and attributes defined by those entities. Entities have lifetimes and (coming soon) behaviors that trigger events over time.</p><span style="background-color: lightpink; text-decoration: line-through;">
</span>
<p>Story graph is inspired by <a href="http://www.cs.cmu.edu/~cmartens/thesis/">progamming interactive worlds with linear logic</a> by <a href="http://www.cs.cmu.edu/~cmartens/index.html">Chris Martens</a> although it doesn’t realize any of the specific principles she develops in that thesis.</p><span style="background-color: lightpink; text-decoration: line-through;">
</span>
<p>There is a more or less fleshed out example in ./example.js that produces sometimes surreal interactions in a snowy forest. To run that example, clone the repo and run the example directly with node.js:</p>
<span style="background-color: lightpink; text-decoration: line-through;">
</span><pre><code class="language-shell">$ node example.js
</code></pre>
<p><span style="background-color: palegreen; text-decoration: underline;">Elliott has input another line.</span></p>
<p>You will see output something like this:</p><span style="background-color: lightpink; text-decoration: line-through;">
</span>
<pre><code>The river joins with the shadow for a moment. The river does a whirling dance with the shadow. A bluejay discovers the river dancing with the shadow. A bluejay observes the patterns of the river dancing with the shadow. A bluejay dwells in the stillness of life. A duck approaches the whisper. A duck and the whisper pass eachother quietly.
</code></pre>
<span style="background-color: lightpink; text-decoration: line-through;">
</span><p>This project is licensed under the terms of the MIT license.</p><span style="background-color: lightpink; text-decoration: line-through;">
</span>
<p>##Types</p><span style="background-color: lightpink; text-decoration: line-through;">
</span>
<p>The first step is to define types. While it is possible to make rules that apply to specific things, you’ll probably want to make general rules that apply to classes of things. First the basics:</p><span style="background-color: lightpink; text-decoration: line-through;">

</span>`}},
}

func TestSimple(t *testing.T) {

	for s, st := range simpleTests {
		res, err := cfg.HTMLdiff(st.versions)
		if err != nil {
			t.Errorf("Simple test %d had error %v", s, err)
		}
		for d := range st.diffs {
			if d < len(res) {
				fn := fmt.Sprintf("testout/simple%d-%d.html", s, d)
				err := ioutil.WriteFile(fn, []byte(res[d]), 0777)
				if err != nil {
					t.Error(err)
				}
				if !strings.Contains(res[d], st.diffs[d]) {
					if len(res[d]) < 1024 {
						t.Errorf("Simple test %d diff %d wanted: `%s` got: `%s`", s, d, st.diffs[d], res[d])
					} else {
						t.Errorf("Simple test %d diff %d failed see file: `%s`", s, d, fn)
					}
				}
			}
		}
	}

}

func TestTimeoutAndMemory(t *testing.T) {
	dir := "." + string(os.PathSeparator) + "testin"
	files, err := ioutil.ReadDir(dir)
	if err != nil {
		t.Fatal(err)
	}
	testHTML := make([]string, 0, len(files))
	names := make([]string, 0, len(files))

	for _, file := range files {
		fn := file.Name()
		if strings.HasSuffix(fn, ".html") {
			ffn := dir + string(os.PathSeparator) + fn
			dat, err := ioutil.ReadFile(ffn)
			if err != nil {
				t.Fatal(err)
			}
			testHTML = append(testHTML, string(dat))
			names = append(names, fn)
		}
	}

	fmt.Println("NOTE: this test may take a few minutes to run")

	var ms runtime.MemStats
	var alloc1 uint64
	goroutineCount1 := 2 // the number of goroutines in a quiet state, more if test flags are used
	for i := 0; i < 2; i++ {
		testToMem(testHTML, names, t)
		limit := 60
		var goroutineCount, secs int
		for secs = 1; secs <= limit; secs++ {
			time.Sleep(time.Second) // wait for the timeout goroutines to finish
			goroutineCount, _ = runtime.GoroutineProfile(nil)
			if goroutineCount == goroutineCount1 {
				goto correctGoroutines
			}
		}
		t.Error(fmt.Sprintln("after ", secs, "seconds, num goroutines", goroutineCount, "when should be", goroutineCount1))
	correctGoroutines:
		runtime.GC()
		runtime.ReadMemStats(&ms)
		if alloc1 == 0 {
			alloc1 = ms.Alloc // this is set here to allow for static data set-up by 1st pass through
			fmt.Println("NOTE: base case established in", secs, "seconds. Memory used=", alloc1)
		} else {
			increase := (100.0 * float64(ms.Alloc) / float64(alloc1)) - 100.0
			if increase > 0.2 { // %
				t.Error(fmt.Sprintln("run", i, "memory usage changed from", alloc1, "to", ms.Alloc, "increase:", ms.Alloc-alloc1, "which is", increase, "%"))
			}
		}
	}
}

func testToMem(testHTML, names []string, t *testing.T) {
	for f := range testHTML {
		args := []string{testHTML[f], strings.ToLower(testHTML[f])}
		_, err := cfg.HTMLdiff(args) // don't care about the result as we are looking for crashes and time-outs
		if err != nil {
			if names[f] != "google.html" && names[f] != "bing.html" { // we expect errors on these two
				t.Errorf("comparing %s with its lower-case self error: %s", names[f], err)
			}
		}
	}
}
