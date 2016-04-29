package glgrpc_test

import (
	"errors"
	"fmt"
	"log"
	"net"
	"time"

	"github.com/documize/glick"

	"golang.org/x/net/context"
	"google.golang.org/grpc"

	pb "google.golang.org/grpc/examples/helloworld/helloworld"
)

const (
	address = "localhost:50051"
)

func ConfigGRPChw(lib *glick.Library) error {
	return lib.AddConfigurator("gRPChw", func(l *glick.Library, line int, cfg *glick.Config) error {
		for _, action := range cfg.Actions {
			if err := l.RegPlugin(cfg.API, action,
				func(ctx context.Context, in interface{}) (out interface{}, err error) {
					ins, ok := in.(*pb.HelloRequest)
					if !ok {
						return nil, errors.New("not *pb.HelloRequest")
					}
					out = interface{}(&pb.HelloReply{})
					outsp := out.(*pb.HelloReply)
					dialOpt := []grpc.DialOption{grpc.WithInsecure()}
					if deadline, ok := ctx.Deadline(); ok {
						dialOpt = append(dialOpt,
							grpc.WithTimeout(deadline.Sub(time.Now())))
					}
					conn, err := grpc.Dial(address, dialOpt...)
					if err != nil {
						return nil, err
					}
					defer func() {
						if e := conn.Close(); e != nil {
							panic(e)
						}
					}()
					c := pb.NewGreeterClient(conn)

					r, err := c.SayHello(context.Background(), ins)
					if err != nil {
						return nil, err
					}
					*outsp = *r
					return out, nil
				}, cfg); err != nil {
				return fmt.Errorf("entry %d GRPChw register plugin error: %v",
					line, err)
			}
		}
		return nil
	})
}

func ExampleGRPChw() {
	go servermain()
	time.Sleep(time.Second)

	l, nerr := glick.New(nil)
	if nerr != nil {
		log.Fatal(nerr)
	}
	var req pb.HelloRequest
	var err error
	if err = l.RegAPI("hw", &req, func() interface{} { var hr pb.HelloReply; return interface{}(&hr) }, 2*time.Second); err != nil {
		log.Fatal(err)
	}
	if err := ConfigGRPChw(l); err != nil {
		log.Fatal(err)
	}
	if err := l.Configure([]byte(`[
{"Plugin":"ExampleGRPChw","API":"hw","Actions":["hwAct"],"Type":"gRPChw","Path":"` + address + `"}
		]`)); err != nil {
		log.Fatal(err)
	}
	req.Name = "gRPC"
	ctx, cancelCtx := context.WithTimeout(context.Background(), time.Second)
	defer cancelCtx()
	repI, err := l.Run(ctx, "hw", "hwAct", &req)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(repI.(*pb.HelloReply).Message)
	// output: Hello gRPC
}

// code below copied and slightly modified from google.golang.org/grpc/examples/helloworld/greeter_server

/*
 *
 * Copyright 2015, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

// server is used to implement hellowrld.GreeterServer.
type server struct{}

// SayHello implements helloworld.GreeterServer
func (s *server) SayHello(ctx context.Context, in *pb.HelloRequest) (*pb.HelloReply, error) {
	return &pb.HelloReply{Message: "Hello " + in.Name}, nil
}

func servermain() {
	lis, err := net.Listen("tcp", address)
	if err != nil {
		log.Fatalf("failed to Listen: %v", err)
	}
	s := grpc.NewServer()
	pb.RegisterGreeterServer(s, &server{})
	err = s.Serve(lis)
	if err != nil {
		log.Fatalf("failed to Serve: %v", err)
	}
}
