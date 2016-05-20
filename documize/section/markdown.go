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

package section

import (
	"net/http"

	"github.com/documize/blackfriday"
)

type markdown struct {
}

func init() {
	sectionsMap["markdown"] = &markdown{}
}

func (*markdown) Meta() TypeMeta {
	section := TypeMeta{}

	section.ID = "1470bb4a-36c6-4a98-a443-096f5658378b"
	section.Title = "Markdown"
	section.Description = "CommonMark based markdown content with preview"
	section.ContentType = "markdown"
	section.Order = 9998

	return section
}

// Command stub.
func (*markdown) Command(w http.ResponseWriter, r *http.Request) {
	writeEmpty(w)
}

// Render converts markdown data into HTML suitable for browser rendering.
func (*markdown) Render(config, data string) string {
	result := blackfriday.MarkdownCommon([]byte(data))

	return string(result)
}

// Refresh just sends back data as-is.
func (*markdown) Refresh(config, data string) string {
	return data
}
