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

package documizeapi

import (
	"encoding/json"

	api "github.com/documize/community/core/convapi"

	"context"
)

// Convert provides the standard interface for conversion of a ".documizeapi" json document.
func Convert(ctx context.Context, in interface{}) (interface{}, error) {
	ret := new(api.DocumentConversionResponse)
	err := json.Unmarshal(in.(*api.DocumentConversionRequest).Filedata, ret)
	return ret, err
}
