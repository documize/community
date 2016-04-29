package utility

import "testing"
import "os/exec"
import "time"

func TestCmd(t *testing.T) {
	cmd := exec.Command("echo", "test")
	buf, err := CommandWithTimeout(cmd)
	if err != nil {
		t.Error(err)
		return
	}
	if string(buf) != "test\n" {
		t.Error("command did not return `test` it returned:" + string(buf))
	}
	cmd2 := exec.Command("dingbat doodah")
	_, err2 := CommandWithTimeout(cmd2)
	if err2 == nil {
		t.Error("bad command did not return an error")
	}
	timeout = 5 * time.Second
	cmd3 := exec.Command("sleep", "50")
	_, err3 := CommandWithTimeout(cmd3)
	if err3 != errTimeout {
		t.Error("sleep command did not timeout:", err3)
	}
}
