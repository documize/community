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

package search

import (
	"github.com/documize/community/core/env"
	"github.com/documize/community/domain/store"
)

// Indexer documents!
type Indexer struct {
	runtime *env.Runtime
	store   *store.Store
}

// NewIndexer provides background search indexer
func NewIndexer(rt *env.Runtime, s *store.Store) (i Indexer) {
	i = Indexer{}
	i.runtime = rt
	i.store = s

	return
}
