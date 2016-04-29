package section

import (
	"net/http"
)

type code struct {
}

func init() {
	sectionsMap["code"] = &code{}
}

func (*code) Meta() TypeMeta {
	section := TypeMeta{}

	section.ID = "4f6f2b02-8397-483d-9bb9-eea1fef13304"
	section.Title = "Code"
	section.Description = "Code snippets supporting 50+ languages"
	section.ContentType = "code"
	section.IconFontLigature = "code"
	section.Order = 9997

	return section
}

// Command stub.
func (*code) Command(w http.ResponseWriter, r *http.Request) {
	writeEmpty(w)
}

// Render just sends back HMTL as-is.
func (*code) Render(config, data string) string {
	return data
}

// Refresh just sends back data as-is.
func (*code) Refresh(config, data string) string {
	return data
}
