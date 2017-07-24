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

	"github.com/documize/api/wordsmith/log"
	"github.com/documize/community/core/api/mail"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/account"
	"github.com/documize/community/domain/document"
	"github.com/documize/community/domain/eventing"
	"github.com/documize/community/domain/organization"
	"github.com/documize/community/domain/pin"
	"github.com/documize/community/domain/user"
)

// Add creates a new space.
func (h *Handler) Add(w http.ResponseWriter, r *http.Request) {
	method := "AddSpace"
	ctx, s := domain.NewContexts(h.Runtime, r)

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
		return
	}

	var space = Space{}
	err = json.Unmarshal(body, &space)
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	if len(space.Name) == 0 {
		response.WriteMissingDataError(w, method, "name")
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	space.RefID = uniqueid.Generate()
	space.OrgID = ctx.OrgID

	err = addSpace(s, space)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	eventing.Record(s, eventing.EventTypeSpaceAdd)

	ctx.Transaction.Commit()

	space, _ = Get(s, space.RefID)

	response.WriteJSON(w, space)
}

// Get returns the requested space.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	method := "Get"
	_, s := domain.NewContexts(h.Runtime, r)

	id := request.Param(r, "folderID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "folderID")
		return
	}

	sp, err := Get(s, id)
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, id)
		return
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	response.WriteJSON(w, sp)
}

// GetAll returns spaces the user can see.
func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	method := "GetAll"
	_, s := domain.NewContexts(h.Runtime, r)

	sp, err := GetAll(s)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}

	if len(sp) == 0 {
		sp = []Space{}
	}

	response.WriteJSON(w, sp)
}

// GetSpaceViewers returns the users that can see the shared spaces.
func (h *Handler) GetSpaceViewers(w http.ResponseWriter, r *http.Request) {
	method := "GetSpaceViewers"
	_, s := domain.NewContexts(h.Runtime, r)

	v, err := Viewers(s)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}

	if len(v) == 0 {
		v = []Viewer{}
	}

	response.WriteJSON(w, v)
}

// Update processes request to save space object to the database
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	method := "space.Update"
	ctx, s := domain.NewContexts(h.Runtime, r)

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
		return
	}

	var sp Space
	err = json.Unmarshal(body, &sp)
	if err != nil {
		response.WriteBadRequestError(w, method, "marshal")
		return
	}

	if len(sp.Name) == 0 {
		response.WriteMissingDataError(w, method, "name")
		return
	}

	sp.RefID = folderID

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	err = Update(s, sp)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	eventing.Record(s, eventing.EventTypeSpaceUpdate)

	ctx.Transaction.Commit()

	response.WriteJSON(w, sp)
}

// Remove moves documents to another folder before deleting it
func (h *Handler) Remove(w http.ResponseWriter, r *http.Request) {
	method := "space.Remove"
	ctx, s := domain.NewContexts(h.Runtime, r)

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	if !ctx.Editor {
		response.WriteForbiddenError(w)
		return
	}

	id := request.Param(r, "folderID")
	move := request.Param(r, "moveToId")

	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "folderID")
		return
	}
	if len(move) == 0 {
		response.WriteMissingDataError(w, method, "moveToId")
		return
	}

	var err error
	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	_, err = Delete(s, id)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	err = document.MoveDocumentSpace(s, id, move)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	err = MoveSpaceRoles(s, id, move)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	_, err = pin.DeletePinnedSpace(s, id)
	if err != nil && err != sql.ErrNoRows {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	eventing.Record(s, eventing.EventTypeSpaceDelete)

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}

// Delete deletes empty space.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	method := "space.Delete"
	ctx, s := domain.NewContexts(h.Runtime, r)

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
		return
	}

	_, err = Delete(s, id)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	_, err = DeleteSpaceRoles(s, id)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	_, err = pin.DeletePinnedSpace(s, id)
	if err != nil && err != sql.ErrNoRows {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	eventing.Record(s, eventing.EventTypeSpaceDelete)

	ctx.Transaction.Commit()
	response.WriteEmpty(w)
}

