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

// Package backup handle data backup/restore to/from ZIP format.
package backup

// Existing data models do not necessarily have fields to hold
// all data when loaded from the database.
// So we extend the existing models to hold additional fields
// for a complete backup and restore process.

import (
	"time"

	"github.com/documize/community/model/org"
)

type orgExtended struct {
	org.Organization
	Logo []byte `json:"logo"`
}

type config struct {
	ConfigKey   string `json:"key"`
	ConfigValue string `json:"config"`
}

type userConfig struct {
	OrgID       string `json:"orgId"`
	UserID      string `json:"userId"`
	ConfigKey   string `json:"key"`
	ConfigValue string `json:"config"`
}

// Vote
type vote struct {
	RefID      string    `json:"refId"`
	OrgID      string    `json:"orgId"`
	DocumentID string    `json:"documentId"`
	VoterID    string    `json:"voterId"`
	Vote       int       `json:"vote"`
	Created    time.Time `json:"created"`
	Revised    time.Time `json:"revised"`
}

// Comment
type comment struct {
	RefID      string    `json:"feedbackId"`
	OrgID      string    `json:"orgId"`
	DocumentID string    `json:"documentId"`
	UserID     string    `json:"userId"`
	Email      string    `json:"email"`
	Feedback   string    `json:"feedback"`
	SectionID  string    `json:"sectionId"`
	ReplyTo    string    `json:"replyTo"`
	Created    time.Time `json:"created"`
}

// Share
type share struct {
	ID         uint64    `json:"id"`
	OrgID      string    `json:"orgId"`
	UserID     string    `json:"userId"`
	DocumentID string    `json:"documentId"`
	Email      string    `json:"email"`
	Message    string    `json:"message"`
	Viewed     string    `json:"viewed"`  // recording each view as |date-viewed|date-viewed|
	Secret     string    `json:"secret"`  // secure token used to access document
	Expires    string    `json:"expires"` // number of days from creation, value of 0 means never
	Active     bool      `json:"active"`
	Created    time.Time `json:"created"`
}
