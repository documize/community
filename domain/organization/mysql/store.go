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

package organization

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store/mysql"
	"github.com/documize/community/model/org"
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
)

// Scope provides data access to MySQL.
type Scope struct {
	Runtime *env.Runtime
}

// AddOrganization inserts the passed organization record into the organization table.
func (s Scope) AddOrganization(ctx domain.RequestContext, org org.Organization) error {
	org.Created = time.Now().UTC()
	org.Revised = time.Now().UTC()

	stmt, err := ctx.Transaction.Preparex(
		"INSERT INTO organization (refid, company, title, message, url, domain, email, allowanonymousaccess, serial, created, revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, "unable to prepare insert for org")
		return err
	}

	_, err = stmt.Exec(org.RefID, org.Company, org.Title, org.Message, strings.ToLower(org.URL), strings.ToLower(org.Domain),
		strings.ToLower(org.Email), org.AllowAnonymousAccess, org.Serial, org.Created, org.Revised)

	if err != nil {
		err = errors.Wrap(err, "unable to execute insert for org")
		return err
	}

	return nil
}

// GetOrganization returns the Organization reocrod from the organization database table with the given id.
func (s Scope) GetOrganization(ctx domain.RequestContext, id string) (org org.Organization, err error) {
	stmt, err := s.Runtime.Db.Preparex("SELECT id, refid, company, title, message, url, domain, service as conversionendpoint, email, serial, active, allowanonymousaccess, authprovider, coalesce(authconfig,JSON_UNQUOTE('{}')) as authconfig, created, revised FROM organization WHERE refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to prepare select for org %s", id))
		return
	}

	err = stmt.Get(&org, id)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to get org %s", id))
		return
	}

	return
}

// GetOrganizationByDomain returns the organization matching a given URL subdomain.
// No context is required because user might no be authenticated yet.
func (s Scope) GetOrganizationByDomain(subdomain string) (org org.Organization, err error) {
	err = nil
	subdomain = strings.TrimSpace(strings.ToLower(subdomain))

	if s.Runtime.Flags.SiteMode == env.SiteModeNormal { // only return an organization when running normally
		var stmt *sqlx.Stmt

		stmt, err = s.Runtime.Db.Preparex("SELECT id, refid, company, title, message, url, domain, service as conversionendpoint, email, serial, active, allowanonymousaccess, authprovider, coalesce(authconfig,JSON_UNQUOTE('{}')) as authconfig, created, revised FROM organization WHERE domain=? AND active=1")
		defer streamutil.Close(stmt)

		if err != nil {
			err = errors.Wrap(err, fmt.Sprintf("unable to prepare select for subdomain %s", subdomain))
			return
		}

		err = stmt.Get(&org, subdomain)

		if err != nil && err != sql.ErrNoRows {
			err = errors.Wrap(err, fmt.Sprintf("unable to execute select for subdomain %s", subdomain))
			return
		}
	}

	return
}

// UpdateOrganization updates the given organization record in the database to the values supplied.
func (s Scope) UpdateOrganization(ctx domain.RequestContext, org org.Organization) (err error) {
	org.Revised = time.Now().UTC()

	stmt, err := ctx.Transaction.PrepareNamed("UPDATE organization SET title=:title, message=:message, service=:conversionendpoint, email=:email, allowanonymousaccess=:allowanonymousaccess, revised=:revised WHERE refid=:refid")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to prepare update for org %s", org.RefID))
		return
	}

	_, err = stmt.Exec(&org)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute update for org %s", org.RefID))
		return
	}

	return
}

// DeleteOrganization deletes the orgID organization from the organization table.
func (s Scope) DeleteOrganization(ctx domain.RequestContext, orgID string) (rows int64, err error) {
	b := mysql.BaseQuery{}
	return b.Delete(ctx.Transaction, "organization", orgID)
}

// RemoveOrganization sets the orgID organization to be inactive, thus executing a "soft delete" operation.
func (s Scope) RemoveOrganization(ctx domain.RequestContext, orgID string) (err error) {
	stmt, err := ctx.Transaction.Preparex("UPDATE organization SET active=0 WHERE refid=?")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to prepare soft delete for org %s", orgID))
		return
	}

	_, err = stmt.Exec(orgID)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute soft delete for org %s", orgID))
		return
	}

	return
}

// UpdateAuthConfig updates the given organization record in the database with the auth config details.
func (s Scope) UpdateAuthConfig(ctx domain.RequestContext, org org.Organization) (err error) {
	org.Revised = time.Now().UTC()

	stmt, err := ctx.Transaction.PrepareNamed("UPDATE organization SET allowanonymousaccess=:allowanonymousaccess, authprovider=:authprovider, authconfig=:authconfig, revised=:revised WHERE refid=:refid")
	defer streamutil.Close(stmt)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to prepare UpdateAuthConfig %s", org.RefID))
		return
	}

	_, err = stmt.Exec(&org)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute UpdateAuthConfig %s", org.RefID))
		return
	}

	return
}

// CheckDomain makes sure there is an organisation with the correct domain
func (s Scope) CheckDomain(ctx domain.RequestContext, domain string) string {
	row := s.Runtime.Db.QueryRow("SELECT COUNT(*) FROM organization WHERE domain=? AND active=1", domain)

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
