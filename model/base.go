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

// Package model ...
package model

import (
	"time"
)

// BaseEntity contains the database fields used in every table.
type BaseEntity struct {
	ID      uint64    `json:"-"`
	RefID   string    `json:"id"`
	Created time.Time `json:"created"`
	Revised time.Time `json:"revised"`
}

// BaseEntityObfuscated is a mirror of BaseEntity,
// but with the fields invisible to JSON.
type BaseEntityObfuscated struct {
	ID      uint64    `json:"-"`
	RefID   string    `json:"-"`
	Created time.Time `json:"-"`
	Revised time.Time `json:"-"`
}
