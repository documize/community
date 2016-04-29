package documize_test

import "testing"
import "github.com/documize/community/sdk/exttest"

func TestAPItest(t *testing.T) {
	exttest.APItest(t)
}

func BenchmarkAPIbench(b *testing.B) {
	for n := 0; n < b.N; n++ {
		err := exttest.APIbenchmark()
		if err != nil {
			b.Error(err)
			b.Fail()
		}
	}
}
