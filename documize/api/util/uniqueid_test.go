package util_test

import (
	"runtime"
	"sync"
	"testing"

	"github.com/documize/community/documize/api/util"
)

const sample = 1 << 24

var m = make(map[string]struct{})
var mx sync.Mutex

func mm(t *testing.T, id string) {
	if len(id) != 16 {
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
				mm(t, util.UniqueID())
			}
			wg.Done()
		}()
	}
	wg.Wait()
}

func BenchmarkUniqueID(b *testing.B) {
	for i := 0; i < b.N; i++ {
		util.UniqueID()
	}
}
