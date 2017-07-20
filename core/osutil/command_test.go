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

package osutil

import (
	"os/exec"
	"testing"
	"time"
)

func TestCmd(t *testing.T) {
	cmd := exec.Command("echo", "test")
	buf, err := CommandWithTimeout(cmd, time.Second)
	if err != nil {
		t.Error(err)
		return
	}
	if string(buf) != "test\n" {
		t.Error("command did not return `test` it returned:" + string(buf))
	}
	cmd2 := exec.Command("dingbat doodah")
	_, err2 := CommandWithTimeout(cmd2, time.Second)
	if err2 == nil {
		t.Error("bad command did not return an error")
	}
	timeout := 5 * time.Second
	cmd3 := exec.Command("sleep", "50")
	_, err3 := CommandWithTimeout(cmd3, timeout)
	if err3 != errTimeout {
		t.Error("sleep command did not timeout:", err3)
	}
}
