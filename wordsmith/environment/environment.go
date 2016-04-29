// Package environment allow environment variables to be obtained from either the environment or the command line.
// Environment variables are always uppercase, with the Prefix; flags are always lowercase without.
package environment

import (
	"flag"
	"fmt"
	"os"
	"sort"
	"strings"
)

type varT struct {
	target              *string
	name, setter, value string
	required            bool
	callback            func()
}

type varsT struct {
	vv []varT
}

var vars varsT

// Len is part of sort.Interface.
func (v *varsT) Len() int {
	return len(v.vv)
}

// Swap is part of sort.Interface.
func (v *varsT) Swap(i, j int) {
	v.vv[i], v.vv[j] = v.vv[j], v.vv[i]
}

// Less is part of sort.Interface.
func (v *varsT) Less(i, j int) bool {
	return v.vv[i].name < v.vv[j].name
}

// Prefix provides the prefix for all Environment variables
const Prefix = "DOCUMIZE"

const goInit =  "(default)"

// GetString sets-up the flag for later use, it must be called before ParseOK(), usually in an init().
func GetString(target *string, name string, required bool, usage string, callback func()) {
	name = strings.ToLower(strings.TrimSpace(name))
	setter := Prefix + strings.ToUpper(name)
	value := os.Getenv(setter)
	if value == "" {
		value = *target // use the Go initialized value
		setter = goInit
	}
	flag.StringVar(target, name, value, usage)
	vars.vv = append(vars.vv, varT{target: target, name: name, required: required, callback: callback, value: value, setter: setter})
}

// Parse calls flag.Parse() then checks that the required environment variables are all set.
// It should be the first thing called by any main() that uses this library.
// If all the required variables are not present, it prints an error and calls os.Exit(2) like flag.Parse().
func Parse() {
	flag.Parse()
	sort.Sort(&vars)
	for vi, v := range vars.vv {
		typ := "Optional"
		if v.value != *(v.target) || (v.value != "" && *(v.target) == "") {
			vars.vv[vi].setter = "-" + v.name // v is a local copy, not the underlying data
		}
		if v.required {
			if *(v.target) == "" {
				fmt.Fprintln(os.Stderr)
				fmt.Fprintln(os.Stderr, "In order to run", os.Args[0], "the following must be provided:")
				for _, vv := range vars.vv {
					if vv.required {
						fmt.Fprintf(os.Stderr, "* setting from environment variable '%s' or flag '-%s', current value: '%s' set by '%s'\n",
							Prefix+strings.ToUpper(vv.name), vv.name, *(vv.target), vv.setter)
					}
				}
				fmt.Fprintln(os.Stderr)
				flag.Usage()
				os.Exit(2)
				return
			}
			typ = "Required"
		}
		if *(v.target) != "" && v.setter != goInit {
			fmt.Fprintf(os.Stdout, "%s setting from '%s' is: '%s'\n",
				typ, v.setter, *(v.target))
		}
		if v.callback != nil {
			v.callback()
		}
	}
}
