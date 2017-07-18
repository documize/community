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

// Package log provides centralized logging for the Documize application.
package log

import (
	"bytes"
	"fmt"
	"os"
	"runtime"

	log "github.com/Sirupsen/logrus"

	"github.com/documize/community/core/env"
)

var environment = "Non-production"

func init() {
	log.SetFormatter(new(log.TextFormatter))
	log.SetOutput(os.Stdout)
	log.SetLevel(log.DebugLevel)
	env.GetString(&environment, "log", false,
		"system being logged e.g. 'PRODUCTION'",
		func(*string, string) bool {
			log.Infoln(environment + " environment logging enabled")
			return false
		})
}

// Debug logs a message for debug purposes.
func Debug(message string) {
	log.WithFields(log.Fields{"env": environment}).Debug(message)
}

// Info logs a message for information purposes.
func Info(message string) {
	log.WithFields(log.Fields{"env": environment}).Info(message)
}

// TestIfErr is used by the test code to signal that a test being run should error, it is reset if an error occurs.
var TestIfErr bool

// ErrorString logs an error, where there is not an error value.
func ErrorString(message string) {
	TestIfErr = false
	log.WithFields(log.Fields{"env": environment}).Error(message)
}

// Error logs an error, if non-nil, with a message to give some context.
func Error(message string, err error) {
	if err != nil {
		TestIfErr = false
		stack := make([]byte, 4096)
		runtime.Stack(stack, false)
		if idx := bytes.IndexByte(stack, 0); idx > 0 && idx < len(stack) {
			stack = stack[:idx] // remove trailing nulls from stack dump
		}
		log.WithFields(log.Fields{"env": environment, "error": err.Error(), "stack": fmt.Sprintf("%s", stack)}).Error(message)

		//log.WithField("error: "+message, err.Error()).Errorf("%q\n%s\n", err, stack[:])
	}
}

// IfErr logs an error if one exists.
// It is a convenience wrapper for Error(), with no context message.
func IfErr(err error) {
	Error("", err)
}
