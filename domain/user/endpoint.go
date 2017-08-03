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

package user

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"

	"strconv"

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

// Add is the endpoint that enables an administrator to add a new user for their orgaisation.
func (h *Handler) Add(w http.ResponseWriter, r *http.Request) {
	method := "user.Add"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
	}

	if !ctx.Administrator {
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

	userModel := user.User{}
	err = json.Unmarshal(body, &userModel)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	// data validation
	userModel.Email = strings.ToLower(strings.TrimSpace(userModel.Email))
	userModel.Firstname = strings.TrimSpace(userModel.Firstname)
	userModel.Lastname = strings.TrimSpace(userModel.Lastname)
	userModel.Password = strings.TrimSpace(userModel.Password)

	if len(userModel.Email) == 0 {
		response.WriteMissingDataError(w, method, "email")
		return
	}

	if len(userModel.Firstname) == 0 {
		response.WriteMissingDataError(w, method, "firsrtname")
		return
	}

	if len(userModel.Lastname) == 0 {
		response.WriteMissingDataError(w, method, "lastname")
		return
	}

	userModel.Initials = stringutil.MakeInitials(userModel.Firstname, userModel.Lastname)
	requestedPassword := secrets.GenerateRandomPassword()
	userModel.Salt = secrets.GenerateSalt()
	userModel.Password = secrets.GeneratePassword(requestedPassword, userModel.Salt)

	// only create account if not dupe
	addUser := true
	addAccount := true
	var userID string

	userDupe, err := h.Store.User.GetByEmail(ctx, userModel.Email)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if userModel.Email == userDupe.Email {
		addUser = false
		userID = userDupe.RefID

		h.Runtime.Log.Info("Dupe user found, will not add " + userModel.Email)
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if addUser {
		userID = uniqueid.Generate()
		userModel.RefID = userID

		err = h.Store.User.Add(ctx, userModel)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		h.Runtime.Log.Info("Adding user")
	} else {
		AttachUserAccounts(ctx, *h.Store, ctx.OrgID, &userDupe)

		for _, a := range userDupe.Accounts {
			if a.OrgID == ctx.OrgID {
				addAccount = false
				h.Runtime.Log.Info("Dupe account found, will not add")
				break
			}
		}
	}

	// set up user account for the org
	if addAccount {
		var a account.Account
		a.RefID = uniqueid.Generate()
		a.UserID = userID
		a.OrgID = ctx.OrgID
		a.Editor = true
		a.Admin = false
		a.Active = true

		err = h.Store.Account.Add(ctx, a)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	if addUser {
		event.Handler().Publish(string(event.TypeAddUser))
		h.Store.Audit.Record(ctx, audit.EventTypeUserAdd)
	}

	if addAccount {
		event.Handler().Publish(string(event.TypeAddAccount))
		h.Store.Audit.Record(ctx, audit.EventTypeAccountAdd)
	}

	ctx.Transaction.Commit()

	// If we did not add user or give them access (account) then we error back
	if !addUser && !addAccount {
		response.WriteDuplicateError(w, method, "user")
		return
	}

	// Invite new user
	inviter, err := h.Store.User.Get(ctx, ctx.UserID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Prepare invitation email (that contains SSO link)
	if addUser && addAccount {
		size := len(requestedPassword)

		auth := fmt.Sprintf("%s:%s:%s", ctx.AppURL, userModel.Email, requestedPassword[:size])
		encrypted := secrets.EncodeBase64([]byte(auth))

		url := fmt.Sprintf("%s/%s", ctx.GetAppURL("auth/sso"), url.QueryEscape(string(encrypted)))
		mailer := mail.Mailer{Runtime: h.Runtime, Store: h.Store, Context: ctx}
		go mailer.InviteNewUser(userModel.Email, inviter.Fullname(), url, userModel.Email, requestedPassword)

		h.Runtime.Log.Info(fmt.Sprintf("%s invited by %s on %s", userModel.Email, inviter.Email, ctx.AppURL))

	} else {
		mailer := mail.Mailer{Runtime: h.Runtime, Store: h.Store, Context: ctx}
		go mailer.InviteExistingUser(userModel.Email, inviter.Fullname(), ctx.GetAppURL(""))

		h.Runtime.Log.Info(fmt.Sprintf("%s is giving access to an existing user %s", inviter.Email, userModel.Email))
	}

	response.WriteJSON(w, userModel)
}

// GetOrganizationUsers is the endpoint that allows administrators to view the users in their organisation.
func (h *Handler) GetOrganizationUsers(w http.ResponseWriter, r *http.Request) {
	method := "user.GetOrganizationUsers"
	ctx := domain.GetRequestContext(r)

	if !ctx.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	active, err := strconv.ParseBool(request.Query(r, "active"))
	if err != nil {
		active = false
	}

	u := []user.User{}

	if active {
		u, err = h.Store.User.GetActiveUsersForOrganization(ctx)
		if err != nil && err != sql.ErrNoRows {
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

	} else {
		u, err = h.Store.User.GetUsersForOrganization(ctx)
		if err != nil && err != sql.ErrNoRows {
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	if len(u) == 0 {
		u = []user.User{}
	}

	for i := range u {
		AttachUserAccounts(ctx, *h.Store, ctx.OrgID, &u[i])
	}

	response.WriteJSON(w, u)
}

// GetSpaceUsers returns every user within a given space
func (h *Handler) GetSpaceUsers(w http.ResponseWriter, r *http.Request) {
	method := "user.GetSpaceUsers"
	ctx := domain.GetRequestContext(r)

	var u []user.User
	var err error

	folderID := request.Param(r, "folderID")
	if len(folderID) == 0 {
		response.WriteMissingDataError(w, method, "folderID")
		return
	}

	// check to see space type as it determines user selection criteria
	folder, err := h.Store.Space.Get(ctx, folderID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteJSON(w, u)
		h.Runtime.Log.Error(method, err)
		return
	}

	switch folder.Type {
	case space.ScopePublic:
		u, err = h.Store.User.GetActiveUsersForOrganization(ctx)
		break
	case space.ScopePrivate:
		// just me
		var me user.User
		me, err = h.Store.User.Get(ctx, ctx.UserID)
		u = append(u, me)
		break
	case space.ScopeRestricted:
		u, err = h.Store.User.GetSpaceUsers(ctx, folderID)
		break
	}

	if len(u) == 0 {
		u = []user.User{}
	}

	if err != nil && err != sql.ErrNoRows {
		response.WriteJSON(w, u)
		h.Runtime.Log.Error(method, err)
		return
	}

	response.WriteJSON(w, u)
}

// Get returns user specified by ID
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	method := "user.Get"
	ctx := domain.GetRequestContext(r)

	userID := request.Param(r, "userID")
	if len(userID) == 0 {
		response.WriteMissingDataError(w, method, "userId")
		return
	}

	if userID != ctx.UserID {
		response.WriteBadRequestError(w, method, "userId mismatch")
		return
	}

	u, err := GetSecuredUser(ctx, *h.Store, ctx.OrgID, userID)
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, ctx.UserID)
		return
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	response.WriteJSON(w, u)
}

// Delete is the endpoint to delete a user specified by userID, the caller must be an Administrator.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	method := "user.Delete"
	ctx := domain.GetRequestContext(r)

	userID := request.Param(r, "userID")
	if len(userID) == 0 {
		response.WriteMissingDataError(w, method, "userId")
		return
	}

	if userID == ctx.UserID {
		response.WriteBadRequestError(w, method, "cannot delete self")
		return
	}

	var err error
	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.User.DeactiveUser(ctx, userID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	err = h.Store.Space.ChangeOwner(ctx, userID, ctx.UserID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Audit.Record(ctx, audit.EventTypeUserDelete)

	event.Handler().Publish(string(event.TypeRemoveUser))

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}

// Update is the endpoint to update user information for the given userID.
// Note that unless they have admin privildges, a user can only update their own information.
// Also, only admins can update user roles in organisations.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	method := "user.Update"
	ctx := domain.GetRequestContext(r)

	userID := request.Param(r, "userID")
	if len(userID) == 0 {
		response.WriteBadRequestError(w, method, "user id must be numeric")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	u := user.User{}
	err = json.Unmarshal(body, &u)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	// can only update your own account unless you are an admin
	if ctx.UserID != userID && !ctx.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	// can only update your own account unless you are an admin
	if len(u.Email) == 0 {
		response.WriteMissingDataError(w, method, "email")
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	u.RefID = userID
	u.Initials = stringutil.MakeInitials(u.Firstname, u.Lastname)

	err = h.Store.User.UpdateUser(ctx, u)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Now we update user roles for this organization.
	// That means we have to first find their account record
	// for this organization.
	a, err := h.Store.Account.GetUserAccount(ctx, userID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	a.Editor = u.Editor
	a.Admin = u.Admin
	a.Active = u.Active

	err = h.Store.Account.UpdateAccount(ctx, a)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Audit.Record(ctx, audit.EventTypeUserUpdate)

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}

// ChangePassword accepts password change from within the app.
func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	method := "user.ChangePassword"
	ctx := domain.GetRequestContext(r)

	userID := request.Param(r, "userID")
	if len(userID) == 0 {
		response.WriteMissingDataError(w, method, "user id")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}
	newPassword := string(body)

	// can only update your own account unless you are an admin
	if userID != ctx.UserID || !ctx.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	u, err := h.Store.User.Get(ctx, userID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	u.Salt = secrets.GenerateSalt()

	err = h.Store.User.UpdateUserPassword(ctx, userID, u.Salt, secrets.GeneratePassword(newPassword, u.Salt))
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Rollback()

	response.WriteEmpty(w)
}

// UserSpacePermissions returns folder permission for authenticated user.
func (h *Handler) UserSpacePermissions(w http.ResponseWriter, r *http.Request) {
	method := "user.UserSpacePermissions"
	ctx := domain.GetRequestContext(r)

	userID := request.Param(r, "userID")
	if userID != ctx.UserID {
		response.WriteForbiddenError(w)
		return
	}

	roles, err := h.Store.Space.GetUserRoles(ctx)
	if err == sql.ErrNoRows {
		err = nil
		roles = []space.Role{}
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	response.WriteJSON(w, roles)
}

// ForgotPassword initiates the change password procedure.
// Generates a reset token and sends email to the user.
// User has to click link in email and then provide a new password.
func (h *Handler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	method := "user.ForgotPassword"
	ctx := domain.GetRequestContext(r)

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "cannot ready payload")
		h.Runtime.Log.Error(method, err)
		return
	}

	u := new(user.User)
	err = json.Unmarshal(body, &u)
	if err != nil {
		response.WriteBadRequestError(w, method, "JSON body")
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	token := secrets.GenerateSalt()

	err = h.Store.User.ForgotUserPassword(ctx, u.Email, token)
	if err != nil && err != sql.ErrNoRows {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if err == sql.ErrNoRows {
		response.WriteEmpty(w)
		h.Runtime.Log.Info(fmt.Sprintf("User %s not found for password reset process", u.Email))
		return
	}

	ctx.Transaction.Commit()

	appURL := ctx.GetAppURL(fmt.Sprintf("auth/reset/%s", token))
	mailer := mail.Mailer{Runtime: h.Runtime, Store: h.Store, Context: ctx}
	go mailer.PasswordReset(u.Email, appURL)

	response.WriteEmpty(w)
}

// ResetPassword stores the newly chosen password for the user.
func (h *Handler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	method := "user.ForgotUserPassword"
	ctx := domain.GetRequestContext(r)

	token := request.Param(r, "token")
	if len(token) == 0 {
		response.WriteMissingDataError(w, method, "missing token")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "JSON body")
		h.Runtime.Log.Error(method, err)
		return
	}
	newPassword := string(body)

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	u, err := h.Store.User.GetByToken(ctx, token)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	u.Salt = secrets.GenerateSalt()

	err = h.Store.User.UpdateUserPassword(ctx, u.RefID, u.Salt, secrets.GeneratePassword(newPassword, u.Salt))
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Audit.Record(ctx, audit.EventTypeUserPasswordReset)

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}
