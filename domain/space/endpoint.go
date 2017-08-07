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

// Package space handles API calls and persistence for spaces.
// Spaces in Documize contain documents.
package space

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/mail"
	"github.com/documize/community/model/account"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/space"
	"github.com/documize/community/model/user"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *domain.Store
}

// Add creates a new space.
func (h *Handler) Add(w http.ResponseWriter, r *http.Request) {
	method := "space.Add"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	if !ctx.Editor {
		response.WriteForbiddenError(w)
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	var sp = space.Space{}
	err = json.Unmarshal(body, &sp)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if len(sp.Name) == 0 {
		response.WriteMissingDataError(w, method, "name")
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	sp.RefID = uniqueid.Generate()
	sp.OrgID = ctx.OrgID
	sp.Type = space.ScopePrivate
	sp.UserID = ctx.UserID

	err = h.Store.Space.Add(ctx, sp)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	role := space.Role{}
	role.LabelID = sp.RefID
	role.OrgID = sp.OrgID
	role.UserID = ctx.UserID
	role.CanEdit = true
	role.CanView = true
	role.RefID = uniqueid.Generate()

	err = h.Store.Space.AddRole(ctx, role)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeSpaceAdd)

	sp, _ = h.Store.Space.Get(ctx, sp.RefID)

	response.WriteJSON(w, sp)
}

// Get returns the requested space.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	method := "Get"
	ctx := domain.GetRequestContext(r)

	id := request.Param(r, "folderID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "folderID")
		return
	}

	sp, err := h.Store.Space.Get(ctx, id)
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, id)
		h.Runtime.Log.Error(method, err)
		return
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	response.WriteJSON(w, sp)
}

// GetAll returns spaces the user can see.
func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	method := "GetAll"
	ctx := domain.GetRequestContext(r)

	sp, err := h.Store.Space.GetAll(ctx)

	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if len(sp) == 0 {
		sp = []space.Space{}
	}

	response.WriteJSON(w, sp)
}

// GetSpaceViewers returns the users that can see the shared spaces.
func (h *Handler) GetSpaceViewers(w http.ResponseWriter, r *http.Request) {
	method := "space.Viewers"
	ctx := domain.GetRequestContext(r)

	v, err := h.Store.Space.Viewers(ctx)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if len(v) == 0 {
		v = []space.Viewer{}
	}

	response.WriteJSON(w, v)
}

// Update processes request to save space object to the database
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	method := "space.Update"
	ctx := domain.GetRequestContext(r)

	if !ctx.Editor {
		response.WriteForbiddenError(w)
		return
	}

	folderID := request.Param(r, "folderID")
	if len(folderID) == 0 {
		response.WriteMissingDataError(w, method, "folderID")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	var sp space.Space
	err = json.Unmarshal(body, &sp)
	if err != nil {
		response.WriteBadRequestError(w, method, "marshal")
		h.Runtime.Log.Error(method, err)
		return
	}

	if len(sp.Name) == 0 {
		response.WriteMissingDataError(w, method, "name")
		h.Runtime.Log.Error(method, err)
		return
	}

	sp.RefID = folderID

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Space.Update(ctx, sp)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Audit.Record(ctx, audit.EventTypeSpaceUpdate)

	ctx.Transaction.Commit()

	response.WriteJSON(w, sp)
}

// Remove moves documents to another folder before deleting it
func (h *Handler) Remove(w http.ResponseWriter, r *http.Request) {
	method := "space.Remove"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	if !ctx.Editor {
		response.WriteForbiddenError(w)
		return
	}

	id := request.Param(r, "folderID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "folderID")
		return
	}

	move := request.Param(r, "moveToId")
	if len(move) == 0 {
		response.WriteMissingDataError(w, method, "moveToId")
		return
	}

	var err error
	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	_, err = h.Store.Space.Delete(ctx, id)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Document.MoveDocumentSpace(ctx, id, move)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Space.MoveSpaceRoles(ctx, id, move)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	_, err = h.Store.Pin.DeletePinnedSpace(ctx, id)
	if err != nil && err != sql.ErrNoRows {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Audit.Record(ctx, audit.EventTypeSpaceDelete)

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}

// Delete deletes empty space.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	method := "space.Delete"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	if !ctx.Editor {
		response.WriteForbiddenError(w)
		return
	}

	id := request.Param(r, "folderID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "folderID")
		return
	}

	var err error
	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	_, err = h.Store.Space.Delete(ctx, id)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	_, err = h.Store.Space.DeleteSpaceRoles(ctx, id)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	_, err = h.Store.Pin.DeletePinnedSpace(ctx, id)
	if err != nil && err != sql.ErrNoRows {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Audit.Record(ctx, audit.EventTypeSpaceDelete)

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}

