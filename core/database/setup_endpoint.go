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

package database

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/documize/community/core/api/plugins"
	"github.com/documize/community/core/env"
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/server/web"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *domain.Store
}

// Setup the tables in a blank database
func (h *Handler) Setup(w http.ResponseWriter, r *http.Request) {
	defer func() {
		target := "/setup"
		status := http.StatusBadRequest

		if h.Runtime.Flags.SiteMode == env.SiteModeNormal {
			target = "/"
			status = http.StatusOK
		}

		req, err := http.NewRequest("GET", target, nil)
		if err != nil {
			h.Runtime.Log.Error("database.Setup error in defer ", err)
		}

		http.Redirect(w, req, target, status)
	}()

	err := r.ParseForm()
	if err != nil {
		h.Runtime.Log.Error("database.Setup r.ParseForm()", err)
		return
	}

	dbname := r.Form.Get("dbname")
	dbhash := r.Form.Get("dbhash")

	if dbname != web.SiteInfo.DBname || dbhash != web.SiteInfo.DBhash {
		h.Runtime.Log.Error("database.Setup security credentials error ", errors.New("bad db name or validation code"))
		return
	}

	details := onboardRequest{
		URL:         "",
		Company:     r.Form.Get("title"),
		CompanyLong: r.Form.Get("title"),
		Message:     r.Form.Get("message"),
		Email:       r.Form.Get("email"),
		Password:    r.Form.Get("password"),
		Firstname:   r.Form.Get("firstname"),
		Lastname:    r.Form.Get("lastname"),
		Revised:     time.Now().UTC(),
	}

	if details.Company == "" ||
		details.CompanyLong == "" ||
		details.Message == "" ||
		details.Email == "" ||
		details.Password == "" ||
		details.Firstname == "" ||
		details.Lastname == "" {
		h.Runtime.Log.Error("database.Setup error ", errors.New("required field in database set-up form blank"))
		return
	}

	if err = InstallUpgrade(h.Runtime, false); err != nil {
		h.Runtime.Log.Error("database.Setup migrate", err)
		return
	}

	err = setupAccount(h.Runtime, details, secrets.GenerateSalt())
	if err != nil {
		h.Runtime.Log.Error("database.Setup setup account ", err)
		return
	}

	h.Runtime.Flags.SiteMode = env.SiteModeNormal

	err = plugins.Setup(h.Store)
	if err != nil {
		h.Runtime.Log.Error("database.Setup plugin setup failed", err)
	}
}

// The result of completing the onboarding process.
type onboardRequest struct {
	URL         string
	Company     string
	CompanyLong string
	Message     string
	Email       string
	Password    string
	Firstname   string
	Lastname    string
	Revised     time.Time
}

