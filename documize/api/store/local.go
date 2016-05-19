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

// Package store provides the implementation for a file system based storage provider.
// This enables all document upload previews to be processed AND stored locally.
package store

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"strings"

	"github.com/documize/community/documize/api/convert"
	"github.com/documize/community/wordsmith/api"
	"github.com/documize/community/wordsmith/log"
)

var folderPath string

func init() {
	tempDir := os.TempDir()
	if !strings.HasSuffix(tempDir, string(os.PathSeparator)) {
		tempDir += string(os.PathSeparator)
	}
	folderPath = tempDir + "documize" + string(os.PathSeparator) + "_uploads" + string(os.PathSeparator)
	log.Info("Temporary upload directory: " + folderPath)
	log.IfErr(os.MkdirAll(folderPath, os.ModePerm))
}

// LocalStorageProvider provides an implementation of StorageProvider.
type LocalStorageProvider struct {
}

// Upload a flie and store it locally.
func (store *LocalStorageProvider) Upload(job string, filename string, file []byte) (err error) {
	destination := folderPath + job + string(os.PathSeparator)

	err = os.MkdirAll(destination, os.ModePerm)

	if err != nil {
		log.Error(fmt.Sprintf("Cannot create local folder %s", destination), err)
		return err
	}

	err = ioutil.WriteFile(destination+filename, file, 0666)

	if err != nil {
		log.Error(fmt.Sprintf("Cannot write to local file %s", destination+filename), err)
		return err
	}

	return nil
}

// Convert a file from its native format into Documize internal format.
func (store *LocalStorageProvider) Convert(params api.ConversionJobRequest) (filename string, fileResult *api.DocumentConversionResponse, err error) {
	fileResult = &api.DocumentConversionResponse{}
	err = nil
	path := folderPath

	if params.Job == "" {
		return filename, fileResult, errors.New("no job to convert")
	}

	inputFolder := path + params.Job + string(os.PathSeparator)

	list, err := ioutil.ReadDir(inputFolder)

	if err != nil {
		return filename, fileResult, err
	}

	if len(list) == 0 {
		return filename, fileResult, errors.New("no file to convert")
	}

	// remove temporary directory on exit
	defer func() { log.IfErr(os.RemoveAll(inputFolder)) }()

	for _, v := range list {

		if v.Size() > 0 && !strings.HasPrefix(v.Name(), ".") && v.Mode().IsRegular() {
			filename = inputFolder + v.Name()
			log.Info(fmt.Sprintf("Fetching document %s", filename))

			fileData, err := ioutil.ReadFile(filename)

			if err != nil {
				log.Error(fmt.Sprintf("Unable to fetch document %s", filename), err)
				return filename, fileResult, err
			}

			if len(fileData) > 0 {
				fileRequest := api.DocumentConversionRequest{}
				fileRequest.Filename = filename
				fileRequest.Filedata = fileData
				fileRequest.PageBreakLevel = params.IndexDepth
				//fileRequest.Job = params.OrgID + string(os.PathSeparator) + params.Job
				//fileRequest.OrgID = params.OrgID

				bits := strings.Split(filename, ".")
				xtn := strings.ToLower(bits[len(bits)-1])

				fileResult, err = convert.Convert(nil, xtn, &fileRequest)
				return filename, fileResult, err
			}
		}
	}

	return filename, fileResult, nil
}
