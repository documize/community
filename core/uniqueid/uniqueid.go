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

// Package uniqueid provides utility functions specific to the http-end-point component of Documize.
package uniqueid

import "github.com/rs/xid"

// Generate creates a randomly generated string suitable for use as part of an URI.
// It returns a string that is always 16 characters long.
func Generate() string {
	return xid.New().String()
}
