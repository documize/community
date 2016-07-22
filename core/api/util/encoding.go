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
