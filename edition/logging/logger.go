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

// Package logging defines application-wide logging implementation.
package logging

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"runtime"

	"github.com/documize/community/core/env"
	"github.com/jmoiron/sqlx"
)

// Logger is how we log.
type Logger struct {
	db    *sqlx.DB
	log   *log.Logger
	trace bool // shows Info() entries
}

// Info logs message.
func (l Logger) Info(message string) {
	l.log.Println(message)
}

// Infof logs message via Sprintf.
func (l Logger) Infof(message string, a ...interface{}) {
	l.log.Println(fmt.Sprintf(message, a...))
}

// Trace logs message if tracing enabled.
func (l Logger) Trace(message string) {
	if l.trace {
		l.log.Println(message)
	}
}

// Error logs error with message.
func (l Logger) Error(message string, err error) {
	l.log.Println(message)
	l.log.Println(err)

	stack := make([]byte, 4096)
	runtime.Stack(stack, false)
	if idx := bytes.IndexByte(stack, 0); idx > 0 && idx < len(stack) {
		stack = stack[:idx] // remove trailing nulls from stack dump
	}

	l.log.Println(fmt.Sprintf("%s", stack))
}

// SetDB associates database connection with given logger.
// Logger will also record messages to database given valid database connection.
func (l Logger) SetDB(logger env.Logger, db *sqlx.DB) env.Logger {
	l.db = db
	return logger
}

// NewLogger returns initialized logging instance.
func NewLogger(trace bool) env.Logger {
	l := log.New(os.Stdout, "", 0)
	l.SetOutput(os.Stdout)
	// log.SetOutput(os.Stdout)

	var logger Logger
	logger.log = l
	logger.trace = trace

	return logger
}
