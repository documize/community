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

// Package embed contains the Documize static web data.
package embed

//go:generate go-bindata-assetfs -pkg embed bindata/...

import (
	"net/http"

	assetfs "github.com/elazarl/go-bindata-assetfs"
)

type embedderT struct{}

func (embedderT) Asset(name string) ([]byte, error) {
	return Asset(name)
}

func (embedderT) AssetDir(dir string) ([]string, error) {
	return AssetDir(dir)
}

// StaticAssetsFileSystem data encoded in the go:generate above.
func (embedderT) StaticAssetsFileSystem() http.FileSystem {
	return &assetfs.AssetFS{Asset: Asset, AssetDir: AssetDir, AssetInfo: AssetInfo, Prefix: "bindata/public"}
}

var embedder embedderT

// NewEmbedder returns embed assets handler instance
func NewEmbedder() embedderT {
	return embedder
}

// func init() {
// 	fmt.Println("firing embed init()")
// 	web.Embed = embedder
// }
