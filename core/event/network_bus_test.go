package event

import (
	"testing"
)

func TestNewServer(t *testing.T) {
	serverBus := NewServer(":2010", "/_server_bus_", New())
	serverBus.Start()
	if serverBus == nil || !serverBus.service.started {
		t.Log("New server EventBus not created!")
		t.Fail()
	}
	serverBus.Stop()
}

func TestNewClient(t *testing.T) {
	clientBus := NewClient(":2015", "/_client_bus_", New())
	clientBus.Start()
	if clientBus == nil || !clientBus.service.started {
		t.Log("New client EventBus not created!")
		t.Fail()
	}
	clientBus.Stop()
}

func TestRegister(t *testing.T) {
	serverPath := "/_server_bus_"
	serverBus := NewServer(":2010", serverPath, New())

	args := &SubscribeArg{serverBus.address, serverPath, PublishService, Subscribe, "topic"}
	reply := new(bool)

	serverBus.service.Register(args, reply)

	if serverBus.eventBus.HasCallback("topic_topic") {
		t.Fail()
	}
	if !serverBus.eventBus.HasCallback("topic") {
		t.Fail()
	}
}

func TestPushEvent(t *testing.T) {
	clientBus := NewClient("localhost:2015", "/_client_bus_", New())

	eventArgs := make([]interface{}, 1)
	eventArgs[0] = 10

	clientArg := &ClientArg{eventArgs, "topic"}
	reply := new(bool)

	fn := func(a int) {
		if a != 10 {
			t.Fail()
		}
	}

	clientBus.eventBus.Subscribe("topic", fn)
	clientBus.service.PushEvent(clientArg, reply)
	if !(*reply) {
		t.Fail()
	}
}

func TestServerPublish(t *testing.T) {
	serverBus := NewServer(":2020", "/_server_bus_b", New())
	serverBus.Start()

	fn := func(a int) {
		if a != 10 {
			t.Fail()
		}
	}

	clientBus := NewClient(":2025", "/_client_bus_b", New())
	clientBus.Start()

	clientBus.Subscribe("topic", fn, ":2010", "/_server_bus_b")

	serverBus.EventBus().Publish("topic", 10)

	clientBus.Stop()
	serverBus.Stop()
}

func TestNetworkBus(t *testing.T) {
	networkBusA := NewNetworkBus(":2035", "/_net_bus_A")
	networkBusA.Start()

	networkBusB := NewNetworkBus(":2030", "/_net_bus_B")
	networkBusB.Start()

	fnA := func(a int) {
		if a != 10 {
			t.Fail()
		}
	}
	networkBusA.Subscribe("topic-A", fnA, ":2030", "/_net_bus_B")
	networkBusB.EventBus().Publish("topic-A", 10)

	fnB := func(a int) {
		if a != 20 {
			t.Fail()
		}
	}
	networkBusB.Subscribe("topic-B", fnB, ":2035", "/_net_bus_A")
	networkBusA.EventBus().Publish("topic-B", 20)

	networkBusA.Stop()
	networkBusB.Stop()
}
