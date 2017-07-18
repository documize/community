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

// This file contains the code for initial set-up of a database

import (
	"github.com/documize/community/core/api/entity"
	"github.com/documize/community/core/uniqueid"
)

// SetupPersister prepares context for database activity.
func SetupPersister() (*Persister, error) {
	var err error
	c := Context{
		Authenticated: true,                // bool
		Guest:         false,               // bool
		Administrator: true,                // bool
		Editor:        true,                // bool
		UserID:        uniqueid.Generate(), // string
		OrgID:         uniqueid.Generate(), // string
		//OrgURL:               "http://wwww.test.org",    // string
		//OrgName:              "TestOrgName",          // string
		AllowAnonymousAccess: false, // bool
		//AppURL:               "https://documize.com", // string // e.g. https://{url}.documize.com
		//Expires              time.Time
		//Transaction: &sqlx.Tx{},
	}

	p := &Persister{Context: c}
	p.Context.Transaction, err = Db.Beginx()
	return p, err
}

// SetupOrganization creates "tenant" record in database.
func (p *Persister) SetupOrganization(company, title, message, domain, email string) (entity.Organization, error) {
	org := entity.Organization{
		BaseEntity: entity.BaseEntity{RefID: p.Context.OrgID},
		Company:    company, // string `json:"-"`
		Title:      title,   // string `json:"title"`
		Message:    message, // string `json:"message"`
		//URL:                  "test.domain",           // string `json:"url"`
		Domain:               domain, // string `json:"domain"`
		Email:                email,  // string `json:"email"`
		AllowAnonymousAccess: false,  // bool   `json:"allowAnonymousAccess"`
		//Serial:               "123",                   // string `json:"-"`
		Active: true, // bool   `json:"-"`
	}
	err := p.AddOrganization(org)
	if err != nil {
		return org, err
	}
	err = p.Context.Transaction.Commit()
	if err != nil {
		return org, err
	}
	p.Context.Transaction, err = Db.Beginx()
	return org, err
}
