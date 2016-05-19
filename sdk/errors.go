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

package documize

import "strings"

const (
	errPfx = "{Error: '"
	errSfx = "'}"
)

func trimErrors(e string) string {
	return strings.TrimPrefix(strings.TrimSuffix(e, errSfx), errPfx)
}

func isError(e string) bool {
	return strings.HasPrefix(e, errPfx)
}
