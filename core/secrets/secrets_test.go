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

package secrets

import "testing"

func TestSecrets(t *testing.T) {
	mimi := "007"
	b, e := MakeAES(mimi)
	if e != nil {
		t.Fatal(e)
	}
	mm, e2 := DecryptAES(b)
	if e2 != nil {
		t.Fatal(e2)
	}
	if mimi != string(mm) {
		t.Errorf("wanted %s got %s", mimi, string(mm))
	}

	_, ee := DecryptAES([]byte{})
	if ee == nil {
		t.Error("should have errored on empty cypher")
	}

}
