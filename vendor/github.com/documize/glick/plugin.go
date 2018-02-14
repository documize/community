package glick

import (
	"errors"
	"fmt"
	"os/exec"
	"reflect"
	"sort"
	"sync"
	"time"

	"golang.org/x/net/context"
)

var (
	// ErrNilLib means the library pointer is nil.
	ErrNilLib = errors.New("nil library")
	// ErrNilAPI means an API value is nil.
	ErrNilAPI = errors.New("nil api")
)

// errDupAPI means that a duplicate name has been given for an API.
func errDupAPI(name string) error {
	return errors.New("duplicate api: " + name)
}

// errNoAPI means that the name of the API was not found in the map.
func errNoAPI(name string) error {
	return errors.New("unknown api: " + name)
}

// errNoPlug means that no handler function was found for the plugin.
func errNoPlug(name string) error {
	return errors.New("no plugin found: " + name)
}

// Plugin type provides the type of the every plugin function,
// it has the same signature as Endpoint in "github.com/go-kit/kit".
type Plugin func(ctx context.Context, in interface{}) (out interface{}, err error)

// ProtoPlugOut provides a prototype for the output of a Plugger
type ProtoPlugOut func() interface{}

type plugOut struct {
	out interface{}
	err error
}

// Overloader allows the standard system settings for an API
// to be overloaded, depending on the context passed in.
type Overloader func(ctx context.Context, api, action string, handler Plugin) (context.Context, Plugin, error)
type plugkey struct {
	api, action string // the strings to choose a plugin
}
type plugval struct {
	plug Plugin
	cfg  *Config
}
type plugmap map[plugkey]plugval
type apidef struct {
	ppi        interface{}   // a prototype of the input type
	ppo        ProtoPlugOut  // a function returning a prototype of the output type
	ppiT, ppoT reflect.Type  // a cached version of reflect.TypeOf the input and output types
	timeout    time.Duration // how long before we abort
}
type apimap map[string]apidef
type cfgmap map[string]Configurator

// Library holds the registered API and plugin database.
type Library struct {
	pim      plugmap      // a map of known plugins
	apim     apimap       // a map of known APIs
	cfgm     cfgmap       // a map of know configuration handlers
	mtx      sync.RWMutex // mutex to protect map access
	ovfn     Overloader   // the function to call to overload which plugin to use at runtime
	subprocs []*exec.Cmd  // a slice of sub-processes created
}

// New returns an initialized Library.
func New(ov Overloader) (*Library, error) {
	lib := &Library{
		apim:     make(apimap),
		pim:      make(plugmap),
		cfgm:     make(cfgmap),
		ovfn:     ov,
		subprocs: make([]*exec.Cmd, 0),
	}
	if err := ConfigCmd(lib); err != nil {
		return nil, err
	}
	if err := ConfigGetURL(lib); err != nil {
		return nil, err
	}
	if err := ConfigRPC(lib); err != nil {
		return nil, err
	}
	return lib, nil
}

// RegAPI allows registration of a named API.
// The in/out prototype defines the type that must be passed in and out.
// The timeout gives the maximum time that a Plugin using this API may take to execute.
func (l *Library) RegAPI(api string, inPrototype interface{}, outPlugProto ProtoPlugOut, timeout time.Duration) error {
	if l == nil {
		return ErrNilLib
	}
	l.mtx.Lock()
	defer l.mtx.Unlock()
	if inPrototype == nil || outPlugProto == nil || outPlugProto() == nil {
		return ErrNilAPI
	}
	if _, found := l.apim[api]; found {
		return errDupAPI(api)
	}
	l.apim[api] = apidef{inPrototype, outPlugProto,
		reflect.TypeOf(inPrototype), reflect.TypeOf(outPlugProto()),
		timeout}
	return nil
}

// RegPlugin registers a Plugger to use for this action on an api.
// Duplicate actions simply overload what is there.
func (l *Library) RegPlugin(api, action string, handler Plugin, cfg *Config) error {
	if l == nil {
		return ErrNilLib
	}
	l.mtx.Lock()
	defer l.mtx.Unlock()
	if _, hasAPI := l.apim[api]; !hasAPI {
		return errNoAPI(api)
	}
	if handler == nil {
		return errNoPlug("nil handler for api " + api)
	}
	l.pim[plugkey{api, action}] = plugval{handler, cfg}
	return nil
}

