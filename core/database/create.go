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

	"github.com/documize/community/core/api/util"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/utility"
	"github.com/documize/community/core/web"
)

// runSQL creates a transaction per call
func runSQL(sql string) (id uint64, err error) {

	if strings.TrimSpace(sql) == "" {
		return 0, nil
	}

	tx, err := (*dbPtr).Beginx()

	if err != nil {
		log.Error("runSql - failed to get transaction", err)
		return
	}

	result, err := tx.Exec(sql)

	if err != nil {
		log.IfErr(tx.Rollback())
		log.Error("runSql - unable to run sql", err)
		return
	}

	if err = tx.Commit(); err != nil {
		log.Error("runSql - unable to commit sql", err)
		return
	}

	tempID, _ := result.LastInsertId()
	id = uint64(tempID)

	return
}

// Create the tables in a blank database
func Create(w http.ResponseWriter, r *http.Request) {

	defer func() {
		target := "/setup"
		status := http.StatusBadRequest

		if web.SiteMode == web.SiteModeNormal {
			target = "/"
			status = http.StatusOK
		}

		req, err := http.NewRequest("GET", target, nil)

		if err != nil {
			log.Error("database.Create()'s error in defer ", err)
		}

		http.Redirect(w, req, target, status)
	}()

	err := r.ParseForm()
	if err != nil {
		log.Error("database.Create()'s r.ParseForm()", err)
		return
	}

	dbname := r.Form.Get("dbname")
	dbhash := r.Form.Get("dbhash")

	if dbname != web.SiteInfo.DBname || dbhash != web.SiteInfo.DBhash {
		log.Error("database.Create()'s security credentials error ", errors.New("bad db name or validation code"))
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
		Revised:     time.Now(),
	}

	if details.Company == "" ||
		details.CompanyLong == "" ||
		details.Message == "" ||
		details.Email == "" ||
		details.Password == "" ||
		details.Firstname == "" ||
		details.Lastname == "" {
		log.Error("database.Create() error ",
			errors.New("required field in database set-up form blank"))
		return
	}

	if err = Migrate(false /* no tables exist yet */); err != nil {
		log.Error("database.Create()", err)
		return
	}

	err = setupAccount(details, util.GenerateSalt())
	if err != nil {
		log.Error("database.Create()", err)
		return
	}

	web.SiteMode = web.SiteModeNormal
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
func setupAccount(completion onboardRequest, serial string) (err error) {
	//accountTitle := "This is where you will find documentation for your all projects. You can customize this message from the settings screen."
	salt := util.GenerateSalt()
	password := util.GeneratePassword(completion.Password, salt)

	// Allocate organization to the user.
	orgID := util.UniqueID()

	sql := fmt.Sprintf("insert into organization (refid, company, title, message, domain, email, serial) values (\"%s\", \"%s\", \"%s\", \"%s\", \"%s\", \"%s\", \"%s\")",
		orgID, completion.Company, completion.CompanyLong, completion.Message, completion.URL, completion.Email, serial)
	_, err = runSQL(sql)

	if err != nil {
		log.Error("Failed to insert into organization", err)
		return
	}

	userID := util.UniqueID()

	sql = fmt.Sprintf("insert into user (refid, firstname, lastname, email, initials, salt, password, global) values (\"%s\",\"%s\", \"%s\", \"%s\", \"%s\", \"%s\", \"%s\", 1)",
		userID, completion.Firstname, completion.Lastname, completion.Email, utility.MakeInitials(completion.Firstname, completion.Lastname), salt, password)
	_, err = runSQL(sql)

	if err != nil {
		log.Error("Failed with error", err)
		return err
	}

	// Link user to organization.
	accountID := util.UniqueID()
	sql = fmt.Sprintf("insert into account (refid, userid, orgid, admin, editor) values (\"%s\", \"%s\", \"%s\",1, 1)", accountID, userID, orgID)
	_, err = runSQL(sql)

	if err != nil {
		log.Error("Failed with error", err)
		return err
	}

	// Set up default labels for main collection.
	labelID := util.UniqueID()
	sql = fmt.Sprintf("insert into label (refid, orgid, label, type, userid) values (\"%s\", \"%s\", \"My Project\", 2, \"%s\")", labelID, orgID, userID)
	_, err = runSQL(sql)

	if err != nil {
		log.Error("insert into label failed", err)
	}

	labelRoleID := util.UniqueID()
	sql = fmt.Sprintf("insert into labelrole (refid, labelid, orgid, userid, canview, canedit) values (\"%s\", \"%s\", \"%s\", \"%s\", 1, 1)", labelRoleID, labelID, orgID, userID)
	_, err = runSQL(sql)

	if err != nil {
		log.Error("insert into labelrole failed", err)
	}

	return
}
