package request

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/jmoiron/sqlx"

	"github.com/documize/community/documize/database"
	"github.com/documize/community/wordsmith/environment"
	"github.com/documize/community/wordsmith/log"
	"github.com/documize/community/wordsmith/utility"
)

var connectionString string

// Db is the central connection to the database, used by all database requests.
var Db *sqlx.DB

var searches *SearchManager

type databaseRequest struct {
	Transaction *sqlx.Tx
	OrgID       string
}

func (dr *databaseRequest) MakeTx() (err error) {
	if dr.Transaction != nil {
		return nil
	}
	dr.Transaction, err = Db.Beginx()
	return err
}

func init() {
	var err error
	var upgrade = "false"

	environment.GetString(&upgrade, "upgrade", false,
		"to upgrade the database set to 'true' (only this Documize binary must be running)", nil)

	environment.GetString(&connectionString, "db", true,
		`"username:password@protocol(hostname:port)/databasename" for example "fred:bloggs@tcp(localhost:3306)/documize"`,
		func(*string, string) bool {
			Db, err = sqlx.Open("mysql", stdConn(connectionString))

			if err != nil {
				log.Error("Unable to setup database", err)
			}

			database.DbPtr = &Db // allow the database package to see this DB connection

			Db.SetMaxIdleConns(30)
			Db.SetMaxOpenConns(100)

			err = Db.Ping()

			if err != nil {
				log.Error("Unable to connect to database, connection string should be of the form: '"+
					"username:password@tcp(host:3306)/database'", err)
				os.Exit(2)
			}

			// go into setup mode if required
			if database.Check(Db, connectionString) {
				log.Info("database.Check(Db) OK")
			} else {
				log.Info("database.Check(Db) !OK, going into setup mode")
			}

			migrations, err := database.Migrations(ConfigString("DATABASE", "last_migration"))
			if err != nil {
				log.Error("Unable to find required database migrations: ", err)
				os.Exit(2)
			}
			if len(migrations) > 0 {
				if strings.ToLower(upgrade) != "true" {
					log.Error("database migrations are required",
						errors.New("the -upgrade flag is not 'true'"))
					os.Exit(2)

				}
				if err := migrations.Migrate(); err != nil {
					log.Error("Unable to run database migration: ", err)
					os.Exit(2)
				}
			}

			return false // value not changed
		})
}

var stdParams = map[string]string{
	"charset":   "utf8",
	"parseTime": "True",
}

func stdConn(cs string) string {
	queryBits := strings.Split(cs, "?")
	ret := queryBits[0] + "?"
	retFirst := true
	if len(queryBits) == 2 {
		paramBits := strings.Split(queryBits[1], "&")
		for _, pb := range paramBits {
			found := false
			if assignBits := strings.Split(pb, "="); len(assignBits) == 2 {
				_, found = stdParams[strings.TrimSpace(assignBits[0])]
			}
			if !found { // if we can't work out what it is, put it through
				if retFirst {
					retFirst = false
				} else {
					ret += "&"
				}
				ret += pb
			}
		}
	}
	for k, v := range stdParams {
		if retFirst {
			retFirst = false
		} else {
			ret += "&"
		}
		ret += k + "=" + v
	}
	return ret
}

type baseManager struct {
}

func (m *baseManager) Delete(tx *sqlx.Tx, table string, id string) (rows int64, err error) {

	err = nil

	stmt, err := tx.Preparex("DELETE FROM " + table + " WHERE refid=?")
	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare delete of row in table %s", table), err)
		return
	}
	defer utility.Close(stmt)

	result, err := stmt.Exec(id)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to delete row in table %s", table), err)
		return
	}

	rows, err = result.RowsAffected()

	return
}

func (m *baseManager) DeleteConstrained(tx *sqlx.Tx, table string, orgID, id string) (rows int64, err error) {
	stmt, err := tx.Preparex("DELETE FROM " + table + " WHERE orgid=? AND refid=?")
	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare constrained delete of row in table %s", table), err)
		return
	}
	defer utility.Close(stmt)

	result, err := stmt.Exec(orgID, id)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to delete row in table %s", table), err)
		return
	}

	rows, err = result.RowsAffected()

	return
}

func (m *baseManager) DeleteConstrainedWithID(tx *sqlx.Tx, table string, orgID, id string) (rows int64, err error) {
	stmt, err := tx.Preparex("DELETE FROM " + table + " WHERE orgid=? AND id=?")
	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare ConstrainedWithID delete of row in table %s", table), err)
		return
	}
	defer utility.Close(stmt)

	result, err := stmt.Exec(orgID, id)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to delete row in table %s", table), err)
		return
	}

	rows, err = result.RowsAffected()

	return
}

func (m *baseManager) DeleteWhere(tx *sqlx.Tx, statement string) (rows int64, err error) {
	result, err := tx.Exec(statement)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to delete rows: %s", statement), err)
		return
	}

	rows, err = result.RowsAffected()

	return
}

// Audit inserts a record into the audit table.
func (m *baseManager) Audit(c Context, action, document, page string) {

	_, err := Db.Exec("INSERT INTO audit (orgid, userid, documentid, pageid, action) VALUES (?,?,?,?,?)", c.OrgID, c.UserID, document, page, action)

	if err != nil {
		log.Error(fmt.Sprintf("Unable record audit for action %s, user %s, customer %s", action, c.UserID, c.OrgID), err)
	}
}

// SQLPrepareError returns a string detailing the location of the error.
func (m *baseManager) SQLPrepareError(method string, id string) string {
	return fmt.Sprintf("Unable to prepare SQL for %s, ID %s", method, id)
}

// SQLSelectError returns a string detailing the location of the error.
func (m *baseManager) SQLSelectError(method string, id string) string {
	return fmt.Sprintf("Unable to execute SQL for %s, ID %s", method, id)
}
