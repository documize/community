package glpie_test

import (
	"fmt"
	"testing"
	"time"

	"github.com/documize/glick"
	test "github.com/documize/glick/_test"
	"github.com/documize/glick/glpie"
)

func pieSwitchTest(t *testing.T, useJSON bool) {
	l, nerr := glick.New(nil)
	if nerr != nil {
		t.Error(nerr)
		return
	}
	if err := glpie.ConfigPIE(l); err != nil {
		t.Error(err)
		return
	}
	var proto string
	protoOut := func() interface{} {
		s := ""
		return interface{}(&s)
	}
	if err := l.RegAPI("string/&string", proto, protoOut, 10*time.Second); err != nil {
		t.Error(err)
		return
	}
	if err := l.RegPlugin("string/&string", "cmdBad",
		glpie.PluginPie(useJSON, "dingbat", []string{"doodah"}, protoOut), nil); err == nil {
		t.Error("garbage pie plugin did not fail")
		return
	}
	if _, err := l.Run(nil, "string/&string", "cmdBad", proto); err == nil {
		t.Error("bad command did not fail")
		return
	}
	api := fmt.Sprintf("API%v", useJSON)
	act := fmt.Sprintf("ACT%v", useJSON)
	tisOut := func() interface{} {
		return interface{}(&test.IntStr{})
	}
	if err := l.RegAPI(api, test.IntStr{}, tisOut, 2*time.Second); err != nil {
		t.Error(err)
		return
	}
	cmdPath := "./_test/gob/gob"
	if useJSON {
		cmdPath = "./_test/json/json"
	}
	if err := l.RegPlugin(api, act,
		glpie.PluginPie(useJSON, "CI.CopyIntX", []string{cmdPath}, tisOut), nil); err != nil {
		t.Error("unable to create " + err.Error())
		return
	}

	parTest(t, l, api, act, cmdPath, useJSON, tisOut)

}
func parTest(t *testing.T, l *glick.Library, api, act, cmdPath string, useJSON bool, tisOut func() interface{}) {
	par := test.IntStr{I: 42}
	if ret, err := l.Run(nil, api, act, par); err != nil {
		t.Error("unable to run pie " + err.Error())
	} else {
		if ret.(*test.IntStr).I != 42 {
			t.Error("pie integer copy did not work")
		}
	}
	par.I = 4
	if _, err := l.Run(nil, api, act, par); err == nil {
		t.Error("over-long pie plugin did not timeout")
	}
	if err := l.RegPlugin(api, act+"bad",
		glpie.PluginPie(true, "CI.CopyIntX", []string{"./_test/bad/bad"}, tisOut), nil); err != nil {
		t.Error("unable to create " + err.Error())
	}
	par.I = 0
	if _, err := l.Run(nil, api, act+"bad", par); err == nil {
		t.Error("bad pie plugin did not error")
	}
	if err := l.RegPlugin(api, act+"badder",
		glpie.PluginPie(true, "CI.CopyIntX", []string{"./_test/bad/main.go"}, tisOut), nil); err != nil {
		t.Error("unable to create " + err.Error())
	}
	par.I = 0
	if _, err := l.Run(nil, api, act+"badder", par); err == nil {
		t.Error("non-runnable bad pie plugin did not error")
	}
	parTestGobler(t, l, api, act, cmdPath, useJSON, tisOut)
}
func parTestGobler(t *testing.T, l *glick.Library, api, act, cmdPath string, useJSON bool, tisOut func() interface{}) {
	gobbler := fmt.Sprintf("%v", !useJSON)
	if err := l.Configure([]byte(`[
{"Plugin":"pie1","API":"` + api + `","Actions":["intStr1"],"Type":"PIE","Cmd":["` + cmdPath + `"],"Method":"CI.CopyIntX","Gob":` + gobbler + `}
		]`)); err != nil {
		t.Error(err)
	}
	par := test.IntStr{I: 42}
	if _, err := l.Run(nil, api, "intStr1", par); err != nil {
		t.Error("unable to run intStr1 for " + api + " err=" + err.Error())
	}
	if err := l.Configure([]byte(`[
{"Plugin":"pie2","API":"` + api + `","Actions":["intStr2"],"Type":"PIE"}
		]`)); err == nil {
		t.Error("unsuited end pie exe not spotted")
	}
	if err := l.Configure([]byte(`[
{"Plugin":"pie3","API":"` + api + `","Actions":["intStr1"],"Type":"PIE","Cmd":["illegal path"]}
		]`)); err == nil {
		t.Error("unsuited pie exe path not spotted")
	}
	if err := l.Configure([]byte(`[
{"Plugin":"pie4","API":"nothing here","Actions":["intStr1"],"Type":"PIE"}
		]`)); err == nil {
		t.Error("unsuited pie api not spotted")
	}
}

func TestPie(t *testing.T) {
	pieSwitchTest(t, true)
	pieSwitchTest(t, false)
}
