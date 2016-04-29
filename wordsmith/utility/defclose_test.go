package utility

import "testing"
import "os"
import "github.com/documize/community/wordsmith/log"

func TestDefclose(t *testing.T) {
	var f *os.File
	log.TestIfErr=true
	Close(f)
	if log.TestIfErr {
		t.Error("Close() did not error when it should have")
	}
}
