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

// Package env provides runtime, server level setup and configuration
package env

// Logger provides the interface for Documize compatible loggers.
type Logger interface {
	Info(message string)
	Infof(message string, a ...interface{})
	Trace(message string)
	Error(message string, err error)
	// SetDB(l Logger, db *sqlx.DB) Logger
}
