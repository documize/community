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
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/org"
	"github.com/pkg/errors"
)

// Store provides data access to organization (tenant) information.
type Store struct {
	store.Context
	store.OrganizationStorer
}

// AddOrganization inserts the passed organization record into the organization table.
func (s Store) AddOrganization(ctx domain.RequestContext, o org.Organization) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind("INSERT INTO dmz_org (c_refid, c_company, c_title, c_message, c_domain, c_email, c_anonaccess, c_serial, c_maxtags, c_sub, c_created, c_revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"),
		o.RefID, o.Company, o.Title, o.Message, strings.ToLower(o.Domain),
		strings.ToLower(o.Email), o.AllowAnonymousAccess, o.Serial, o.MaxTags,
		o.Subscription, o.Created, o.Revised)

	if err != nil {
		err = errors.Wrap(err, "unable to execute insert for org")
	}

	return nil
}

// GetOrganization returns the Organization record from the organization database table with the given id.
func (s Store) GetOrganization(ctx domain.RequestContext, id string) (org org.Organization, err error) {
	err = s.Runtime.Db.Get(&org, s.Bind(`SELECT id, c_refid AS refid,
        c_title AS title, c_message AS message, c_domain AS domain,
        c_service AS conversionendpoint, c_email AS email, c_serial AS serial, c_active AS active,
        c_anonaccess AS allowanonymousaccess, c_authprovider AS authprovider,
        coalesce(c_authconfig,`+s.EmptyJSON()+`) AS authconfig,
	    coalesce(c_sub,`+s.EmptyJSON()+`) AS subscription,
        c_maxtags AS maxtags, c_theme AS theme, c_locale as locale, c_created AS created, c_revised AS revised
        FROM dmz_org
        WHERE c_refid=?`),
		id)

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
        coalesce(c_authconfig,`+s.EmptyJSON()+`) AS authconfig,
	    coalesce(c_sub,`+s.EmptyJSON()+`) AS subscription,
        c_maxtags AS maxtags, c_theme AS theme, c_locale as locale, c_created AS created, c_revised AS revised, c_theme AS theme
        FROM dmz_org
        WHERE c_domain=? AND c_active=`+s.IsTrue()),
		subdomain)
	if err == nil {
		return
	}

	// match on empty domain AS last resort
	err = s.Runtime.Db.Get(&o, s.Bind(`SELECT id, c_refid AS refid,
        c_title AS title, c_message AS message, c_domain AS domain,
        c_service AS conversionendpoint, c_email AS email, c_serial AS serial, c_active AS active,
        c_anonaccess AS allowanonymousaccess, c_authprovider AS authprovider,
        coalesce(c_authconfig,`+s.EmptyJSON()+`) AS authconfig,
	    coalesce(c_sub,`+s.EmptyJSON()+`) AS subscription,
        c_maxtags AS maxtags, c_theme AS theme, c_locale as locale, c_created AS created, c_revised AS revised, c_theme AS theme
        FROM dmz_org
        WHERE c_domain='' AND c_active=`+s.IsTrue()))

	if err != nil && err != sql.ErrNoRows {
		err = errors.Wrap(err, "unable to execute select for empty subdomain")
	}

	return
}

// UpdateOrganization updates the given organization record in the database to the values supplied.
func (s Store) UpdateOrganization(ctx domain.RequestContext, org org.Organization) (err error) {
	org.Revised = time.Now().UTC()

	_, err = ctx.Transaction.NamedExec(`UPDATE dmz_org SET
        c_title=:title, c_message=:message, c_service=:conversionendpoint, c_email=:email, c_domain=:domain,
        c_anonaccess=:allowanonymousaccess, c_maxtags=:maxtags, c_theme=:theme, c_locale=:locale, c_revised=:revised
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
	_, err = ctx.Transaction.Exec(s.Bind("UPDATE dmz_org SET c_active="+s.IsFalse()+"  WHERE c_refid=?"), orgID)

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
	row := s.Runtime.Db.QueryRow(s.Bind("SELECT COUNT(*) FROM dmz_org WHERE c_domain=? AND c_active="+s.IsTrue()), domain)

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

// Logo fetchs stored image from store or NULL.
func (s Store) Logo(ctx domain.RequestContext, domain string) (l []byte, err error) {
	row := s.Runtime.Db.QueryRow(s.Bind("SELECT c_logo FROM dmz_org WHERE c_domain=? AND c_active="+s.IsTrue()), domain)

	err = row.Scan(&l)
	if err == sql.ErrNoRows {
		err = nil
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return l, nil
}

// UploadLogo saves custom logo to the organization record.
func (s Store) UploadLogo(ctx domain.RequestContext, logo []byte) (err error) {
	_, err = ctx.Transaction.Exec(s.Bind("UPDATE dmz_org SET c_logo=?, c_revised=? WHERE c_refid=?"),
		logo, time.Now().UTC(), ctx.OrgID)

	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to save custom logo for org %s", ctx.OrgID))
	}

	return
}
