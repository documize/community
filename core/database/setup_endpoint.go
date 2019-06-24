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
	"encoding/json"
	"encoding/xml"
	"errors"
	"net/http"
	"time"

	"github.com/documize/community/core/api/plugins"
	"github.com/documize/community/core/env"
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/server/web"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
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
		URL:           "",
		Company:       r.Form.Get("title"),
		CompanyLong:   r.Form.Get("title"),
		Message:       r.Form.Get("message"),
		Email:         r.Form.Get("email"),
		Password:      r.Form.Get("password"),
		Firstname:     r.Form.Get("firstname"),
		Lastname:      r.Form.Get("lastname"),
		ActivationKey: r.Form.Get("activationKey"),
		Revised:       time.Now().UTC(),
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
	URL           string
	Company       string
	CompanyLong   string
	Message       string
	Email         string
	Password      string
	Firstname     string
	Lastname      string
	ActivationKey string
	Revised       time.Time
}

// setupAccount prepares the database for a newly onboard customer.
// Once done, they can then login and use Documize.
func setupAccount(rt *env.Runtime, completion onboardRequest, serial string) (err error) {
	tx, err := rt.Db.Beginx()
	if err != nil {
		rt.Log.Error("setup - failed to get transaction", err)
		return
	}

	salt := secrets.GenerateSalt()
	password := secrets.GeneratePassword(completion.Password, salt)

	// Process activation key if we have one.
	activationKey := processActivationKey(rt, completion)

	// Allocate organization to the user.
	orgID := uniqueid.Generate()
	_, err = tx.Exec(RebindParams("INSERT INTO dmz_org (c_refid, c_company, c_title, c_message, c_domain, c_email, c_serial, c_sub) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		rt.StoreProvider.Type()),
		orgID, completion.Company, completion.CompanyLong, completion.Message, completion.URL, completion.Email, serial, activationKey)
	if err != nil {
		rt.Log.Error("INSERT INTO dmz_org failed", err)
		rt.Rollback(tx)
		return
	}

	// Create user.
	userID := uniqueid.Generate()
	_, err = tx.Exec(RebindParams("INSERT INTO dmz_user (c_refid, c_firstname, c_lastname, c_email, c_initials, c_salt, c_password, c_globaladmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", rt.StoreProvider.Type()),
		userID, completion.Firstname, completion.Lastname, completion.Email, stringutil.MakeInitials(completion.Firstname, completion.Lastname), salt, password, true)
	if err != nil {
		rt.Log.Error("INSERT INTO dmz_user failed", err)
		rt.Rollback(tx)
		return
	}

	// Link user to organization.
	accountID := uniqueid.Generate()
	_, err = tx.Exec(RebindParams("INSERT INTO dmz_user_account (c_refid, c_userid, c_orgid, c_admin, c_editor, c_users, c_analytics) VALUES (?, ?, ?, ?, ?, ?, ?)", rt.StoreProvider.Type()),
		accountID, userID, orgID, true, true, true, true)
	if err != nil {
		rt.Log.Error("INSERT INTO dmz_user_account failed", err)
		rt.Rollback(tx)
		return
	}

	// Finish up.
	if err = tx.Commit(); err != nil {
		rt.Log.Error("setup - unable to commit sql", err)
		return
	}

	return
}

func processActivationKey(rt *env.Runtime, or onboardRequest) (key string) {
	key = "{}"
	if len(or.ActivationKey) == 0 {
		return
	}

	j := domain.SubscriptionData{}
	x := domain.SubscriptionXML{Key: "", Signature: ""}

	err1 := xml.Unmarshal([]byte(or.ActivationKey), &x)
	if err1 == nil {
		j.Key = x.Key
		j.Signature = x.Signature
	} else {
		rt.Log.Error("failed to XML unmarshal subscription XML", err1)
	}

	d, err2 := json.Marshal(j)
	if err2 == nil {
		key = string(d)
	} else {
		rt.Log.Error("failed to JSON marshal subscription XML", err2)
	}

	return
}
