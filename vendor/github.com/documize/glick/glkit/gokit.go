// Package glkit enables integration with gokit.io from the glick library.
// It can do so in two ways, either within the server, or as a client.
//
// Within a go-kit server, the glick package can provide gokit endpoints
// created using glick (and therefore the glick 3-level configuration)
// by using the MakeEndpoint() function.
//
// When writing a client to a go-kit server, the PluginKitJSONoverHTTP()
// function allows the creation of simple plugins for JSON over HTTP
// (the most basic form of microservice available within go-kit);
// while ConfigKit() allows those simple plugins to be configured via
// the library JSON configuration process.
//
package glkit

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/documize/glick"
	"github.com/go-kit/kit/endpoint"
	"golang.org/x/net/context"
)

// MakeEndpoint returns a gokit.io endpoint from a glick library,
// it is intended for use inside servers constructed using gokit.
func MakeEndpoint(l *glick.Library, api, action string) endpoint.Endpoint {
	return func(ctx context.Context, in interface{}) (interface{}, error) {
		return l.Run(ctx, api, action, in)
	}
}

// PluginKitJSONoverHTTP enables calls to plugin commands
// implemented as microservices using "gokit.io".
func PluginKitJSONoverHTTP(cmdPath string, ppo glick.ProtoPlugOut) glick.Plugin {
	return func(ctx context.Context, in interface{}) (out interface{}, err error) {
		var j, b []byte
		var r *http.Response
		if j, err = json.Marshal(in); err != nil {
			return nil, err
		}
		if r, err = http.Post(cmdPath, "application/json", bytes.NewReader(j)); err != nil {
			return nil, err
		}
		if b, err = ioutil.ReadAll(r.Body); err != nil {
			return nil, err
		}
		out = ppo()
		if err = json.Unmarshal(b, &out); err != nil {
			return nil, err
		}
		return out, nil
	}
}

// ConfigKit provides the Configurator for the GoKit class of plugin.
func ConfigKit(lib *glick.Library) error {
	if lib == nil {
		return glick.ErrNilLib
	}
	return lib.AddConfigurator("KIT", func(l *glick.Library, line int, cfg *glick.Config) error {
		ppo, err := l.ProtoPlugOut(cfg.API)
		if err != nil { // internal error, simple test case impossible
			return fmt.Errorf(
				"entry %d Go-Kit plugin error for api: %s actions: %v error: %s",
				line, cfg.API, cfg.Actions, err)
		}
		if cfg.Gob {
			return fmt.Errorf(
				"entry %d Go-Kit: non-JSON plugins are not supported",
				line)
		}
		for _, action := range cfg.Actions {
			if err := l.RegPlugin(cfg.API, action, PluginKitJSONoverHTTP(cfg.Path, ppo), cfg); err != nil {
				// internal error, simple test case impossible
				return fmt.Errorf("entry %d Go-Kit register plugin error: %v",
					line, err)
			}
		}
		return nil
	})
}
