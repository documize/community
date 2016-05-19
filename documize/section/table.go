package section

import (
	"net/http"
)

type table struct {
}

func init() {
	sectionsMap["table"] = &table{}
}

func (*table) Meta() TypeMeta {
	section := TypeMeta{}

	section.ID = "81a2ea93-2dfc-434d-841e-54b832492c92"
	section.Title = "Table"
	section.Description = "Table with rows, columns and formatting"
	section.ContentType = "table"
	section.IconFile = "sections/table.png"
	section.Order = 9996

	return section
}

// Command stub.
func (*table) Command(w http.ResponseWriter, r *http.Request) {
	writeEmpty(w)
}

// Render sends back data as-is (HTML).
func (*table) Render(config, data string) string {
	return data
}

// Refresh just sends back data as-is.
func (*table) Refresh(config, data string) string {
	return data
}
