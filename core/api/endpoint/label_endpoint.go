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
	"strings"

	"github.com/gorilla/mux"

	"github.com/documize/community/core/api/endpoint/models"
	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/api/mail"
	"github.com/documize/community/core/api/request"
	"github.com/documize/community/core/api/util"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/utility"
)

// AddFolder creates a new folder.
func AddFolder(w http.ResponseWriter, r *http.Request) {
	method := "AddFolder"
	p := request.GetPersister(r)

	if !p.Context.Editor {
		writeForbiddenError(w)
		return
	}

	defer utility.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	var folder = entity.Label{}
	err = json.Unmarshal(body, &folder)

	if len(folder.Name) == 0 {
		writeJSONMarshalError(w, method, "folder", err)
		return
	}

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	id := util.UniqueID()
	folder.RefID = id
	folder.OrgID = p.Context.OrgID
	err = addFolder(p, &folder)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	log.IfErr(tx.Commit())

	folder, err = p.GetLabel(id)

	json, err := json.Marshal(folder)

	if err != nil {
		writeJSONMarshalError(w, method, "folder", err)
		return
	}

	writeSuccessBytes(w, json)
}

func addFolder(p request.Persister, label *entity.Label) (err error) {
	label.Type = entity.FolderTypePrivate
	label.UserID = p.Context.UserID

	err = p.AddLabel(*label)

	if err != nil {
		return
	}

	role := entity.LabelRole{}
	role.LabelID = label.RefID
	role.OrgID = label.OrgID
	role.UserID = p.Context.UserID
	role.CanEdit = true
	role.CanView = true
	refID := util.UniqueID()
	role.RefID = refID

	err = p.AddLabelRole(role)

	return
}

// GetFolder returns the requested folder.
func GetFolder(w http.ResponseWriter, r *http.Request) {
	method := "GetFolder"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	id := params["folderID"]

	if len(id) == 0 {
		writeMissingDataError(w, method, "folderID")
		return
	}

	folder, err := p.GetLabel(id)

	if err != nil && err != sql.ErrNoRows {
		writeServerError(w, method, err)
		return
	}

	if err == sql.ErrNoRows {
		writeNotFoundError(w, method, id)
		return
	}

	json, err := json.Marshal(folder)

	if err != nil {
		writeJSONMarshalError(w, method, "folder", err)
		return
	}

	writeSuccessBytes(w, json)
}

// GetFolders returns the folders the user can see.
func GetFolders(w http.ResponseWriter, r *http.Request) {
	method := "GetFolders"
	p := request.GetPersister(r)

	folders, err := p.GetLabels()

	if err != nil && err != sql.ErrNoRows {
		writeServerError(w, method, err)
		return
	}

	if len(folders) == 0 {
		folders = []entity.Label{}
	}

	json, err := json.Marshal(folders)

	if err != nil {
		writeJSONMarshalError(w, method, "folder", err)
		return
	}

	writeSuccessBytes(w, json)
}

// GetFolderVisibility returns the users that can see the shared folders.
func GetFolderVisibility(w http.ResponseWriter, r *http.Request) {
	method := "GetFolderVisibility"
	p := request.GetPersister(r)

	folders, err := p.GetFolderVisibility()

	if err != nil && err != sql.ErrNoRows {
		writeServerError(w, method, err)
		return
	}

	json, err := json.Marshal(folders)

	if err != nil {
		writeJSONMarshalError(w, method, "folder", err)
		return
	}

	writeSuccessBytes(w, json)
}

// UpdateFolder processes request to save folder object to the database
func UpdateFolder(w http.ResponseWriter, r *http.Request) {
	method := "UpdateFolder"
	p := request.GetPersister(r)

	if !p.Context.Editor {
		writeForbiddenError(w)
		return
	}

	params := mux.Vars(r)
	folderID := params["folderID"]

	if len(folderID) == 0 {
		writeMissingDataError(w, method, "folderID")
		return
	}

	defer utility.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	var folder = entity.Label{}
	err = json.Unmarshal(body, &folder)

	if len(folder.Name) == 0 {
		writeJSONMarshalError(w, method, "folder", err)
		return
	}

	folder.RefID = folderID

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	err = p.UpdateLabel(folder)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	log.IfErr(tx.Commit())

	json, err := json.Marshal(folder)

	if err != nil {
		writeJSONMarshalError(w, method, "folder", err)
		return
	}

	writeSuccessBytes(w, json)
}

