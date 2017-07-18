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

// Package web contains the Documize static web data.
package web

import (
	"html/template"
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/secrets"
)

// SiteMode defines that the web server should show the system to be in a particular state.
var SiteMode string

const (
	// SiteModeNormal serves app
	SiteModeNormal = ""
	// SiteModeOffline serves offline.html
	SiteModeOffline = "1"
	// SiteModeSetup tells Ember to serve setup route
	SiteModeSetup = "2"
	// SiteModeBadDB redirects to db-error.html page
	SiteModeBadDB = "3"
)

// SiteInfo describes set-up information about the site
var SiteInfo struct {
	DBname, DBhash, Issue string
}

func init() {
	env.GetString(&SiteMode, "offline", false, "set to '1' for OFFLINE mode", nil) // no sense overriding this setting from the DB
	SiteInfo.DBhash = secrets.GenerateRandomPassword()                             // do this only once
}

// EmbedHandler is defined in each embed directory
type EmbedHandler interface {
	Asset(string) ([]byte, error)
	AssetDir(string) ([]string, error)
	StaticAssetsFileSystem() http.FileSystem
}

// Embed allows access to the embedded data
var Embed EmbedHandler

// EmberHandler provides the webserver for pages developed using the Ember programming environment.
func EmberHandler(w http.ResponseWriter, r *http.Request) {
	filename := "index.html"
	switch SiteMode {
	case SiteModeOffline:
		filename = "offline.html"
	case SiteModeSetup:
		// NoOp
	case SiteModeBadDB:
		filename = "db-error.html"
	default:
		SiteInfo.DBhash = ""
	}

	data, err := Embed.Asset("bindata/" + filename)
	if err != nil {
		// Asset was not found.
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	emberView := template.Must(template.New(filename).Parse(string(data)))

	if err := emberView.Execute(w, SiteInfo); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// StaticAssetsFileSystem data encoded in the go:generate above.
func StaticAssetsFileSystem() http.FileSystem {
	return Embed.StaticAssetsFileSystem()
	//return &assetfs.AssetFS{Asset: Asset, AssetDir: AssetDir, AssetInfo: AssetInfo, Prefix: "bindata/public"}
}

// ReadFile is intended to substitute for ioutil.ReadFile().
func ReadFile(filename string) ([]byte, error) {
	return Embed.Asset("bindata/" + filename)
}

// Asset fetch.
func Asset(location string) ([]byte, error) {
	return Embed.Asset(location)
}

// AssetDir returns web app "assets" folder.
func AssetDir(dir string) ([]string, error) {
	return Embed.AssetDir(dir)
}
