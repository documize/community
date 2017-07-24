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

package request

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/documize/community/core/api"
	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/env"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/streamutil"
	"github.com/jmoiron/sqlx"
)

// AddOrganization inserts the passed organization record into the organization table.
func (p *Persister) AddOrganization(org entity.Organization) error {
	org.Created = time.Now().UTC()
	org.Revised = time.Now().UTC()

	stmt, err := p.Context.Transaction.Preparex(
		"INSERT INTO organization (refid, company, title, message, url, domain, email, allowanonymousaccess, serial, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		log.Error("Unable to prepare insert for org", err)
		return err
	}

	res, err := stmt.Exec(org.RefID, org.Company, org.Title, org.Message, strings.ToLower(org.URL), strings.ToLower(org.Domain),
		strings.ToLower(org.Email), org.AllowAnonymousAccess, org.Serial, org.Created, org.Revised)

	if err != nil {
		log.Error("Unable to execute insert for org", err)
		return err
	}

	if num, e := res.RowsAffected(); e == nil {
		if num != 1 {
			e := fmt.Errorf("expecting to insert one row, but inserted %d", num)
			log.Error("Wrong numer of rows inserted for org:", e)
			return e
		}
	}

	return nil
}

// GetOrganization returns the Organization reocrod from the organization database table with the given id.
func (p *Persister) GetOrganization(id string) (org entity.Organization, err error) {
	stmt, err := Db.Preparex("SELECT id, refid, company, title, message, url, domain, service as conversionendpoint, email, serial, active, allowanonymousaccess, authprovider, coalesce(authconfig,JSON_UNQUOTE('{}')) as authconfig, created, revised FROM organization WHERE refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare select for org %s", id), err)
		return
	}

	err = stmt.Get(&org, id)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to get org %s", id), err)
		return
	}

	return
}

// GetOrganizationByDomain returns the organization matching a given URL subdomain.
func (p *Persister) GetOrganizationByDomain(subdomain string) (org entity.Organization, err error) {
	err = nil
	subdomain = strings.ToLower(subdomain)

	if api.Runtime.Flags.SiteMode == env.SiteModeNormal { // only return an organization when running normally

		var stmt *sqlx.Stmt

		stmt, err = Db.Preparex("SELECT id, refid, company, title, message, url, domain, service as conversionendpoint, email, serial, active, allowanonymousaccess, authprovider, coalesce(authconfig,JSON_UNQUOTE('{}')) as authconfig, created, revised FROM organization WHERE domain=? AND active=1")
		defer streamutil.Close(stmt)

		if err != nil {
			log.Error(fmt.Sprintf("Unable to prepare select for subdomain %s", subdomain), err)
			return
		}

		err = stmt.Get(&org, subdomain)

		if err != nil && err != sql.ErrNoRows {
			log.Error(fmt.Sprintf("Unable to execute select for subdomain %s", subdomain), err)
			return
		}

	}

	return
}

// UpdateOrganization updates the given organization record in the database to the values supplied.
func (p *Persister) UpdateOrganization(org entity.Organization) (err error) {
	org.Revised = time.Now().UTC()

	stmt, err := p.Context.Transaction.PrepareNamed("UPDATE organization SET title=:title, message=:message, service=:conversionendpoint, email=:email, allowanonymousaccess=:allowanonymousaccess, revised=:revised WHERE refid=:refid")
	defer streamutil.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare update for org %s", org.RefID), err)
		return
	}

	res, err := stmt.Exec(&org)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute update for org %s", org.RefID), err)
		return
	}

	if num, e := res.RowsAffected(); e == nil {
		if num != 1 {
			e := fmt.Errorf("expecting to update one row, but updated %d", num)
			log.Error("Wrong numer of rows updated for org:", e)
			return e
		}
	}

	return
}

// DeleteOrganization deletes the orgID organization from the organization table.
func (p *Persister) DeleteOrganization(orgID string) (rows int64, err error) {
	return p.Base.Delete(p.Context.Transaction, "organization", orgID)
}

// RemoveOrganization sets the orgID organization to be inactive, thus executing a "soft delete" operation.
func (p *Persister) RemoveOrganization(orgID string) (err error) {
	stmt, err := p.Context.Transaction.Preparex("UPDATE organization SET active=0 WHERE refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare soft delete for org %s", orgID), err)
		return
	}

	res, err := stmt.Exec(orgID)

	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute soft delete for org %s", orgID), err)
		return
	}

	if num, e := res.RowsAffected(); e == nil {
		if num != 1 {
			e := fmt.Errorf("expecting to update one row to remove an organization, but updated %d", num)
			log.Error("Wrong numer of rows updated for org:", e)
			return e
		}
	}

	return
}

// UpdateAuthConfig updates the given organization record in the database with the auth config details.
func (p *Persister) UpdateAuthConfig(org entity.Organization) (err error) {
	org.Revised = time.Now().UTC()

	stmt, err := p.Context.Transaction.PrepareNamed("UPDATE organization SET allowanonymousaccess=:allowanonymousaccess, authprovider=:authprovider, authconfig=:authconfig, revised=:revised WHERE refid=:refid")
	if err != nil {
		log.Error(fmt.Sprintf("Unable to prepare UpdateAuthConfig %s", org.RefID), err)
		return
	}

	defer streamutil.Close(stmt)

	_, err = stmt.Exec(&org)
	if err != nil {
		log.Error(fmt.Sprintf("Unable to execute UpdateAuthConfig %s", org.RefID), err)
		return
	}

	return
}

// CheckDomain makes sure there is an organisation with the correct domain
func CheckDomain(domain string) string {
	row := Db.QueryRow("SELECT COUNT(*) FROM organization WHERE domain=? AND active=1", domain)

	var count int
	err := row.Scan(&count)

	if err != nil {
		return ""
	}

	if count == 1 {
		return domain
	}

	return ""
}
