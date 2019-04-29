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

// Package env provides runtime, server level setup and configuration
package env

import (
	"flag"
	"fmt"
	"os"
	"sort"
	"strings"
	"sync"
)

// prefix provides the prefix for all environment variables
const prefix = "DOCUMIZE"
const goInit = "(default)"

var flagList progFlags
var cliMutex sync.Mutex

type flagItem struct {
	target              *string
	name, setter, value string
	required            bool
}

type progFlags struct {
	items []flagItem
}

// Len is part of sort.Interface.
func (v *progFlags) Len() int {
	return len(v.items)
}

// Swap is part of sort.Interface.
func (v *progFlags) Swap(i, j int) {
	v.items[i], v.items[j] = v.items[j], v.items[i]
}

// Less is part of sort.Interface.
func (v *progFlags) Less(i, j int) bool {
	return v.items[i].name < v.items[j].name
}

// register prepares flag for subsequent parsing
func register(target *string, name string, required bool, usage string) {
	cliMutex.Lock()
	defer cliMutex.Unlock()

	name = strings.ToLower(strings.TrimSpace(name))
	setter := prefix + strings.ToUpper(name)

	value := os.Getenv(setter)
	if value == "" {
		value = *target // use the Go initialized value
		setter = goInit
	}

	flag.StringVar(target, name, value, usage)
	flagList.items = append(flagList.items, flagItem{target: target, name: name, required: required, value: value, setter: setter})
}

// parse loads flags from OS environment and command line switches
func parse(doFirst string) (ok bool) {
	cliMutex.Lock()
	defer cliMutex.Unlock()

	flag.Parse()
	sort.Sort(&flagList)

	for pass := 1; pass <= 2; pass++ {
		for vi, v := range flagList.items {
			if (pass == 1 && v.name == doFirst) || (pass == 2 && v.name != doFirst) {
				if v.value != *(v.target) || (v.value != "" && *(v.target) == "") {
					flagList.items[vi].setter = "-" + v.name // v is a local copy, not the underlying data
				}
				if v.required {
					if *(v.target) == "" {
						fmt.Fprintln(os.Stderr)
						fmt.Fprintln(os.Stderr, "In order to run", os.Args[0], "the following must be provided:")
						for _, vv := range flagList.items {
							if vv.required {
								fmt.Fprintf(os.Stderr, "* setting from environment variable '%s' or flag '-%s' or an application setting '%s', current value: '%s' set by '%s'\n",
									prefix+strings.ToUpper(vv.name), vv.name, vv.name, *(vv.target), vv.setter)
							}
						}
						fmt.Fprintln(os.Stderr)
						flag.Usage()
						return false
					}
				}
			}
		}
	}

	return true
}
