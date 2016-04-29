package glick_test

import (
	"testing"
	"time"

	"github.com/documize/glick"
)

func TestGetURL(t *testing.T) {
	outProtoString := func() interface{} { var s string; return interface{}(&s) }
	l, nerr := glick.New(nil)
	if nerr != nil {
		t.Error(nerr)
	}
	proto := ""
	if err := l.RegAPI("string/*string", proto, outProtoString, 2*time.Second); err != nil {
		t.Error(err)
	}
	if err := l.RegPlugin("string/*string", "bad1",
		glick.PluginGetURL(true, "", &proto), nil); err == nil {
		t.Error("empty url not errored")
	}
	if err := l.RegPlugin("string/*string", "dynamic1",
		glick.PluginGetURL(false, "", &proto), nil); err != nil {
		t.Error(err)
	}
	if err := l.RegPlugin("string/*string", "documize",
		glick.PluginGetURL(true, "https://documize.com", &proto), nil); err != nil {
		t.Error(err)
	}
	if _, err := l.Run(nil, "string/*string", "documize", ""); err != nil {
		t.Error(err)
	}
	if _, err := l.Run(nil, "string/*string", "dynamic1", "http://golang.org"); err != nil {
		t.Error(err)
	}
	if _, err := l.Run(nil, "string/*string", "dynamic1", ""); err == nil {
		t.Error("empty url did not error")
	}
	if _, err := l.Run(nil, "string/*string", "dynamic1", "!@£$%^&*()"); err == nil {
		t.Error("bad url did not error")
	}
}

func TestGetURLint(t *testing.T) {
	outProtoString := func() interface{} { var s string; return interface{}(&s) }
	outProtoInt := func() interface{} { var i int; return interface{}(&i) }
	l, nerr := glick.New(nil)
	if nerr != nil {
		t.Error(nerr)
	}
	proto := ""

	ip := 0
	if err := l.RegAPI("int/*string", ip, outProtoString, 2*time.Second); err != nil {
		t.Error(err)
	}
	if err := l.RegPlugin("int/*string", "documize",
		glick.PluginGetURL(true, "https://documize.com", &proto), nil); err != nil {
		t.Error(err)
	}
	if _, err := l.Run(nil, "int/*string", "documize", 42); err == nil {
		t.Error("bad api in did not error")
	}
	if err := l.RegAPI("string/*int", proto, outProtoInt, 2*time.Second); err != nil {
		t.Error(err)
	}
	if err := l.RegPlugin("string/*int", "documize",
		glick.PluginGetURL(true, "https://documize.com", &proto), nil); err != nil {
		t.Error(err)
	}
	if _, err := l.Run(nil, "string/*int", "documize", ""); err == nil {
		t.Error("bad api out did not error")
	}
	if _, err := l.Run(nil, "string/*string", "documize", nil); err == nil {
		t.Error("nil input value did not error")
	}
	if _, err := l.Run(nil, "string/*string", "documize", true); err == nil {
		t.Error("incorrect input value did not error")
	}
}
