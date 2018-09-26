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
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/org"
	"github.com/pkg/errors"
)

// Store provides data access to organization (tenant) information.
type Store struct {
	store.Context
	domain.OrganizationStorer
}

// AddOrganization inserts the passed organization record into the organization table.
func (s Store) AddOrganization(ctx domain.RequestContext, org org.Organization) (err error) {
	org.Created = time.Now().UTC()
	org.Revised = time.Now().UTC()

	_, err = ctx.Transaction.Exec(
		s.Bind("INSERT INTO dmz_org (c_refid, c_company, c_title, c_message, c_domain, c_email, c_anonaccess, c_serial, c_maxtags, c_created, c_revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"),
		org.RefID, org.Company, org.Title, org.Message, strings.ToLower(org.Domain),
		strings.ToLower(org.Email), org.AllowAnonymousAccess, org.Serial, org.MaxTags, org.Created, org.Revised)

	if err != nil {
		err = errors.Wrap(err, "unable to execute insert for org")
	}

	return nil
}

// GetOrganization returns the Organization reocrod from the organization database table with the given id.
func (s Store) GetOrganization(ctx domain.RequestContext, id string) (org org.Organization, err error) {
	stmt, err := s.Runtime.Db.Preparex(s.Bind(`SELECT id, c_refid AS refid,
        c_title AS title, c_message AS message, c_domain AS domain,
        c_service AS conversionendpoint, c_email AS email, c_serial AS serial, c_active AS active,
        c_anonaccess AS allowanonymousaccess, c_authprovider AS authprovider,
        coalesce(c_authconfig,` + s.EmptyJSON() + `) AS authconfig, c_maxtags AS maxtags,
        c_created AS created, c_revised AS revised
        FROM dmz_org
        WHERE c_refid=?`))
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
// No context is required because user might not be authenticated yet.
func (s Store) GetOrganizationByDomain(subdomain string) (o org.Organization, err error) {
	err = nil
	subdomain = strings.TrimSpace(strings.ToLower(subdomain))

	// only return an organization when running normally
	if s.Runtime.Flags.SiteMode != env.SiteModeNormal {
		err = errors.New("database not in normal mode so cannot fetch meta for " + subdomain)
		return
	}

	// match on given domain name
	err = s.Runtime.Db.Get(&o, s.Bind(`SELECT id, c_refid AS refid,
        c_title AS title, c_message AS message, c_domain AS domain,
        c_service AS conversionendpoint, c_email AS email, c_serial AS serial, c_active AS active,
        c_anonaccess AS allowanonymousaccess, c_authprovider AS authprovider,
        coalesce(c_authconfig,`+s.EmptyJSON()+`) AS authconfig, c_maxtags AS maxtags,
        c_created AS created, c_revised AS revised
        FROM dmz_org
        WHERE c_domain=? AND c_active=1`),
		subdomain)
	if err == nil {
		return
	}
	fmt.Println(err)
	err = nil

	// match on empty domain AS last resort
	err = s.Runtime.Db.Get(&o, s.Bind(`SELECT id, c_refid AS refid,
        c_title AS title, c_message AS message, c_domain AS domain,
        c_service AS conversionendpoint, c_email AS email, c_serial AS serial, c_active AS active,
        c_anonaccess AS allowanonymousaccess, c_authprovider AS authprovider,
        coalesce(c_authconfig,`+s.EmptyJSON()+`) AS authconfig, c_maxtags AS maxtags,
        c_created AS created, c_revised AS revised
        FROM dmz_org
        WHERE c_domain='' AND c_active=1`))

	if err != nil && err != sql.ErrNoRows {
		err = errors.Wrap(err, "unable to execute select for empty subdomain")
	}

	return
}

// UpdateOrganization updates the given organization record in the database to the values supplied.
func (s Store) UpdateOrganization(ctx domain.RequestContext, org org.Organization) (err error) {
	org.Revised = time.Now().UTC()

	_, err = ctx.Transaction.NamedExec(`UPDATE dmz_org SET
        c_title=:title, c_message=:message, c_service=:conversionendpoint, c_email=:email,
        c_anonaccess=:allowanonymousaccess, c_maxtags=:maxtags, c_revised=:revised
        WHERE c_refid=:refid`,
		&org)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute update for org %s", org.RefID))
	}

	return
}

// DeleteOrganization deletes the orgID organization from the organization table.
func (s Store) DeleteOrganization(ctx domain.RequestContext, orgID string) (rows int64, err error) {
	return s.Delete(ctx.Transaction, "dmz_org", orgID)
}

// RemoveOrganization sets the orgID organization to be inactive, thus executing a "soft delete" operation.
func (s Store) RemoveOrganization(ctx domain.RequestContext, orgID string) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind("UPDATE dmz_org SET c_active=0 WHERE c_refid=?"), orgID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute soft delete for org %s", orgID))
	}

	return
}

// UpdateAuthConfig updates the given organization record in the database with the auth config details.
func (s Store) UpdateAuthConfig(ctx domain.RequestContext, org org.Organization) (err error) {
	org.Revised = time.Now().UTC()

	_, err = ctx.Transaction.NamedExec(`UPDATE dmz_org SET
        c_anonaccess=:allowanonymousaccess, c_authprovider=:authprovider, c_authconfig=:authconfig,
        c_revised=:revised
        WHERE c_refid=:refid`,
		&org)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to execute UpdateAuthConfig %s", org.RefID))
	}

	return
}

// CheckDomain makes sure there is an organisation with the correct domain
func (s Store) CheckDomain(ctx domain.RequestContext, domain string) string {
	row := s.Runtime.Db.QueryRow(s.Bind("SELECT COUNT(*) FROM dmz_org WHERE c_domain=? AND c_active=1"), domain)

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
