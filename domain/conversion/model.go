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

package conversion

import (
	api "github.com/documize/community/core/convapi"
)

// StorageProvider imports and stores documents
type StorageProvider interface {
	Upload(job string, filename string, file []byte) (err error)
	Convert(api.ConversionJobRequest) (filename string, fileResult *api.DocumentConversionResponse, err error)
}
