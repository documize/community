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

// Documize data is all held in the SQL database in relational format.
// The objective is to export the data into a compressed file that
// can be restored again as required.
//
// This allows for the following scenarios to be supported:
//
// 1. Copying data from one Documize instance to another.
// 2. Changing database provider (e.g. from MySQL to PostgreSQL).
// 3. Moving between Documize Cloud and self-hosted instances.
// 4. GDPR compliance (send copy of data and nuke whatever remains).
// 5. Setting up sample Documize instance with pre-defined content.
//
// The initial implementation is restricted to tenant or global
// backup/restore operations and can only be performed by a verified
// Global Administrator.
//
// In future the process should be able to support per space backup/restore
// operations. This is subject to further review.

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"

	"github.com/documize/community/core/request"
	"github.com/documize/community/model/audit"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/domain"
	indexer "github.com/documize/community/domain/search"
	"github.com/documize/community/domain/store"
	m "github.com/documize/community/model/backup"
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

	spec := m.ExportSpec{}
	err = json.Unmarshal(body, &spec)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Runtime.Log.Infof("Backup started %s", ctx.OrgID)

	bh := backerHandler{Runtime: h.Runtime, Store: h.Store, Context: ctx, Spec: spec}

	// Produce zip file on disk.
	filename, err := bh.GenerateBackup()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Read backup file into memory.
	// DEBT: write file directly to HTTP response stream?
	// defer out.Close()
	// io.Copy(out, resp.Body)

	bk, err := ioutil.ReadFile(filename)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Runtime.Log.Info(fmt.Sprintf("Backup size of org %s pending download %d", ctx.OrgID, len(bk)))

	// Standard HTTP headers.
	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", `attachment; filename="`+filename+`" ; `+`filename*="`+filename+`"`)
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(bk)))

	// Custom HTTP header helps API consumer to extract backup filename cleanly
	// instead of parsing 'Content-Disposition' header.
	// This HTTP header is CORS white-listed.
	w.Header().Set("x-documize-filename", filename)
	w.WriteHeader(http.StatusOK)

	// Write backup to response stream.
	x, err := w.Write(bk)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Runtime.Log.Info(fmt.Sprintf("Backup completed for %s by %s, size %d", ctx.OrgID, ctx.UserID, x))
	h.Store.Audit.Record(ctx, audit.EventTypeDatabaseBackup)

	// Delete backup file if not requested to keep it.
	if !spec.Retain {
		os.Remove(filename)
	}
}

// Restore receives ZIP file for restore operation.
// Options are specified as HTTP query paramaters.
func (h *Handler) Restore(w http.ResponseWriter, r *http.Request) {
	method := "system.restore"
	ctx := domain.GetRequestContext(r)

	if !ctx.Administrator {
		response.WriteForbiddenError(w)
		h.Runtime.Log.Info(fmt.Sprintf("Non-admin attempted system restore operation (user ID: %s)", ctx.UserID))
		return
	}

	h.Runtime.Log.Info(fmt.Sprintf("Restored attempted by user: %s", ctx.UserID))

	overwriteOrg, err := strconv.ParseBool(request.Query(r, "org"))
	if err != nil {
		h.Runtime.Log.Info("Restore invoked without 'org' parameter")
		response.WriteMissingDataError(w, method, "org=false/true missing")
		return
	}

	filedata, fileheader, err := r.FormFile("restore-file")
	if err != nil {
		response.WriteMissingDataError(w, method, "restore-file")
		h.Runtime.Log.Error(method, err)
		return
	}

	b := new(bytes.Buffer)
	_, err = io.Copy(b, filedata)
	if err != nil {
		h.Runtime.Log.Error(method, err)
		response.WriteServerError(w, method, err)
		return
	}

	h.Runtime.Log.Info(fmt.Sprintf("Restore file: %s %d", fileheader.Filename, len(b.Bytes())))

	//
	org, err := h.Store.Organization.GetOrganization(ctx, ctx.OrgID)
	if err != nil {
		h.Runtime.Log.Error(method, err)
		response.WriteServerError(w, method, err)
		return
	}

	// Prepare context and start restore process.
	spec := m.ImportSpec{OverwriteOrg: overwriteOrg, Org: org}
	rh := restoreHandler{Runtime: h.Runtime, Store: h.Store, Context: ctx, Spec: spec}

	// Run the restore process.
	err = rh.PerformRestore(b.Bytes(), r.ContentLength)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Runtime.Log.Infof("Restore remapped %d OrgID values", len(rh.MapOrgID))
	h.Runtime.Log.Infof("Restore remapped %d UserID values", len(rh.MapUserID))
	h.Runtime.Log.Info("Restore completed")

	h.Runtime.Log.Info("Building search index")
	go h.Indexer.Rebuild(ctx)

	response.WriteEmpty(w)
}
