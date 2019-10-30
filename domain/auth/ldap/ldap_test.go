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

package ldap

import (
	"testing"
)

var testSplitData = []struct {
	in    string
	count int
}{
	{`CN=Surname\,Name,OU=Something,OU=AD-Example,OU=Examaple,DC=example,DC=example,DC=com`, 7},
	{`CN=Surname\, Name,OU=Something,OU=AD-Example,OU=Examaple,DC=example,DC=example,DC=com`, 7},
	{`CN=Surname\5c, Name,OU=Some\,thing,OU=AD-Example,OU=Examaple,DC=example,DC=example,DC=com`, 7},
	{`CN=Surname\5c,Name,OU=Something,OU=AD-Example,OU=Examaple,DC=example,DC=example,DC=com`, 7},
	{`CN=Given,OU=Something,OU=AD-Example,OU=Examaple,DC=example,DC=example,DC=com`, 7},
	{"cn=Hubert\\, J. Farnsworth,ou=people,dc=planetexpress,dc=com", 4},
}

func Test_SplitDN(t *testing.T) {
	for _, td := range testSplitData {
		sp := splitDN(td.in)
		if len(sp) != td.count {
			t.Errorf("Did not receive %d split entries", td.count)
			return
		}
		t.Logf("%d entries: %v", len(sp), sp)
	}
}
