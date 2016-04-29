// Package main provides a simple Documize plugin for document conversions using libreoffice.
package main

import (
	"bytes"
	"encoding/base64"
	"errors"
	"flag"
	"fmt"
	"io/ioutil"
	"net"
	"net/rpc"
	"net/rpc/jsonrpc"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"
	"unicode"
	"unicode/utf8"

	"github.com/documize/community/wordsmith/api"
)

var cmdmtx sync.Mutex // enforce only one conversion at a time

// LibreOffice provides a peg on which to hang the Convert method.
type LibreOffice struct{}

var dir *os.File
var outputDir string

func init() {
	tempDir := os.TempDir()
	if !strings.HasSuffix(tempDir, string(os.PathSeparator)) {
		tempDir += string(os.PathSeparator)
	}
	outputDir = tempDir + "documize-plugin-libreoffice"
	err := os.MkdirAll(outputDir, os.ModePerm)
	if err != nil {
		panic(err)
	}
}

func createTempDir() *os.File {
	fmt.Println("create temp dir")
	err := os.Mkdir(outputDir, 0777) // make the dir if non-existent, TODO filemode
	if err != nil {
		//fmt.Println("unable to create temp dir")
		panic(err)
	}
	dir, err = os.Open(outputDir)
	if err != nil {
		//fmt.Println("unable to open created temp dir")
		panic(err)
	}
	return dir
}

func removePrevTempFiles(dir *os.File) error {
	fin, err := dir.Readdirnames(-1)
	if err != nil {
		return err
	}
	for _, nam := range fin { // remove any previous temporary files
		target := outputDir + string(os.PathSeparator) + nam
		//fmt.Println("delete temp file: " + target)
		err = os.Remove(target)
		if err != nil {
			return err
		}
	}
	return nil
}

func runLibreOffice(inPath string) error {
	var err error
	var cmd = "soffice"
	switch runtime.GOOS {
	case "darwin": // may not be in the path
		cmd = "/Applications/LibreOffice.app/Contents/MacOS/soffice"
	case "windows": // TODO
	}
	cmd, err = exec.LookPath(cmd)
	if err != nil {
		return err
	}

	args := []string{"--headless",
		"--convert-to", "html", // "html:XHTML Writer File:UTF8",
		"--outdir", outputDir, inPath}

	fmt.Println("libreoffice args:", args)

	ecmd := exec.Command(cmd, args...)
	var outBuf, errBuf bytes.Buffer
	ecmd.Stdout, ecmd.Stderr = &outBuf, &errBuf
	over := make(chan error, 1)
	go func() {
		if e := ecmd.Start(); e != nil {
			over <- e
		} else {
			over <- ecmd.Wait()
		}
	}()
	select {
	case err = <-over:
		if err != nil {
			return errors.New(string(outBuf.Bytes()) + string(errBuf.Bytes()) + err.Error())
		}
	case <-time.After(2 * time.Minute):
		ke := ""
		if runtime.GOOS != "windows" { // Process is not available on windows
			err = ecmd.Process.Kill()
			if err != nil {
				ke = ", kill error: " + err.Error()
			}
		}
		return errors.New("libreoffice.Convert() cancelled via timeout" + ke)
	}
	return nil
}

// Convert converts a file into the Countersoft Documize format.
func (file *LibreOffice) Convert(r api.DocumentConversionRequest, reply *api.DocumentConversionResponse) error {
	var err error

	cmdmtx.Lock() // enforce only one conversion at a time
	defer cmdmtx.Unlock()

	dir, err = os.Open(outputDir)
	if err != nil {
		dir = createTempDir()
	}
	defer func() {
		if e := dir.Close(); e != nil {
			fmt.Fprintln(os.Stderr, "Error closing temp dir: "+e.Error())
		}
	}()

	err = removePrevTempFiles(dir)
	if err != nil {
		return err
	}

	_, inFileX := filepath.Split(r.Filename)
	inFile := fixName(inFileX)
	if inFile == "" {
		return errors.New("no filename")
	}

	xtn := filepath.Ext(inFile)
	if xtn == "" {
		return errors.New("invalid filename: " + inFile)
	}

	inPath := outputDir + string(os.PathSeparator) + inFile
	fmt.Println("writing data to: " + inPath)
	if err = ioutil.WriteFile(inPath, r.Filedata, 0777); err != nil {
		return err
	}

	err = runLibreOffice(inPath)
	if err != nil {
		return err
	}

	outPath := strings.TrimSuffix(inPath, xtn) + ".html"
	fmt.Println("output file: " + outPath)
	reply.PagesHTML, err = ioutil.ReadFile(outPath)
	if err != nil {
		return err
	}
	fmt.Printf("%d bytes read from: %s\n", len(reply.PagesHTML), outPath)

	incorporateImages(reply)

	return ioutil.WriteFile(outputDir+string(os.PathSeparator)+"debug.html", reply.PagesHTML, 0666)
}

func incorporateImages(reply *api.DocumentConversionResponse) {
	dir, err := os.Open(outputDir)
	if err == nil {
		names, err := dir.Readdirnames(-1)
		if err == nil {
			for _, nam := range names {
				//fmt.Println("Found file " + nam)
				switch pic := strings.ToLower(filepath.Ext(nam)[1:]); pic {
				case "jpg", "gif", "png", "webp": // TODO others?
					//fmt.Println("Found picture file " + nam)
					enam := fixName(nam)
					buf, err := ioutil.ReadFile(outputDir + string(os.PathSeparator) + nam)
					if err == nil {
						enc := base64.StdEncoding.EncodeToString(buf)
						benam := []byte(`<img src="` + enam + `"`)
						split := bytes.Split(reply.PagesHTML, benam)
						rep := []byte(`<img src="data:image/` + pic + `;base64,` + enc + `"`)
						/*
							fmt.Println("DEBUG read picture file ", nam,
								"size", len(buf),
								"benam", string(benam),
								"len(split)", len(split),
								"replacement size", len(rep))
						*/
						if len(rep)*len(split) > 1000000 {
							fmt.Println("Too large a file increase to replace (>1Mb)")
						} else {
							reply.PagesHTML = bytes.Join(split, rep)
						}
					}
				}
			}
		}
	}
}

var port string

func init() {
	flag.StringVar(&port, "port", "", "the port to listen on")
}

func main() {
	var err error

	fmt.Println("Documize plugin-libreoffice starting up")

	fmt.Println("outputDir:" + outputDir)

	// register all the services that we accept
	fileConverter := new(LibreOffice)
	err = rpc.Register(fileConverter)
	if err != nil {
		panic(err)
	}

	flag.Parse()
	if port == "" {
		fmt.Fprintln(os.Stderr, "no port specified, please use the '-port' flag")
		return
	}

	// set up the server
	listener, err := net.Listen("tcp", ":"+port)
	if err != nil {
		panic(err)
	}

	// start server
	fmt.Println("Documize plugin-libreoffice server up on", listener.Addr())

	for {
		conn, err := listener.Accept()
		if err != nil {
			panic(err)
		}

		go jsonrpc.ServeConn(conn) // using JSON encoding
	}
}

func fixName(s string) string {
	ret := ""
	for _, r := range s {
		if utf8.RuneLen(r) > 1 ||
			unicode.IsSpace(r) ||
			unicode.IsSymbol(r) ||
			r == '%' {
			ret += fmt.Sprintf("%%%x", r)
		} else {
			ret += string(r)
		}
	}
	return ret
}
