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
	section.Description = "CommonMark based markdown editing"
	section.ContentType = "markdown"
	section.IconFontLigature = "functions"
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
