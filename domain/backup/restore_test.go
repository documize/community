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

package backup

import (
	"testing"
)

// go test github.com/documize/community/domain/backup -run TestRemapORg
func TestRemapOrg(t *testing.T) {
	r := restoreHandler{MapOrgID: make(map[string]string)}
	r.MapOrgID["abc"] = "def"
	r.MapOrgID["xyz"] = "123"

	n := r.remapOrg("abc")
	if n != "def" {
		t.Errorf("expected def got %s", n)
	}

	n = r.remapOrg("xyz")
	if n != "123" {
		t.Errorf("expected 123 got %s", n)
	}

	n = r.remapOrg("jkl")
	if n != "jkl" {
		t.Errorf("expected jkl got %s", n)
	}
}

func TestRemapUser(t *testing.T) {
	r := restoreHandler{MapUserID: make(map[string]string)}
	r.MapUserID["abc"] = "def"
	r.MapUserID["xyz"] = "123"

	n := r.remapUser("abc")
	if n != "def" {
		t.Errorf("expected def got %s", n)
	}

	n = r.remapUser("xyz")
	if n != "123" {
		t.Errorf("expected 123 got %s", n)
	}

	n = r.remapUser("jkl")
	if n != "jkl" {
		t.Errorf("expected jkl got %s", n)
	}
}
