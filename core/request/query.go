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

import "net/http"

// Query returns query string from HTTP request.
func Query(r *http.Request, key string) string {
	query := r.URL.Query()
	return query.Get(key)
}
