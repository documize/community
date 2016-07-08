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

package request

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/context"
	"github.com/jmoiron/sqlx"

	"github.com/documize/community/wordsmith/log"
)

var rc = Context{}

// Context holds the context in which the client is dealing with Documize.
type Context struct {
	AllowAnonymousAccess bool
	Authenticated        bool
	Administrator        bool
	Guest                bool
	Editor               bool
	UserID               string
	OrgID                string
	OrgName              string
	SSL                  bool
	AppURL               string // e.g. https://{url}.documize.com
	Subdomain            string
	Expires              time.Time
	Transaction          *sqlx.Tx
}

// NewContext simply returns a blank Context type.
func NewContext() Context {
	return Context{}
}

func getContext(r *http.Request) Context {

	if value := context.Get(r, rc); value != nil {
		return value.(Context)
	}

	return Context{}
}

// SetContext simply calls the Set method on the passed context, using the empty context stored in rc as an extra parameter.
func SetContext(r *http.Request, c Context) {
	c.AppURL = r.Host
	c.Subdomain = GetSubdomainFromHost(r)
	c.SSL = r.TLS != nil

	context.Set(r, rc, c)
}

// Persister stores the Context of the client along with a baseManager instance.
type Persister struct {
	Context Context
	Base    baseManager
}

// GetPersister reurns a Persister which contains a Context which is based on the incoming request.
func GetPersister(r *http.Request) Persister {
	var p = Persister{}
	p.Context = getContext(r)
	p.Context.AppURL = r.Host
	p.Context.SSL = r.TLS != nil

	return p
}

// CanViewDocumentInFolder returns if the user has permission to view a document within the specified folder.
func (p *Persister) CanViewDocumentInFolder(labelID string) (hasPermission bool) {
	roles, err := p.GetUserLabelRoles()

	if err == sql.ErrNoRows {
		err = nil
	}

	if err != nil {
		log.Error(fmt.Sprintf("Unable to check folder %s for permission check", labelID), err)
		return false
	}

	for _, role := range roles {
		if role.LabelID == labelID && (role.CanView || role.CanEdit) {
			return true
		}
	}

	return false
}

// CanViewDocument returns if the clinet has permission to view a given document.
func (p *Persister) CanViewDocument(documentID string) (hasPermission bool) {
	document, err := p.GetDocument(documentID)

	if err == sql.ErrNoRows {
		err = nil
	}

	if err != nil {
		log.Error(fmt.Sprintf("Unable to get document %s for permission check", documentID), err)
		return false
	}

	roles, err := p.GetUserLabelRoles()

	if err == sql.ErrNoRows {
		err = nil
	}

	if err != nil {
		log.Error(fmt.Sprintf("Unable to get document %s for permission check", documentID), err)
		return false
	}

	for _, role := range roles {
		if role.LabelID == document.LabelID && (role.CanView || role.CanEdit) {
			return true
		}
	}

	return false
}

// CanChangeDocument returns if the clinet has permission to change a given document.
func (p *Persister) CanChangeDocument(documentID string) (hasPermission bool) {
	document, err := p.GetDocument(documentID)

	if err == sql.ErrNoRows {
		err = nil
	}

	if err != nil {
		log.Error(fmt.Sprintf("Unable to get document %s for permission check", documentID), err)
		return false
	}

	roles, err := p.GetUserLabelRoles()

	if err == sql.ErrNoRows {
		err = nil
	}

	if err != nil {
		log.Error(fmt.Sprintf("Unable to get document %s for permission check", documentID), err)
		return false
	}

	for _, role := range roles {
		if role.LabelID == document.LabelID && role.CanEdit {
			return true
		}
	}

	return false
}

// CanUploadDocument returns if the client has permission to upload documents to the given folderID.
func (p *Persister) CanUploadDocument(folderID string) (hasPermission bool) {
	roles, err := p.GetUserLabelRoles()

	if err == sql.ErrNoRows {
		err = nil
	}

	if err != nil {
		log.Error(fmt.Sprintf("Unable to check permission for folder %s", folderID), err)
		return false
	}

	for _, role := range roles {
		if role.LabelID == folderID && role.CanEdit {
			return true
		}
	}

	return false
}

// CanViewFolder returns if the user has permission to view the given folderID.
func (p *Persister) CanViewFolder(folderID string) (hasPermission bool) {
	roles, err := p.GetUserLabelRoles()

	if err == sql.ErrNoRows {
		err = nil
	}

	if err != nil {
		log.Error(fmt.Sprintf("Unable to check permission for folder %s", folderID), err)
		return false
	}

	for _, role := range roles {
		if role.LabelID == folderID && (role.CanView || role.CanEdit) {
			return true
		}
	}

	return false
}
