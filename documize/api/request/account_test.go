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

/* TODO(Elliott)
import (
	"github.com/documize/community/documize/api/entity"
	"github.com/documize/community/wordsmith/environment"
	"testing"
)

const testAcc = "TestAccount"

func testAddAccount(t *testing.T, p *Persister) entity.Account {
	acc := entity.Account{
		BaseEntity: entity.BaseEntity{RefID: testAcc},
		Admin:      true,             // bool   `json:"admin"`
		Editor:     true,             // bool   `json:"editor"`
		UserID:     p.Context.UserID, // string `json:"userId"`
		OrgID:      p.Context.OrgID,  // string `json:"orgId"`
		Company:    "testCompany",    // string `json:"company"`
		Title:      "testTitle",      // string `json:"title"`
		Message:    "testMessage",    // string `json:"message"`
		Domain:     "testDomain",     // string `json:"domain"`
	}
	err := p.AddAccount(acc)
	if err != nil {
		t.Error(err)
		t.Fail()
	}
	p.testCommit(t)
	return acc
}

func testDeleteAccount(t *testing.T, p *Persister) {
	p.testNewTx(t) // so that we can use it reliably in defer
	rows, err := p.DeleteAccount(testAcc)
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

func TestAccount(t *testing.T) {
	environment.Parse("db")

	p := newTestPersister(t)
	defer deleteTestAuditTrail(t, p)
	org := testAddOrganization(t, p)
	defer testDeleteOrganization(t, p)
	user := testAddUser(t, p)
	defer testDeleteUser(t, p)
	acc := testAddAccount(t, p)
	defer testDeleteAccount(t, p)

	err := p.AddAccount(entity.Account{
		BaseEntity: entity.BaseEntity{RefID: acc.RefID},
		OrgID:      org.RefID,
		UserID:     user.RefID,
	})
	if err == nil {
		t.Error("did not error as expected on duplicate record")
	}
	p.testRollback(t)

	acc2, err := p.GetUserAccount(user.RefID)
	if err != nil {
		t.Error(err)
	}
	if acc.Company != acc2.Company {
		t.Errorf("bad data returned want: `%s` got: `%s`", acc.Company, acc2.Company)
	}
	p.testRollback(t)

	gua, err := p.GetUserAccounts(user.RefID)
	if err != nil {
		t.Error(err)
	}
	if len(gua) != 1 {
		t.Errorf("length is %d not 1 ", len(gua))
	} else {
		if acc.Company != gua[0].Company {
			t.Errorf("bad data returned want: `%s` got: `%s`", acc.Company, gua[0].Company)
		}
	}
	p.testRollback(t)

	gabo, err := p.GetAccountsByOrg()
	if err != nil {
		t.Error(err)
	}
	if len(gabo) != 1 {
		t.Errorf("length is %d not 1 ", len(gabo))
	} else {
		if acc.Company != gabo[0].Company {
			t.Errorf("bad data returned want: `%s` got: `%s`", acc.Company, gabo[0].Company)
		}
	}
	p.testRollback(t)

	if p.HasOrgAccount("XXXXXXXX", "YYYYYY") {
		t.Error("found account where there should not be one")
	}
	if !p.HasOrgAccount(org.RefID, user.RefID) {
		t.Error("did not find account where there should be one")
	}
	p.testRollback(t)

	acc.Admin = false
	err = p.UpdateAccount(acc)
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)
	acc3, err := p.GetUserAccount(user.RefID)
	if err != nil {
		t.Error(err)
	}
	if acc3.Admin {
		t.Errorf("bad data returned")
	}
	p.testRollback(t)

}
*/
