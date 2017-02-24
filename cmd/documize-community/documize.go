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
	"github.com/documize/community/core/api/endpoint"
	"github.com/documize/community/core/environment"
	"github.com/documize/community/core/section"

	_ "github.com/documize/community/embed" // the compressed front-end code and static data
	_ "github.com/go-sql-driver/mysql"      // the mysql driver is required behind the scenes
)

func main() {
	environment.Parse("db")         // process the db value first
	ready := make(chan struct{}, 1) // channel is used for testing

	section.Register()

	endpoint.Serve(ready)
}
