package documizeapi

import (
	"encoding/json"

	"github.com/documize/community/wordsmith/api"

	"golang.org/x/net/context"
)

// Convert provides the standard interface for conversion of a ".documizeapi" json document.
func Convert(ctx context.Context, in interface{}) (interface{}, error) {
	ret := new(api.DocumentConversionResponse)
	err := json.Unmarshal(in.(*api.DocumentConversionRequest).Filedata, ret)
	return ret, err
}
