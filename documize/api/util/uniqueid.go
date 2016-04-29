// Package util provides utility functions specific to the Dickens http-end-point component of Documize.
package util

import "github.com/rs/xid"

// UniqueID creates a randomly generated string suitable for use as part of an URI.
// It returns a string that is always 16 characters long.
func UniqueID() string {
	return xid.New().String()
}
