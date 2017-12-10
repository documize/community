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

package database

import "testing"

// go test github.com/documize/community/core/database -run TestGetVersion
func TestGetVersion(t *testing.T) {
	ts2(t, "5.7.10", []int{5, 7, 10})
	ts2(t, "5.7.10-log", []int{5, 7, 10})
	ts2(t, "5.7.10-demo", []int{5, 7, 10})
	ts2(t, "5.7.10-debug", []int{5, 7, 10})
	ts2(t, "5.7.16-10", []int{5, 7, 16})
	ts2(t, "5.7.12-0ubuntu0-12.12.3", []int{5, 7, 12})
	ts2(t, "10.1.20-MariaDB-1~jessie", []int{10, 1, 20})
	ts2(t, "ubuntu0-12.12.3", []int{0, 0, 0})
	ts2(t, "junk-string", []int{0, 0, 0})
	ts2(t, "somethingstring", []int{0, 0, 0})
}

func ts2(t *testing.T, in string, out []int) {
	got, _ := GetSQLVersion(in)

	// if err != nil {
	// 	t.Errorf("Unable to GetSQLVersion %s", err)
	// }

	for k, v := range got {
		if v != out[k] {
			t.Errorf("version input of %s got %d for position %d but expected %d\n", in, v, k, out[k])
		}
	}
}
