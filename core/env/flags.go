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

// Flags provides access to environment and command line switches for this program.
type Flags struct {
	DBConn            string // database connection string
	Salt              string // the salt string used to encode JWT tokens
	DBType            string // (optional) database type
	SSLCertFile       string // (optional) name of SSL certificate PEM file
	SSLKeyFile        string // (optional) name of SSL key PEM file
	HTTPPort          string // (optional) HTTP or HTTPS port
	ForceHTTPPort2SSL string // (optional) HTTP that should be redirected to HTTPS
	SiteMode          string // (optional) if 1 then serve offline web page
}

// SSLEnabled returns true if both cert and key were provided at runtime.
func (f *Flags) SSLEnabled() bool {
	return f.SSLCertFile != "" && f.SSLKeyFile != ""
}

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

// prefix provides the prefix for all environment variables
const prefix = "DOCUMIZE"
const goInit = "(default)"

var flagList progFlags
var loadMutex sync.Mutex

// ParseFlags loads command line and OS environment variables required by the program to function.
func ParseFlags() (f Flags) {
	var dbConn, dbType, jwtKey, siteMode, port, certFile, keyFile, forcePort2SSL string

	register(&jwtKey, "salt", false, "the salt string used to encode JWT tokens, if not set a random value will be generated")
	register(&certFile, "cert", false, "the cert.pem file used for https")
	register(&keyFile, "key", false, "the key.pem file used for https")
	register(&port, "port", false, "http/https port number")
	register(&forcePort2SSL, "forcesslport", false, "redirect given http port number to TLS")
	register(&siteMode, "offline", false, "set to '1' for OFFLINE mode")
	register(&dbType, "dbtype", true, "specify the database provider: mysql|percona|mariadb|postgresql")
	register(&dbConn, "db", true, `'database specific connection string for example "user:password@tcp(localhost:3306)/dbname"`)

	parse("db")

	f.DBConn = dbConn
	f.ForceHTTPPort2SSL = forcePort2SSL
	f.HTTPPort = port
	f.Salt = jwtKey
	f.SiteMode = siteMode
	f.SSLCertFile = certFile
	f.SSLKeyFile = keyFile
	f.DBType = strings.ToLower(dbType)

	return f
}

// register prepares flag for subsequent parsing
func register(target *string, name string, required bool, usage string) {
	loadMutex.Lock()
	defer loadMutex.Unlock()

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
func parse(doFirst string) {
	loadMutex.Lock()
	defer loadMutex.Unlock()

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
						return
					}
				}
			}
		}
	}
}
