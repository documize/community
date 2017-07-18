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

package endpoint

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"obiwan/utility"
	"strconv"
	"strings"

	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/api/mail"
	"github.com/documize/community/core/api/request"
	"github.com/documize/community/core/api/util"
	api "github.com/documize/community/core/convapi"
	"github.com/documize/community/core/event"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/stringutil"
	"github.com/gorilla/mux"
)

// AddUser is the endpoint that enables an administrator to add a new user for their orgaisation.
func AddUser(w http.ResponseWriter, r *http.Request) {
	if IsInvalidLicense() {
		util.WriteBadLicense(w)
		return
	}

	method := "AddUser"
	p := request.GetPersister(r)

	if !p.Context.Administrator {
		writeForbiddenError(w)
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	userModel := entity.User{}
	err = json.Unmarshal(body, &userModel)

	if err != nil {
		writeJSONMarshalError(w, method, "user", err)
		return
	}

	// data validation
	userModel.Email = strings.ToLower(strings.TrimSpace(userModel.Email))
	userModel.Firstname = strings.TrimSpace(userModel.Firstname)
	userModel.Lastname = strings.TrimSpace(userModel.Lastname)
	userModel.Password = strings.TrimSpace(userModel.Password)

	if len(userModel.Email) == 0 {
		writeBadRequestError(w, method, "Missing email")
		return
	}

	if len(userModel.Firstname) == 0 {
		writeBadRequestError(w, method, "Missing firstname")
		return
	}

	if len(userModel.Lastname) == 0 {
		writeBadRequestError(w, method, "Missing lastname")
		return
	}

	userModel.Initials = stringutil.MakeInitials(userModel.Firstname, userModel.Lastname)

	// generate secrets
	requestedPassword := secrets.GenerateRandomPassword()
	userModel.Salt = secrets.GenerateSalt()
	userModel.Password = secrets.GeneratePassword(requestedPassword, userModel.Salt)

	// only create account if not dupe
	addUser := true
	addAccount := true
	var userID string

	userDupe, err := p.GetUserByEmail(userModel.Email)

	if err != nil && err != sql.ErrNoRows {
		writeGeneralSQLError(w, method, err)
		return
	}

	if userModel.Email == userDupe.Email {
		addUser = false
		userID = userDupe.RefID

		log.Info("Dupe user found, will not add")
	}

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	if addUser {
		userID = util.UniqueID()
		userModel.RefID = userID
		err = p.AddUser(userModel)

		if err != nil {
			log.IfErr(tx.Rollback())
			writeGeneralSQLError(w, method, err)
			return
		}

		log.Info("Adding user")
	} else {
		attachUserAccounts(p, p.Context.OrgID, &userDupe)

		for _, a := range userDupe.Accounts {
			if a.OrgID == p.Context.OrgID {
				addAccount = false
				log.Info("Dupe account found, will not add")
				break
			}
		}
	}

	// set up user account for the org
	if addAccount {
		var a entity.Account
		a.RefID = util.UniqueID()
		a.UserID = userID
		a.OrgID = p.Context.OrgID
		a.Editor = true
		a.Admin = false
		a.Active = true

		err = p.AddAccount(a)

		if err != nil {
			log.IfErr(tx.Rollback())
			writeGeneralSQLError(w, method, err)
			return
		}
	}

	if addUser {
		event.Handler().Publish(string(event.TypeAddUser))
		p.RecordEvent(entity.EventTypeUserAdd)
	}

	if addAccount {
		event.Handler().Publish(string(event.TypeAddAccount))
		p.RecordEvent(entity.EventTypeAccountAdd)
	}

	log.IfErr(tx.Commit())

	// If we did not add user or give them access (account) then we error back
	if !addUser && !addAccount {
		writeDuplicateError(w, method, "user")
		return
	}

	// Invite new user
	inviter, err := p.GetUser(p.Context.UserID)
	log.IfErr(err)

	// Prepare invitation email (that contains SSO link)
	if addUser && addAccount {
		size := len(requestedPassword)
		auth := fmt.Sprintf("%s:%s:%s", p.Context.AppURL, userModel.Email, requestedPassword[:size])
		encrypted := utility.EncodeBase64([]byte(auth))

		url := fmt.Sprintf("%s/%s", p.Context.GetAppURL("auth/sso"), url.QueryEscape(string(encrypted)))
		go mail.InviteNewUser(userModel.Email, inviter.Fullname(), url, userModel.Email, requestedPassword)

		log.Info(fmt.Sprintf("%s invited by %s on %s", userModel.Email, inviter.Email, p.Context.AppURL))

	} else {
		go mail.InviteExistingUser(userModel.Email, inviter.Fullname(), p.Context.GetAppURL(""))

		log.Info(fmt.Sprintf("%s is giving access to an existing user %s", inviter.Email, userModel.Email))
	}

	// Send back new user record
	userModel, err = getSecuredUser(p, p.Context.OrgID, userID)

	json, err := json.Marshal(userModel)
	if err != nil {
		writeJSONMarshalError(w, method, "user", err)
		return
	}

	writeSuccessBytes(w, json)
}

// GetOrganizationUsers is the endpoint that allows administrators to view the users in their organisation.
func GetOrganizationUsers(w http.ResponseWriter, r *http.Request) {
	method := "GetUsersForOrganization"
	p := request.GetPersister(r)

	if !p.Context.Editor && !p.Context.Administrator {
		writeForbiddenError(w)
		return
	}

	active, err := strconv.ParseBool(r.URL.Query().Get("active"))
	if err != nil {
		active = false
	}

	users := []entity.User{}

	if active {
		users, err = p.GetActiveUsersForOrganization()
		if err != nil && err != sql.ErrNoRows {
			writeServerError(w, method, err)
			return
		}

	} else {
		users, err = p.GetUsersForOrganization()
		if err != nil && err != sql.ErrNoRows {
			writeServerError(w, method, err)
			return
		}
	}

	if len(users) == 0 {
		users = []entity.User{}
	}

	for i := range users {
		attachUserAccounts(p, p.Context.OrgID, &users[i])
	}

	json, err := json.Marshal(users)
	if err != nil {
		writeJSONMarshalError(w, method, "user", err)
		return
	}

	writeSuccessBytes(w, json)
}

// GetFolderUsers returns every user within a given space
func GetFolderUsers(w http.ResponseWriter, r *http.Request) {
	method := "GetUsersForSpace"
	p := request.GetPersister(r)
	var users []entity.User
	var err error

	params := mux.Vars(r)
	folderID := params["folderID"]

	if len(folderID) == 0 {
		writeBadRequestError(w, method, "missing folderID")
		return
	}

	// check to see folder type as it determines user selection criteria
	folder, err := p.GetLabel(folderID)

	if err != nil && err != sql.ErrNoRows {
		log.Error(fmt.Sprintf("%s: cannot fetch space %s", method, folderID), err)
		writeUsers(w, nil)
		return
	}

	switch folder.Type {
	case entity.FolderTypePublic:
		// return all users for team
		users, err = p.GetActiveUsersForOrganization()
		break
	case entity.FolderTypePrivate:
		// just me
		var user entity.User
		user, err = p.GetUser(p.Context.UserID)
		users = append(users, user)
		break
	case entity.FolderTypeRestricted:
		users, err = p.GetFolderUsers(folderID)
		break
	}

	if err != nil && err != sql.ErrNoRows {
		log.Error(fmt.Sprintf("%s: cannot fetch users for space %s", method, folderID), err)
		writeUsers(w, nil)
		return
	}

	writeUsers(w, users)
}

// GetUser returns user specified by Id
func GetUser(w http.ResponseWriter, r *http.Request) {
	method := "GetUser"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	userID := params["userID"]

	if len(userID) == 0 {
		writeMissingDataError(w, method, "userId")
		return
	}

	if userID != p.Context.UserID {
		writeBadRequestError(w, method, "User Id mismatch")
		return
	}

	user, err := getSecuredUser(p, p.Context.OrgID, userID)

	if err == sql.ErrNoRows {
		writeNotFoundError(w, method, userID)
		return
	}

	if err != nil {
		writeServerError(w, method, err)
		return
	}

	json, err := json.Marshal(user)

	if err != nil {
		writeJSONMarshalError(w, method, "user", err)
		return
	}

	writeSuccessBytes(w, json)
}

// DeleteUser is the endpoint to delete a user specified by userID, the caller must be an Administrator.
func DeleteUser(w http.ResponseWriter, r *http.Request) {
	method := "DeleteUser"
	p := request.GetPersister(r)

	if !p.Context.Administrator {
		writeForbiddenError(w)
		return
	}

	params := mux.Vars(r)
	userID := params["userID"]

	if len(userID) == 0 {
		writeMissingDataError(w, method, "userID")
		return
	}

	if userID == p.Context.UserID {
		writeBadRequestError(w, method, "cannot delete self")
		return
	}

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	err = p.DeactiveUser(userID)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	err = p.ChangeLabelOwner(userID, p.Context.UserID)
	log.IfErr(err)

	p.RecordEvent(entity.EventTypeUserDelete)

	log.IfErr(tx.Commit())

	event.Handler().Publish(string(event.TypeRemoveUser))

	writeSuccessString(w, "{}")
}

// UpdateUser is the endpoint to update user information for the given userID.
// Note that unless they have admin privildges, a user can only update their own information.
// Also, only admins can update user roles in organisations.
func UpdateUser(w http.ResponseWriter, r *http.Request) {
	method := "UpdateUser"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	userID := params["userID"]

	if len(userID) == 0 {
		writeBadRequestError(w, method, "user id must be numeric")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	user := entity.User{}
	err = json.Unmarshal(body, &user)

	if err != nil {
		writeJSONMarshalError(w, method, "user", err)
		return
	}

	// can only update your own account unless you are an admin
	if p.Context.UserID != userID && !p.Context.Administrator {
		writeForbiddenError(w)
		return
	}

	// can only update your own account unless you are an admin
	if len(user.Email) == 0 {
		writeBadRequestError(w, method, "missing email")
		return
	}

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	user.RefID = userID
	user.Initials = stringutil.MakeInitials(user.Firstname, user.Lastname)

	err = p.UpdateUser(user)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	// Now we update user roles for this organization.
	// That means we have to first find their account record
	// for this organization.
	account, err := p.GetUserAccount(userID)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	account.Editor = user.Editor
	account.Admin = user.Admin
	account.Active = user.Active

	err = p.UpdateAccount(account)
	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	p.RecordEvent(entity.EventTypeUserUpdate)

	log.IfErr(tx.Commit())

	json, err := json.Marshal(user)

	if err != nil {
		writeJSONMarshalError(w, method, "user", err)
		return
	}

	writeSuccessBytes(w, json)
}

// ChangeUserPassword accepts password change from within the app.
func ChangeUserPassword(w http.ResponseWriter, r *http.Request) {
	method := "ChangeUserPassword"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	userID := params["userID"]

	if len(userID) == 0 {
		writeMissingDataError(w, method, "user id")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	newPassword := string(body)

	// can only update your own account unless you are an admin
	if userID != p.Context.UserID && !p.Context.Administrator {
		writeForbiddenError(w)
		return
	}

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	user, err := p.GetUser(userID)

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	user.Salt = secrets.GenerateSalt()

	err = p.UpdateUserPassword(userID, user.Salt, secrets.GeneratePassword(newPassword, user.Salt))

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	log.IfErr(tx.Commit())

	writeSuccessEmptyJSON(w)
}

// GetUserFolderPermissions returns folder permission for authenticated user.
func GetUserFolderPermissions(w http.ResponseWriter, r *http.Request) {
	method := "ChangeUserPassword"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	userID := params["userID"]

	if userID != p.Context.UserID {
		writeUnauthorizedError(w)
		return
	}

	roles, err := p.GetUserLabelRoles()

	if err == sql.ErrNoRows {
		err = nil
		roles = []entity.LabelRole{}
	}

	if err != nil {
		writeServerError(w, method, err)
		return
	}

	json, err := json.Marshal(roles)

	if err != nil {
		writeJSONMarshalError(w, method, "roles", err)
		return
	}

	writeSuccessBytes(w, json)
}

// ForgotUserPassword initiates the change password procedure.
// Generates a reset token and sends email to the user.
// User has to click link in email and then provide a new password.
func ForgotUserPassword(w http.ResponseWriter, r *http.Request) {
	method := "ForgotUserPassword"
	p := request.GetPersister(r)

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writeBadRequestError(w, method, "cannot ready payload")
		return
	}

	user := new(entity.User)
	err = json.Unmarshal(body, &user)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	token := secrets.GenerateSalt()

	err = p.ForgotUserPassword(user.Email, token)

	if err != nil && err != sql.ErrNoRows {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	if err == sql.ErrNoRows {
		writeServerError(w, method, fmt.Errorf("User %s not found for password reset process", user.Email))
		return
	}

	log.IfErr(tx.Commit())

	appURL := p.Context.GetAppURL(fmt.Sprintf("auth/reset/%s", token))

	go mail.PasswordReset(user.Email, appURL)

	writeSuccessEmptyJSON(w)
}

// ResetUserPassword stores the newly chosen password for the user.
func ResetUserPassword(w http.ResponseWriter, r *http.Request) {
	api.SetJSONResponse(w)
	p := request.GetPersister(r)

	params := mux.Vars(r)
	token := params["token"]

	if len(token) == 0 {
		log.ErrorString("ResetUserPassword - missing password reset token")
		api.WriteErrorBadRequest(w, "missing password reset token")
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		api.WriteErrorBadRequest(w, "Bad payload")
		log.Error("ResetUserPassword - failed to read body", err)
		return
	}

	newPassword := string(body)

	tx, err := request.Db.Beginx()

	if err != nil {
		api.WriteError(w, err)
		log.Error("ResetUserPassword - failed to get DB transaction", err)
		return
	}

	p.Context.Transaction = tx

	user, err := p.GetUserByToken(token)

	if err != nil {
		api.WriteError(w, err)
		log.Error("ResetUserPassword - unable to retrieve user", err)
		return
	}

	user.Salt = secrets.GenerateSalt()

	err = p.UpdateUserPassword(user.RefID, user.Salt, secrets.GeneratePassword(newPassword, user.Salt))

	if err != nil {
		log.IfErr(tx.Rollback())
		api.WriteError(w, err)
		log.Error("ResetUserPassword - failed to change password", err)
		return
	}

	p.RecordEvent(entity.EventTypeUserPasswordReset)

	log.IfErr(tx.Commit())

	_, err = w.Write([]byte("{}"))
	log.IfErr(err)
}

// Get user object contain associated accounts but credentials are wiped.
func getSecuredUser(p request.Persister, orgID, user string) (u entity.User, err error) {
	u, err = p.GetUser(user)
	attachUserAccounts(p, orgID, &u)
	return
}

func attachUserAccounts(p request.Persister, orgID string, user *entity.User) {
	user.ProtectSecrets()
	a, err := p.GetUserAccounts(user.RefID)

	if err != nil {
		log.Error("Unable to fetch user accounts", err)
		return
	}

	user.Accounts = a
	user.Editor = false
	user.Admin = false
	user.Active = false

	for _, account := range user.Accounts {
		if account.OrgID == orgID {
			user.Admin = account.Admin
			user.Editor = account.Editor
			user.Active = account.Active
			break
		}
	}
}

func writeUsers(w http.ResponseWriter, u []entity.User) {
	if u == nil {
		u = []entity.User{}
	}

	j, err := json.Marshal(u)

	if err != nil {
		log.Error("unable to writeUsers", err)
		writeServerError(w, "unabe to writeUsers", err)
		return
	}

	writeSuccessBytes(w, j)
}
