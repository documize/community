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
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/BurntSushi/toml"
)

// ParseFlags loads runtime parameters like port numbers and DB connections.
// We first check for -config switch that would point us towards a .CONF file.
// If not found, we then read parameters from command line and environment vars.
func ParseFlags() (f Flags, ok bool) {
	// Check and process config file
	f, ok = configFile()

	// If not OK then get parameters from command line and environment variables.
	if !ok {
		f, ok = commandLineEnv()
	}

	return
}

// configFile checks for the presence of exactly one command argument
// checks to see if it is a TOML format config file.
func configFile() (f Flags, ok bool) {
	ok = false

	// We are expecting: ./documize sample.conf
	var configFile string
	if len(os.Args) != 2 {
		return
	}
	configFile = os.Args[1]
	if len(configFile) == 0 || !configFileExists(configFile) {
		return
	}

	// So now we have file and we parse the TOML format.
	var ct ConfigToml
	if _, err := toml.DecodeFile(configFile, &ct); err != nil {
		fmt.Println(err)
		return
	}

	// TOML format cofig file is good so we map to flags.
	f.DBType = strings.ToLower(ct.Database.Type)
	f.DBConn = ct.Database.Connection
	f.Salt = ct.Database.Salt
	f.HTTPPort = strconv.Itoa(ct.HTTP.Port)
	f.ForceHTTPPort2SSL = strconv.Itoa(ct.HTTP.ForceSSLPort)
	f.SSLCertFile = ct.HTTP.Cert
	f.SSLKeyFile = ct.HTTP.Key

	ok = true
	return
}

// commandLineEnv loads command line and OS environment variables required by the program to function.
func commandLineEnv() (f Flags, ok bool) {
	ok = true
	var dbConn, dbType, jwtKey, siteMode, port, certFile, keyFile, forcePort2SSL, location string

	// register(&configFile, "salt", false, "the salt string used to encode JWT tokens, if not set a random value will be generated")
	register(&jwtKey, "salt", false, "the salt string used to encode JWT tokens, if not set a random value will be generated")
	register(&certFile, "cert", false, "the cert.pem file used for https")
	register(&keyFile, "key", false, "the key.pem file used for https")
	register(&port, "port", false, "http/https port number")
	register(&forcePort2SSL, "forcesslport", false, "redirect given http port number to TLS")
	register(&siteMode, "offline", false, "set to '1' for OFFLINE mode")
	register(&dbType, "dbtype", true, "specify the database provider: mysql|percona|mariadb|postgresql|sqlserver")
	register(&dbConn, "db", true, `'database specific connection string for example "user:password@tcp(localhost:3306)/dbname"`)
	register(&location, "location", false, `reserved`)

	if !parse("db") {
		ok = false
	}

	f.DBType = strings.ToLower(dbType)
	f.DBConn = dbConn
	f.ForceHTTPPort2SSL = forcePort2SSL
	f.HTTPPort = port
	f.Salt = jwtKey
	f.SiteMode = siteMode
	f.SSLCertFile = certFile
	f.SSLKeyFile = keyFile

	// reserved
	if len(location) == 0 {
		location = "selfhost"
	}
	f.Location = strings.ToLower(location)

	return f, ok
}

func configFileExists(fn string) bool {
	info, err := os.Stat(fn)
	if os.IsNotExist(err) {
		return false
	}

	return !info.IsDir()
}
