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
	"net/http"
)

// EmbedHandler is defined in each embed directory
type EmbedHandler interface {
	Asset(string) ([]byte, error)
	AssetDir(string) ([]string, error)
	StaticAssetsFileSystem() http.FileSystem
}

// Embed allows access to the embedded data
var Embed EmbedHandler

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