// RemoveFolder moves documents to another folder before deleting it
func RemoveFolder(w http.ResponseWriter, r *http.Request) {
	method := "RemoveFolder"
	p := request.GetPersister(r)

	if !p.Context.Editor {
		writeForbiddenError(w)
		return
	}

	params := mux.Vars(r)
	id := params["folderID"]
	move := params["moveToId"]

	if len(id) == 0 {
		writeMissingDataError(w, method, "folderID")
		return
	}

	if len(move) == 0 {
		writeMissingDataError(w, method, "moveToId")
		return
	}

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	_, err = p.DeleteLabel(id)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeServerError(w, method, err)
		return
	}

	err = p.MoveDocumentLabel(id, move)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeServerError(w, method, err)
		return
	}

	err = p.MoveLabelRoles(id, move)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeServerError(w, method, err)
		return
	}

	_, err = p.DeletePinnedSpace(id)

	if err != nil && err != sql.ErrNoRows {
		log.IfErr(tx.Rollback())
		writeServerError(w, method, err)
		return
	}

	log.IfErr(tx.Commit())

	writeSuccessString(w, "{}")
}

// SetFolderPermissions persists specified folder permissions
func SetFolderPermissions(w http.ResponseWriter, r *http.Request) {
	method := "SetFolderPermissions"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	id := params["folderID"]

	if len(id) == 0 {
		writeMissingDataError(w, method, "folderID")
		return
	}

	label, err := p.GetLabel(id)

	if err != nil {
		writeBadRequestError(w, method, "No such folder")
		return
	}

	if label.UserID != p.Context.UserID {
		writeForbiddenError(w)
		return
	}

	defer utility.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	var model = models.FolderRolesModel{}
	err = json.Unmarshal(body, &model)

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	// We compare new permisions to what we had before.
	// Why? So we can send out folder invitation emails.
	previousRoles, err := p.GetLabelRoles(id)

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	// Store all previous roles as map for easy querying
	previousRoleUsers := make(map[string]bool)

	for _, v := range previousRoles {
		previousRoleUsers[v.UserID] = true
	}

	// Who is sharing this folder?
	inviter, err := p.GetUser(p.Context.UserID)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	// Nuke all previous permissions for this folder
	_, err = p.DeleteLabelRoles(id)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	me := false
	hasEveryoneRole := false
	roleCount := 0

	url := p.Context.GetAppURL(fmt.Sprintf("s/%s/%s", label.RefID, utility.MakeSlug(label.Name)))

	for _, role := range model.Roles {
		role.OrgID = p.Context.OrgID
		role.LabelID = id

		// Ensure the folder owner always has access!
		if role.UserID == p.Context.UserID {
			me = true
			role.CanView = true
			role.CanEdit = true
		}

		if len(role.UserID) == 0 && (role.CanView || role.CanEdit) {
			hasEveryoneRole = true
		}

		// Only persist if there is a role!
		if role.CanView || role.CanEdit {
			roleID := util.UniqueID()
			role.RefID = roleID
			err = p.AddLabelRole(role)
			roleCount++
			log.IfErr(err)

			// We send out folder invitation emails to those users
			// that have *just* been given permissions.
			if _, isExisting := previousRoleUsers[role.UserID]; !isExisting {

				// we skip 'everyone' (user id != empty string)
				if len(role.UserID) > 0 {
					var existingUser entity.User
					existingUser, err = p.GetUser(role.UserID)

					if err == nil {
						go mail.ShareFolderExistingUser(existingUser.Email, inviter.Fullname(), url, label.Name, model.Message)
						log.Info(fmt.Sprintf("%s is sharing space %s with existing user %s", inviter.Email, label.Name, existingUser.Email))
					} else {
						writeServerError(w, method, err)
					}
				}
			}
		}
	}

	// Do we need to ensure permissions for folder owner when shared?
	if !me {
		role := entity.LabelRole{}
		role.LabelID = id
		role.OrgID = p.Context.OrgID
		role.UserID = p.Context.UserID
		role.CanEdit = true
		role.CanView = true
		roleID := util.UniqueID()
		role.RefID = roleID
		err = p.AddLabelRole(role)
		log.IfErr(err)
	}

	// Mark up folder type as either public, private or restricted access.
	if hasEveryoneRole {
		label.Type = entity.FolderTypePublic
	} else {
		if roleCount > 1 {
			label.Type = entity.FolderTypeRestricted
		} else {
			label.Type = entity.FolderTypePrivate
		}
	}

	log.Error("p.UpdateLabel()", p.UpdateLabel(label))

	log.Error("tx.Commit()", tx.Commit())

	writeSuccessEmptyJSON(w)
}

