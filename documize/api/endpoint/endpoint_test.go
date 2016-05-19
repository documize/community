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

package endpoint

// TestEndpoint is the entrypoint for all testing unit testing of this package.
// The actual tests are in "github.com/documize/documize-sdk/exttest".
/* The tests require an environment specified by two environment variables:
   "DOCUMIZEAPI" e.g. "http://localhost:5002"
   "DOCUMIZEAUTH" e.g. "demo1:jim@davidson.com:demo123"
   - the user for testing must have admin privilidges and a folder called 'TEST'.
*/
/* NOTE currently excluded from SDK and testing are endpoints requiring e-mail interaction:
	   InviteToFolder()
	   inviteNewUserToSharedFolder()
	   AcceptSharedFolder()
	   ForgotUserPassword()
	   ResetUserPassword()
       ChangeUserPassword()
*/

/* TODO (Elliott) make tests work on an empty database

import (
	"os"
	"strings"
	"testing"
	"time"

	"github.com/documize/community/documize/api/plugins"
	"github.com/documize/community/wordsmith/environment"
	"github.com/documize/community/wordsmith/log"

	"github.com/documize/community/sdk/exttest"
)

func TestMain(m *testing.M) {
	environment.Parse("db") // the database environment variables must be set
	port = "5002"
	testHost = "localhost"
	testSetup()
	x := m.Run()
	testTeardown()
	os.Exit(x)
}

func testSetup() {
	path, err := os.Getwd()
	if err != nil {
		log.IfErr(err)
		return
	}
	switch {
	case strings.HasSuffix(path, "endpoint"):
		err = os.Chdir("../../..") // everything needs to be run from the top level documize directory, as plugin paths are relative
		if err != nil {
			log.IfErr(err)
			return
		}
	case strings.HasSuffix(path, "api"):
		err = os.Chdir("../..") // everything needs to be run from the top level documize directory, as plugin paths are relative
		if err != nil {
			log.IfErr(err)
			return
		}
	case strings.HasSuffix(path, "documize"):
		err = os.Chdir("..") // everything needs to be run from the top level documize directory, as plugin paths are relative
		if err != nil {
			log.IfErr(err)
			return
		}
	case strings.HasSuffix(path, "community"):
		// in the right place
	default:
		log.Error("wrong directory? "+path, nil)
		return
	}
	ready := make(chan struct{}, 1)
	go Serve(ready)
	<-ready
	time.Sleep(time.Second) // just to let everything settle down
}

func testTeardown() {
	log.IfErr(plugins.Lib.KillSubProcs())
}

func TestEndpoint(t *testing.T) {
	exttest.APItest(t)
}

func BenchmarkEndpoint(b *testing.B) {
	for n := 0; n < b.N; n++ {
		err := exttest.APIbenchmark()
		if err != nil {
			b.Error(err)
			b.Fail()
		}
	}
}

*/
