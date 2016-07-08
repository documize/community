// Package glpie exists to allow use of "github.com/natefinch/pie"
// (a toolkit for creating plugins for Go applications) from
// the glick package.
//
package glpie

import (
	"fmt"
	"net/rpc"
	"net/rpc/jsonrpc"
	"os"
	"sync"

	"github.com/documize/glick"

	"golang.org/x/net/context"

	"github.com/natefinch/pie"
)

// pi provides the underlying type for running plugin commands created using github.com/natefinch/pie.
type pi struct {
	useJSON       bool
	serviceMethod string
	cmdPath       string
	args          []string
	// this servers runtime info
	mtx    sync.Mutex
	client *rpc.Client
	err    error
}

func (p *pi) newClient() {
	// note if the client is still running we can't p.client.Close() without a data-race
	// TODO investigate if there is a better way to clean-up
	if p.useJSON {
		p.client, p.err = pie.StartProviderCodec(
			jsonrpc.NewClientCodec, os.Stderr, p.cmdPath, p.args...)
	} else {
		p.client, p.err = pie.StartProvider(os.Stderr, p.cmdPath, p.args...)
	}
	if p.err != nil {
		p.err = fmt.Errorf("plugin %#v failed, error %v", *p, p.err)
	}
}

func (p *pi) plugin(ctx context.Context, in, out interface{}) error {
	p.mtx.Lock()
	defer p.mtx.Unlock()
	if p.err != nil {
		defer p.newClient() //set up again if we've had an error last time
		return p.err
	}
	return p.client.Call(p.serviceMethod, in, out)
}

// PluginPie enables plugin commands created using github.com/natefinch/pie.
func PluginPie(useJSON bool, serviceMethod string, cmd []string, ppo glick.ProtoPlugOut) glick.Plugin {
	if len(cmd) == 0 {
		return nil
	}
	f, e := os.Open(cmd[0])
	if e != nil {
		return nil
	}
	e = f.Close()
	if e != nil {
		return nil
	}
	ret := &pi{useJSON, serviceMethod, cmd[0], cmd[1:], sync.Mutex{}, nil, nil}
	ret.newClient()
	return func(ctx context.Context, in interface{}) (out interface{}, err error) {
		out = ppo()
		err = ret.plugin(ctx, in, out)
		return
	}
}

// ConfigPIE provides the Configurator for the PIE class of plugin.
func ConfigPIE(lib *glick.Library) error {
	if lib == nil {
		return glick.ErrNilLib
	}
	return lib.AddConfigurator("PIE", func(l *glick.Library, line int, cfg *glick.Config) error {
		ppo, err := l.ProtoPlugOut(cfg.API)
		if err != nil {
			return fmt.Errorf("entry %d PIE register plugin error: %v",
				line, err) // no simple test possible for this path
		}
		pi := PluginPie(!cfg.Gob, cfg.Method, cfg.Cmd, ppo)
		for _, action := range cfg.Actions {
			if err := l.RegPlugin(cfg.API, action, pi, cfg); err != nil {
				return fmt.Errorf("entry %d PIE register plugin error: %v",
					line, err)
			}
		}
		return nil
	})
}
