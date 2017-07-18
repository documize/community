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
	"sort"
	"strings"
	"testing"
)

func TestWords(t *testing.T) {
	ws(t, " the quick brown fox jumps over the lazy dog [ ] ["+string(rune(0x200B)), 0, true,
		"the quick brown fox jumps over the lazy dog [ [", 1)
	ws(t, "the quick brown [ dog jumps over the lazy ] fox", 0, false,
		"the quick brown [ fox .", 0)
	ws(t, "the quick brown;fox;", 0, false,
		"the quick brown ; fox ; .", 0)
	ws(t, "the ] quick brown fox ", 1, true,
		"quick brown fox", 0)
}

func ws(t *testing.T, in string, bktIn int, isTest bool, out string, bktOut int) {
	wds := strings.Split(out, " ")
	gotX, bo, e := Words(HTML(in), bktIn, isTest)
	if e != nil {
		t.Fatal(e)
	}
	if bo != bktOut {
		t.Errorf("wrong bracket count returned: input `%s` bktIn %d bktOut %d\n", in, bktIn, bktOut)
	}
	got := make([]string, 0, len(gotX))
	for _, v := range gotX { // remove empty entries
		if v != "" {
			got = append(got, v)
		}
	}
	if len(got) != len(wds) {
		t.Errorf("wrong number of words found: input `%s` got %d %v expected %d %v`\n", in, len(got), got, len(wds), wds)
	} else {
		sort.Strings(wds)
		sort.Strings(got)
		for i := range wds {
			if wds[i] != got[i] {
				t.Errorf("wrong word[%d]: input `%s` got %v expected %v\n", i, in, got, wds)
			}
		}
	}
}
