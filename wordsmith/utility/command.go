package utility

import (
	"bytes"
	"github.com/documize/community/wordsmith/log"
	"errors"
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
			log.Error("failed to kill: ", err)
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