// SetPermissions persists specified spac3 permissions
func (h *Handler) SetPermissions(w http.ResponseWriter, r *http.Request) {
	method := "space.SetPermissions"
	ctx, s := domain.NewContexts(h.Runtime, r)

	if !ctx.Editor {
		response.WriteForbiddenError(w)
		return
	}

	id := request.Param(r, "folderID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "folderID")
		return
	}

	sp, err := Get(s, id)
	if err != nil {
		response.WriteNotFoundError(w, method, "No such space")
		return
	}

	if sp.UserID != s.Context.UserID {
		response.WriteForbiddenError(w)
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		return
	}

	var model = RolesModel{}
	err = json.Unmarshal(body, &model)
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	// We compare new permisions to what we had before.
	// Why? So we can send out folder invitation emails.
	previousRoles, err := GetRoles(s, id)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	// Store all previous roles as map for easy querying
	previousRoleUsers := make(map[string]bool)

	for _, v := range previousRoles {
		previousRoleUsers[v.UserID] = true
	}

	// Who is sharing this folder?
	inviter, err := user.Get(s, s.Context.UserID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	// Nuke all previous permissions for this folder
	_, err = DeleteSpaceRoles(s, id)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	me := false
	hasEveryoneRole := false
	roleCount := 0

	url := s.Context.GetAppURL(fmt.Sprintf("s/%s/%s", sp.RefID, stringutil.MakeSlug(sp.Name)))

	for _, role := range model.Roles {
		role.OrgID = s.Context.OrgID
		role.LabelID = id

		// Ensure the folder owner always has access!
		if role.UserID == s.Context.UserID {
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
			err = AddRole(s, role)
			roleCount++
			log.IfErr(err)

			// We send out folder invitation emails to those users
			// that have *just* been given permissions.
			if _, isExisting := previousRoleUsers[role.UserID]; !isExisting {

				// we skip 'everyone' (user id != empty string)
				if len(role.UserID) > 0 {
					var existingUser user.User
					existingUser, err = user.Get(s, role.UserID)

					if err == nil {
						go mail.ShareFolderExistingUser(existingUser.Email, inviter.Fullname(), url, sp.Name, model.Message)
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
		role := Role{}
		role.LabelID = id
		role.OrgID = s.Context.OrgID
		role.UserID = s.Context.UserID
		role.CanEdit = true
		role.CanView = true
		roleID := uniqueid.Generate()
		role.RefID = roleID

		err = AddRole(s, role)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			return
		}
	}

	// Mark up folder type as either public, private or restricted access.
	if hasEveryoneRole {
		sp.Type = ScopePublic
	} else {
		if roleCount > 1 {
			sp.Type = ScopeRestricted
		} else {
			sp.Type = ScopePrivate
		}
	}

	err = Update(s, sp)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	eventing.Record(s, eventing.EventTypeSpacePermission)

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}

// GetPermissions returns user permissions for the requested folder.
func (h *Handler) GetPermissions(w http.ResponseWriter, r *http.Request) {
	method := "space.GetPermissions"
	_, s := domain.NewContexts(h.Runtime, r)

	folderID := request.Param(r, "folderID")
	if len(folderID) == 0 {
		response.WriteMissingDataError(w, method, "folderID")
		return
	}

	roles, err := GetRoles(s, folderID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}

	if len(roles) == 0 {
		roles = []Role{}
	}

	response.WriteJSON(w, roles)
}

// AcceptInvitation records the fact that a user has completed space onboard process.
func (h *Handler) AcceptInvitation(w http.ResponseWriter, r *http.Request) {
	method := "space.AcceptInvitation"
	ctx, s := domain.NewContexts(h.Runtime, r)

	folderID := request.Param(r, "folderID")
	if len(folderID) == 0 {
		response.WriteMissingDataError(w, method, "folderID")
		return
	}

	org, err := organization.GetOrganizationByDomain(s, ctx.Subdomain)
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	// AcceptShare does not authenticate the user hence the context needs to set up
	ctx.OrgID = org.RefID
	s.Context.OrgID = org.RefID

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		return
	}

	var model = AcceptShareModel{}
	err = json.Unmarshal(body, &model)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		return
	}

	if len(model.Serial) == 0 || len(model.Firstname) == 0 || len(model.Lastname) == 0 || len(model.Password) == 0 {
		response.WriteMissingDataError(w, method, "Serial, Firstname, Lastname, Password")
		return
	}

	u, err := user.GetBySerial(s, model.Serial)
	if err != nil && err == sql.ErrNoRows {
		response.WriteDuplicateError(w, method, "user")
		return
	}

	// AcceptShare does not authenticate the user hence the context needs to set up
	ctx.UserID = u.RefID
	s.Context.UserID = u.RefID

	u.Firstname = model.Firstname
	u.Lastname = model.Lastname
	u.Initials = stringutil.MakeInitials(u.Firstname, u.Lastname)

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	err = user.UpdateUser(s, u)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	salt := secrets.GenerateSalt()

	err = user.UpdateUserPassword(s, u.RefID, salt, secrets.GeneratePassword(model.Password, salt))
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	eventing.Record(s, eventing.EventTypeSpaceJoin)

	ctx.Transaction.Commit()

	response.WriteJSON(w, u)
}

// Invite sends users folder invitation emails.
func (h *Handler) Invite(w http.ResponseWriter, r *http.Request) {
	method := "space.Invite"
	ctx, s := domain.NewContexts(h.Runtime, r)

	id := request.Param(r, "folderID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "folderID")
		return
	}

	sp, err := Get(s, id)
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	if sp.UserID != s.Context.UserID {
		response.WriteForbiddenError(w)
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "body")
		return
	}

	var model = InvitationModel{}
	err = json.Unmarshal(body, &model)
	if err != nil {
		response.WriteBadRequestError(w, method, "json")
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	inviter, err := user.Get(s, ctx.UserID)
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	for _, email := range model.Recipients {
		u, err := user.GetByEmail(s, email)
		if err != nil && err != sql.ErrNoRows {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			return
		}

		if len(u.RefID) > 0 {
			// Ensure they have access to this organization
			accounts, err2 := account.GetUserAccounts(s, u.RefID)
			if err2 != nil {
				ctx.Transaction.Rollback()
				response.WriteServerError(w, method, err)
				return
			}

			// we create if they c
			hasAccess := false
			for _, a := range accounts {
				if a.OrgID == s.Context.OrgID {
					hasAccess = true
				}
			}

			if !hasAccess {
				var a account.Account
				a.UserID = u.RefID
				a.OrgID = s.Context.OrgID
				a.Admin = false
				a.Editor = false
				a.Active = true
				accountID := uniqueid.Generate()
				a.RefID = accountID

				err = account.Add(s, a)
				if err != nil {
					ctx.Transaction.Rollback()
					response.WriteServerError(w, method, err)
					return
				}
			}

			// Ensure they have space roles
			DeleteUserSpaceRoles(s, sp.RefID, u.RefID)

			role := Role{}
			role.LabelID = sp.RefID
			role.OrgID = ctx.OrgID
			role.UserID = u.RefID
			role.CanEdit = false
			role.CanView = true
			roleID := uniqueid.Generate()
			role.RefID = roleID

			err = AddRole(s, role)
			if err != nil {
				ctx.Transaction.Rollback()
				response.WriteServerError(w, method, err)
				return
			}

			url := ctx.GetAppURL(fmt.Sprintf("s/%s/%s", sp.RefID, stringutil.MakeSlug(sp.Name)))
			go mail.ShareFolderExistingUser(email, inviter.Fullname(), url, sp.Name, model.Message)

			h.Runtime.Log.Info(fmt.Sprintf("%s is sharing space %s with existing user %s", inviter.Email, sp.Name, email))
		} else {
			// On-board new user
			if strings.Contains(email, "@") {
				url := ctx.GetAppURL(fmt.Sprintf("auth/share/%s/%s", sp.RefID, stringutil.MakeSlug(sp.Name)))
				err = inviteNewUserToSharedSpace(s, email, inviter, url, sp, model.Message)

				if err != nil {
					ctx.Transaction.Rollback()
					response.WriteServerError(w, method, err)
					return
				}

				h.Runtime.Log.Info(fmt.Sprintf("%s is sharing space %s with new user %s", inviter.Email, sp.Name, email))
			}
		}
	}

	// We ensure that the folder is marked as restricted as a minimum!
	if len(model.Recipients) > 0 && sp.Type == ScopePrivate {
		sp.Type = ScopeRestricted

		err = Update(s, sp)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			return
		}
	}

	eventing.Record(s, eventing.EventTypeSpaceInvite)

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}
