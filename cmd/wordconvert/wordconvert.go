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

// Package main contains a command line utility to convert multiple word documents using api.documize.com
package main

import (
	"archive/zip"
	"bytes"
	"crypto/tls"
	"errors"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net"
	"net/http"
	"os"
	"path"
	"strings"
)

const serverURLfmt = "https://%s/api/1/word"

var server = flag.String("s", "api.documize.com:443", "the server")
var outputDir = flag.String("o", ".", "specify the directory to hold the output")
var ignoreBadCert = flag.Bool("k", false, "ignore bad certificate errors")
var verbose = flag.Bool("v", false, "verbose progress messages")
var stayziped = flag.Bool("z", false, "do not automatically unzip content")
var token = flag.String("t", "", "authorization token (if you use your e-mail address here during preview period, we will tell you before changes are made)")
var ignoreErrs = flag.Bool("e", false, "report errors on individual files, but continue")
var version = flag.Bool("version", false, "display the version of this code")

func validXtn(fn string) bool {
	lcfn := strings.ToLower(fn)
	for _, xtn := range []string{".doc", ".docx", ".pdf"} {
		if strings.HasSuffix(lcfn, xtn) {
			return true
		}
	}
	return false
}

func errCanContinue(can bool, err error) bool {
	if err == nil {
		return false
	}
	fmt.Fprintln(os.Stderr, err)
	if *ignoreErrs && can {
		return true
	}
	os.Exit(0)
	return true // never reached
}

func main() {

	flag.Parse()

	if *version {
		fmt.Println("Version: 0.1 preview")
	}

	if *outputDir != "." {
		if err := os.Mkdir(*outputDir, 0777); err != nil && !os.IsExist(err) {
			errCanContinue(false, err)
		}
	}

	host, _, err := net.SplitHostPort(*server)
	errCanContinue(false, err)

	tlc := &tls.Config{
		InsecureSkipVerify: *ignoreBadCert,
		ServerName:         host,
	}

	transport := &http.Transport{TLSClientConfig: tlc}
	hclient := &http.Client{Transport: transport}

	processFiles(hclient)

	os.Exit(1)
}

func processFiles(hclient *http.Client) {

	for _, fileName := range flag.Args() {
		if validXtn(fileName) {
			if *verbose {
				fmt.Println("processing", fileName)
			}

			content, err := ioutil.ReadFile(fileName)
			if errCanContinue(true, err) {
				continue
			}

			bodyBuf := &bytes.Buffer{}
			bodyWriter := multipart.NewWriter(bodyBuf)

			_, fn := path.Split(fileName)
			fileWriter, err := bodyWriter.CreateFormFile("wordfile", fn)
			if errCanContinue(true, err) {
				continue
			}

			_, err = io.Copy(fileWriter, bytes.NewReader(content))
			if errCanContinue(true, err) {
				continue
			}

			contentType := bodyWriter.FormDataContentType()
			err = bodyWriter.Close()
			if errCanContinue(true, err) {
				continue
			}

			target := fmt.Sprintf(serverURLfmt, *server)
			if *token != "" {
				target += "?token=" + *token
			}

			req, err := http.NewRequest("POST",
				target,
				bodyBuf)
			if errCanContinue(true, err) {
				continue
			}

			req.Header.Set("Content-Type", contentType)
			resp, err := hclient.Do(req)
			if errCanContinue(true, err) {
				continue
			}

			zipdata, err := ioutil.ReadAll(resp.Body)
			if errCanContinue(true, err) {
				continue
			}

			resp.Body.Close() // ignore error

			if resp.StatusCode != http.StatusOK {
				if errCanContinue(true, errors.New("server returned status: "+resp.Status)) {
					continue
				}
			}

			targetDir := *outputDir + "/" + fn + ".content"
			if *stayziped {
				if err := ioutil.WriteFile(targetDir+".zip", zipdata, 0666); err != nil {
					if errCanContinue(true, err) {
						continue
					}
				}
			} else {
				if errCanContinue(true, unzipFiles(zipdata, targetDir)) {
					continue
				}
			}
		} else {
			if *verbose {
				fmt.Println("ignored", fileName)
			}
		}
	}
}

func unzipFiles(zipdata []byte, targetDir string) error {
	rdr, err := zip.NewReader(bytes.NewReader(zipdata), int64(len(zipdata)))
	if err != nil {
		return err
	}

	if err := os.Mkdir(targetDir, 0777); err != nil && !os.IsExist(err) {
		return err
	}

fileLoop:
	for _, zf := range rdr.File {
		frc, err := zf.Open()
		if errCanContinue(true, err) {
			continue
		}

		filedata, err := ioutil.ReadAll(frc)
		if errCanContinue(true, err) {
			continue
		}

		subTarget := targetDir + "/" + zf.Name

		subDir := path.Dir(subTarget)

		if subDir != targetDir {
			rump := strings.TrimPrefix(subDir, targetDir)
			tree := strings.Split(rump, "/")
			built := ""
			for _, thisPart := range tree[1:] { // make sure we have a directory at each level of the tree
				built += "/" + thisPart
				if err := os.Mkdir(targetDir+built, 0777); err != nil && !os.IsExist(err) {
					if errCanContinue(true, err) {
						continue fileLoop
					}
				}
			}
		}

		if err := ioutil.WriteFile(subTarget, filedata, 0666); err != nil {
			if errCanContinue(true, err) {
				continue
			}
		}

		if *verbose {
			fmt.Println("wrote", subTarget)
		}
		frc.Close()
	}

	return nil
}
