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
	"fmt"
	"os"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/section"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/edition/boot"
	"github.com/documize/community/edition/logging"
	"github.com/documize/community/embed"
	"github.com/documize/community/server"
	"github.com/documize/community/server/web"
)

func main() {
	// Runtime stores server/application information.
	rt := env.Runtime{}

	// Wire up logging implementation.
	rt.Log = logging.NewLogger(false)

	// Wire up embedded web assets handler.
	web.Embed = embed.NewEmbedder()

	// Specify the product edition.
	rt.Product = domain.Product{}
	rt.Product.Major = "3"
	rt.Product.Minor = "5"
	rt.Product.Patch = "0"
	rt.Product.Revision = "191115164251"
	rt.Product.Version = fmt.Sprintf("%s.%s.%s", rt.Product.Major, rt.Product.Minor, rt.Product.Patch)
	rt.Product.Edition = domain.CommunityEdition
	rt.Product.Title = fmt.Sprintf("%s Edition", rt.Product.Edition)

	rt.Log.Info(fmt.Sprintf("Product: %s version %s (build %s)", rt.Product.Title, rt.Product.Version, rt.Product.Revision))

	// Setup data store.
	s := store.Store{}

	// Parse configuration information.
	flagsOK := false
	rt.Flags, flagsOK = env.LoadConfig()
	if !flagsOK {
		os.Exit(0)
	}
	rt.Log.Info("Configuration: " + rt.Flags.ConfigSource)

	// Start database init.
	bootOK := boot.InitRuntime(&rt, &s)
	if bootOK {
		// runtime.Log = runtime.Log.SetDB(runtime.Db)
	}

	// Register document sections.
	section.Register(&rt, &s)

	// Start web server.
	ready := make(chan struct{}, 1) // channel signals router ready
	server.Start(&rt, &s, ready)
}
