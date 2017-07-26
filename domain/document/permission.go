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

package document

import (
	"database/sql"

	"github.com/documize/community/domain"
)

// CanViewDocumentInFolder returns if the user has permission to view a document within the specified folder.
func CanViewDocumentInFolder(ctx domain.RequestContext, s domain.Store, labelID string) (hasPermission bool) {
	roles, err := s.Space.GetUserRoles(ctx)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
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
func CanViewDocument(ctx domain.RequestContext, s domain.Store, documentID string) (hasPermission bool) {
	document, err := s.Document.Get(ctx, documentID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	roles, err := s.Space.GetUserRoles(ctx)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
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
func CanChangeDocument(ctx domain.RequestContext, s domain.Store, documentID string) (hasPermission bool) {
	document, err := s.Document.Get(ctx, documentID)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	roles, err := s.Space.GetUserRoles(ctx)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
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
func CanUploadDocument(ctx domain.RequestContext, s domain.Store, folderID string) (hasPermission bool) {
	roles, err := s.Space.GetUserRoles(ctx)

	if err == sql.ErrNoRows {
		err = nil
	}
	if err != nil {
		return false
	}

	for _, role := range roles {
		if role.LabelID == folderID && role.CanEdit {
			return true
		}
	}

	return false
}
