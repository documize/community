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

//go:generate go-bindata-assetfs -pkg web bindata/...

import (
	"html/template"
	"net/http"

	"github.com/documize/community/documize/api/util"
	"github.com/documize/community/wordsmith/environment"

	assetfs "github.com/elazarl/go-bindata-assetfs"
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
	environment.GetString(&SiteMode, "offline", false, "set to '1' for OFFLINE mode", nil) // no sense overriding this setting from the DB
	SiteInfo.DBhash = util.GenerateRandomPassword()                                        // do this only once
}

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

	data, err := Asset("bindata/" + filename)
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
	return &assetfs.AssetFS{Asset: Asset, AssetDir: AssetDir, AssetInfo: AssetInfo, Prefix: "bindata/public"}
}

// ReadFile is intended to substitute for ioutil.ReadFile().
func ReadFile(filename string) ([]byte, error) {
	return Asset("bindata/" + filename)
}
