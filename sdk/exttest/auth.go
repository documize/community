package exttest

import (
	"errors"
	"os"
	"strings"
	"testing"

	"github.com/documize/community/sdk"
)

// auth provides authorization tests to be run locally or from the main Documize repo.
func auth(t *testing.T) (*documize.Client, error) {

	testEndPt := os.Getenv("DOCUMIZEAPI") //e.g. "http://localhost:5002"
	testAuth := os.Getenv("DOCUMIZEAUTH") //e.g. "demo1:jim@davidson.com:demo123"

	testCreds(t, testEndPt, testAuth)
	testEndpoint(t, testEndPt, testAuth)

	//t.Log("Auth", testEndPt, testAuth)

	c, err := documize.NewClient(testEndPt, testAuth) // should work
	if err == nil && c == nil {
		err = errors.New("unable to authorize, new client nil")
	}
	return c, err
}

func testCreds(t *testing.T, testEndPt, testAuth string) {
	_, err := documize.NewClient(testEndPt, "")
	if err == nil {
		t.Error("ExtTestAuth did not error on empty auth string ")
	} else {
		t.Log("INFO: Empty Auth string error:", err)
	}
	_, err = documize.NewClient(testEndPt, "AAA:BBB")
	if err == nil {
		t.Error("ExtTestAuth did not error on AAA:BBB auth string ")
	} else {
		t.Log("INFO: Malfomed auth string error:", err)
	}
	credentials := strings.SplitN(testAuth, ":", 3)
	if len(credentials) == 3 {
		base := []string{"XXX", "YYY", "ZZZ"}
		for i := range credentials {
			ta := make([]string, 3)
			copy(ta, base)
			for j := range ta {
				if j != i { // make sure one of the three is wrong
					ta[j] = credentials[j]
				}
			}
			as := strings.Join(ta, ":")
			//t.Log(as)
			if credentials[i] != "" { // to avoid the case where the sub-domain is empty
				_, err = documize.NewClient(testEndPt, as)
				if err == nil {
					t.Error("ExtTestAuth did not error on bad auth string: ", as)
				} else {
					t.Log("INFO: Bad component to auth string error:", err)
				}
			}
		}
	}
}

func testEndpoint(t *testing.T, testEndPt, testAuth string) {
	_, err := documize.NewClient("", testAuth)
	if err == nil {
		t.Error("ExtTestAuth did not error on empty end point")
	} else {
		t.Log("INFO: Empty end-point error:", err)
	}
	_, err = documize.NewClient("XXXXX", testAuth)
	if err == nil {
		t.Error("ExtTestAuth did not error on bad end point")
	} else {
		t.Log("INFO: Bad end point error:", err)
	}
	_, err = documize.NewClient("http://XXXXXYYYYYYZZZZZZ.com", testAuth)
	if err == nil {
		t.Error("ExtTestAuth did not error on invalid end point")
	} else {
		t.Log("INFO: Invalid end point error:", err)
	}
}
