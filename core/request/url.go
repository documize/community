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

// Package request provides HTTP request parsing functions.
package request

import (
	"net/http"
	"strings"
)

// IsSSL returns true if Referer header contains "https".
// If Referer header is empty we look at r.TLS setting.
func IsSSL(r *http.Request) bool {
	rf := r.Referer()
	if len(rf) > 1 {
		return strings.HasPrefix(rf, "https")
	}

	return r.TLS != nil
}
