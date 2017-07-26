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
	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   domain.Store
}

/*
// AddUser is the endpoint that enables an administrator to add a new user for their orgaisation.
func (h *Handler) AddUser(w http.ResponseWriter, r *http.Request) {
	method := "user.AddUser"
	ctx := domain.GetRequestContext(r)

	if !h.Runtime.Product.License.IsValid() {
		response.WriteBadLicense(w)
	}

	if !s.Context.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		return
	}

	userModel := model.User{}
	err = json.Unmarshal(body, &userModel)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
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

	userDupe, err := h.Store.User.GetByEmail(s, userModel.Email)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		return
	}

	if userModel.Email == userDupe.Email {
		addUser = false
		userID = userDupe.RefID

		h.Runtime.Log.Info("Dupe user found, will not add " + userModel.Email)
	}

	s.Context.Transaction, err = request.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	if addUser {
		userID = uniqueid.Generate()
		userModel.RefID = userID

		err = h.Store.User.Add(s, userModel)
		if err != nil {
			s.Context.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			return
		}

		h.Runtime.Log.Info("Adding user")
	} else {
		AttachUserAccounts(s, s.Context.OrgID, &userDupe)

		for _, a := range userDupe.Accounts {
			if a.OrgID == s.Context.OrgID {
				addAccount = false
				h.Runtime.Log.Info("Dupe account found, will not add")
				break
			}
		}
	}

	// set up user account for the org
	if addAccount {
		var a model.Account
		a.RefID = uniqueid.Generate()
		a.UserID = userID
		a.OrgID = s.Context.OrgID
		a.Editor = true
		a.Admin = false
		a.Active = true

		err = account.Add(s, a)
		if err != nil {
			s.Context.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			return
		}
	}

	if addUser {
		event.Handler().Publish(string(event.TypeAddUser))
		eventing.Record(s, eventing.EventTypeUserAdd)
	}

	if addAccount {
		event.Handler().Publish(string(event.TypeAddAccount))
		eventing.Record(s, eventing.EventTypeAccountAdd)
	}

	s.Context.Transaction.Commit()

	// If we did not add user or give them access (account) then we error back
	if !addUser && !addAccount {
		response.WriteDuplicateError(w, method, "user")
		return
	}

	// Invite new user
	inviter, err := h.Store.User.Get(s, s.Context.UserID)
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	// Prepare invitation email (that contains SSO link)
	if addUser && addAccount {
		size := len(requestedPassword)

		auth := fmt.Sprintf("%s:%s:%s", s.Context.AppURL, userModel.Email, requestedPassword[:size])
		encrypted := secrets.EncodeBase64([]byte(auth))

		url := fmt.Sprintf("%s/%s", s.Context.GetAppURL("auth/sso"), url.QueryEscape(string(encrypted)))
		go mail.InviteNewUser(userModel.Email, inviter.Fullname(), url, userModel.Email, requestedPassword)

		h.Runtime.Log.Info(fmt.Sprintf("%s invited by %s on %s", userModel.Email, inviter.Email, s.Context.AppURL))

	} else {
		go mail.InviteExistingUser(userModel.Email, inviter.Fullname(), s.Context.GetAppURL(""))

		h.Runtime.Log.Info(fmt.Sprintf("%s is giving access to an existing user %s", inviter.Email, userModel.Email))
	}

	response.WriteJSON(w, userModel)
}

/*
// GetOrganizationUsers is the endpoint that allows administrators to view the users in their organisation.
func (h *Handler) GetOrganizationUsers(w http.ResponseWriter, r *http.Request) {
	method := "pin.GetUserPins"
	s := domain.NewContext(h.Runtime, r)

	if !s.Context.Editor && !s.Context.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	active, err := strconv.ParseBool(request.Query("active"))
	if err != nil {
		active = false
	}

	u := []User{}

	if active {
		u, err = GetActiveUsersForOrganization(s)
		if err != nil && err != sql.ErrNoRows {
			response.WriteServerError(w, method, err)
			return
		}

	} else {
		u, err = GetUsersForOrganization(s)
		if err != nil && err != sql.ErrNoRows {
			response.WriteServerError(w, method, err)
			return
		}
	}

	if len(u) == 0 {
		u = []User{}
	}

	for i := range u {
		AttachUserAccounts(s, s.Context.OrgID, &u[i])
	}

	response.WriteJSON(w, u)
}

// GetSpaceUsers returns every user within a given space
func (h *Handler) GetSpaceUsers(w http.ResponseWriter, r *http.Request) {
	method := "user.GetSpaceUsers"
	s := domain.NewContext(h.Runtime, r)

	var u []User
	var err error

	folderID := request.Param("folderID")
	if len(folderID) == 0 {
		response.WriteMissingDataError(w, method, "folderID")
		return
	}

	// check to see space type as it determines user selection criteria
	folder, err := space.Get(s, folderID)
	if err != nil && err != sql.ErrNoRows {
		h.Runtime.Log.Error("cannot get space", err)
		response.WriteJSON(w, u)
		return
	}

	switch folder.Type {
	case entity.FolderTypePublic:
		u, err = GetActiveUsersForOrganization(s)
		break
	case entity.FolderTypePrivate:
		// just me
		var me User
		user, err = Get(s, s.Context.UserID)
		u = append(u, me)
		break
	case entity.FolderTypeRestricted:
		u, err = GetSpaceUsers(s, folderID)
		break
	}

	if len(u) == 0 {
		u = []User
	}

	if err != nil && err != sql.ErrNoRows {
		h.Runtime.Log.Error("cannot get users for space", err)
		response.WriteJSON(w, u)
		return
	}

	response.WriteJSON(w, u)
}

// GetUser returns user specified by ID
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
	method := "user.GetUser"
	s := domain.NewContext(h.Runtime, r)

	userID := request.Param("userID")
	if len(userID) == 0 {
		response.WriteMissingDataError(w, method, "userId")
		return
	}

	if userID != s.Context.UserID {
		response.WriteBadRequestError(w, method, "userId mismatch")
		return
	}

	u, err := GetSecuredUser(s, s.Context.OrgID, userID)
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(s, method, s.Context.UserID)
		return
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	response.WriteJSON(u)

// DeleteUser is the endpoint to delete a user specified by userID, the caller must be an Administrator.
func (h *Handler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	method := "user.DeleteUser"
	s := domain.NewContext(h.Runtime, r)

	if !s.Context.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	userID := response.Params("userID")
	if len(userID) == 0 {
		response.WriteMissingDataError(w, method, "userID")
		return
	}

	if userID == s.Context.UserID {
		response.WriteBadRequestError(w, method, "cannot delete self")
		return
	}

	var err error
	s.Context.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	err = DeactiveUser(s, userID)
	if err != nil {
		s.Context.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	err = space.ChangeLabelOwner(s, userID, s.Context.UserID)
	if err != nil {
		s.Context.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	eventing.Record(s, eventing.EventTypeUserDelete)
	event.Handler().Publish(string(event.TypeRemoveUser))

	s.Context.Transaction.Commit()

	response.WriteEmpty()
}

// UpdateUser is the endpoint to update user information for the given userID.
// Note that unless they have admin privildges, a user can only update their own information.
// Also, only admins can update user roles in organisations.
func (h *Handler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	method := "user.DeleteUser"
	s := domain.NewContext(h.Runtime, r)

	userID := request.Param("userID")
	if len(userID) == 0 {
		response.WriteBadRequestError(w, method, "user id must be numeric")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WritePayloadError(w, method, err)
		return
	}

	u := User{}
	err = json.Unmarshal(body, &u)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		return
	}

	// can only update your own account unless you are an admin
	if s.Context.UserID != userID && !s.Context.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	// can only update your own account unless you are an admin
	if len(u.Email) == 0 {
		response.WriteMissingDataError(w, method, "email")
		return
	}

	s.Context.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	u.RefID = userID
	u.Initials = stringutil.MakeInitials(u.Firstname, u.Lastname)

	err = UpdateUser(s, u)
	if err != nil {
		s.Context.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	// Now we update user roles for this organization.
	// That means we have to first find their account record
	// for this organization.
	a, err := account.GetUserAccount(s, userID)
	if err != nil {
		s.Context.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	a.Editor = u.Editor
	a.Admin = u.Admin
	a.Active = u.Active

	err = account.UpdateAccount(s, account)
	if err != nil {
		s.Context.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	eventing.Record(s, eventing.EventTypeUserUpdate)

	s.Context.Transaction.Commit()

	response.WriteJSON(u)
}

// ChangeUserPassword accepts password change from within the app.
func (h *Handler) ChangeUserPassword(w http.ResponseWriter, r *http.Request) {
	method := "user.ChangeUserPassword"
	s := domain.NewContext(h.Runtime, r)

	userID := response.Param("userID")
	if len(userID) == 0 {
		response.WriteMissingDataError(w, method, "user id")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		return
	}
	newPassword := string(body)

	// can only update your own account unless you are an admin
	if userID != s.Context.UserID && !s.Context.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	s.Context.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	u, err := Get(s, userID)
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	u.Salt = secrets.GenerateSalt()

	err = UpdateUserPassword(s, userID, user.Salt, secrets.GeneratePassword(newPassword, user.Salt))
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	s.Context.Transaction.Rollback()
	response.WriteEmpty(w)
}

// GetUserFolderPermissions returns folder permission for authenticated user.
func (h *Handler) GetUserFolderPermissions(w http.ResponseWriter, r *http.Request) {
	method := "user.ChangeUserPassword"
	s := domain.NewContext(h.Runtime, r)

	userID := request.Param("userID")
	if userID != p.Context.UserID {
		response.WriteForbiddenError(w)
		return
	}

	roles, err := space.GetUserLabelRoles(s, userID)
	if err == sql.ErrNoRows {
		err = nil
		roles = []space.Role{}
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	response.WriteJSON(w, roles)
}

// ForgotUserPassword initiates the change password procedure.
// Generates a reset token and sends email to the user.
// User has to click link in email and then provide a new password.
func (h *Handler) ForgotUserPassword(w http.ResponseWriter, r *http.Request) {
	method := "user.ForgotUserPassword"
	s := domain.NewContext(h.Runtime, r)

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "cannot ready payload")
		return
	}

	u := new(User)
	err = json.Unmarshal(body, &u)
	if err != nil {
		response.WriteBadRequestError(w, method, "JSON body")
		return
	}

	s.Context.Transaction, err = request.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	token := secrets.GenerateSalt()

	err = ForgotUserPassword(s, u.Email, token)
	if err != nil && err != sql.ErrNoRows {
		s.Context.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	if err == sql.ErrNoRows {
		response.WriteEmpty(w)
		h.Runtime.Log.Info(fmt.Errorf("User %s not found for password reset process", u.Email))
		return
	}

	s.Context.Transaction.Commit()

	appURL := s.Context.GetAppURL(fmt.Sprintf("auth/reset/%s", token))
	go mail.PasswordReset(u.Email, appURL)

	response.WriteEmpty(w)
}

// ResetUserPassword stores the newly chosen password for the user.
func (h *Handler) ResetUserPassword(w http.ResponseWriter, r *http.Request) {
	method := "user.ForgotUserPassword"
	s := domain.NewContext(h.Runtime, r)

	token := request.Param("token")
	if len(token) == 0 {
		response.WriteMissingDataError(w, method, "missing token")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, "JSON body")
		return
	}
	newPassword := string(body)

	s.Context.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	u, err := GetByToken(token)
	if err != nil {
		response.WriteServerError(w, method, err)
		return
	}

	user.Salt = secrets.GenerateSalt()

	err = UpdateUserPassword(s, u.RefID, u.Salt, secrets.GeneratePassword(newPassword, u.Salt))
	if err != nil {
		s.Context.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		return
	}

	eventing.Record(s, eventing.EventTypeUserPasswordReset)

	s.Context.Transaction.Commit()

	response.WriteEmpty(w)
}
*/
