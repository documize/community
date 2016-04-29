package mimeext

import "mime"

func init() {
	for key, value := range allMimeTypes {
		err := mime.AddExtensionType(key, value)
		if err != nil {
			panic(err)
		}
	}
}
