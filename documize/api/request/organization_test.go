package request

import (
	"database/sql"
	"reflect"
	"testing"

	"github.com/documize/community/documize/api/entity"
)

func testAddOrganization(t *testing.T, p *Persister) entity.Organization {
	/*
		org := entity.Organization{
			BaseEntity:           entity.BaseEntity{RefID: p.Context.OrgID},
			Company:              "testCompany",           // string `json:"-"`
			Title:                "testTitle",             // string `json:"title"`
			Message:              "testMessage",           // string `json:"message"`
			URL:                  "test.domain",           // string `json:"url"`
			Domain:               "testdomain",            // string `json:"domain"`
			Email:                "mail@request.test.org", // string `json:"email"`
			AllowAnonymousAccess: false,                   // bool   `json:"allowAnonymousAccess"`
			Serial:               "123",                   // string `json:"-"`
			Active:               true,                    // bool   `json:"-"`
		}
		err := p.AddOrganization(org)
		if err != nil {
			t.Error(err)
			t.Fail()
		}
		p.testCommit(t)
	*/
	org, err := p.SetupOrganization("testCompany", "testTitle", "testMessage", "testdomain", "mail@request.test.org")
	if err != nil {
		t.Error(err)
		t.Fail()
	}

	return org
}

func testDeleteOrganization(t *testing.T, p *Persister) {
	p.testNewTx(t) // so that we can use it reliably in defer
	rows, err := p.DeleteOrganization(p.Context.OrgID)
	if err != nil {
		t.Error(err)
		t.Fail()
	}
	if rows != 1 {
		t.Errorf("expected 1 row deleted got %d", rows)
		t.Fail()
	}
	p.testCommit(t)
}

func TestOrganization(t *testing.T) {
	p := newTestPersister(t)
	defer deleteTestAuditTrail(t, p)

	org := testAddOrganization(t, p)
	defer testDeleteOrganization(t, p)

	org2, err := p.GetOrganization(org.RefID)
	if err != nil {
		t.Error(err)
		return
	}
	org.BaseEntity = org2.BaseEntity
	if !reflect.DeepEqual(org, org2) {
		t.Error("wrong data returned", org, org2)
	}

	org2.Email += "42"
	err = p.UpdateOrganization(org2)
	if err != nil {
		t.Error(err)
		return
	}
	p.testCommit(t)

	org3, err := p.GetOrganizationByDomain(org.Domain)
	if err != nil {
		t.Error(err)
		return
	}
	if org3.Email != org2.Email {
		t.Error("wrong data returned", org3.Email, org2.Email)
	}

	err = p.RemoveOrganization(org.RefID)
	if err != nil {
		t.Error(err)
		return
	}
	p.testCommit(t)
	_, err = p.GetOrganizationByDomain(org.Domain)
	if err != sql.ErrNoRows {
		t.Error("should have no rows returned here, error:", err)
		return
	}
	p.testRollback(t)

	// now errors

	err = p.AddOrganization(org)
	if err == nil {
		t.Error("no error adding duplicate organization", err)
	}
	p.testRollback(t)

	_, err = p.GetOrganization("XXXXXXXXX")
	if err == nil {
		t.Error("no error getting non-existant organization", err)
	}
	p.testRollback(t)

	err = p.UpdateOrganization(entity.Organization{BaseEntity: entity.BaseEntity{RefID: "XXXXXXXXX"}})
	if err == nil {
		t.Error("no error updating non-existant organization", err)
	}
	p.testRollback(t)

	err = p.RemoveOrganization("XXXXXXXXX")
	if err == nil {
		t.Error("no error removing non-existant organization", err)
	}
	p.testRollback(t)
}
