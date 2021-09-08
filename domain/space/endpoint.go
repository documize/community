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
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/event"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/mail"
	"github.com/documize/community/domain/organization"
	perm "github.com/documize/community/domain/permission"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/account"
	"github.com/documize/community/model/activity"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/page"
	"github.com/documize/community/model/permission"
	"github.com/documize/community/model/space"
	"github.com/documize/community/model/user"
	wf "github.com/documize/community/model/workflow"
	"github.com/microcosm-cc/bluemonday"
	uuid "github.com/nu7hatch/gouuid"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Add creates a new space.
func (h *Handler) Add(w http.ResponseWriter, r *http.Request) {
	method := "space.add"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.IsValid(ctx) {
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
	sp.Description = bluemonday.StrictPolicy().Sanitize(model.Description)

	sp.Icon = model.Icon
	sp.LabelID = model.LabelID
	sp.RefID = uniqueid.Generate()
	sp.OrgID = ctx.OrgID
	sp.UserID = ctx.UserID
	sp.Type = space.ScopePrivate
	sp.Lifecycle = wf.LifecycleLive
	sp.UserID = ctx.UserID
	sp.Created = time.Now().UTC()
	sp.Revised = time.Now().UTC()

	err = h.Store.Space.Add(ctx, sp)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	perm := permission.Permission{}
	perm.OrgID = sp.OrgID
	perm.Who = permission.UserPermission
	perm.WhoID = ctx.UserID
	perm.Scope = permission.ScopeRow
	perm.Location = permission.LocationSpace
	perm.RefID = sp.RefID
	perm.Action = "" // we send array for actions below

	err = h.Store.Permission.AddPermissions(ctx, perm, permission.SpaceOwner, permission.SpaceManage, permission.SpaceView,
		permission.DocumentAdd, permission.DocumentCopy, permission.DocumentDelete, permission.DocumentEdit, permission.DocumentMove,
		permission.DocumentTemplate, permission.DocumentApprove, permission.DocumentVersion, permission.DocumentLifecycle)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		SpaceID:      sp.RefID,
		SourceType:   activity.SourceTypeSpace,
		ActivityType: activity.TypeCreated})

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

		if model.CopyPermission {
			spCloneRoles, err := h.Store.Permission.GetSpacePermissions(ctx, model.CloneID)
			if err != nil {
				ctx.Transaction.Rollback()
				response.WriteServerError(w, method, err)
				h.Runtime.Log.Error(method, err)
				return
			}

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
			ctx.Transaction.Rollback()
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

		// documemt.GroupID groups versioned documents together
		// and must be reassigned a new value when being copied
		// to avoid conflicts.
		groupChange := make(map[string]string)

		// Store old-to-new document ID mapping for subsequence reference.
		docMap := make(map[string]string)

		if len(toCopy) > 0 {
			for _, t := range toCopy {
				origID := t.RefID

				documentID := uniqueid.Generate()
				docMap[t.RefID] = documentID

				t.RefID = documentID
				t.SpaceID = sp.RefID

				// Reassign group ID
				if len(t.GroupID) > 0 {
					if len(groupChange[t.GroupID]) > 0 {
						t.GroupID = groupChange[t.GroupID]
					} else {
						groupChange[t.GroupID] = uniqueid.Generate()
						t.GroupID = groupChange[t.GroupID]
					}
				}

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

					meta.SectionID = pageID
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
				b.SpaceID = sp.RefID
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

		// Copy over space categories, associated permissions and document assignments.
		cats, err := h.Store.Category.GetAllBySpace(ctx, model.CloneID)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		catMap := make(map[string]string)
		for _, ct := range cats {
			// Store old-to-new category ID mapping for subsequent processing.
			cid := uniqueid.Generate()
			catMap[ct.RefID] = cid

			// Get existing user/group permissions for the category to be cloned.
			cp, err := h.Store.Permission.GetCategoryPermissions(ctx, ct.RefID)
			if err != nil {
				ctx.Transaction.Rollback()
				response.WriteServerError(w, method, err)
				h.Runtime.Log.Error(method, err)
				return
			}

			// Add cloned category.
			ct.RefID = cid
			ct.SpaceID = sp.RefID
			err = h.Store.Category.Add(ctx, ct)
			if err != nil {
				ctx.Transaction.Rollback()
				response.WriteServerError(w, method, err)
				h.Runtime.Log.Error(method, err)
				return
			}

			// Add cloned category permissions.
			for _, p := range cp {
				p.RefID = cid
				err = h.Store.Permission.AddPermission(ctx, p)
				if err != nil {
					ctx.Transaction.Rollback()
					response.WriteServerError(w, method, err)
					h.Runtime.Log.Error(method, err)
					return
				}
			}
		}

		// Add cloned category members
		cm, err := h.Store.Category.GetSpaceCategoryMembership(ctx, model.CloneID)
		for _, m := range cm {
			m.RefID = uniqueid.Generate()
			m.CategoryID = catMap[m.CategoryID]
			m.DocumentID = docMap[m.DocumentID]
			m.SpaceID = sp.RefID

			err = h.Store.Category.AssociateDocument(ctx, m)
			if err != nil {
				ctx.Transaction.Rollback()
				response.WriteServerError(w, method, err)
				h.Runtime.Log.Error(method, err)
				return
			}
		}

		// Finish up the clone operations.
		ctx.Transaction.Commit()
	}

	event.Handler().Publish(string(event.TypeAddSpace))

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

	// Cater for negative counts caused by user database manipulation.
	if sp.CountCategory < 0 {
		sp.CountCategory = 0
	}
	if sp.CountContent < 0 {
		sp.CountContent = 0
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		SpaceID:      sp.RefID,
		SourceType:   activity.SourceTypeSpace,
		ActivityType: activity.TypeRead})

	ctx.Transaction.Commit()

	response.WriteJSON(w, sp)
}

