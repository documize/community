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

package uniqueid

import (
	"runtime"
	"sync"
	"testing"
)

const sample = 1 << 24

var m = make(map[string]struct{})
var mx sync.Mutex

func mm(t *testing.T, id string) {
	if len(id) != 20 {
		t.Errorf("len(id)=%d", len(id))
	}
	mx.Lock()
	_, found := m[id]
	if found {
		t.Error("Duplicate")
	} else {
		m[id] = struct{}{}
	}
	mx.Unlock()
}

// TestUniqueID checks that in a large number of calls to UniqueID() they are all different.
func TestUniqueID(t *testing.T) {
	var wg sync.WaitGroup
	c := runtime.NumCPU()
	ss := sample / c
	wg.Add(c)
	for i := 0; i < c; i++ {
		go func() {
			for i := 0; i < ss; i++ {
				mm(t, Generate())
			}
			wg.Done()
		}()
	}
	wg.Wait()
}

func BenchmarkUniqueID(b *testing.B) {
	for i := 0; i < b.N; i++ {
		Generate()
	}
}
