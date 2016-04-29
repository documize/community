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