// GetViewable returns spaces the user can see.
func (h *Handler) GetViewable(w http.ResponseWriter, r *http.Request) {
	method := "space.GetViewable"
	ctx := domain.GetRequestContext(r)

	sp, err := h.Store.Space.GetViewable(ctx)
	if err != nil {
		h.Runtime.Log.Error(method, err)
	}

	// Cater for negative counts caused by user database manipulation.
	for i := range sp {
		if sp[i].CountCategory < 0 {
			sp[i].CountCategory = 0
		}
		if sp[i].CountContent < 0 {
			sp[i].CountContent = 0
		}
	}

	response.WriteJSON(w, sp)
}

// Update processes request to save space object to the database
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	method := "space.update"
	ctx := domain.GetRequestContext(r)

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

	// Check permissions (either Documize admin OR space owner/manager).
	canManage := perm.CanManageSpace(ctx, *h.Store, spaceID)
	if !canManage && !ctx.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	// Retreive previous record for comparison later.
	prev, err := h.Store.Space.Get(ctx, spaceID)
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

	err = h.Store.Space.Update(ctx, sp)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// If newly marked Everyone space, ensure everyone has permission
	if prev.Type != space.ScopePublic && sp.Type == space.ScopePublic {
		_, err = h.Store.Permission.DeleteUserSpacePermissions(ctx, sp.RefID, user.EveryoneUserID)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		perm := permission.Permission{}
		perm.OrgID = sp.OrgID
		perm.Who = permission.UserPermission
		perm.WhoID = user.EveryoneUserID
		perm.Scope = permission.ScopeRow
		perm.Location = permission.LocationSpace
		perm.RefID = sp.RefID
		perm.Action = "" // we send array for actions below

		err = h.Store.Permission.AddPermissions(ctx, perm, permission.SpaceView)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeSpaceUpdate)

	response.WriteJSON(w, sp)
}

// Remove moves documents to another space before deleting it
func (h *Handler) Remove(w http.ResponseWriter, r *http.Request) {
	method := "space.remove"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.IsValid(ctx) {
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

	h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		SpaceID:      id,
		SourceType:   activity.SourceTypeSpace,
		ActivityType: activity.TypeDeleted})

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeSpaceDelete)

	event.Handler().Publish(string(event.TypeRemoveSpace))

	response.WriteEmpty(w)
}

