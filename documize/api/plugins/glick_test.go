package plugins

import (
	"os"
	"testing"
)

func TestSetup(t *testing.T) {
	err := LibSetup()
	if err == nil {
		//t.Error("should error on non-existent config file")
		//t.Fail()
	}
	ssc, err := Lib.Actions("Convert")
	if err != nil {
		t.Error(err)
	}
	
	// TODO(Elliott) review for empty database
	//if len(ssc) > 3 {
	//	t.Errorf("extra convert formats:%v", ssc)
	//}

	/* this code leaves plugins still running */
	err = os.Chdir("../../..")
	if err != nil {
		t.Error(err)
	}

	err = LibSetup()
	if err != nil {
		t.Error(err)
	}
	ssc, err = Lib.Actions("Convert")
	if err != nil {
		t.Error(err)
	}
	if len(ssc) == 0 {
		t.Error("no extra convert formats (defined)")
	}
	err = os.Chdir("documize/api/plugins")
	if err != nil {
		t.Error(err)
	}

	err = Lib.KillSubProcs()
	if err != nil {
		t.Error(err)
	}
}
