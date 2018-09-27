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

// Package plugins manages the plug-in componenets of the Documize system.
package plugins

import (
	"bytes"
	"io/ioutil"
	"time"

	"github.com/documize/community/core/api/convert/apidocumizecom"
	"github.com/documize/community/core/api/convert/documizeapi"
	"github.com/documize/community/core/api/convert/html"
	"github.com/documize/community/core/api/convert/md"
	api "github.com/documize/community/core/convapi"
	"github.com/documize/community/domain/store"
	"github.com/documize/glick"
)

// PluginFile is the path to the file containing the configuration information for the plugin system in JSON format.
var PluginFile = "DB" // this points to the database
var insecure = "false"

type infoLog struct{}

func (i infoLog) Write(b []byte) (int, error) {
	// log.Info(string(b))
	return len(b), nil
}

type errorLog struct{}

func (i errorLog) Write(b []byte) (int, error) {
	// log.ErrorString(string(b))
	return len(b), nil
}

// Lib holds a pointer to the global glick Library for the Documize app.
var Lib *glick.Library

// Setup configures the global library at Lib,
// largely based on the "config.json" file. It should be called only once.
func Setup(s *store.Store) error {
	if insecure == "true" {
		glick.InsecureSkipVerifyTLS = true
	}
	var err error
	Lib, err = glick.New(nil)
	if err != nil {
		return err
	}

	ppo := func() interface{} { return interface{}(&api.DocumentConversionResponse{}) }
	err = Lib.RegAPI("Convert", &api.DocumentConversionRequest{}, ppo, 2*time.Minute)
	if err != nil {
		return err
	}

	for _, xtn := range []string{"htm", "html"} {
		err = Lib.RegPlugin("Convert", xtn, html.Convert, nil)
		if err != nil {
			return err
		}
	}

	for _, xtn := range []string{"md", "markdown"} {
		err = Lib.RegPlugin("Convert", xtn, md.Convert, nil)
		if err != nil {
			return err
		}
	}

	for _, xtn := range []string{"doc", "docx"} {
		err = Lib.RegPlugin("Convert", xtn, apidocumizecom.MSwordConvert, nil)
		if err != nil {
			return err
		}
	}

	err = Lib.RegPlugin("Convert", "documizeapi", documizeapi.Convert, nil)
	if err != nil {
		return err
	}

	ppoe := func() interface{} { return interface{}(&api.DocumentExport{}) }
	err = Lib.RegAPI("Export", []byte{}, ppoe, 5*time.Minute)
	if err != nil {
		return err
	}

	var json = make([]byte, 0)
	if PluginFile == "DB" {
		c, _ := s.Setting.Get("FILEPLUGINS", "")
		json = []byte(c)
		if len(bytes.TrimSpace(json)) == 0 {
			return nil // don't fail if the DB does not exist yet
		}
	} else {
		json, err = ioutil.ReadFile(PluginFile)
		if err != nil {
			json = []byte(" [ ] \n")
			err = nil
		}
	}
	err = Lib.Configure(json)
	if err != nil {
		//fmt.Println("DEBUG plugin: "+string(json))
		return err
	}
	return Lib.StartLocalRPCservers(infoLog{}, errorLog{})
}
