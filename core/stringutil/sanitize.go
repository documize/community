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

package stringutil

import (
	"strings"
)

// CleanDBValue returns like query minus dodgy characters.
func CleanDBValue(filter string) string {
	filter = strings.ReplaceAll(filter, " ", "")
	filter = strings.ReplaceAll(filter, " ' ", "")
	filter = strings.ReplaceAll(filter, "'", "")
	filter = strings.ReplaceAll(filter, " ` ", "")
	filter = strings.ReplaceAll(filter, "`", "")
	filter = strings.ReplaceAll(filter, " \" ", "")
	filter = strings.ReplaceAll(filter, "\"", "")
	filter = strings.ReplaceAll(filter, " -- ", "")
	filter = strings.ReplaceAll(filter, "--", "")
	filter = strings.ReplaceAll(filter, ";", "")
	filter = strings.ReplaceAll(filter, ":", "")
	filter = strings.ReplaceAll(filter, "~", "")
	filter = strings.ReplaceAll(filter, "!", "")
	filter = strings.ReplaceAll(filter, "#", "")
	filter = strings.ReplaceAll(filter, "%", "")
	filter = strings.ReplaceAll(filter, "*", "")
	filter = strings.ReplaceAll(filter, "\\", "")
	filter = strings.ReplaceAll(filter, "/", "")
	filter = strings.ReplaceAll(filter, "union select", "")
	filter = strings.ReplaceAll(filter, "UNION SELECT", "")
	filter = strings.ReplaceAll(filter, " from ", "")
	filter = strings.ReplaceAll(filter, " FROM ", "")
	filter = strings.ReplaceAll(filter, " OR 1=1 ", "")
	filter = strings.ReplaceAll(filter, " OR 1=1 ", "")
	filter = strings.ReplaceAll(filter, " = ", "")
	filter = strings.ReplaceAll(filter, "=", "")

	filter = strings.TrimSpace(filter)

	return filter
}
