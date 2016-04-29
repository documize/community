package glick_test

import (
	"net"
	"net/rpc"
	"net/rpc/jsonrpc"
	"sync"
	"testing"
	"time"

	"github.com/documize/glick"
	test "github.com/documize/glick/_test"
)

func TestRPC(t *testing.T) {
	tisOut := func() interface{} {
		return interface{}(&test.IntStr{})
	}

	// set up the server

	if err := rpc.Register(&test.CI{}); err != nil {
		t.Error(err.Error())
		return
	}

	for i := 0; i < 2; i++ {

		endPt := "localhost:808"
		endPt += string('8' + i)

		var up sync.WaitGroup
		up.Add(1)

		// start the protocol server
		go func(ii int, ep string) {
			listener, err := net.Listen("tcp", ep)
			if err != nil {
				t.Error(err.Error())
				return
			}
			up.Done()
			for {
				conn, err := listener.Accept()
				if err != nil {
					t.Error(err.Error())
					return
				}
				if ii == 0 {
					go rpc.ServeConn(conn)
				} else {
					go jsonrpc.ServeConn(conn)
				}
			}
		}(i, endPt)

		up.Wait()

		// run the client code
		var useJSON bool
		if i > 0 {
			useJSON = true
		}

		client(t, useJSON, tisOut, endPt)
		clientBad(t, useJSON, tisOut, endPt)
	}
}

func client(t *testing.T, useJSON bool, tisOut func() interface{}, endPt string) {

	l, nerr := glick.New(nil)
	if nerr != nil {
		t.Error(nerr)
	}

	api := "ab"
	act := "cdef"
	if err := l.RegAPI(api, test.IntStr{}, tisOut, 2*time.Second); err != nil {
		t.Error(err)
		return
	}

	if err := l.RegPlugin(api, act,
		glick.PluginRPC(useJSON, "CI.CopyIntX", endPt, tisOut), nil); err != nil {
		t.Error("unable to create JsonRPC " + err.Error())
		return
	}

	par := test.IntStr{I: 42}
	if ret, err := l.Run(nil, api, act, par); err != nil {
		t.Error("unable to run plugin " + err.Error())
	} else {
		if ret.(*test.IntStr).I != 42 {
			t.Error("RPC integer copy did not work")
		}
	}
	par.I = 4
	if _, err := l.Run(nil, api, act, par); err == nil {
		t.Error("over-long plugin did not timeout")
	}

	if err := l.RegPlugin(api, "bep",
		glick.PluginRPC(useJSON, "", "localhost:8080", tisOut), nil); err == nil {
		t.Error("able to create empty end-point method")
		return
	}

	if err := l.RegPlugin(api, "bep",
		glick.PluginRPC(useJSON, "CI.CopyIntX", "", tisOut), nil); err == nil {
		t.Error("able to create empty endpoint")
		return
	}
}
func clientBad(t *testing.T, useJSON bool, tisOut func() interface{}, endPt string) {

	l, nerr := glick.New(nil)
	if nerr != nil {
		t.Error(nerr)
	}

	api := "ab"
	act := "cdef"
	if err := l.RegAPI(api, test.IntStr{}, tisOut, 2*time.Second); err != nil {
		t.Error(err)
		return
	}

	if err := l.RegPlugin(api, act,
		glick.PluginRPC(useJSON, "CI.CopyIntX", endPt, tisOut), nil); err != nil {
		t.Error("unable to create JsonRPC " + err.Error())
		return
	}

	par := test.IntStr{I: 42}

	if err := l.RegPlugin(api, "errEP",
		glick.PluginRPC(useJSON, "CI.CopyIntX", "localhost:9999", tisOut), nil); err != nil {
		t.Error("error on valid (if unused) endpoint")
		return
	}
	if _, err := l.Run(nil, api, "errEP", par); err == nil {
		t.Error("did not error on unpopulated end-point")
	}

	noPoint := func() interface{} { return interface{}(42) }
	if err := l.RegAPI("noPoint", 42, noPoint, 0); err != nil {
		t.Error(err)
	}
	if err := l.RegPlugin("noPoint", "errEP",
		glick.PluginRPC(useJSON, "CI.CopyIntX", "localhost:9999", noPoint), nil); err == nil {
		t.Error("a non-pointer return should error")
	}

}
