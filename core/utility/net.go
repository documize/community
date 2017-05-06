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

package utility

import (
	"strings"
)

// GetRemoteIP returns just the IP and not the port number
func GetRemoteIP(ip string) string {
	i := strings.LastIndex(ip, ":")
	if i == -1 {
		return ip
	}

	return ip[:i]
}
