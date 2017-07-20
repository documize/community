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

	"github.com/documize/community/core/api"
	"github.com/documize/community/core/api/endpoint"
	"github.com/documize/community/core/api/request"
	"github.com/documize/community/core/env"
	"github.com/documize/community/core/section"
	"github.com/documize/community/edition/boot"
	"github.com/documize/community/edition/logging"
	_ "github.com/documize/community/embed" // the compressed front-end code and static data
	_ "github.com/go-sql-driver/mysql"      // the mysql driver is required behind the scenes
)

func init() {
	// runtime stores server/application level information
	runtime := env.Runtime{}

	// wire up logging implementation
	runtime.Log = logging.NewLogger()

	// define product edition details
	runtime.Product = env.ProdInfo{}
	runtime.Product.Major = "1"
	runtime.Product.Minor = "50"
	runtime.Product.Patch = "1"
	runtime.Product.Version = fmt.Sprintf("%s.%s.%s", runtime.Product.Major, runtime.Product.Minor, runtime.Product.Patch)
	runtime.Product.Edition = "Community"
	runtime.Product.Title = fmt.Sprintf("%s Edition", runtime.Product.Edition)
	runtime.Product.License = env.License{}
	runtime.Product.License.Seats = 1
	runtime.Product.License.Valid = true
	runtime.Product.License.Trial = false
	runtime.Product.License.Edition = "Community"

	// parse settings from command line and environment
	runtime.Flags = env.ParseFlags()
	flagsOK := boot.InitRuntime(&runtime)

	if flagsOK {
		// runtime.Log = runtime.Log.SetDB(runtime.Db)
	}

	// temp code repair
	api.Runtime = runtime
	request.Db = runtime.Db
}

func main() {
	section.Register()

	ready := make(chan struct{}, 1) // channel is used for testing
	endpoint.Serve(ready)
}
