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

package util

import "testing"

func TestHTMLEncoding(t *testing.T) {
	html(t, "<script>alert('test')</script>", "&lt;script&gt;alert(&#39;test&#39;)&lt;/script&gt;")
	text(t, "<script>alert('test')</script>", "<script>alert('test')</script>")
}

func html(t *testing.T, in, out string) {
	got := EncodeHTMLString(in)
	if got != out {
		t.Errorf("EncodeHTMLString `%s` got `%s` expected `%s`\n", in, got, out)
	}
}

func text(t *testing.T, in, out string) {
	got, _ := EncodeTextTemplate(in)
	if got != out {
		t.Errorf("Html encode `%s` got `%s` expected `%s`\n", in, got, out)
	}
}
