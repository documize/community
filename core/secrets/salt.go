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
	"crypto/rand"
	"fmt"
)

// RandSalt generates 16 character value for use in JWT token as salt.
func RandSalt() string {
	b := make([]byte, 17)

	_, err := rand.Read(b)
	if err != nil {
		return ""
	}

	for k, v := range b {
		if (v >= 'a' && v <= 'z') || (v >= 'A' && v <= 'Z') || (v >= '0' && v <= '0') {
			b[k] = v
		} else {
			s := fmt.Sprintf("%x", v)
			b[k] = s[0]
		}
	}

	return string(b)
}
