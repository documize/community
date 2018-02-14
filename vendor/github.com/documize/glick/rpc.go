package glick

import (
	"crypto/tls"
	"fmt"
	"io"
	"net/rpc"
	"net/rpc/jsonrpc"
	"net/url"
	"os/exec"
	"reflect"

	"golang.org/x/net/context"
)

// InsecureSkipVerifyTLS should only be set to true when testing.
var InsecureSkipVerifyTLS = false

// PluginRPC returns a type which implements the Plugger interface for making an RPC.
// The return type of this class of plugin must be a pointer.
// The plugin creates a client per call to allow services to go up-and-down between calls.
func PluginRPC(useJSON bool, serviceMethod, endPoint string, ppo ProtoPlugOut) Plugin {
	if endPoint == "" || serviceMethod == "" ||
		reflect.TypeOf(ppo()).Kind() != reflect.Ptr {
		return nil
	}
	url, err := url.Parse(endPoint)
	if err != nil {
		return nil
	}
	useTLS := false
	switch url.Scheme {
	case "http":
		endPoint = url.Host
	case "https":
		endPoint = url.Host
		useTLS = true
	}
	return func(ctx context.Context, in interface{}) (out interface{}, err error) {
		var client *rpc.Client
		var conn *tls.Conn
		var connClose = func() {
			if e := conn.Close(); err == nil {
				err = e
			}
		}
		var errDial error
		var cfg = &tls.Config{
			InsecureSkipVerify: InsecureSkipVerifyTLS,
		}
		if useJSON {
			if useTLS {
				conn, errDial = tls.Dial("tcp", endPoint, cfg)
				if errDial == nil {
					defer connClose()
					client = jsonrpc.NewClient(conn)
				}
			} else {
				client, errDial = jsonrpc.Dial("tcp", endPoint)
			}
		} else {
			if useTLS {
				conn, errDial = tls.Dial("tcp", endPoint, cfg)
				if errDial == nil {
					defer connClose()
					client = rpc.NewClient(conn)
				}
			} else {
				client, errDial = rpc.Dial("tcp", endPoint)
			}
		}
		if errDial != nil {
			return nil, errDial
		}
		out = ppo()
		err = client.Call(serviceMethod, in, out)
		err2 := client.Close()
		if err == nil {
			err = err2
		}
		return
	}
}

// ConfigRPC provides the Configurator for the RPC class of plugin.
func ConfigRPC(lib *Library) error {
	if lib == nil {
		return ErrNilLib
	}
	return lib.AddConfigurator("RPC", func(l *Library, line int, cfg *Config) error {
		ppo := l.apim[cfg.API].ppo
		pi := PluginRPC(!cfg.Gob, cfg.Method, cfg.Path, ppo)
		for _, action := range cfg.Actions {
			if err := l.RegPlugin(cfg.API, action, pi, cfg); err != nil {
				return fmt.Errorf("entry %d RPC register plugin error: %v",
					line, err)
			}
		}
		return nil
	})
}

type rpcLog struct {
	plugin []byte
	target io.Writer
}

func (l rpcLog) Write(p []byte) (int, error) {
	b := make([]byte, 0, len(l.plugin)+len(p))
	b = append(b, l.plugin...)
	b = append(b, p...)
	_, err := l.target.Write(b)
	return len(p), err
}

func validRPC(v plugval) bool {
	if v.cfg != nil {
		if !v.cfg.Disabled &&
			v.cfg.Type == "RPC" &&
			len(v.cfg.Cmd) > 0 &&
			v.cfg.Cmd[0] != "" &&
			v.cfg.Plugin != "" {
			return true
		}
	}
	return false
}

// StartLocalRPCservers starts up local RPC server plugins.
// TODO add tests.
func (l *Library) StartLocalRPCservers(stdOut, stdErr io.Writer) error {
	if l == nil {
		return ErrNilLib
	}

	l.mtx.RLock()
	defer l.mtx.RUnlock()

	servers := make(map[string]struct{})

	for _, v := range l.pim {
		if validRPC(v) {
			_, found := servers[v.cfg.Plugin]
			if !found {
				servers[v.cfg.Plugin] = struct{}{}
				cmdPath, e := exec.LookPath(v.cfg.Cmd[0])
				if e != nil {
					return errNoPlug(v.cfg.Cmd[0] + " (error: " + e.Error() + ")")
				}
				fmt.Fprintln(stdOut, "Start local RPC server:", v.cfg.Plugin)
				var se, so rpcLog
				se.plugin = []byte(v.cfg.Plugin + ": ")
				so.plugin = se.plugin
				se.target = stdErr
				so.target = stdOut
				ecmd := exec.Command(cmdPath, v.cfg.Cmd[1:]...)
				ecmd.Stdout = so
				ecmd.Stderr = se
				err := ecmd.Start()
				if err != nil {
					return err
				}
				l.subprocs = append(l.subprocs, ecmd)
			}
		}
	}
	return nil
}
