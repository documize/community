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

// This package provides Documize as a single executable.
package main

import (
	"embed"
	"fmt"
	"os"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/i18n"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/section"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/edition/boot"
	"github.com/documize/community/edition/logging"
	"github.com/documize/community/server"
)

//go:embed static/*
var embeddedFiles embed.FS

func main() {
	// Runtime stores server/application information.
	rt := env.Runtime{}

	// Wire up logging implementation.
	rt.Log = logging.NewLogger(false)

	// Specify the product edition.
	rt.Product = domain.Product{}
	rt.Product.Major = "5"
	rt.Product.Minor = "8"
	rt.Product.Patch = "0"
	rt.Product.Revision = "230724105728"
	rt.Product.Version = fmt.Sprintf("%s.%s.%s", rt.Product.Major, rt.Product.Minor, rt.Product.Patch)
	rt.Product.Edition = domain.CommunityEdition
	rt.Product.Title = "Community"

	rt.Log.Info(fmt.Sprintf("Documize %s v%s (build %s)", rt.Product.Title, rt.Product.Version, rt.Product.Revision))

	// Locate static assets.
	rt.Assets = embeddedFiles

	// Setup data store.
	s := store.Store{}

	// Parse configuration information.
	flagsOK := false
	rt.Flags, flagsOK = env.LoadConfig()
	if !flagsOK {
		os.Exit(0)
	}
	rt.Log.Info("Configuration: " + rt.Flags.ConfigSource)

	// i18n
	err := i18n.Initialize(rt.Assets)
	if err != nil {
		rt.Log.Error("i18n", err)
	}

	// Start database init.
	boot.InitRuntime(&rt, &s)

	// Register document sections.
	section.Register(&rt, &s)

	// Start web server.
	ready := make(chan struct{}, 1) // channel signals router ready
	server.Start(&rt, &s, ready)
}
