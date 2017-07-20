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

import "testing"

func TestHTML(t *testing.T) {
	type testConv struct {
		htm, txt string
		istest   bool
	}
	convTest := []testConv{
		{
			`<html><head><title>HTML TITLE</title></head><body><p>This <I>is</I>:</p><ul><li><a href="foo">Example</a><li><a href="/bar/baz">HTML text.</a><div class="documize-math">exclueded</div></ul></body></html>`,
			"This is : Example HTML text. ", false,
		},
		{
			`<p>This is:</p><ul><li><documize type="field-start"></documize> <documize type="field-end"></documize><documize type="unknown"></documize><li><a href="/bar/baz">HTML text.</a></ul>`,
			"This is: [ ] [ ] HTML text. ", true,
		},
	}
	for _, tst := range convTest {
		var ch HTML
		ch = HTML([]byte(tst.htm))
		//t.Logf("HTML: %s", ch)
		txt, err := ch.Text(tst.istest)
		if err != nil {
			t.Log(err)
			t.Fail()
		}
		expected := compressSpaces(tst.txt)
		got := compressSpaces(string(txt))
		if expected != got {
			t.Errorf("Conversion to text for `%s`, expected: `%s` got: `%s`\n",
				ch, expected, got)
		} //else {
		//	t.Logf("Text: %s", txt)
		//}
	}
}

func compressSpaces(s string) string {
	ret := ""
	inSpace := false
	for _, r := range s {
		switch r {
		case ' ', '\t', '\n', '\u200b' /*zero width space*/ :
			if !inSpace {
				ret += " "
			}
			inSpace = true
		default:
			inSpace = false
			ret += string(r)
		}
	}
	return ret
}

func TestHTMLescape(t *testing.T) {
	tianchao := "兲朝 test"
	expected := "&#20850;&#26397; test"

	gotString := EscapeHTMLcomplexChars(tianchao)
	if gotString != expected {
		t.Errorf("EscapeHTMLcomplexChars error got `%s` expected `%s`\n", gotString, expected)
	}

	gotBytes := EscapeHTMLcomplexCharsByte([]byte(tianchao))
	if string(gotBytes) != expected {
		t.Errorf("EscapeHTMLcomplexCharsByte error got `%s` expected `%s`\n", string(gotBytes), expected)
	}

}
