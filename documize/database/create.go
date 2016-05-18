package database

import (
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/documize/community/documize/api/util"
	"github.com/documize/community/documize/web"
	"github.com/documize/community/wordsmith/log"
	"github.com/documize/community/wordsmith/utility"
)

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
		tx.Rollback() // ignore error as already in an error state
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
	txt := "database.Create()"
	//defer func(){fmt.Println("DEBUG"+txt)}()

	if dbCheckOK {
		txt += " Check OK"
	} else {
		txt += " Check not OK"
	}

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

	txt += fmt.Sprintf("\n%#v\n", r.Form)

	dbname := r.Form.Get("dbname")
	dbhash := r.Form.Get("dbhash")

	txt += fmt.Sprintf("DBname:%s (want:%s) DBhash: %s (want:%s)\n",
		dbname, web.SiteInfo.DBname, dbhash, web.SiteInfo.DBhash)

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

	txt += fmt.Sprintf("\n%#v\n", details)

	if details.Company == "" ||
		details.CompanyLong == "" ||
		details.Message == "" ||
		details.Email == "" ||
		details.Password == "" ||
		details.Firstname == "" ||
		details.Lastname == "" {
		txt += "ERROR: required field blank"
		return
	}

	firstSQL := "db_00000.sql"

	buf, err := web.ReadFile("scripts/" + firstSQL)
	if err != nil {
		log.Error("database.Create()'s web.ReadFile()", err)
		return
	}

	tx, err := (*dbPtr).Beginx()
	if err != nil {
		log.Error(" failed to get transaction", err)
		return
	}

	stmts := getStatements(buf)

	for i, stmt := range stmts {
		_, err = tx.Exec(stmt)
		txt += fmt.Sprintf("%d: %s\nResult: %v\n\n", i, stmt, err)
		if err != nil {
			tx.Rollback() // ignore error as already in an error state
			log.Error("database.Create() unable to run table create sql", err)
			return
		}
	}

	err = tx.Commit()
	if err != nil {
		log.Error("database.Create()", err)
		return
	}

	if err := Migrate(firstSQL); err != nil {
		log.Error("database.Create()", err)
		return
	}

	err = setupAccount(details, util.GenerateSalt())
	if err != nil {
		log.Error("database.Create()", err)
		return
	}

	web.SiteMode = web.SiteModeNormal
	txt += "\n Success!\n"
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

	sql = fmt.Sprintf("insert into user (refid, firstname, lastname, email, initials, salt, password) values (\"%s\",\"%s\", \"%s\", \"%s\", \"%s\", \"%s\", \"%s\")",
		userID, completion.Firstname, completion.Lastname, completion.Email, utility.MakeInitials(completion.Firstname, completion.Lastname), salt, password)
	_, err = runSQL(sql)

	if err != nil {
		log.Error("Failed with error", err)
		return err
	}
	//}

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

// getStatement strips out the comments and returns all the individual SQL commands (apart from "USE") as a []string.
func getStatements(bytes []byte) []string {
	/* Strip comments of the form '-- comment' or like this one */
	stripped := regexp.MustCompile("(?s)--.*?\n|/\\*.*?\\*/").ReplaceAll(bytes, []byte("\n"))
	sqls := strings.Split(string(stripped), ";")
	ret := make([]string, 0, len(sqls))
	for _, v := range sqls {
		trimmed := strings.TrimSpace(v)
		if len(trimmed) > 0 &&
			!strings.HasPrefix(strings.ToUpper(trimmed), "USE ") { // make sure we don't USE the wrong database
			ret = append(ret, trimmed+";")
		}
	}
	return ret
}
