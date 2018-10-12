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
	"net/http"

	api "github.com/documize/community/core/convapi"
	"github.com/documize/community/core/env"
	indexer "github.com/documize/community/domain/search"
	"github.com/documize/community/domain/store"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
	Indexer indexer.Indexer
}

// UploadConvert is an endpoint to both upload and convert a document
func (h *Handler) UploadConvert(w http.ResponseWriter, r *http.Request) {
	job, spaceID, orgID := h.upload(w, r)
	if job == "" {
		return // error already handled
	}

	h.convert(w, r, job, spaceID, api.ConversionJobRequest{
		Job:        job,
		IndexDepth: 4,
		OrgID:      orgID,
	})
}
