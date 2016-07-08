package glkit_test

import (
	"testing"
	"time"

	"github.com/documize/glick"
	"github.com/documize/glick/glkit"

	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"

	"golang.org/x/net/context"

	"github.com/go-kit/kit/endpoint"
	httptransport "github.com/go-kit/kit/transport/http"
)

func TestGoKitStringsvc1(t *testing.T) {
	go servermain()

	<-time.After(2 * time.Second)

	l, nerr := glick.New(nil)
	if nerr != nil {
		t.Error(nerr)
	}

	if err := glkit.ConfigKit(l); err != nil {
		t.Error(err)
	}
	if err := l.RegAPI("uppercase", uppercaseRequest{},
		func() interface{} { return &uppercaseResponse{} }, time.Second); err != nil {
		t.Error(err)
	}
	if err := l.Configure([]byte(`[
{"Plugin":"gk","API":"uppercase","Actions":["uc"],"Type":"KIT","Path":"http://localhost:8080/uppercase","JSON":true},
{"Plugin":"gk","API":"uppercase","Actions":["lc"],"Type":"KIT","Path":"http://localhost:8080/lowercase","JSON":true}
		]`)); err != nil {
		t.Error(err)
	}
	if rep, err := l.Run(nil, "uppercase", "uc", uppercaseRequest{S: "abc"}); err == nil {
		if rep.(*uppercaseResponse).V != "ABC" {
			t.Error("uppercase did not work")
		}
	} else {
		t.Error(err)
	}
	if rep, err := l.Run(nil, "uppercase", "lc", uppercaseRequest{S: "XYZ"}); err == nil {
		if rep.(*uppercaseResponse).V != "xyz" {
			t.Error("lowercase did not work")
		}
	} else {
		t.Error(err)
	}
	if err := l.Configure([]byte(`[
{"Plugin":"gk","API":"uppercase","Actions":["uc"],"Type":"KIT","Path":"http://localhost:8080/uppercase","Gob":true}
		]`)); err == nil {
		t.Error("did not spot non-JSON")
	}

	testCount(t)
}

func testCount(t *testing.T) {
	// use the more direct method for count
	count := glkit.PluginKitJSONoverHTTP("http://localhost:8080/count",
		func() interface{} { return &countResponse{} })
	cc, ecc := count(nil, countRequest{S: "abc"})
	if ecc != nil {
		t.Error(ecc)
	}
	if cc.(*countResponse).V != 3 {
		t.Error("count did not work")
	}
}

func TestAssignFn(t *testing.T) {
	var glp glick.Plugin
	var kep endpoint.Endpoint

	x := func(c context.Context, i interface{}) (interface{}, error) {
		return nil, nil
	}

	glp = x
	kep = x
	glp = glick.Plugin(kep)
	kep = endpoint.Endpoint(glp)
	// NOTE: kep assigned to but never used, so:
	_ = kep
}

// example below modified from https://github.com/go-kit/kit/blob/master/examples/stringsvc1/main.go

// StringService provides operations on strings.
type StringService interface {
	Uppercase(string) (string, error)
	Count(string) int
}

type stringService struct{}

func (stringService) Uppercase(s string) (string, error) {
	if s == "" {
		return "", ErrEmpty
	}
	return strings.ToUpper(s), nil
}

func (stringService) Count(s string) int {
	return len(s)
}

func servermain() {
	lib, nerr := glick.New(nil)
	if nerr != nil {
		panic(nerr)
	}
	if err := lib.RegAPI("api", uppercaseRequest{},
		func() interface{} { return uppercaseResponse{} }, time.Second); err != nil {
		panic(err)
	}
	if err := lib.RegPlugin("api", "lc",
		func(ctx context.Context, in interface{}) (interface{}, error) {
			return uppercaseResponse{
				V: strings.ToLower(in.(uppercaseRequest).S),
			}, nil
		}, nil); err != nil {
		panic(err)
	}

	ctx := context.Background()
	svc := stringService{}

	lowercaseHandler := httptransport.NewServer(
		ctx,
		glkit.MakeEndpoint(lib, "api", "lc"),
		decodeUppercaseRequest,
		encodeResponse,
	)

	uppercaseHandler := httptransport.NewServer(
		ctx,
		makeUppercaseEndpoint(svc),
		decodeUppercaseRequest,
		encodeResponse,
	)

	countHandler := httptransport.NewServer(
		ctx,
		makeCountEndpoint(svc),
		decodeCountRequest,
		encodeResponse,
	)

	http.Handle("/uppercase", uppercaseHandler)
	http.Handle("/lowercase", lowercaseHandler)
	http.Handle("/count", countHandler)
	log.Fatal(http.ListenAndServe("localhost:8080", nil))
}

func makeUppercaseEndpoint(svc StringService) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		req := request.(uppercaseRequest)
		v, err := svc.Uppercase(req.S)
		if err != nil {
			return uppercaseResponse{v, err.Error()}, nil
		}
		return uppercaseResponse{v, ""}, nil
	}
}

func makeCountEndpoint(svc StringService) endpoint.Endpoint {
	return func(ctx context.Context, request interface{}) (interface{}, error) {
		req := request.(countRequest)
		v := svc.Count(req.S)
		return countResponse{v}, nil
	}
}

func decodeUppercaseRequest(r *http.Request) (interface{}, error) {
	var request uppercaseRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		return nil, err
	}
	return request, nil
}

func decodeCountRequest(r *http.Request) (interface{}, error) {
	var request countRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		return nil, err
	}
	return request, nil
}

func encodeResponse(w http.ResponseWriter, response interface{}) error {
	return json.NewEncoder(w).Encode(response)
}

type uppercaseRequest struct {
	S string `json:"s"`
}

type uppercaseResponse struct {
	V   string `json:"v"`
	Err string `json:"err,omitempty"` // errors don't define JSON marshaling
}

type countRequest struct {
	S string `json:"s"`
}

type countResponse struct {
	V int `json:"v"`
}

// ErrEmpty is returned when an input string is empty.
var ErrEmpty = errors.New("empty string")
