package glick

import (
	"fmt"
	"io/ioutil"
	"net/http"

	"golang.org/x/net/context"
	"golang.org/x/net/context/ctxhttp"
)

// PluginGetURL fetches the content of a URL, which could be static or dynamic (passed in).
// It only works with an api with a simple Text/Text signature.
func PluginGetURL(static bool, uri string, model interface{}) Plugin {
	if static {
		if uri == "" {
			return nil
		}
	}
	return func(ctx context.Context, in interface{}) (out interface{}, err error) {
		inb, err := TextBytes(in)
		if err != nil {
			return nil, err
		}
		ins := string(inb)
		if static {
			ins = uri
		}
		resp, err := ctxhttp.Get(ctx, http.DefaultClient, ins) // handles context.Done() correctly
		if err != nil {
			return nil, err
		}
		byts, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return nil, err // unable to create a simple test case for this error
		}
		err = resp.Body.Close()
		if err != nil {
			return nil, err // unable to create a simple test case for this error
		}
		return TextConvert(byts, model)
	}
}

// ConfigGetURL provides the Configurator for the URL class of plugins that
// fetch the content of URLs.
func ConfigGetURL(lib *Library) error {
	if lib == nil {
		return ErrNilLib
	}
	return lib.AddConfigurator("URL", func(l *Library, line int, cfg *Config) error {
		if !(IsText(l.apim[cfg.API].ppi) && IsText(l.apim[cfg.API].ppo())) {
			return fmt.Errorf("entry %d API %s is not of simple type (string/*string) ",
				line, cfg.API)
		}
		pi := PluginGetURL(cfg.Static, cfg.Path, l.apim[cfg.API].ppo())
		for _, action := range cfg.Actions {
			if err := l.RegPlugin(cfg.API, action, pi, cfg); err != nil {
				return fmt.Errorf("entry %d URL register plugin error: %v",
					line, err)
			}
		}
		return nil
	})
}
