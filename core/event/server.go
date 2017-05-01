package event

import (
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/rpc"
	"sync"
)

// SubscribeType - how the client intends to subscribe
type SubscribeType int

const (
	// Subscribe - subscribe to all events
	Subscribe SubscribeType = iota
	// SubscribeOnce - subscribe to only one event
	SubscribeOnce
)

const (
	// RegisterService - Server subscribe service method
	RegisterService = "ServerService.Register"
)

// SubscribeArg - object to hold subscribe arguments from remote event handlers
type SubscribeArg struct {
	ClientAddr    string
	ClientPath    string
	ServiceMethod string
	SubscribeType SubscribeType
	Topic         string
}

// Server - object capable of being subscribed to by remote handlers
type Server struct {
	eventBus    Bus
	address     string
	path        string
	subscribers map[string][]*SubscribeArg
	service     *ServerService
}

// NewServer - create a new Server at the address and path
func NewServer(address, path string, eventBus Bus) *Server {
	server := new(Server)
	server.eventBus = eventBus
	server.address = address
	server.path = path
	server.subscribers = make(map[string][]*SubscribeArg)
	server.service = &ServerService{server, &sync.WaitGroup{}, false}
	return server
}

// EventBus - returns wrapped event bus
func (server *Server) EventBus() Bus {
	return server.eventBus
}

func (server *Server) rpcCallback(subscribeArg *SubscribeArg) func(args ...interface{}) {
	return func(args ...interface{}) {
		client, connErr := rpc.DialHTTPPath("tcp", subscribeArg.ClientAddr, subscribeArg.ClientPath)
		defer client.Close()
		if connErr != nil {
			fmt.Errorf("dialing: %v", connErr)
		}
		clientArg := new(ClientArg)
		clientArg.Topic = subscribeArg.Topic
		clientArg.Args = args
		var reply bool
		err := client.Call(subscribeArg.ServiceMethod, clientArg, &reply)
		if err != nil {
			fmt.Errorf("dialing: %v", err)
		}
	}
}

// HasClientSubscribed - True if a client subscribed to this server with the same topic
func (server *Server) HasClientSubscribed(arg *SubscribeArg) bool {
	if topicSubscribers, ok := server.subscribers[arg.Topic]; ok {
		for _, topicSubscriber := range topicSubscribers {
			if *topicSubscriber == *arg {
				return true
			}
		}
	}
	return false
}

// Start - starts a service for remote clients to subscribe to events
func (server *Server) Start() error {
	var err error
	service := server.service
	if !service.started {
		rpcServer := rpc.NewServer()
		rpcServer.Register(service)
		rpcServer.HandleHTTP(server.path, "/debug"+server.path)
		l, e := net.Listen("tcp", server.address)
		if e != nil {
			err = e
			fmt.Errorf("listen error: %v", e)
		}
		service.started = true
		service.wg.Add(1)
		go http.Serve(l, nil)
	} else {
		err = errors.New("Server bus already started")
	}
	return err
}

// Stop - signal for the service to stop serving
func (server *Server) Stop() {
	service := server.service
	if service.started {
		service.wg.Done()
		service.started = false
	}
}

// ServerService - service object to listen to remote subscriptions
type ServerService struct {
	server  *Server
	wg      *sync.WaitGroup
	started bool
}

// Register - Registers a remote handler to this event bus
// for a remote subscribe - a given client address only needs to subscribe once
// event will be republished in local event bus
func (service *ServerService) Register(arg *SubscribeArg, success *bool) error {
	subscribers := service.server.subscribers
	if !service.server.HasClientSubscribed(arg) {
		rpcCallback := service.server.rpcCallback(arg)
		switch arg.SubscribeType {
		case Subscribe:
			service.server.eventBus.Subscribe(arg.Topic, rpcCallback)
		case SubscribeOnce:
			service.server.eventBus.SubscribeOnce(arg.Topic, rpcCallback)
		}
		var topicSubscribers []*SubscribeArg
		if _, ok := subscribers[arg.Topic]; ok {
			topicSubscribers = []*SubscribeArg{arg}
		} else {
			topicSubscribers = subscribers[arg.Topic]
			topicSubscribers = append(topicSubscribers, arg)
		}
		subscribers[arg.Topic] = topicSubscribers
	}
	*success = true
	return nil
}