// GetFolderPermissions returns user permissions for the requested folder.
func GetFolderPermissions(w http.ResponseWriter, r *http.Request) {
	method := "GetFolderPermissions"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	folderID := params["folderID"]

	if len(folderID) == 0 {
		writeMissingDataError(w, method, "folderID")
		return
	}

	roles, err := p.GetLabelRoles(folderID)

	if err != nil && err != sql.ErrNoRows {
		writeGeneralSQLError(w, method, err)
		return
	}

	if len(roles) == 0 {
		roles = []entity.LabelRole{}
	}

	json, err := json.Marshal(roles)

	if err != nil {
		writeJSONMarshalError(w, method, "folder-permissions", err)
		return
	}

	writeSuccessBytes(w, json)
}

// AcceptSharedFolder records the fact that a user has completed folder onboard process.
func AcceptSharedFolder(w http.ResponseWriter, r *http.Request) {
	method := "AcceptSharedFolder"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	folderID := params["folderID"]

	if len(folderID) == 0 {
		writeMissingDataError(w, method, "folderID")
		return
	}

	org, err := p.GetOrganizationByDomain(p.Context.Subdomain)

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	p.Context.OrgID = org.RefID

	defer utility.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	var model = models.AcceptSharedFolderModel{}
	err = json.Unmarshal(body, &model)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	if len(model.Serial) == 0 || len(model.Firstname) == 0 || len(model.Lastname) == 0 || len(model.Password) == 0 {
		writeJSONMarshalError(w, method, "missing field data", err)
		return
	}

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	user, err := p.GetUserBySerial(model.Serial)

	// User has already on-boarded.
	if err != nil && err == sql.ErrNoRows {
		writeDuplicateError(w, method, "user")
		return
	}

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	user.Firstname = model.Firstname
	user.Lastname = model.Lastname
	user.Initials = utility.MakeInitials(user.Firstname, user.Lastname)

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	err = p.UpdateUser(user)

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	salt := util.GenerateSalt()

	log.IfErr(p.UpdateUserPassword(user.RefID, salt, util.GeneratePassword(model.Password, salt)))

	if err != nil {
		log.IfErr(tx.Rollback())
		writeGeneralSQLError(w, method, err)
		return
	}

	log.IfErr(tx.Commit())

	data, err := json.Marshal(user)

	if err != nil {
		writeJSONMarshalError(w, method, "user", err)
		return
	}

	writeSuccessBytes(w, data)
}

