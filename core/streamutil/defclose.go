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

package streamutil

import "io"

// Close is a convenience function to close an io.Closer, usually in a defer.
func Close(f interface{}) {
	if f != nil {
		if ff, ok := f.(io.Closer); ok {
			if ff != io.Closer(nil) {
				// log.IfErr(ff.Close())
			}
		}
	}
}
