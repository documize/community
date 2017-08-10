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

	"github.com/gorilla/mux"
)

// Param returns the requested paramater from route request.
func Param(r *http.Request, p string) string {
	params := mux.Vars(r)
	return params[p]
}

// Params returns the paramaters from route request.
func Params(r *http.Request) map[string]string {
	return mux.Vars(r)
}
