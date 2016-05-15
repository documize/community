package section

import (
	"net/http"
)

type trello struct {
}

func init() {
	sectionsMap["trello"] = &trello{}
}

func (*trello) Meta() TypeMeta {
	section := TypeMeta{}

	section.ID = "c455a552-202e-441c-ad79-397a8152920b"
	section.Title = "Trello"
	section.Description = "Trello boards"
	section.ContentType = "trello"
	section.IconFontLigature = "dashboard"

	return section
}

// Command stub.
func (*trello) Command(w http.ResponseWriter, r *http.Request) {
	writeEmpty(w)
}

// Render just sends back HMTL as-is.
func (*trello) Render(config, data string) string {
	return data
}

// Refresh just sends back data as-is.
func (*trello) Refresh(config, data string) string {
	return data
}
