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
	"github.com/documize/community/domain/organization"
	"github.com/documize/community/model/account"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/page"
	"github.com/documize/community/model/permission"
	"github.com/documize/community/model/space"
	uuid "github.com/nu7hatch/gouuid"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *domain.Store
}

// Add creates a new space.
func (h *Handler) Add(w http.ResponseWriter, r *http.Request) {
	method := "space.add"
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

	var model = space.NewSpaceRequest{}
	err = json.Unmarshal(body, &model)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	model.Name = strings.TrimSpace(model.Name)
	model.CloneID = strings.TrimSpace(model.CloneID)
	if len(model.Name) == 0 {
		response.WriteMissingDataError(w, method, "name")
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	var sp space.Space
	sp.Name = model.Name
	sp.RefID = uniqueid.Generate()
	sp.OrgID = ctx.OrgID
	sp.Type = space.ScopePrivate
	sp.UserID = ctx.UserID
	sp.Type = space.ScopePrivate

	err = h.Store.Space.Add(ctx, sp)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	perm := permission.Permission{}
	perm.OrgID = sp.OrgID
	perm.Who = "user"
	perm.WhoID = ctx.UserID
	perm.Scope = "object"
	perm.Location = "space"
	perm.RefID = sp.RefID
	perm.Action = "" // we send array for actions below

	err = h.Store.Permission.AddPermissions(ctx, perm, permission.SpaceOwner, permission.SpaceManage, permission.SpaceView)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeSpaceAdd)

	// Get back new space
	sp, _ = h.Store.Space.Get(ctx, sp.RefID)

	// clone existing space?
	if model.CloneID != "" && (model.CopyDocument || model.CopyPermission || model.CopyTemplate) {
		ctx.Transaction, err = h.Runtime.Db.Beginx()
		if err != nil {
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		spCloneRoles, err := h.Store.Permission.GetSpacePermissions(ctx, model.CloneID)
		if err != nil {
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		if model.CopyPermission {
			for _, r := range spCloneRoles {
				r.RefID = sp.RefID

				err = h.Store.Permission.AddPermission(ctx, r)
				if err != nil {
					ctx.Transaction.Rollback()
					response.WriteServerError(w, method, err)
					h.Runtime.Log.Error(method, err)
					return
				}
			}
		}

		toCopy := []doc.Document{}
		spCloneTemplates, err := h.Store.Document.TemplatesBySpace(ctx, model.CloneID)
		if err != nil {
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
		toCopy = append(toCopy, spCloneTemplates...)

		if model.CopyDocument {
			docs, err := h.Store.Document.GetBySpace(ctx, model.CloneID)

			if err != nil {
				ctx.Transaction.Rollback()
				response.WriteServerError(w, method, err)
				h.Runtime.Log.Error(method, err)
				return
			}

			toCopy = append(toCopy, docs...)
		}

		if len(toCopy) > 0 {
			for _, t := range toCopy {
				origID := t.RefID

				documentID := uniqueid.Generate()
				t.RefID = documentID
				t.LabelID = sp.RefID

				err = h.Store.Document.Add(ctx, t)
				if err != nil {
					ctx.Transaction.Rollback()
					response.WriteServerError(w, method, err)
					h.Runtime.Log.Error(method, err)
					return
				}

				pages, _ := h.Store.Page.GetPages(ctx, origID)
				for _, p := range pages {
					meta, err2 := h.Store.Page.GetPageMeta(ctx, p.RefID)
					if err2 != nil {
						ctx.Transaction.Rollback()
						response.WriteServerError(w, method, err)
						h.Runtime.Log.Error(method, err)
						return
					}

					p.DocumentID = documentID
					pageID := uniqueid.Generate()
					p.RefID = pageID

					meta.PageID = pageID
					meta.DocumentID = documentID

					model := page.NewPage{}
					model.Page = p
					model.Meta = meta

					err = h.Store.Page.Add(ctx, model)

					if err != nil {
						ctx.Transaction.Rollback()
						response.WriteServerError(w, method, err)
						h.Runtime.Log.Error(method, err)
						return
					}
				}

				newUUID, _ := uuid.NewV4()
				attachments, _ := h.Store.Attachment.GetAttachmentsWithData(ctx, origID)
				for _, a := range attachments {
					attachmentID := uniqueid.Generate()
					a.RefID = attachmentID
					a.DocumentID = documentID
					a.Job = newUUID.String()
					random := secrets.GenerateSalt()
					a.FileID = random[0:9]

					err = h.Store.Attachment.Add(ctx, a)
					if err != nil {
						ctx.Transaction.Rollback()
						response.WriteServerError(w, method, err)
						h.Runtime.Log.Error(method, err)
						return
					}
				}
			}
		}

		if model.CopyTemplate {
			blocks, err := h.Store.Block.GetBySpace(ctx, model.CloneID)

			for _, b := range blocks {
				b.RefID = uniqueid.Generate()
				b.LabelID = sp.RefID
				b.UserID = ctx.UserID

				err = h.Store.Block.Add(ctx, b)
				if err != nil {
					ctx.Transaction.Rollback()
					response.WriteServerError(w, method, err)
					h.Runtime.Log.Error(method, err)
					return
				}
			}
		}

		// update space to reflect it's type (public/protected/private)
		toClone, err := h.Store.Space.Get(ctx, model.CloneID)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		sp.Type = toClone.Type

		err = h.Store.Space.Update(ctx, sp)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		ctx.Transaction.Commit()
	}

	response.WriteJSON(w, sp)
}

// Get returns the requested space.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	method := "space.get"
	ctx := domain.GetRequestContext(r)

	id := request.Param(r, "spaceID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "spaceID")
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

// GetViewable returns spaces the user can see.
func (h *Handler) GetViewable(w http.ResponseWriter, r *http.Request) {
	method := "space.GetViewable"
	ctx := domain.GetRequestContext(r)

	sp, err := h.Store.Space.GetViewable(ctx)

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

// GetAll returns every space for documize admin users to manage
func (h *Handler) GetAll(w http.ResponseWriter, r *http.Request) {
	method := "space.getAll"
	ctx := domain.GetRequestContext(r)

	if !ctx.Administrator {
		response.WriteForbiddenError(w)
		h.Runtime.Log.Info("rejected non-admin user request for all spaces")
		return
	}

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

// Update processes request to save space object to the database
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	method := "space.update"
	ctx := domain.GetRequestContext(r)

	if !ctx.Editor {
		response.WriteForbiddenError(w)
		return
	}

	spaceID := request.Param(r, "spaceID")
	if len(spaceID) == 0 {
		response.WriteMissingDataError(w, method, "spaceID")
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

	sp.RefID = spaceID

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

// Remove moves documents to another space before deleting it
func (h *Handler) Remove(w http.ResponseWriter, r *http.Request) {
	method := "space.remove"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	if !ctx.Editor {
		response.WriteForbiddenError(w)
		return
	}

	id := request.Param(r, "spaceID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "spaceID")
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

	err = h.Store.Document.MoveDocumentSpace(ctx, id, move)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	_, err = h.Store.Category.RemoveSpaceCategoryMemberships(ctx, id)
	if err != nil {
		ctx.Transaction.Rollback()
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

	_, err = h.Store.Permission.DeleteSpacePermissions(ctx, id)
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

// Delete removes space.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	method := "space.delete"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
		return
	}

	if !ctx.Editor {
		response.WriteForbiddenError(w)
		return
	}

	id := request.Param(r, "spaceID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "spaceID")
		return
	}

	var err error
	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	_, err = h.Store.Document.DeleteBySpace(ctx, id)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	_, err = h.Store.Permission.DeleteSpacePermissions(ctx, id)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// remove category permissions
	_, err = h.Store.Permission.DeleteSpaceCategoryPermissions(ctx, id)
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

	// remove category and members for space
	_, err = h.Store.Category.DeleteBySpace(ctx, id)
	if err != nil {
		ctx.Transaction.Rollback()
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

	h.Store.Audit.Record(ctx, audit.EventTypeSpaceDelete)

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}

// AcceptInvitation records the fact that a user has completed space onboard process.
func (h *Handler) AcceptInvitation(w http.ResponseWriter, r *http.Request) {
	method := "space.AcceptInvitation"
	ctx := domain.GetRequestContext(r)
	ctx.Subdomain = organization.GetSubdomainFromHost(r)

	spaceID := request.Param(r, "spaceID")
	if len(spaceID) == 0 {
		response.WriteMissingDataError(w, method, "spaceID")
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

// Invite sends users space invitation emails.
func (h *Handler) Invite(w http.ResponseWriter, r *http.Request) {
	method := "space.Invite"
	ctx := domain.GetRequestContext(r)

	id := request.Param(r, "spaceID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "spaceID")
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
				a.Users = false
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
			h.Store.Permission.DeleteUserSpacePermissions(ctx, sp.RefID, u.RefID)

			perm := permission.Permission{}
			perm.OrgID = sp.OrgID
			perm.Who = "user"
			perm.WhoID = u.RefID
			perm.Scope = "object"
			perm.Location = "space"
			perm.RefID = sp.RefID
			perm.Action = "" // we send array for actions below

			err = h.Store.Permission.AddPermissions(ctx, perm, permission.SpaceView)
			if err != nil {
				ctx.Transaction.Rollback()
				response.WriteServerError(w, method, err)
				h.Runtime.Log.Error(method, err)
				return
			}

			url := ctx.GetAppURL(fmt.Sprintf("s/%s/%s", sp.RefID, stringutil.MakeSlug(sp.Name)))
			mailer := mail.Mailer{Runtime: h.Runtime, Store: h.Store, Context: ctx}
			go mailer.ShareSpaceExistingUser(email, inviter.Fullname(), url, sp.Name, model.Message)

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

	// We ensure that the space is marked as restricted as a minimum!
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
