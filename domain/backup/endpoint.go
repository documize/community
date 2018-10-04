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

package backup

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	indexer "github.com/documize/community/domain/search"
	"github.com/documize/community/domain/store"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
	Indexer indexer.Indexer
}

// Backup generates binary file of all instance settings and contents.
// The content is pulled directly from the database and marshalled to JSON.
// A zip file is then sent to the caller.
func (h *Handler) Backup(w http.ResponseWriter, r *http.Request) {
	method := "system.backup"
	ctx := domain.GetRequestContext(r)

	if !ctx.Administrator {
		response.WriteForbiddenError(w)
		h.Runtime.Log.Info(fmt.Sprintf("Non-admin attempted system backup operation (user ID: %s)", ctx.UserID))
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	spec := backupSpec{}
	err = json.Unmarshal(body, &spec)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	// data, err := backup(ctx, *h.Store, spec)
	// if err != nil {
	// 	response.WriteServerError(w, method, err)
	// 	h.Runtime.Log.Error(method, err)
	// 	return
	// }

	// Filename is current timestamp
	fn := fmt.Sprintf("dmz-backup-%s.zip", uniqueid.Generate())

	ziptest(fn)

	bb, err := ioutil.ReadFile(fn)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", `attachment; filename="`+fn+`" ; `+`filename*="`+fn+`"`)
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(bb)))
	w.Header().Set("x-documize-filename", fn)

	x, err := w.Write(bb)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	w.WriteHeader(http.StatusOK)

	h.Runtime.Log.Info(fmt.Sprintf("Backup completed for %s by %s, size %d", ctx.OrgID, ctx.UserID, x))
}

type backupSpec struct {
}

func backup(ctx domain.RequestContext, s store.Store, spec backupSpec) (file []byte, err error) {
	buf := new(bytes.Buffer)
	zw := zip.NewWriter(buf)

	// Add some files to the archive.
	var files = []struct {
		Name, Body string
	}{
		{"readme.txt", "This archive contains some text files."},
		{"gopher.txt", "Gopher names:\nGeorge\nGeoffrey\nGonzo"},
		{"todo.txt", "Get animal handling licence.\nWrite more examples."},
	}

	for _, file := range files {
		f, err := zw.Create(file.Name)
		if err != nil {
			return nil, err
		}

		_, err = f.Write([]byte(file.Body))
		if err != nil {
			return nil, err
		}
	}

	// Make sure to check the error on Close.
	err = zw.Close()
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

func ziptest(filename string) {
	// Create a file to write the archive buffer to
	// Could also use an in memory buffer.
	outFile, err := os.Create(filename)
	if err != nil {
		fmt.Println(err)
	}
	defer outFile.Close()

	// Create a zip writer on top of the file writer
	zipWriter := zip.NewWriter(outFile)

	// Add files to archive
	// We use some hard coded data to demonstrate,
	// but you could iterate through all the files
	// in a directory and pass the name and contents
	// of each file, or you can take data from your
	// program and write it write in to the archive
	// without
	var filesToArchive = []struct {
		Name, Body string
	}{
		{"test.txt", "String contents of file"},
		{"test2.txt", "\x61\x62\x63\n"},
	}

	// Create and write files to the archive, which in turn
	// are getting written to the underlying writer to the
	// .zip file we created at the beginning
	for _, file := range filesToArchive {
		fileWriter, err := zipWriter.Create(file.Name)
		if err != nil {
			fmt.Println(err)
		}
		_, err = fileWriter.Write([]byte(file.Body))
		if err != nil {
			fmt.Println(err)
		}
	}

	// Clean up
	err = zipWriter.Close()
	if err != nil {
		fmt.Println(err)
	}
}
