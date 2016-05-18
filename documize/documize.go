// This package provides Documize as a single executable.
// It should be run from the dickens directory, where the plugin.json file is and runs from.
package main

import (
	"github.com/documize/community/documize/api/endpoint"
	"github.com/documize/community/wordsmith/environment"

	_ "github.com/go-sql-driver/mysql" // the mysql driver is required behind the scenes
)

func main() {
	environment.Parse("db")         // process the db value first
	ready := make(chan struct{}, 1) // channel is used for testing

	endpoint.Serve(ready)
}
