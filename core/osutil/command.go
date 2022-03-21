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
	"bytes"
	"errors"
	"fmt"
	"os/exec"
	"time"
)

var errTimeout = errors.New("conversion timelimit exceeded")

// CommandWithTimeout runs a command but stops it if it does not finish within the timout above.
func CommandWithTimeout(command *exec.Cmd, timeout time.Duration) ([]byte, error) {
	var output bytes.Buffer
	//fmt.Println("DEBUG CommandWithTimeout: %v", command.Args)
	command.Stdout = &output
	command.Stderr = &output
	if err := command.Start(); err != nil {
		return nil, err
	}
	done := make(chan error, 1)
	defer close(done)
	go func() {
		done <- command.Wait()
	}()
	select {
	case <-time.After(timeout):
		if err := command.Process.Kill(); err != nil {
			fmt.Printf("failed to kill: %s", err.Error())
		}
		<-done // prevent memory leak
		//fmt.Println("DEBUG timeout")
		return nil, errTimeout
	case err := <-done:
		if err != nil {
			//fmt.Println("DEBUG error return")
			return output.Bytes(), err
		}
		if !command.ProcessState.Success() {
			err = errors.New(string(output.Bytes()))
			//fmt.Println("DEBUG not successful")
			return nil, err
		}
		//fmt.Println("DEBUG successful return")
		return output.Bytes(), nil
	}
}
