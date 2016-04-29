package mimeext

import (
	"fmt"
	"mime"
	"strings"
	"testing"
)

func Test_AddingMimeTypes(t *testing.T) {
	for key, _ := range allMimeTypes {
		if strings.HasPrefix(allMimeTypes[key], "text/") {
			if mime.TypeByExtension(key) != fmt.Sprintf("%s; charset=utf-8", allMimeTypes[key]) {
				t.Errorf("Missing mime type: %s", allMimeTypes[key])
			}
		} else {
			if mime.TypeByExtension(key) != allMimeTypes[key] {
				t.Errorf("Missing mime type: %s", allMimeTypes[key])
			}
		}

	}
}
