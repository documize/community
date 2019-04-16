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
	"testing"
)

func TestSpamDomains(t *testing.T) {
	g1 := "good@example.org"
	b1 := "bad@qq.com"

	if IsBlockedEmailDomain(g1) {
		t.Errorf("%s should not be blocked email domain", g1)
	}
	if !IsBlockedEmailDomain(b1) {
		t.Errorf("%s should be blocked email domain", b1)
	}
}
