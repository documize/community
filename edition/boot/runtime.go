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

// Package boot prepares runtime environment.
package boot

import (
	"strings"
	"time"

	"github.com/documize/community/core/database"
	"github.com/documize/community/core/env"
	"github.com/documize/community/core/secrets"
	"github.com/documize/community/server/web"
	"github.com/jmoiron/sqlx"
)

// InitRuntime prepares runtime using command line and environment variables.
func InitRuntime(r *env.Runtime) bool {
	// We need SALT to hash auth JWT tokens
	if r.Flags.Salt == "" {
		r.Flags.Salt = secrets.RandSalt()

		if r.Flags.Salt == "" {
			return false
		}

		r.Log.Info("please set DOCUMIZESALT or use -salt with this value: " + r.Flags.Salt)
	}

	// We can use either or both HTTP and HTTPS ports
	if r.Flags.SSLCertFile == "" && r.Flags.SSLKeyFile == "" {
		if r.Flags.HTTPPort == "" {
			r.Flags.HTTPPort = "80"
		}
	} else {
		if r.Flags.HTTPPort == "" {
			r.Flags.HTTPPort = "443"
		}
	}

	// Prepare DB
	db, err := sqlx.Open("mysql", stdConn(r.Flags.DBConn))
	if err != nil {
		r.Log.Error("unable to setup database", err)
	}

	r.Db = db
	r.Db.SetMaxIdleConns(30)
	r.Db.SetMaxOpenConns(100)
	r.Db.SetConnMaxLifetime(time.Second * 14400)

	err = r.Db.Ping()
	if err != nil {
		r.Log.Error("unable to connect to database, connection string should be of the form: '"+
			"username:password@tcp(host:3306)/database'", err)
		return false
	}

	// go into setup mode if required
	if r.Flags.SiteMode != web.SiteModeOffline {
		if database.Check(r) {
			if err := database.Migrate(*r, true /* the config table exists */); err != nil {
				r.Log.Error("unable to run database migration", err)
				return false
			}
		} else {
			r.Log.Info("going into setup mode to prepare new database")
		}
	}

	return true
}

var stdParams = map[string]string{
	"charset":          "utf8",
	"parseTime":        "True",
	"maxAllowedPacket": "4194304", // 4194304 // 16777216 = 16MB
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
