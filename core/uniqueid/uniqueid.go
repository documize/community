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

// Package uniqueid provides randomly generated string 16 characters long.
package uniqueid

import (
	"github.com/documize/community/core/uniqueid/xid"
	"github.com/documize/community/core/uniqueid/xid16"
)

// Generate creates a randomly generated string suitable for use as part of an URI.
// It returns a string that is always 16 characters long.
func Generate() string {
	return xid.New().String()
}

// Generate16 creates a randomly generated 16 character length string suitable for use as part of an URI.
// It returns a string that is always 16 characters long.
func Generate16() string {
	return xid16.New().String()
}

// beqassjmvbajrivsc0eg
// beqat1bmvbajrivsc0f0

// beqat1bmvbajrivsc1ag
// beqat1bmvbajrivsc1g0
// beqat1bmvbajrivsc1ug
