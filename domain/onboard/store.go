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

// Package onboard handles the setup of sample data for a new Documize instance.
package onboard

import (
	"github.com/documize/community/domain/store"
)

// Store provides data access to version information.
type Store struct {
	store.Context
}

// ContentCounts returns the number of spaces and documents.
func (s Store) ContentCounts(orgID string) (spaces, docs int) {
	// By default we assume there is content in case of error condition.
	spaces = 10
	docs = 10

	var m int
	var err error

	row := s.Runtime.Db.QueryRow(s.Bind("SELECT COUNT(*) FROM dmz_space WHERE c_orgid=?"), orgID)
	err = row.Scan(&m)
	if err == nil {
		spaces = m
	} else {
		s.Runtime.Log.Error("onboard.ContentCounts", err)
	}

	row = s.Runtime.Db.QueryRow(s.Bind("SELECT COUNT(*) FROM dmz_doc WHERE c_orgid=?"), orgID)
	err = row.Scan(&m)
	if err == nil {
		docs = m
	} else {
		s.Runtime.Log.Error("onboard.ContentCounts", err)
	}

	return
}
