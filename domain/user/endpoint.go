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
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
	"strings"

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
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/account"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/group"
	"github.com/documize/community/model/user"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Add is the endpoint that enables an administrator to add a new user for their organization.
func (h *Handler) Add(w http.ResponseWriter, r *http.Request) {
	method := "user.Add"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.IsValid(ctx) {
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

	// Spam checks.
	if mail.IsBlockedEmailDomain(userModel.Email) {
		response.WriteForbiddenError(w)
		return
	}

	userModel.Initials = stringutil.MakeInitials(userModel.Firstname, userModel.Lastname)
	requestedPassword := secrets.GenerateRandomPassword()
	userModel.Salt = secrets.GenerateSalt()
	userModel.Password = secrets.GeneratePassword(requestedPassword, userModel.Salt)
	userModel.LastVersion = fmt.Sprintf("v%s", h.Runtime.Product.Version)

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
		userModel.Locale = ctx.OrgLocale

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
		a.Editor = userModel.Editor
		a.Admin = false
		a.Active = true
		a.Analytics = userModel.Analytics
		a.Users = userModel.ViewUsers

		err = h.Store.Account.Add(ctx, a)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	ctx.Transaction.Commit()

	if addUser {
		event.Handler().Publish(string(event.TypeAddUser))
		h.Store.Audit.Record(ctx, audit.EventTypeUserAdd)
	}

	if addAccount {
		event.Handler().Publish(string(event.TypeAddAccount))
		h.Store.Audit.Record(ctx, audit.EventTypeAccountAdd)
	}

	// If we did not add user or give them access (account) then we error back
	if !addUser && !addAccount {
		response.WriteDuplicateError(w, method, "user")
		return
	}

	// Get back newly created user.
	newUser, err := h.Store.User.Get(ctx, userID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	AttachUserAccounts(ctx, *h.Store, ctx.OrgID, &newUser)

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
		go mailer.InviteNewUser(userModel.Email, inviter.Fullname(), inviter.Email, url, userModel.Email, requestedPassword)

		h.Runtime.Log.Info(fmt.Sprintf("%s invited by %s on %s", userModel.Email, inviter.Email, ctx.AppURL))
	} else {
		mailer := mail.Mailer{Runtime: h.Runtime, Store: h.Store, Context: ctx}
		go mailer.InviteExistingUser(userModel.Email, inviter.Fullname(), inviter.Email, ctx.GetAppURL(""))

		h.Runtime.Log.Info(fmt.Sprintf("%s is giving access to an existing user %s", inviter.Email, userModel.Email))
	}

	response.WriteJSON(w, newUser)
}

// GetOrganizationUsers is the endpoint that allows administrators to view the users in their organization.
func (h *Handler) GetOrganizationUsers(w http.ResponseWriter, r *http.Request) {
	method := "user.GetOrganizationUsers"
	ctx := domain.GetRequestContext(r)

	if !ctx.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	filter := request.Query(r, "filter")

	active, err := strconv.ParseBool(request.Query(r, "active"))
	if err != nil {
		active = false
	}

	limit, _ := strconv.Atoi(request.Query(r, "limit"))
	if limit == 0 {
		limit = 100
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
		u, err = h.Store.User.GetUsersForOrganization(ctx, filter, limit)
		if err != nil && err != sql.ErrNoRows {
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}
	// prefetch all group membership records
	groups, err := h.Store.Group.GetMembers(ctx)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// for each user...
	for i := range u {
		// 1. attach user accounts
		AttachUserAccounts(ctx, *h.Store, ctx.OrgID, &u[i])

		// 2. attach user groups
		u[i].Groups = []group.Record{}
		for j := range groups {
			if groups[j].UserID == u[i].RefID {
				u[i].Groups = append(u[i].Groups, groups[j])
			}
		}
	}

	response.WriteJSON(w, u)
}

// GetSpaceUsers returns every user within a given space
func (h *Handler) GetSpaceUsers(w http.ResponseWriter, r *http.Request) {
	method := "user.GetSpaceUsers"
	ctx := domain.GetRequestContext(r)

	var u []user.User
	var err error

	spaceID := request.Param(r, "spaceID")
	if len(spaceID) == 0 {
		response.WriteMissingDataError(w, method, "spaceID")
		return
	}

	// Get user account as we need to know if user can see all users.
	account, err := h.Store.Account.GetUserAccount(ctx, ctx.UserID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteJSON(w, u)
		h.Runtime.Log.Error(method, err)
		return
	}

	// account.users == false means we restrict viewing to just space users
	if account.Users {
		// can see all users
		u, err = h.Store.User.GetActiveUsersForOrganization(ctx)
		if err != nil && err != sql.ErrNoRows {
			response.WriteJSON(w, u)
			h.Runtime.Log.Error(method, err)
			return
		}
	} else {
		// send back existing space users
		u, err = h.Store.User.GetSpaceUsers(ctx, spaceID)
		if err != nil && err != sql.ErrNoRows {
			response.WriteJSON(w, u)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	if len(u) == 0 {
		u = []user.User{}
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

	// Remove user's permissions
	_, err = h.Store.Permission.DeleteUserPermissions(ctx, userID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Remove all user groups memberships
	err = h.Store.Group.RemoveUserGroups(ctx, userID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeUserDelete)

	event.Handler().Publish(string(event.TypeRemoveUser))

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
	a.Users = u.ViewUsers
	a.Analytics = u.Analytics

	err = h.Store.Account.UpdateAccount(ctx, a)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeUserUpdate)

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
	if !ctx.Administrator && userID != ctx.UserID {
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
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	u.Salt = secrets.GenerateSalt()

	err = h.Store.User.UpdateUserPassword(ctx, userID, u.Salt, secrets.GeneratePassword(newPassword, u.Salt))
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}

// ForgotPassword initiates the change password procedure.
// Generates a reset token and sends email to the user.
// User has to click link in email and then provide a new password.
func (h *Handler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	method := "user.ForgotPassword"
	ctx := domain.GetRequestContext(r)
	ctx.Subdomain = organization.GetSubdomainFromHost(r)

	// Get email address from payload.
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

	// Exit process if user does not exist.
	_, err = h.Store.User.GetByEmail(ctx, u.Email)
	if err != nil {
		response.WriteNotFound(w)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Set token for password reset process.
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
		ctx.Transaction.Rollback()
		h.Runtime.Log.Info(fmt.Sprintf("User %s not found for password reset process", u.Email))
		response.WriteEmpty(w)
		return
	}

	ctx.Transaction.Commit()

	// Fire reset email to user.
	appURL := ctx.GetAppURL(fmt.Sprintf("auth/reset/%s", token))
	mailer := mail.Mailer{Runtime: h.Runtime, Store: h.Store, Context: ctx}
	go mailer.PasswordReset(u.Email, appURL)

	response.WriteEmpty(w)
}

// ResetPassword stores the newly chosen password for the user.
func (h *Handler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	method := "user.ResetPassword"
	ctx := domain.GetRequestContext(r)
	ctx.Subdomain = organization.GetSubdomainFromHost(r)

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
		ctx.Transaction.Rollback()
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

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeUserPasswordReset)

	response.WriteEmpty(w)
}

// MatchUsers returns users where provided text
// matches firstname, lastname, email
func (h *Handler) MatchUsers(w http.ResponseWriter, r *http.Request) {
	method := "user.MatchUsers"
	ctx := domain.GetRequestContext(r)

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "text")
		h.Runtime.Log.Error(method, err)
		return
	}
	searchText := string(body)

	limit, _ := strconv.Atoi(request.Query(r, "limit"))
	if limit == 0 {
		limit = 100
	}

	u, err := h.Store.User.MatchUsers(ctx, searchText, limit)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	response.WriteJSON(w, u)
}

// BulkImport imports comma-delimited list of users:
// firstname, lastname, email
func (h *Handler) BulkImport(w http.ResponseWriter, r *http.Request) {
	method := "user.BulkImport"
	ctx := domain.GetRequestContext(r)

	if !ctx.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "text")
		h.Runtime.Log.Error(method, err)
		return
	}
	usersList := string(body)

	cr := csv.NewReader(strings.NewReader(usersList))
	cr.TrimLeadingSpace = true
	cr.FieldsPerRecord = 3

	records, err := cr.ReadAll()
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

	inviter, err := h.Store.User.Get(ctx, ctx.UserID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	for _, v := range records {
		userModel := user.User{}
		userModel.Firstname = strings.TrimSpace(v[0])
		userModel.Lastname = strings.TrimSpace(v[1])
		userModel.Email = strings.ToLower(strings.TrimSpace(v[2]))
		userModel.Locale = ctx.OrgLocale

		if len(userModel.Email) == 0 || len(userModel.Firstname) == 0 || len(userModel.Lastname) == 0 {
			h.Runtime.Log.Info(method + " missing firstname, lastname, or email")
			continue
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
			h.Runtime.Log.Error(method, err)
			continue
		}

		if userModel.Email == userDupe.Email {
			addUser = false
			userID = userDupe.RefID
			h.Runtime.Log.Info("Dupe user found, will not add " + userModel.Email)
		}

		if addUser {
			userID = uniqueid.Generate()
			userModel.RefID = userID

			// Spam checks.
			if mail.IsBlockedEmailDomain(userModel.Email) {
				ctx.Transaction.Rollback()
				response.WriteForbiddenError(w)
				return
			}

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
			a.Analytics = false

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

		// If we did not add user or give them access (account) then we error back
		if !addUser && !addAccount {
			h.Runtime.Log.Info(method + " duplicate user not added")
			continue
		}

		// Invite new user and prepare invitation email (that contains SSO link)
		if addUser && addAccount {
			size := len(requestedPassword)

			auth := fmt.Sprintf("%s:%s:%s", ctx.AppURL, userModel.Email, requestedPassword[:size])
			encrypted := secrets.EncodeBase64([]byte(auth))

			url := fmt.Sprintf("%s/%s", ctx.GetAppURL("auth/sso"), url.QueryEscape(string(encrypted)))
			mailer := mail.Mailer{Runtime: h.Runtime, Store: h.Store, Context: ctx}
			go mailer.InviteNewUser(userModel.Email, inviter.Fullname(), inviter.Email, url, userModel.Email, requestedPassword)

			h.Runtime.Log.Info(fmt.Sprintf("%s invited by %s on %s", userModel.Email, inviter.Email, ctx.AppURL))
		} else {
			mailer := mail.Mailer{Runtime: h.Runtime, Store: h.Store, Context: ctx}
			go mailer.InviteExistingUser(userModel.Email, inviter.Fullname(), inviter.Email, ctx.GetAppURL(""))

			h.Runtime.Log.Info(fmt.Sprintf("%s is giving access to an existing user %s", inviter.Email, userModel.Email))
		}
	}

	ctx.Transaction.Commit()

	response.WriteEmpty(w)
}
