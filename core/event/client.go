package event

import (
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/rpc"
	"sync"
)

const (
	// PublishService - Client service method
	PublishService = "ClientService.PushEvent"
)

// ClientArg - object containing event for client to publish locally
type ClientArg struct {
	Args  []interface{}
	Topic string
}

// Client - object capable of subscribing to a remote event bus
type Client struct {
	eventBus Bus
	address  string
	path     string
	service  *ClientService
}

// NewClient - create a client object with the address and server path
func NewClient(address, path string, eventBus Bus) *Client {
	client := new(Client)
	client.eventBus = eventBus
	client.address = address
	client.path = path
	client.service = &ClientService{client, &sync.WaitGroup{}, false}
	return client
}

// EventBus - returns the underlying event bus
func (client *Client) EventBus() Bus {
	return client.eventBus
}

func (client *Client) doSubscribe(topic string, fn interface{}, serverAddr, serverPath string, subscribeType SubscribeType) {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Server not found -", r)
		}
	}()

	rpcClient, err := rpc.DialHTTPPath("tcp", serverAddr, serverPath)
	defer rpcClient.Close()
	if err != nil {
		fmt.Errorf("dialing: %v", err)
	}
	args := &SubscribeArg{client.address, client.path, PublishService, subscribeType, topic}
	reply := new(bool)
	err = rpcClient.Call(RegisterService, args, reply)
	if err != nil {
		fmt.Errorf("Register error: %v", err)
	}
	if *reply {
		client.eventBus.Subscribe(topic, fn)
	}
}

//Subscribe subscribes to a topic in a remote event bus
func (client *Client) Subscribe(topic string, fn interface{}, serverAddr, serverPath string) {
	client.doSubscribe(topic, fn, serverAddr, serverPath, Subscribe)
}

//SubscribeOnce subscribes once to a topic in a remote event bus
func (client *Client) SubscribeOnce(topic string, fn interface{}, serverAddr, serverPath string) {
	client.doSubscribe(topic, fn, serverAddr, serverPath, SubscribeOnce)
}

// Start - starts the client service to listen to remote events
func (client *Client) Start() error {
	var err error
	service := client.service
	if !service.started {
		server := rpc.NewServer()
		server.Register(service)
		server.HandleHTTP(client.path, "/debug"+client.path)
		l, e := net.Listen("tcp", client.address)
		if e != nil {
			err = e
			fmt.Errorf("listen error: %v", e)
		}
		service.wg.Add(1)
		service.started = true
		go http.Serve(l, nil)
	} else {
		err = errors.New("Client service already started")
	}
	return err
}

// Stop - signal for the service to stop serving
func (client *Client) Stop() {
	service := client.service
	if service.started {
		service.wg.Done()
		service.started = false
	}
}

// ClientService - service object listening to events published in a remote event bus
type ClientService struct {
	client  *Client
	wg      *sync.WaitGroup
	started bool
}

// PushEvent - exported service to listening to remote events
func (service *ClientService) PushEvent(arg *ClientArg, reply *bool) error {
	service.client.eventBus.Publish(arg.Topic, arg.Args...)
	*reply = true
	return nil
}
