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

package mail

import (
	"strings"
)

// IsBlockedEmailDomain checks to see if email domain
// is on spam/blacklisted email domain.
func IsBlockedEmailDomain(to string) bool {
	if strings.HasSuffix(to, "@qq.com") {
		return true
	}

	return false
}
