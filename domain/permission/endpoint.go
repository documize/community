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

// Package permission handles API calls and persistence for spaces.
// Spaces in Documize contain documents.
package permission

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/mail"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/permission"
	"github.com/documize/community/model/space"
	"github.com/documize/community/model/user"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *domain.Store
}

// SetSpacePermissions persists specified space permissions
func (h *Handler) SetSpacePermissions(w http.ResponseWriter, r *http.Request) {
	method := "space.SetPermissions"
	ctx := domain.GetRequestContext(r)

	id := request.Param(r, "spaceID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "spaceID")
		return
	}

	if !HasPermission(ctx, *h.Store, id, permission.SpaceManage, permission.SpaceOwner) {
		response.WriteForbiddenError(w)
		return
	}

	sp, err := h.Store.Space.Get(ctx, id)
	if err != nil {
		response.WriteNotFoundError(w, method, "space not found")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	var model = permission.SpaceRequestModel{}
	err = json.Unmarshal(body, &model)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// We compare new permisions to what we had before.
	// Why? So we can send out space invitation emails.
	previousRoles, err := h.Store.Permission.GetSpacePermissions(ctx, id)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Store all previous roles as map for easy querying
	previousRoleUsers := make(map[string]bool)
	for _, v := range previousRoles {
		previousRoleUsers[v.WhoID] = true
	}

	// Who is sharing this space?
	inviter, err := h.Store.User.Get(ctx, ctx.UserID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Nuke all previous permissions for this space
	_, err = h.Store.Permission.DeleteSpacePermissions(ctx, id)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	me := false
	hasEveryoneRole := false
	roleCount := 0

	url := ctx.GetAppURL(fmt.Sprintf("s/%s/%s", sp.RefID, stringutil.MakeSlug(sp.Name)))

	for _, perm := range model.Permissions {
		perm.OrgID = ctx.OrgID
		perm.SpaceID = id

		// Ensure the space owner always has access!
		if perm.UserID == ctx.UserID {
			me = true
		}

		// Only persist if there is a role!
		if permission.HasAnyPermission(perm) {
			// identify publically shared spaces
			if perm.UserID == "0" || perm.UserID == "" {
				perm.UserID = "0"
				hasEveryoneRole = true
			}

			r := permission.EncodeUserPermissions(perm)

			for _, p := range r {
				err = h.Store.Permission.AddPermission(ctx, p)
				if err != nil {
					h.Runtime.Log.Error("set permission", err)
				}

				roleCount++
			}

			// We send out space invitation emails to those users
			// that have *just* been given permissions.
			if _, isExisting := previousRoleUsers[perm.UserID]; !isExisting {

				// we skip 'everyone' (user id != empty string)
				if perm.UserID != "0" && perm.UserID != "" {
					existingUser, err := h.Store.User.Get(ctx, perm.UserID)
					if err != nil {
						response.WriteServerError(w, method, err)
						break
					}

					mailer := mail.Mailer{Runtime: h.Runtime, Store: h.Store, Context: ctx}
					go mailer.ShareSpaceExistingUser(existingUser.Email, inviter.Fullname(), url, sp.Name, model.Message)
					h.Runtime.Log.Info(fmt.Sprintf("%s is sharing space %s with existing user %s", inviter.Email, sp.Name, existingUser.Email))
				}
			}
		}
	}

	// Do we need to ensure permissions for space owner when shared?
	if !me {
		perm := permission.Permission{}
		perm.OrgID = ctx.OrgID
		perm.Who = "user"
		perm.WhoID = ctx.UserID
		perm.Scope = "object"
		perm.Location = "space"
		perm.RefID = id
		perm.Action = "" // we send array for actions below

		err = h.Store.Permission.AddPermissions(ctx, perm, permission.SpaceView, permission.SpaceManage)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			return
		}
	}

	// Mark up space type as either public, private or restricted access.
	if hasEveryoneRole {
		sp.Type = space.ScopePublic
	} else {
		if roleCount > 1 {
			sp.Type = space.ScopeRestricted
		} else {
			sp.Type = space.ScopePrivate
		}
	}

	err = h.Store.Space.Update(ctx, sp)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeSpacePermission)

	response.WriteEmpty(w)
}