func (l *Library) def(ctx context.Context, api, action string, in interface{}) (apidef, error) {
	if in == nil {
		return apidef{}, ErrNilAPI
	}
	def, ok := l.apim[api]
	if ok {
		if !reflect.TypeOf(in).AssignableTo(def.ppiT) {
			return apidef{}, fmt.Errorf("bad api types - in: got %T want %T",
				in, def.ppi)
		}
	} else {
		return apidef{}, errNoAPI(api)
	}
	return def, nil
}

// Run a plugin for a given action on an API, passing data in/out.
// The library overloader function may decide from the context that a non-standard
// action should be run.
func (l *Library) Run(ctx context.Context, api, action string, in interface{}) (out interface{}, err error) {
	if l == nil {
		return nil, ErrNilLib
	}
	l.mtx.RLock()
	defer l.mtx.RUnlock()

	def, err := l.def(ctx, api, action, in)
	if err != nil {
		return nil, err
	}

	if ctx == nil || ctx == context.TODO() {
		ctx = context.Background()
	}

	var handler Plugin
	pv, found := l.pim[plugkey{api, action}]
	if found {
		handler = pv.plug
	}

	// should this run call and overload function?
	if l.ovfn != nil {
		var ovHandler Plugin
		var ovErr error
		ctx, ovHandler, ovErr = l.ovfn(ctx, api, action, handler)
		if ovErr != nil {
			return nil, ovErr
		}
		if ovHandler != nil {
			handler = ovHandler
			found = true
		}
	}

	return l.run(ctx, api, found, handler, def, in)
}

func (l *Library) run(ctx context.Context, api string, found bool, handler Plugin, def apidef, in interface{}) (out interface{}, err error) {
	if !found || handler == nil {
		return nil, errNoPlug("api " + api)
	}
	reply := make(chan plugOut)
	ctxWT, cancel := context.WithTimeout(ctx, l.apim[api].timeout)
	go func() {
		defer cancel()
		var plo plugOut
		plo.out, plo.err = handler(ctxWT, in)
		reply <- plo
	}()
	select {
	case <-ctxWT.Done():
		return nil, ctxWT.Err()
	case plo := <-reply:
		if plo.err == nil && (plo.out == nil ||
			!def.ppoT.AssignableTo(reflect.TypeOf(plo.out))) {
			return nil, fmt.Errorf("bad api type - out: got %T want %T",
				plo.out, def.ppo())
		}
		return plo.out, plo.err
	}
}

// ProtoPlugOut provides the way to return a function to create the output for a plugin.
func (l *Library) ProtoPlugOut(api string) (ppo ProtoPlugOut, err error) {
	if l == nil {
		return nil, ErrNilLib
	}
	l.mtx.RLock()
	defer l.mtx.RUnlock()
	if v, ok := l.apim[api]; !ok {
		err = errors.New("could not find api: " + api)
	} else {
		ppo = v.ppo
	}
	return
}

// Actions provides the names of all registered plugin actions for an api.
func (l *Library) Actions(api string) ([]string, error) {
	if l == nil {
		return nil, ErrNilLib
	}
	l.mtx.RLock()
	defer l.mtx.RUnlock()
	if _, ok := l.apim[api]; !ok {
		return nil, errors.New("could not find api: " + api)
	}
	var ret []string
	for pv := range l.pim {
		if pv.api == api {
			ret = append(ret, pv.action)
		}
	}
	sort.Strings(ret)
	return ret, nil
}

// Config returns a pointer to the JSON Config struct for a given API and Action,
// or nil if no Config exists.
func (l *Library) Config(api, action string) *Config {
	if l == nil {
		return nil
	}
	l.mtx.RLock()
	defer l.mtx.RUnlock()
	return l.pim[plugkey{api, action}].cfg
}

// Token is a convenience function that returns the Token string for a given API and Action,
// if one exists.
func (l *Library) Token(api, action string) string {
	cfg := l.Config(api, action)
	if cfg == nil {
		return ""
	}
	return cfg.Token
}

// KillSubProcs created by StartLocalRPCservers() (or eventually maybe elsewhere).
func (l *Library) KillSubProcs() error {
	if l == nil {
		return errors.New("pointer to Library is nil")
	}
	l.mtx.RLock()
	defer l.mtx.RUnlock()
	errStr := ""
	for _, s := range l.subprocs {
		var err error
		err = s.Process.Kill()
		if err != nil {
			errStr += " : " + err.Error()
		} else {
			time.Sleep(time.Second)
		}
	}
	if errStr == "" {
		return nil
	}
	return errors.New(errStr)
}
