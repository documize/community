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
	"fmt"
	_ "github.com/go-sql-driver/mysql" // this must be somewhere...
	"testing"
)

func deleteTestAuditTrail(t *testing.T, p *Persister) {
	c := p.Context
	_, err := Db.Exec("DELETE FROM audit WHERE orgid=? AND userid=?", c.OrgID, c.UserID)
	if err != nil {
		t.Error(fmt.Sprintf("Unable delete audit trail for user %s, customer %s", c.UserID, c.OrgID), err)
	}
	p.testCommit(t)
}

func TestInit(t *testing.T) {
	p := newTestPersister(t)
	defer deleteTestAuditTrail(t, p)

	_ = p.Base.SQLPrepareError("method", "id") // noting to test, just for coverage stats
	_ = p.Base.SQLSelectError("method", "id")  // noting to test, just for coverage stats
}
*/
