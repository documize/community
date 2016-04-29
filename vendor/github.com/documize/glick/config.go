package glick

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/url"
	"strconv"
	"strings"
)

// Config defines a line in the JSON configuration file for a glick Libarary.
type Config struct {
	Plugin  string   // name of the plugin server, used to configure URL ports.
	API     string   // must already exist.
	Actions []string // these must be unique within the API.
	Token   string   // authorisation string to pass in the API, if it contains a Token field.
	Type    string   // the type of plugin, e.g. "RPC","URL","CMD"...
	Method  string   // the service method to use in the plugin, if relavent.
	Path    string   // path to the end-point for "RPC" or "URL".
	Cmd     []string // command to run to start an image in "CMD", or to start a local "RPC" server.
	Comment string   // a place to put comments about the entry.

	// bools at the end to make the structure smaller
	Disabled bool // disable the plugin(s) or plugin server by setting this to true.
	Gob      bool // should the plugin use GOB encoding rather than JSON, if relavent.
	Static   bool // only used by "URL" to signal a static address.
}

// Configurator is a type of function that allows plug-in fuctionality to the Config process.
type Configurator func(lib *Library, line int, cfg *Config) error

// AddConfigurator adds a type of configuration to the library.
func (l *Library) AddConfigurator(name string, cfg Configurator) error {
	if l == nil {
		return ErrNilLib
	}
	l.mtx.Lock()
	defer l.mtx.Unlock()
	if _, exists := l.cfgm[name]; exists {
		return errors.New("duplicate configurator")
	}
	if cfg == nil {
		return errors.New("nil configurator")
	}
	l.cfgm[name] = cfg
	return nil
}

// Disable an existing plugin.
func (l *Library) Disable(api string, actions []string) {
	l.mtx.Lock()
	for _, act := range actions {
		delete(l.pim, plugkey{api: api, action: act})
	}
	l.mtx.Unlock()
}

// ValidTypes returns all the valid plugin type names.
func (l *Library) ValidTypes() []string {
	validTypes := make([]string, 0, len(l.cfgm))
	for t := range l.cfgm {
		validTypes = append(validTypes, t)
	}
	return validTypes
}

// Configure takes a JSON-encoded byte slice and configures the plugins for a library from it.
// NOTE: duplicate actions overload earlier versions.
func (l *Library) Configure(b []byte) error {
	if l == nil {
		return ErrNilLib
	}
	var m []Config
	if err := json.Unmarshal(b, &m); err != nil {
		return err
	}
	for line, cfg := range m {
		if cfg.Plugin == "" { // unnamed plugin => pre-programmed
			if cfg.Disabled { // disable existing entries
				l.Disable(cfg.API, cfg.Actions)
			}
		} else {
			if !cfg.Disabled { // only set it up if not disabled
				if _, ok := l.apim[cfg.API]; !ok {
					return fmt.Errorf("entry %d unknown api %s ", line+1, cfg.API)
				}
				if cfgfn, ok := l.cfgm[cfg.Type]; ok {
					thisConfig := cfg
					if err := cfgfn(l, line+1, &thisConfig); err != nil {
						return err
					}
				} else {
					return fmt.Errorf("entry %d unknown config type %s (expected one of:%s)",
						line+1, cfg.Type, strings.Join(l.ValidTypes(), ","))
				}
			}
		}
	}
	return nil
}

// Port returns the first port number it comes across for
// a given Plugin name in a json config file, in the form: ":9999".
// TODO add tests for this code.
func Port(configJSONpath, pluginServerName string) (string, error) {

	b, err := ioutil.ReadFile(configJSONpath)
	if err != nil {
		return "", err
	}

	var m []Config
	if err := json.Unmarshal(b, &m); err != nil {
		return "", err
	}

	for _, e := range m {
		if e.Plugin == pluginServerName && !e.Disabled {
			url, err := url.Parse(e.Path)
			if err != nil {
				return "", err
			}
			ret, err := urlPort(url)
			if ret != "" {
				return ret, err
			}
		}
	}
	return "", errNoAPI(pluginServerName)
}

// urlPort deduces the port information from a given URL.
func urlPort(url *url.URL) (string, error) {
	bits := strings.Split(url.Host, ":")
	if len(bits) == 2 { // ignore if no ":" in Host
		_, err := strconv.Atoi(bits[1])
		if err != nil {
			return bits[1], err
		}
		return ":" + bits[1], nil
	}
	_, err := strconv.Atoi(url.Opaque) // port could be in Opaque
	if err == nil {
		return ":" + url.Opaque, nil
	}
	switch url.Scheme { // more to go here?
	case "http":
		return ":80", nil
	case "https":
		return ":443", nil
	default:
		return "", nil
	}
}