// setupAccount prepares the database for a newly onboard customer.
// Once done, they can then login and use Documize.
func setupAccount(rt *env.Runtime, completion onboardRequest, serial string) (err error) {
	//accountTitle := "This is where you will find documentation for your all projects. You can customize this message from the settings screen."
	salt := secrets.GenerateSalt()
	password := secrets.GeneratePassword(completion.Password, salt)

	// Allocate organization to the user.
	orgID := uniqueid.Generate()

	sql := fmt.Sprintf("insert into organization (refid, company, title, message, domain, email, serial) values (\"%s\", \"%s\", \"%s\", \"%s\", \"%s\", \"%s\", \"%s\")",
		orgID, completion.Company, completion.CompanyLong, completion.Message, completion.URL, completion.Email, serial)
	_, err = runSQL(rt, sql)

	if err != nil {
		rt.Log.Error("Failed to insert into organization", err)
		return
	}

	userID := uniqueid.Generate()

	sql = fmt.Sprintf("insert into user (refid, firstname, lastname, email, initials, salt, password, global) values (\"%s\",\"%s\", \"%s\", \"%s\", \"%s\", \"%s\", \"%s\", 1)",
		userID, completion.Firstname, completion.Lastname, completion.Email, stringutil.MakeInitials(completion.Firstname, completion.Lastname), salt, password)
	_, err = runSQL(rt, sql)

	if err != nil {
		rt.Log.Error("Failed with error", err)
		return err
	}

	// Link user to organization.
	accountID := uniqueid.Generate()
	sql = fmt.Sprintf("insert into account (refid, userid, orgid, `admin`, editor, users, analytics) values (\"%s\", \"%s\", \"%s\", 1, 1, 1, 1)", accountID, userID, orgID)
	_, err = runSQL(rt, sql)

	if err != nil {
		rt.Log.Error("Failed with error", err)
		return err
	}

	// create space
	labelID := uniqueid.Generate()
	sql = fmt.Sprintf("insert into label (refid, orgid, label, type, userid) values (\"%s\", \"%s\", \"My Project\", 2, \"%s\")", labelID, orgID, userID)
	_, err = runSQL(rt, sql)
	if err != nil {
		rt.Log.Error("insert into label failed", err)
	}

	// assign permissions to space
	perms := []string{"view", "manage", "own", "doc-add", "doc-edit", "doc-delete", "doc-move", "doc-copy", "doc-template", "doc-approve", "doc-version", "doc-lifecycle"}
	for _, p := range perms {
		sql = fmt.Sprintf("insert into permission (orgid, who, whoid, action, scope, location, refid) values (\"%s\", 'user', \"%s\", \"%s\", 'object', 'space', \"%s\")", orgID, userID, p, labelID)
		_, err = runSQL(rt, sql)
		if err != nil {
			rt.Log.Error("insert into permission failed", err)
		}
	}

	// Create some user groups
	groupDevID := uniqueid.Generate()
	sql = fmt.Sprintf("INSERT INTO role (refid, orgid, role, purpose) VALUES (\"%s\", \"%s\", \"Technology\", \"On-site and remote development teams\")", groupDevID, orgID)
	_, err = runSQL(rt, sql)
	if err != nil {
		rt.Log.Error("insert into role failed", err)
	}

	groupProjectID := uniqueid.Generate()
	sql = fmt.Sprintf("INSERT INTO role (refid, orgid, role, purpose) VALUES (\"%s\", \"%s\", \"Project Management\", \"HQ project management\")", groupProjectID, orgID)
	_, err = runSQL(rt, sql)
	if err != nil {
		rt.Log.Error("insert into role failed", err)
	}

	groupBackofficeID := uniqueid.Generate()
	sql = fmt.Sprintf("INSERT INTO role (refid, orgid, role, purpose) VALUES (\"%s\", \"%s\", \"Back Office\", \"Non-IT and PMO personnel\")", groupBackofficeID, orgID)
	_, err = runSQL(rt, sql)
	if err != nil {
		rt.Log.Error("insert into role failed", err)
	}

	// Join some groups
	sql = fmt.Sprintf("INSERT INTO rolemember (orgid, roleid, userid) VALUES (\"%s\", \"%s\", \"%s\")", orgID, groupDevID, userID)
	_, err = runSQL(rt, sql)
	if err != nil {
		rt.Log.Error("insert into rolemember failed", err)
	}
	sql = fmt.Sprintf("INSERT INTO rolemember (orgid, roleid, userid) VALUES (\"%s\", \"%s\", \"%s\")", orgID, groupProjectID, userID)
	_, err = runSQL(rt, sql)
	if err != nil {
		rt.Log.Error("insert into rolemember failed", err)
	}
	sql = fmt.Sprintf("INSERT INTO rolemember (orgid, roleid, userid) VALUES (\"%s\", \"%s\", \"%s\")", orgID, groupBackofficeID, userID)
	_, err = runSQL(rt, sql)
	if err != nil {
		rt.Log.Error("insert into rolemember failed", err)
	}

	return
}

// runSQL creates a transaction per call
func runSQL(rt *env.Runtime, sql string) (id uint64, err error) {
	if strings.TrimSpace(sql) == "" {
		return 0, nil
	}

	tx, err := rt.Db.Beginx()
	if err != nil {
		rt.Log.Error("runSql - failed to get transaction", err)
		return
	}

	result, err := tx.Exec(sql)

	if err != nil {
		tx.Rollback()
		rt.Log.Error("runSql - unable to run sql", err)
		return
	}

	if err = tx.Commit(); err != nil {
		rt.Log.Error("runSql - unable to commit sql", err)
		return
	}

	tempID, _ := result.LastInsertId()
	id = uint64(tempID)

	return
}
