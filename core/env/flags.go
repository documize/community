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

// Flags provides access to environment and command line switches for this program.
type Flags struct {
	DBType            string // database type
	DBConn            string // database connection string
	Salt              string // the salt string used to encode JWT tokens
	HTTPPort          string // (optional) HTTP or HTTPS port
	ForceHTTPPort2SSL string // (optional) HTTP that should be redirected to HTTPS
	SSLCertFile       string // (optional) name of SSL certificate PEM file
	SSLKeyFile        string // (optional) name of SSL key PEM file
	SiteMode          string // (optional) if 1 then serve offline web page
	Location          string // reserved
	ConfigSource      string // tells us if configuration info was obtained from command line or config file
}

// SSLEnabled returns true if both cert and key were provided at runtime.
func (f *Flags) SSLEnabled() bool {
	return f.SSLCertFile != "" && f.SSLKeyFile != ""
}

// ConfigToml represents configuration file that contains all flags as per above.
type ConfigToml struct {
	HTTP     httpConfig     `toml:"http"`
	Database databaseConfig `toml:"database"`
	Install  installConfig  `toml:"install"`
}

type httpConfig struct {
	Port         int
	ForceSSLPort int
	Cert         string
	Key          string
}

type databaseConfig struct {
	Type       string
	Connection string
	Salt       string
}

type installConfig struct {
	Location string
}
