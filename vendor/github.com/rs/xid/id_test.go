package xid

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

type IDParts struct {
	id        ID
	timestamp int64
	machine   []byte
	pid       uint16
	counter   int32
}

var IDs = []IDParts{
	IDParts{
		ID{0x4d, 0x88, 0xe1, 0x5b, 0x60, 0xf4, 0x86, 0xe4, 0x28, 0x41, 0x2d, 0xc9},
		1300816219,
		[]byte{0x60, 0xf4, 0x86},
		0xe428,
		4271561,
	},
	IDParts{
		ID{0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00},
		0,
		[]byte{0x00, 0x00, 0x00},
		0x0000,
		0,
	},
	IDParts{
		ID{0x00, 0x00, 0x00, 0x00, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0x00, 0x00, 0x01},
		0,
		[]byte{0xaa, 0xbb, 0xcc},
		0xddee,
		1,
	},
}

func TestIDPartsExtraction(t *testing.T) {
	for i, v := range IDs {
		assert.Equal(t, v.id.Time(), time.Unix(v.timestamp, 0), "#%d timestamp", i)
		assert.Equal(t, v.id.Machine(), v.machine, "#%d machine", i)
		assert.Equal(t, v.id.Pid(), v.pid, "#%d pid", i)
		assert.Equal(t, v.id.Counter(), v.counter, "#%d counter", i)
	}
}

func TestNew(t *testing.T) {
	// Generate 10 ids
	ids := make([]ID, 10)
	for i := 0; i < 10; i++ {
		ids[i] = New()
	}
	for i := 1; i < 10; i++ {
		prevID := ids[i-1]
		id := ids[i]
		// Test for uniqueness among all other 9 generated ids
		for j, tid := range ids {
			if j != i {
				assert.NotEqual(t, id, tid, "Generated ID is not unique")
			}
		}
		// Check that timestamp was incremented and is within 30 seconds of the previous one
		secs := id.Time().Sub(prevID.Time()).Seconds()
		assert.Equal(t, (secs >= 0 && secs <= 30), true, "Wrong timestamp in generated ID")
		// Check that machine ids are the same
		assert.Equal(t, id.Machine(), prevID.Machine())
		// Check that pids are the same
		assert.Equal(t, id.Pid(), prevID.Pid())
		// Test for proper increment
		delta := int(id.Counter() - prevID.Counter())
		assert.Equal(t, delta, 1, "Wrong increment in generated ID")
	}
}

func TestIDString(t *testing.T) {
	id := ID{0x4d, 0x88, 0xe1, 0x5b, 0x60, 0xf4, 0x86, 0xe4, 0x28, 0x41, 0x2d, 0xc9}
	assert.Equal(t, "TYjhW2D0huQoQS3J", id.String())
}

type jsonType struct {
	ID *ID
}

func TestIDJSONMarshaling(t *testing.T) {
	id := ID{0x4d, 0x88, 0xe1, 0x5b, 0x60, 0xf4, 0x86, 0xe4, 0x28, 0x41, 0x2d, 0xc9}
	v := jsonType{ID: &id}
	data, err := json.Marshal(&v)
	assert.NoError(t, err)
	assert.Equal(t, `{"ID":"TYjhW2D0huQoQS3J"}`, string(data))
}

func TestIDJSONUnmarshaling(t *testing.T) {
	data := []byte(`{"ID":"TYjhW2D0huQoQS3J"}`)
	v := jsonType{}
	err := json.Unmarshal(data, &v)
	assert.NoError(t, err)
	assert.Equal(t, ID{0x4d, 0x88, 0xe1, 0x5b, 0x60, 0xf4, 0x86, 0xe4, 0x28, 0x41, 0x2d, 0xc9}, *v.ID)
}

func TestIDJSONUnmarshalingError(t *testing.T) {
	v := jsonType{}
	err := json.Unmarshal([]byte(`{"ID":"TYjhW2D0huQoQS"}`), &v)
	assert.EqualError(t, err, "invalid ID")
	err = json.Unmarshal([]byte(`{"ID":"TYjhW2D0huQoQS3kdk"}`), &v)
	assert.EqualError(t, err, "invalid ID")
}
