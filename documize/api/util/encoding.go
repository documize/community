package util

import (
	"bytes"
	h "html/template"
	txt "text/template"
)

// EncodeTextTemplate encodes input using text/template
func EncodeTextTemplate(html string) (safe string, err error) {
	var out bytes.Buffer
	t, err := txt.New("foo").Parse(`{{define "T"}}{{.}}{{end}}`)
	err = t.ExecuteTemplate(&out, "T", html)
	return out.String(), err
}

// EncodeHTMLString encodes HTML string
func EncodeHTMLString(html string) (safe string) {
	return h.HTMLEscapeString(html)
}