// GetSpacePermissions returns permissions for all users for given space.
func (h *Handler) GetSpacePermissions(w http.ResponseWriter, r *http.Request) {
	method := "space.GetPermissions"
	ctx := domain.GetRequestContext(r)

	spaceID := request.Param(r, "spaceID")
	if len(spaceID) == 0 {
		response.WriteMissingDataError(w, method, "spaceID")
		return
	}

	perms, err := h.Store.Permission.GetSpacePermissions(ctx, spaceID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}
	if len(perms) == 0 {
		perms = []permission.Permission{}
	}

	userPerms := make(map[string][]permission.Permission)
	for _, p := range perms {
		userPerms[p.WhoID] = append(userPerms[p.WhoID], p)
	}

	records := []permission.Record{}
	for _, up := range userPerms {
		records = append(records, permission.DecodeUserPermissions(up))
	}

	response.WriteJSON(w, records)
}

// GetUserSpacePermissions returns permissions for the requested space, for current user.
func (h *Handler) GetUserSpacePermissions(w http.ResponseWriter, r *http.Request) {
	method := "space.GetUserSpacePermissions"
	ctx := domain.GetRequestContext(r)

	spaceID := request.Param(r, "spaceID")
	if len(spaceID) == 0 {
		response.WriteMissingDataError(w, method, "spaceID")
		return
	}

	perms, err := h.Store.Permission.GetUserSpacePermissions(ctx, spaceID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}
	if len(perms) == 0 {
		perms = []permission.Permission{}
	}

	record := permission.DecodeUserPermissions(perms)
	response.WriteJSON(w, record)
}

// GetCategoryViewers returns user permissions for given category.
func (h *Handler) GetCategoryViewers(w http.ResponseWriter, r *http.Request) {
	method := "space.GetCategoryViewers"
	ctx := domain.GetRequestContext(r)

	categoryID := request.Param(r, "categoryID")
	if len(categoryID) == 0 {
		response.WriteMissingDataError(w, method, "categoryID")
		return
	}

	u, err := h.Store.Permission.GetCategoryUsers(ctx, categoryID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}
	if len(u) == 0 {
		u = []user.User{}
	}

	response.WriteJSON(w, u)
}

// GetCategoryPermissions returns user permissions for given category.
func (h *Handler) GetCategoryPermissions(w http.ResponseWriter, r *http.Request) {
	method := "space.GetCategoryPermissions"
	ctx := domain.GetRequestContext(r)

	categoryID := request.Param(r, "categoryID")
	if len(categoryID) == 0 {
		response.WriteMissingDataError(w, method, "categoryID")
		return
	}

	u, err := h.Store.Permission.GetCategoryPermissions(ctx, categoryID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}
	if len(u) == 0 {
		u = []permission.Permission{}
	}

	response.WriteJSON(w, u)
}

// SetCategoryPermissions persists specified category permissions
func (h *Handler) SetCategoryPermissions(w http.ResponseWriter, r *http.Request) {
	method := "permission.SetCategoryPermissions"
	ctx := domain.GetRequestContext(r)

	id := request.Param(r, "categoryID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "categoryID")
		return
	}

	spaceID := request.Query(r, "space")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "space")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	var model = []permission.CategoryViewRequestModel{}
	err = json.Unmarshal(body, &model)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if !HasPermission(ctx, *h.Store, spaceID, permission.SpaceManage, permission.SpaceOwner) {
		response.WriteForbiddenError(w)
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Nuke all previous permissions for this category
	_, err = h.Store.Permission.DeleteCategoryPermissions(ctx, id)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	for _, m := range model {
		perm := permission.Permission{}
		perm.OrgID = ctx.OrgID
		perm.Who = "user"
		perm.WhoID = m.UserID
		perm.Scope = "object"
		perm.Location = "category"
		perm.RefID = m.CategoryID
		perm.Action = permission.CategoryView

		err = h.Store.Permission.AddPermission(ctx, perm)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			return
		}
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeCategoryPermission)

	response.WriteEmpty(w)
}

