package request
/* TODO(Elliott)
import (
	"github.com/documize/community/wordsmith/environment"
	"net/http"
	"testing"
)

func newTestPersister(t *testing.T) *Persister {
	p, err := SetupPersister()
	if err != nil {
		t.Error(err)
		t.Fail()
	}
	return p
}

func (p *Persister) testNewTx(t *testing.T) {
	tx, err := Db.Beginx()
	if err != nil {
		t.Error(err)
		t.Fail()
	}
	p.Context.Transaction = tx
}

func (p *Persister) testCommit(t *testing.T) {
	err := p.Context.Transaction.Commit()
	if err != nil {
		t.Error(err)
		t.Fail()
	}
	p.testNewTx(t)
}

func (p *Persister) testRollback(t *testing.T) {
	err := p.Context.Transaction.Rollback()
	if err != nil {
		t.Error(err)
		t.Fail()
	}
	p.testNewTx(t)
}

func TestContext(t *testing.T) {

	environment.Parse("db")

	req, err := http.NewRequest("GET", "http://example.com", nil)
	if err != nil {
		t.Error(err)
		t.Fail()
	}
	zgp := GetPersister(req)
	if zgp.Context.OrgID != "" {
		t.Error("wrong data retrieved")
	}
	ctx := NewContext()
	tp := newTestPersister(t)
	SetContext(req, tp.Context)
	gp := GetPersister(req)
	ctx = gp.Context
	if ctx.OrgID != tp.Context.OrgID {
		t.Error("wrong data retrieved")
	}

}
*/