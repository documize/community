package request

// This file contains the code for initial set-up of a database

import (
	"github.com/documize/community/documize/api/entity"
	"github.com/documize/community/documize/api/util"
)

func SetupPersister() (*Persister, error) {
	var err error
	c := Context{
		Authenticated: true,            // bool
		Guest:         false,           // bool
		Administrator: true,            // bool
		Editor:        true,            // bool
		UserID:        util.UniqueID(), // string
		OrgID:         util.UniqueID(), // string
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

func (p *Persister) SetupOrganization(company, title, message, domain, email string) (entity.Organization, error) {
	org := entity.Organization{
		BaseEntity: entity.BaseEntity{RefID: p.Context.OrgID},
		Company:    company, // string `json:"-"`
		Title:      title,   // string `json:"title"`
		Message:    message, // string `json:"message"`
		//URL:                  "test.domain",           // string `json:"url"`
		Domain:               domain,            // string `json:"domain"`
		Email:                email, // string `json:"email"`
		AllowAnonymousAccess: false, // bool   `json:"allowAnonymousAccess"`
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
