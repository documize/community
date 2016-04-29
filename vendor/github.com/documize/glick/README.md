## Versatile plugin framework for Go

This repository contains the "glick" plug-in framework, which is a work-in-progress.

Why "glick"? Well the framework is written in "go" and intended to be as easy to build with as lego bricks which "click" together, hence "glick".

The key features of Glick are:
- Named APIs, described as Go types in and out of a plugin.
- Different "actions" on that same API, but running different code.
- Plugins can be configured using a simple JSON configuration file.
- At runtime, the context of the call can be used to re-route it to different plugin code.

Plugin code can run:
- within the application;
- as a sub-process, either simple or [structured as an RPC](https://github.com/natefinch/pie);
- or remotely via: simple URL get, standard go RPC, via [go-kit](http://gokit.io) or using [gRPC](http://www.grpc.io/) (with more to come). 

For a more detailed overivew of the package see: doc.go 

For a simple example see: examples_test.go

## Dependencies

Besides the standard packages, "glick" relies on [the Context of a request](https://blog.golang.org/context):
	https://golang.org/x/net/context and
	https://golang.org/x/net/context/ctxhttp 

Additionally, "glick/glpie" provides an interface to Nate Finch's PIE package:
	https://github.com/natefinch/pie

The tests in "glick/glgrpc" provide example code to interface with [gRPC](http://www.grpc.io/), Go package at:
	https://google.golang.org/grpc

The package "glick/glkit" provides an interface to [go-kit](http://gokit.io)  and alse requires: https://gopkg.in/logfmt.v0 and https://gopkg.in/stack.v1 

## Testing

In order to run the tests for the "glick/glpie" sub-package the server counterpart executables need to be built. "glick/glpie/_test/build_tests.sh" provides a bash script for doing this, it must be run from the directory it is in.

The code has only been tested on OSX & Ubuntu.
