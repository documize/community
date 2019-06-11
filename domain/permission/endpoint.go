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
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/group"
	"github.com/documize/community/model/permission"
	"github.com/documize/community/model/space"
	"github.com/documize/community/model/user"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
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

	// Permissions can be assigned to both groups and individual users.
	// Pre-fetch users with group membership to help us work out
	// if user belongs to a group with permissions.
	groupMembers, err := h.Store.Group.GetMembers(ctx)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// url is sent in 'space shared with you' invitation emails.
	url := ctx.GetAppURL(fmt.Sprintf("s/%s/%s", sp.RefID, stringutil.MakeSlug(sp.Name)))
	// me tracks if the user who changed permissions, also has some space permissions.
	me := false
	// hasEveryRole tracks if "everyone" has been give access to space.
	hasEveryoneRole := false
	// hasOwner tracks is at least one person or user group has been marked as space owner.
	hasOwner := false
	// roleCount tracks the number of permission records created for this space.
	// It's used to determine if space has multiple participants, see below.
	roleCount := 0

	for _, perm := range model.Permissions {
		perm.OrgID = ctx.OrgID
		perm.SpaceID = id

		isGroup := perm.Who == permission.GroupPermission
		groupRecords := []group.Record{}

		if isGroup {
			// get group records for just this group
			groupRecords = group.FilterGroupRecords(groupMembers, perm.WhoID)
		}

		// Ensure the space owner always has access!
		if (!isGroup && perm.WhoID == ctx.UserID) ||
			(isGroup && group.UserHasGroupMembership(groupMembers, perm.WhoID, ctx.UserID)) {
			me = true
		}

		// Detect is we have at least one space owner permission.
		// Result used below to prevent lock-outs.
		if hasOwner == false && perm.SpaceOwner {
			hasOwner = true
		}

		// Only persist if there is a role!
		if permission.HasAnyPermission(perm) {
			// identify publically shared spaces
			if perm.WhoID == "" {
				perm.WhoID = user.EveryoneUserID
			}
			if perm.WhoID == user.EveryoneUserID {
				hasEveryoneRole = true
			}

			// Encode group/user permission and save to store.
			r := permission.EncodeUserPermissions(perm)
			roleCount++
			for _, p := range r {
				err = h.Store.Permission.AddPermission(ctx, p)
				if err != nil {
					ctx.Transaction.Rollback()
					response.WriteServerError(w, method, err)
					h.Runtime.Log.Error(method, err)
				}
			}

			// We send out space invitation emails to those users
			// that have *just* been given permissions.
			if _, isExisting := previousRoleUsers[perm.WhoID]; !isExisting {
				// we skip 'everyone'
				if perm.WhoID != user.EveryoneUserID {
					whoToEmail := []string{}

					if isGroup {
						// send email to each group member
						for i := range groupRecords {
							whoToEmail = append(whoToEmail, groupRecords[i].UserID)
						}
					} else {
						// send email to individual user
						whoToEmail = append(whoToEmail, perm.WhoID)
					}

					for i := range whoToEmail {
						existingUser, err := h.Store.User.Get(ctx, whoToEmail[i])
						if err != nil {
							h.Runtime.Log.Error(method, err)
							continue
						}

						mailer := mail.Mailer{Runtime: h.Runtime, Store: h.Store, Context: ctx}
						go mailer.ShareSpaceExistingUser(existingUser.Email, inviter.Fullname(), inviter.Email, url, sp.Name, model.Message)
						h.Runtime.Log.Info(fmt.Sprintf("%s is sharing space %s with existing user %s", inviter.Email, sp.Name, existingUser.Email))
					}
				}
			}
		}
	}

	// Catch and prevent lock-outs so we don't have
	// zombie spaces that nobody can access.
	if len(model.Permissions) == 0 {
		// When no permissions are assigned we
		// default to current user as being owner and viewer.
		perm := permission.Permission{}
		perm.OrgID = ctx.OrgID
		perm.Who = permission.UserPermission
		perm.WhoID = ctx.UserID
		perm.Scope = permission.ScopeRow
		perm.Location = permission.LocationSpace
		perm.RefID = id
		perm.Action = "" // we send allowable actions in function call...
		err = h.Store.Permission.AddPermissions(ctx, perm, permission.SpaceOwner, permission.SpaceView)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	} else {
		// So we have permissions but we must check for at least one space owner.
		if !hasOwner {
			// So we have no space owner, make current user the owner
			// if we have no permssions thus far.
			if !me {
				perm := permission.Permission{}
				perm.OrgID = ctx.OrgID
				perm.Who = permission.UserPermission
				perm.WhoID = ctx.UserID
				perm.Scope = permission.ScopeRow
				perm.Location = permission.LocationSpace
				perm.RefID = id
				perm.Action = "" // we send allowable actions in function call...
				err = h.Store.Permission.AddPermissions(ctx, perm, permission.SpaceOwner, permission.SpaceView)
				if err != nil {
					ctx.Transaction.Rollback()
					response.WriteServerError(w, method, err)
					h.Runtime.Log.Error(method, err)
					return
				}
			}
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
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	userPerms := make(map[string][]permission.Permission)
	for _, p := range perms {
		userPerms[p.WhoID] = append(userPerms[p.WhoID], p)
	}

	records := []permission.Record{}
	for _, up := range userPerms {
		records = append(records, permission.DecodeUserPermissions(up))
	}

	// populate user/group name for thing that has permission record
	groups, err := h.Store.Group.GetAll(ctx)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	for i := range records {
		if records[i].Who == permission.GroupPermission {
			for j := range groups {
				if records[i].WhoID == groups[j].RefID {
					records[i].Name = groups[j].Name
					break
				}
			}
		}

		if records[i].Who == permission.UserPermission {
			if records[i].WhoID == user.EveryoneUserID {
				records[i].Name = user.EveryoneUserName
			} else {
				u, err := h.Store.User.Get(ctx, records[i].WhoID)
				if err == nil {
					records[i].Name = u.Fullname()
				}
			}
		}
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
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
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
		h.Runtime.Log.Error(method, err)
		return
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

	perms, err := h.Store.Permission.GetCategoryPermissions(ctx, categoryID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	userPerms := make(map[string][]permission.Permission)
	for _, p := range perms {
		userPerms[p.WhoID] = append(userPerms[p.WhoID], p)
	}

	records := []permission.CategoryRecord{}
	for _, up := range userPerms {
		records = append(records, permission.DecodeUserCategoryPermissions(up))
	}

	// populate user/group name for thing that has permission record
	groups, err := h.Store.Group.GetAll(ctx)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	for i := range records {
		if records[i].Who == permission.GroupPermission {
			for j := range groups {
				if records[i].WhoID == groups[j].RefID {
					records[i].Name = groups[j].Name
					break
				}
			}
		}

		if records[i].Who == permission.UserPermission {
			if records[i].WhoID == user.EveryoneUserID {
				records[i].Name = user.EveryoneUserName
			} else {
				u, err := h.Store.User.Get(ctx, records[i].WhoID)
				if err != nil {
					h.Runtime.Log.Info(fmt.Sprintf("user not found %s", records[i].WhoID))
					h.Runtime.Log.Error(method, err)
					continue
				}

				records[i].Name = u.Fullname()
			}
		}
	}

	response.WriteJSON(w, records)
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

	var model = []permission.CategoryRecord{}
	err = json.Unmarshal(body, &model)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if !HasPermission(ctx, *h.Store, spaceID, permission.SpaceManage, permission.SpaceOwner) {
		response.WriteForbiddenError(w)
		h.Runtime.Log.Info("no permission to set category permissions")
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
		perm.Who = m.Who
		perm.WhoID = m.WhoID
		perm.Scope = permission.ScopeRow
		perm.Location = permission.LocationCategory
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

	sp, err := h.Store.Space.Get(ctx, doc.SpaceID)
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

	url := ctx.GetAppURL(fmt.Sprintf("s/%s/%s/d/%s/%s", sp.RefID, stringutil.MakeSlug(sp.Name), doc.RefID, stringutil.MakeSlug(doc.Name)))

	// Permissions can be assigned to both groups and individual users.
	// Pre-fetch users with group membership to help us work out
	// if user belongs to a group with permissions.
	groupMembers, err := h.Store.Group.GetMembers(ctx)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	for _, perm := range model {
		perm.OrgID = ctx.OrgID
		perm.DocumentID = id

		// get group records for just this group
		isGroup := perm.Who == permission.GroupPermission
		groupRecords := []group.Record{}
		if isGroup {
			groupRecords = group.FilterGroupRecords(groupMembers, perm.WhoID)
		}

		// Only persist if there is a role!
		if permission.HasAnyDocumentPermission(perm) {
			if perm.WhoID == "" {
				perm.WhoID = user.EveryoneUserID
			}

			r := permission.EncodeUserDocumentPermissions(perm)
			for _, p := range r {
				err = h.Store.Permission.AddPermission(ctx, p)
				if err != nil {
					h.Runtime.Log.Error("set document permission", err)
				}
			}

			// Send email notification to users who have been given document approver role
			if _, isExisting := previousRoleUsers[perm.WhoID]; !isExisting {
				// we skip 'everyone' as it has no email address!
				if perm.WhoID != user.EveryoneUserID && perm.DocumentRoleApprove {
					whoToEmail := []string{}

					if isGroup {
						// send email to each group member
						for i := range groupRecords {
							whoToEmail = append(whoToEmail, groupRecords[i].UserID)
						}
					} else {
						// send email to individual user
						whoToEmail = append(whoToEmail, perm.WhoID)
					}

					for i := range whoToEmail {
						existingUser, err := h.Store.User.Get(ctx, whoToEmail[i])
						if err != nil {
							h.Runtime.Log.Error(method, err)
							continue
						}

						mailer := mail.Mailer{Runtime: h.Runtime, Store: h.Store, Context: ctx}
						go mailer.DocumentApprover(existingUser.Email, inviter.Fullname(), inviter.Email, url, doc.Name)
						h.Runtime.Log.Info(fmt.Sprintf("%s has made %s document approver for: %s", inviter.Email, existingUser.Email, doc.Name))
					}
				}
			}
		}
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeDocumentPermission)

	response.WriteEmpty(w)
}
