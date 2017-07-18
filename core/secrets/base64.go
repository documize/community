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

package secrets

import (
	"encoding/base64"
)

// EncodeBase64 is a convenience function to encode using StdEncoding.
func EncodeBase64(b []byte) []byte {
	return []byte(base64.StdEncoding.EncodeToString(b))
}

// DecodeBase64 is a convenience function to decode using StdEncoding.
func DecodeBase64(b []byte) ([]byte, error) {
	return base64.StdEncoding.DecodeString(string(b))
}