// GetDocumentPermissions returns permissions for all users for given document.
func (h *Handler) GetDocumentPermissions(w http.ResponseWriter, r *http.Request) {
	method := "space.GetDocumentPermissions"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	perms, err := h.Store.Permission.GetDocumentPermissions(ctx, documentID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}
	if len(perms) == 0 {
		perms = []permission.Permission{}
	}

	userPerms := make(map[string][]permission.Permission)
	for _, p := range perms {
		userPerms[p.WhoID] = append(userPerms[p.WhoID], p)
	}

	records := []permission.DocumentRecord{}
	for _, up := range userPerms {
		records = append(records, permission.DecodeUserDocumentPermissions(up))
	}

	response.WriteJSON(w, records)
}

// GetUserDocumentPermissions returns permissions for the requested document, for current user.
func (h *Handler) GetUserDocumentPermissions(w http.ResponseWriter, r *http.Request) {
	method := "space.GetUserDocumentPermissions"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	perms, err := h.Store.Permission.GetUserDocumentPermissions(ctx, documentID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}
	if len(perms) == 0 {
		perms = []permission.Permission{}
	}

	record := permission.DecodeUserDocumentPermissions(perms)
	response.WriteJSON(w, record)
}

// SetDocumentPermissions persists specified document permissions
// These permissions override document permissions
func (h *Handler) SetDocumentPermissions(w http.ResponseWriter, r *http.Request) {
	method := "space.SetDocumentPermissions"
	ctx := domain.GetRequestContext(r)

	id := request.Param(r, "documentID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	doc, err := h.Store.Document.Get(ctx, id)
	if err != nil {
		response.WriteNotFoundError(w, method, "document not found")
		return
	}

	sp, err := h.Store.Space.Get(ctx, doc.LabelID)
	if err != nil {
		response.WriteNotFoundError(w, method, "space not found")
		return
	}

	// if !HasPermission(ctx, *h.Store, doc.LabelID, permission.SpaceManage, permission.SpaceOwner) {
	// 	response.WriteForbiddenError(w)
	// 	return
	// }

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	var model = []permission.DocumentRecord{}
	err = json.Unmarshal(body, &model)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// We compare new permisions to what we had before.
	// Why? So we can send out space invitation emails.
	previousRoles, err := h.Store.Permission.GetDocumentPermissions(ctx, id)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Store all previous approval roles as map for easy querying
	previousRoleUsers := make(map[string]bool)
	for _, v := range previousRoles {
		if v.Action == permission.DocumentApprove {
			previousRoleUsers[v.WhoID] = true
		}
	}

	// Get user who is setting document permissions so we can send out emails with context
	inviter, err := h.Store.User.Get(ctx, ctx.UserID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Nuke all previous permissions for this document
	_, err = h.Store.Permission.DeleteDocumentPermissions(ctx, id)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	url := ctx.GetAppURL(fmt.Sprintf("s/%s/%s/d/%s/%s",
		sp.RefID, stringutil.MakeSlug(sp.Name), doc.RefID, stringutil.MakeSlug(doc.Title)))

	for _, perm := range model {
		perm.OrgID = ctx.OrgID
		perm.DocumentID = id

		// Only persist if there is a role!
		if permission.HasAnyDocumentPermission(perm) {
			r := permission.EncodeUserDocumentPermissions(perm)

			for _, p := range r {
				err = h.Store.Permission.AddPermission(ctx, p)
				if err != nil {
					h.Runtime.Log.Error("set document permission", err)
				}
			}

			// Send email notification to users who have been given document approver role
			if _, isExisting := previousRoleUsers[perm.UserID]; !isExisting {

				// we skip 'everyone' (user id != empty string)
				if perm.UserID != "0" && perm.UserID != "" && perm.DocumentRoleApprove {
					existingUser, err := h.Store.User.Get(ctx, perm.UserID)
					if err != nil {
						response.WriteServerError(w, method, err)
						break
					}

					mailer := mail.Mailer{Runtime: h.Runtime, Store: h.Store, Context: ctx}
					go mailer.DocumentApprover(existingUser.Email, inviter.Fullname(), url, doc.Title)
					h.Runtime.Log.Info(fmt.Sprintf("%s has made %s document approver for: %s", inviter.Email, existingUser.Email, doc.Title))
				}
			}
		}
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeDocumentPermission)

	response.WriteEmpty(w)
}
