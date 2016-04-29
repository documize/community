package glick_test

import (
	"io/ioutil"
	"reflect"
	"testing"

	"github.com/documize/glick"
)

func textReader(t *testing.T, tst interface{}, atp string, i int) {
	rdr, err := glick.TextReader(tst)
	if err == nil && i == 0 || err != nil && i > 0 {
		t.Errorf("unexpected TextReader error for %T: %s", tst, err)
	} else {
		if i > 0 {
			b, err := ioutil.ReadAll(rdr)
			if err != nil {
				t.Error(err)
			}
			if string(b) != atp {
				t.Error("incorrect output from TextReader")
			}
		}
	}
}
func textBytes(t *testing.T, tst interface{}, atp string, i int) {
	byts, err := glick.TextBytes(tst)
	if err == nil && i == 0 || err != nil && i > 0 {
		t.Errorf("unexpected TextBytes error for %T: %s", tst, err)
	} else {
		if i > 0 {
			if string(byts) != atp {
				t.Error("incorrect output from TextBytes")
			}
		}
	}
}
func textConvert(t *testing.T, tst interface{}, atp string, i int, atpB []byte) {
	ifc, err := glick.TextConvert(atpB, tst)
	if err == nil && i == 0 || err != nil && i > 0 {
		t.Errorf("unexpected TextConvert error for %T: %s", tst, err)
	} else {
		if i > 0 {
			if reflect.TypeOf(ifc) != reflect.TypeOf(tst) {
				t.Errorf("incorrect output type from TextConvert")
			} else {
				ifcs := ifcstring(ifc)
				if ifcs != atp {
					t.Error("strings not equal")
				}
			}
		}
	}
}

func ifcstring(ifc interface{}) string {
	ifcs := "NOT-SET"
	switch ifc.(type) {
	case string:
		ifcs = ifc.(string)
	case *string:
		ifcs = *ifc.(*string)
	case []byte:
		ifcs = string(ifc.([]byte))
	case *[]byte:
		ifcs = string(*ifc.(*[]byte))
	}
	return ifcs
}

func TestText(t *testing.T) {
	atp := "a test phrase"
	atpB := []byte(atp)
	tests := []interface{}{true, atp, &atp, atpB, &atpB}
	for i, tst := range tests {
		ok := glick.IsText(tst)
		if ok && i == 0 || !ok && i > 0 {
			t.Errorf("unexpected IsTest for %T", tst)
		}
		textReader(t, tst, atp, i)
		textBytes(t, tst, atp, i)
		textConvert(t, tst, atp, i, atpB)
	}
}