// Delete removes space.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	method := "space.delete"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.IsValid(ctx) {
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

	// Delete the space first.
	ok := true
	ctx.Transaction, ok = h.Runtime.StartTx(sql.LevelReadUncommitted)
	if !ok {
		response.WriteError(w, method)
		return
	}

	_, err := h.Store.Space.Delete(ctx, id)
	if err != nil {
		h.Runtime.Rollback(ctx.Transaction)
		response.WriteServerError(w, method, err)
		return
	}

	h.Runtime.Commit(ctx.Transaction)

	// Delete data associated with this space.
	ctx.Transaction, ok = h.Runtime.StartTx(sql.LevelReadUncommitted)
	if !ok {
		response.WriteError(w, method)
		return
	}

	_, err = h.Store.Document.DeleteBySpace(ctx, id)
	if err != nil {
		h.Runtime.Rollback(ctx.Transaction)
		response.WriteServerError(w, method, err)
		return
	}

	_, err = h.Store.Permission.DeleteSpacePermissions(ctx, id)
	if err != nil {
		h.Runtime.Rollback(ctx.Transaction)
		response.WriteServerError(w, method, err)
		return
	}

	_, err = h.Store.Permission.DeleteSpaceCategoryPermissions(ctx, id)
	if err != nil {
		h.Runtime.Rollback(ctx.Transaction)
		response.WriteServerError(w, method, err)
		return
	}

	_, err = h.Store.Category.DeleteBySpace(ctx, id)
	if err != nil {
		h.Runtime.Rollback(ctx.Transaction)
		response.WriteServerError(w, method, err)
		return
	}

	_, err = h.Store.Pin.DeletePinnedSpace(ctx, id)
	if err != nil && err != sql.ErrNoRows {
		h.Runtime.Rollback(ctx.Transaction)
		response.WriteServerError(w, method, err)
		return
	}

	h.Runtime.Commit(ctx.Transaction)

	// Record this action.
	ctx.Transaction, ok = h.Runtime.StartTx(sql.LevelReadUncommitted)
	if !ok {
		response.WriteError(w, method)
		return
	}

	h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		SpaceID:      id,
		SourceType:   activity.SourceTypeSpace,
		ActivityType: activity.TypeDeleted})

	h.Runtime.Commit(ctx.Transaction)

	h.Store.Audit.Record(ctx, audit.EventTypeSpaceDelete)

	event.Handler().Publish(string(event.TypeRemoveSpace))

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
		h.Runtime.Log.Error(method, err)
		return
	}

	u, err := h.Store.User.GetBySerial(ctx, model.Serial)
	if err != nil && err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, "user")
		h.Runtime.Log.Error(method, err)
		return
	}

	// AcceptShare does not authenticate the user hence the context needs to set up
	ctx.UserID = u.RefID

	// Prepare user data
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

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeSpaceJoin)

	// We send back POJO and not fully authenticated user object as
	// SSO should take place thereafter
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

	// if sp.UserID != ctx.UserID {
	// 	response.WriteForbiddenError(w)
	// 	return
	// }

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
		ctx.Transaction.Rollback()
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

		// Spam checks.
		if mail.IsBlockedEmailDomain(email) {
			response.WriteForbiddenError(w)
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
			perm.Who = permission.UserPermission
			perm.WhoID = u.RefID
			perm.Scope = permission.ScopeRow
			perm.Location = permission.LocationSpace
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
			go mailer.ShareSpaceExistingUser(email, inviter.Fullname(), inviter.Email, url, sp.Name, model.Message)

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

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeSpaceInvite)

	response.WriteEmpty(w)
}

// Manage returns all shared spaces and orphaned spaces that have no owner.
func (h *Handler) Manage(w http.ResponseWriter, r *http.Request) {
	method := "space.Manage"
	ctx := domain.GetRequestContext(r)

	if !ctx.Administrator {
		response.WriteForbiddenError(w)
		h.Runtime.Log.Info("rejected non-admin user request for all spaces")
		return
	}

	sp, err := h.Store.Space.AdminList(ctx)
	if err != nil {
		h.Runtime.Log.Error(method, err)
	}

	response.WriteJSON(w, sp)
}

// ManageOwner adds current user as space owner.
// Requires admin rights.
func (h *Handler) ManageOwner(w http.ResponseWriter, r *http.Request) {
	method := "space.ManageOwner"
	ctx := domain.GetRequestContext(r)
	var err error

	if !ctx.Administrator {
		response.WriteForbiddenError(w)
		h.Runtime.Log.Info("rejected space.ManageOwner")
		return
	}

	id := request.Param(r, "spaceID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "spaceID")
		return
	}

	// If they are already space owner, skip.
	isOwner := perm.HasPermission(ctx, *h.Store, id, permission.SpaceOwner)
	if isOwner {
		response.WriteEmpty(w)
		return
	}
	// We need to check if user can see space before we make them owner!
	isViewer := perm.HasPermission(ctx, *h.Store, id, permission.SpaceView)

	// Add current user as space owner
	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	perm := permission.Permission{}
	perm.OrgID = ctx.OrgID
	perm.Who = permission.UserPermission
	perm.WhoID = ctx.UserID
	perm.Scope = permission.ScopeRow
	perm.Location = permission.LocationSpace
	perm.RefID = id
	perm.Action = "" // we send allowable actions in function call...
	if !isViewer {
		err = h.Store.Permission.AddPermissions(ctx, perm, permission.SpaceOwner, permission.SpaceView)
	} else {
		err = h.Store.Permission.AddPermissions(ctx, perm, permission.SpaceOwner)
	}
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeAssumedSpaceOwnership)

	response.WriteEmpty(w)
}