// InviteToFolder sends users folder invitation emails.
func InviteToFolder(w http.ResponseWriter, r *http.Request) {
	method := "InviteToFolder"
	p := request.GetPersister(r)

	params := mux.Vars(r)
	id := params["folderID"]

	if len(id) == 0 {
		writeMissingDataError(w, method, "folderID")
		return
	}

	label, err := p.GetLabel(id)

	if err != nil {
		writeBadRequestError(w, method, "folder not found")
		return
	}

	if label.UserID != p.Context.UserID {
		writeForbiddenError(w)
		return
	}

	defer utility.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writePayloadError(w, method, err)
		return
	}

	var model = models.FolderInvitationModel{}
	err = json.Unmarshal(body, &model)

	tx, err := request.Db.Beginx()

	if err != nil {
		writeTransactionError(w, method, err)
		return
	}

	p.Context.Transaction = tx

	inviter, err := p.GetUser(p.Context.UserID)

	if err != nil {
		writeGeneralSQLError(w, method, err)
		return
	}

	for _, email := range model.Recipients {
		var user entity.User
		user, err = p.GetUserByEmail(email)

		if err != nil && err != sql.ErrNoRows {
			log.IfErr(tx.Rollback())
			writeGeneralSQLError(w, method, err)
			return
		}

		if len(user.RefID) > 0 {

			// Ensure they have access to this organization
			accounts, err2 := p.GetUserAccounts(user.RefID)

			if err2 != nil {
				log.IfErr(tx.Rollback())
				writeGeneralSQLError(w, method, err2)
				return
			}

			// we create if they c
			hasAccess := false
			for _, a := range accounts {
				if a.OrgID == p.Context.OrgID {
					hasAccess = true
				}
			}

			if !hasAccess {
				var a entity.Account
				a.UserID = user.RefID
				a.OrgID = p.Context.OrgID
				a.Admin = false
				a.Editor = false
				accountID := util.UniqueID()
				a.RefID = accountID

				err = p.AddAccount(a)

				if err != nil {
					log.IfErr(tx.Rollback())
					writeGeneralSQLError(w, method, err)
					return
				}
			}

			// Ensure they have folder roles
			_, err = p.DeleteUserFolderRoles(label.RefID, user.RefID)
			log.IfErr(err)

			role := entity.LabelRole{}
			role.LabelID = label.RefID
			role.OrgID = p.Context.OrgID
			role.UserID = user.RefID
			role.CanEdit = false
			role.CanView = true
			roleID := util.UniqueID()
			role.RefID = roleID

			err = p.AddLabelRole(role)

			if err != nil {
				log.IfErr(tx.Rollback())
				writeGeneralSQLError(w, method, err)
				return
			}

			url := p.Context.GetAppURL(fmt.Sprintf("s/%s/%s", label.RefID, utility.MakeSlug(label.Name)))
			go mail.ShareFolderExistingUser(email, inviter.Fullname(), url, label.Name, model.Message)
			log.Info(fmt.Sprintf("%s is sharing space %s with existing user %s", inviter.Email, label.Name, email))
		} else {
			// On-board new user
			if strings.Contains(email, "@") {
				url := p.Context.GetAppURL(fmt.Sprintf("auth/share/%s/%s", label.RefID, utility.MakeSlug(label.Name)))
				err = inviteNewUserToSharedFolder(p, email, inviter, url, label, model.Message)

				if err != nil {
					log.IfErr(tx.Rollback())
					writeServerError(w, method, err)
					return
				}

				log.Info(fmt.Sprintf("%s is sharing space %s with new user %s", inviter.Email, label.Name, email))
			}
		}
	}

	// We ensure that the folder is marked as restricted as a minimum!
	if len(model.Recipients) > 0 && label.Type == entity.FolderTypePrivate {
		label.Type = entity.FolderTypeRestricted
		err = p.UpdateLabel(label)

		if err != nil {
			log.IfErr(tx.Rollback())
			writeServerError(w, method, err)
			return
		}
	}

	log.IfErr(tx.Commit())

	_, err = w.Write([]byte("{}"))
	log.IfErr(err)
}

// Invite new user to a folder that someone has shared with them.
// We create the user account with default values and then take them
// through a welcome process designed to capture profile data.
// We add them to the organization and grant them view-only folder access.
func inviteNewUserToSharedFolder(p request.Persister, email string, invitedBy entity.User,
	baseURL string, label entity.Label, invitationMessage string) (err error) {

	var user = entity.User{}
	user.Email = email
	user.Firstname = email
	user.Lastname = ""
	user.Salt = util.GenerateSalt()
	requestedPassword := util.GenerateRandomPassword()
	user.Password = util.GeneratePassword(requestedPassword, user.Salt)
	userID := util.UniqueID()
	user.RefID = userID

	err = p.AddUser(user)

	if err != nil {
		return
	}

	// Let's give this user access to the organization
	var a entity.Account
	a.UserID = userID
	a.OrgID = p.Context.OrgID
	a.Admin = false
	a.Editor = false
	accountID := util.UniqueID()
	a.RefID = accountID

	err = p.AddAccount(a)

	if err != nil {
		return
	}

	role := entity.LabelRole{}
	role.LabelID = label.RefID
	role.OrgID = p.Context.OrgID
	role.UserID = userID
	role.CanEdit = false
	role.CanView = true
	roleID := util.UniqueID()
	role.RefID = roleID

	err = p.AddLabelRole(role)

	if err != nil {
		return
	}

	url := fmt.Sprintf("%s/%s", baseURL, user.Salt)
	go mail.ShareFolderNewUser(user.Email, invitedBy.Fullname(), url, label.Name, invitationMessage)

	return
}