// SetPermissions persists specified spac3 permissions
func (h *Handler) SetPermissions(w http.ResponseWriter, r *http.Request) {
	method := "space.SetPermissions"
	ctx := domain.GetRequestContext(r)

	if !ctx.Editor {
		response.WriteForbiddenError(w)
		return
	}

	id := request.Param(r, "folderID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "folderID")
		return
	}

	sp, err := h.Store.Space.Get(ctx, id)
	if err != nil {
		response.WriteNotFoundError(w, method, "No such space")
		return
	}

	if sp.UserID != ctx.UserID {
		response.WriteForbiddenError(w)
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	var model = space.RolesModel{}
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
	// Why? So we can send out folder invitation emails.
	previousRoles, err := h.Store.Space.GetRoles(ctx, id)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Store all previous roles as map for easy querying
	previousRoleUsers := make(map[string]bool)

	for _, v := range previousRoles {
		previousRoleUsers[v.UserID] = true
	}

	// Who is sharing this folder?
	inviter, err := h.Store.User.Get(ctx, ctx.UserID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Nuke all previous permissions for this folder
	_, err = h.Store.Space.DeleteSpaceRoles(ctx, id)
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

	for _, role := range model.Roles {
		role.OrgID = ctx.OrgID
		role.LabelID = id

		// Ensure the folder owner always has access!
		if role.UserID == ctx.UserID {
			me = true
			role.CanView = true
			role.CanEdit = true
		}

		if len(role.UserID) == 0 && (role.CanView || role.CanEdit) {
			hasEveryoneRole = true
		}

		// Only persist if there is a role!
		if role.CanView || role.CanEdit {
			roleID := uniqueid.Generate()
			role.RefID = roleID
			err = h.Store.Space.AddRole(ctx, role)
			if err != nil {
				h.Runtime.Log.Error("add role", err)
			}

			roleCount++

			// We send out folder invitation emails to those users
			// that have *just* been given permissions.
			if _, isExisting := previousRoleUsers[role.UserID]; !isExisting {

				// we skip 'everyone' (user id != empty string)
				if len(role.UserID) > 0 {
					var existingUser user.User
					existingUser, err = h.Store.User.Get(ctx, role.UserID)

					if err == nil {
						mailer := mail.Mailer{Runtime: h.Runtime, Store: h.Store, Context: ctx}
						go mailer.ShareFolderExistingUser(existingUser.Email, inviter.Fullname(), url, sp.Name, model.Message)
						h.Runtime.Log.Info(fmt.Sprintf("%s is sharing space %s with existing user %s", inviter.Email, sp.Name, existingUser.Email))
					} else {
						response.WriteServerError(w, method, err)
					}
				}
			}
		}
	}

	// Do we need to ensure permissions for space owner when shared?
	if !me {
		role := space.Role{}
		role.LabelID = id
		role.OrgID = ctx.OrgID
		role.UserID = ctx.UserID
		role.CanEdit = true
		role.CanView = true
		roleID := uniqueid.Generate()
		role.RefID = roleID

		err = h.Store.Space.AddRole(ctx, role)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			return
		}
	}

	// Mark up folder type as either public, private or restricted access.
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

	h.Store.Audit.Record(ctx, audit.EventTypeSpacePermission)

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}

// GetPermissions returns user permissions for the requested folder.
func (h *Handler) GetPermissions(w http.ResponseWriter, r *http.Request) {
	method := "space.GetPermissions"
	ctx := domain.GetRequestContext(r)

	folderID := request.Param(r, "folderID")
	if len(folderID) == 0 {
		response.WriteMissingDataError(w, method, "folderID")
		return
	}

	roles, err := h.Store.Space.GetRoles(ctx, folderID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}

	if len(roles) == 0 {
		roles = []space.Role{}
	}

	response.WriteJSON(w, roles)
}

// AcceptInvitation records the fact that a user has completed space onboard process.
func (h *Handler) AcceptInvitation(w http.ResponseWriter, r *http.Request) {
	method := "space.AcceptInvitation"
	ctx := domain.GetRequestContext(r)

	folderID := request.Param(r, "folderID")
	if len(folderID) == 0 {
		response.WriteMissingDataError(w, method, "folderID")
		return
	}

	org, err := h.Store.Organization.GetOrganizationByDomain(ctx.Subdomain)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// AcceptShare does not authenticate the user hence the context needs to set up
	ctx.OrgID = org.RefID

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	var model = space.AcceptShareModel{}
	err = json.Unmarshal(body, &model)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	if len(model.Serial) == 0 || len(model.Firstname) == 0 || len(model.Lastname) == 0 || len(model.Password) == 0 {
		response.WriteMissingDataError(w, method, "Serial, Firstname, Lastname, Password")
		return
	}

	u, err := h.Store.User.GetBySerial(ctx, model.Serial)
	if err != nil && err == sql.ErrNoRows {
		response.WriteDuplicateError(w, method, "user")
		h.Runtime.Log.Error(method, err)
		return
	}

	// AcceptShare does not authenticate the user hence the context needs to set up
	ctx.UserID = u.RefID

	u.Firstname = model.Firstname
	u.Lastname = model.Lastname
	u.Initials = stringutil.MakeInitials(u.Firstname, u.Lastname)

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.User.UpdateUser(ctx, u)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	salt := secrets.GenerateSalt()

	err = h.Store.User.UpdateUserPassword(ctx, u.RefID, salt, secrets.GeneratePassword(model.Password, salt))
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Audit.Record(ctx, audit.EventTypeSpaceJoin)

	ctx.Transaction.Commit()

	response.WriteJSON(w, u)
}

// Invite sends users folder invitation emails.
func (h *Handler) Invite(w http.ResponseWriter, r *http.Request) {
	method := "space.Invite"
	ctx := domain.GetRequestContext(r)

	id := request.Param(r, "folderID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "folderID")
		return
	}

	sp, err := h.Store.Space.Get(ctx, id)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if sp.UserID != ctx.UserID {
		response.WriteForbiddenError(w)
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "body")
		h.Runtime.Log.Error(method, err)
		return
	}

	var model = space.InvitationModel{}
	err = json.Unmarshal(body, &model)
	if err != nil {
		response.WriteBadRequestError(w, method, "json")
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	inviter, err := h.Store.User.Get(ctx, ctx.UserID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	for _, email := range model.Recipients {
		u, err := h.Store.User.GetByEmail(ctx, email)
		if err != nil && err != sql.ErrNoRows {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		if len(u.RefID) > 0 {
			// Ensure they have access to this organization
			accounts, err2 := h.Store.Account.GetUserAccounts(ctx, u.RefID)
			if err2 != nil {
				ctx.Transaction.Rollback()
				response.WriteServerError(w, method, err)
				h.Runtime.Log.Error(method, err)
				return
			}

			// we create if they c
			hasAccess := false
			for _, a := range accounts {
				if a.OrgID == ctx.OrgID {
					hasAccess = true
				}
			}

			if !hasAccess {
				var a account.Account
				a.UserID = u.RefID
				a.OrgID = ctx.OrgID
				a.Admin = false
				a.Editor = false
				a.Active = true
				accountID := uniqueid.Generate()
				a.RefID = accountID

				err = h.Store.Account.Add(ctx, a)
				if err != nil {
					ctx.Transaction.Rollback()
					response.WriteServerError(w, method, err)
					h.Runtime.Log.Error(method, err)
					return
				}
			}

			// Ensure they have space roles
			h.Store.Space.DeleteUserSpaceRoles(ctx, sp.RefID, u.RefID)

			role := space.Role{}
			role.LabelID = sp.RefID
			role.OrgID = ctx.OrgID
			role.UserID = u.RefID
			role.CanEdit = false
			role.CanView = true
			roleID := uniqueid.Generate()
			role.RefID = roleID

			err = h.Store.Space.AddRole(ctx, role)
			if err != nil {
				ctx.Transaction.Rollback()
				response.WriteServerError(w, method, err)
				h.Runtime.Log.Error(method, err)
				return
			}

			url := ctx.GetAppURL(fmt.Sprintf("s/%s/%s", sp.RefID, stringutil.MakeSlug(sp.Name)))
			mailer := mail.Mailer{Runtime: h.Runtime, Store: h.Store, Context: ctx}
			go mailer.ShareFolderExistingUser(email, inviter.Fullname(), url, sp.Name, model.Message)

			h.Runtime.Log.Info(fmt.Sprintf("%s is sharing space %s with existing user %s", inviter.Email, sp.Name, email))
		} else {
			// On-board new user
			if strings.Contains(email, "@") {
				url := ctx.GetAppURL(fmt.Sprintf("auth/share/%s/%s", sp.RefID, stringutil.MakeSlug(sp.Name)))
				err = inviteNewUserToSharedSpace(ctx, h.Runtime, h.Store, email, inviter, url, sp, model.Message)

				if err != nil {
					ctx.Transaction.Rollback()
					response.WriteServerError(w, method, err)
					h.Runtime.Log.Error(method, err)
					return
				}

				h.Runtime.Log.Info(fmt.Sprintf("%s is sharing space %s with new user %s", inviter.Email, sp.Name, email))
			}
		}
	}

	// We ensure that the folder is marked as restricted as a minimum!
	if len(model.Recipients) > 0 && sp.Type == space.ScopePrivate {
		sp.Type = space.ScopeRestricted

		err = h.Store.Space.Update(ctx, sp)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	h.Store.Audit.Record(ctx, audit.EventTypeSpaceInvite)

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}
