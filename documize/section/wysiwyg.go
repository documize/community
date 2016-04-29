package section

import (
	"net/http"
)

// reading:
//      composition
//      reflection

type wysiwyg struct {
}

func init() {
	sectionsMap["wysiwyg"] = &wysiwyg{}
}

func (*wysiwyg) Meta() TypeMeta {
	section := TypeMeta{}

	section.ID = "0f024fa0-d017-4bad-a094-2c13ce6edad7"
	section.Title = "Rich Text"
	section.Description = "WYSIWYG editing with cut-paste image support"
	section.ContentType = "wysiwyg"
	section.IconFontLigature = "format_bold"
	section.Order = 9999

	return section
}

// Command stub.
func (*wysiwyg) Command(w http.ResponseWriter, r *http.Request) {
	writeEmpty(w)
}

// Render returns data as-is (HTML).
func (*wysiwyg) Render(config, data string) string {
	return data
}

// Refresh just sends back data as-is.
func (*wysiwyg) Refresh(config, data string) string {
	return data
}
