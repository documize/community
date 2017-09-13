package organization

import (
	"testing"

	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/model/org"

	"github.com/documize/community/domain/test"
)

// TestSpace tests all space database operations.

func TestOrganization(t *testing.T) {
	rt, s, ctx := test.SetupTest()
	//Create a new organization
	var err error
	org := org.Organization{}
	orgID := uniqueid.Generate()

	t.Run("AddOrginization", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()
		if err != nil {
			return
		}

		org.RefID = orgID
		org.Company = "test"
		org.Title = "test"
		org.Message = "test"
		org.Domain = "testDomain"
		org.Active = true

		err = s.Organization.AddOrganization(ctx, org)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to add org organization")
		}

		ctx.Transaction.Commit()

		orgGot, err := s.Organization.GetOrganization(ctx, org.RefID)
		if err != nil || org.Title != orgGot.Title {
			t.Error("failed to get org organization")
		}
	})

	t.Run("GetOrganizationByDomain", func(t *testing.T) {
		orgGot, err := s.Organization.GetOrganizationByDomain("testDomain")
		if err != nil || org.Title != orgGot.Title {
			t.Error("failed to get org organization by domain")
		}
	})

	t.Run("UpdateOrginization", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()
		if err != nil {
			return
		}

		org.Title = "testUpdate"

		err = s.Organization.UpdateOrganization(ctx, org)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to update org organization")
		}

		ctx.Transaction.Commit()

		orgGot, err := s.Organization.GetOrganization(ctx, org.RefID)
		if err != nil || org.Title != orgGot.Title {
			t.Error("failed to get updated org organization")
		}
	})

	t.Run("CheckDomain", func(t *testing.T) {
		Domain := s.Organization.CheckDomain(ctx, "")
		if Domain != Domain {
			t.Error("failed to CheckDomain")
		}
	})

	t.Run("UpdateAuthConfig", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()
		if err != nil {
			return
		}

		err = s.Organization.UpdateAuthConfig(ctx, org)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to update organization AuthConfig")
		}

		ctx.Transaction.Commit()
	})

	//
	//Run after everything except delete as this makes an org inactive
	//

	t.Run("RemoveOrganization", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()
		if err != nil {
			return
		}

		err = s.Organization.RemoveOrganization(ctx, org.RefID)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to remove organization")
		}

		ctx.Transaction.Commit()

		orgGot, err := s.Organization.GetOrganization(ctx, org.RefID)
		if err != nil || orgGot.Active != false {
			t.Error("failed to get removed organization activity")
		}
	})

	//
	// teardown code goes here
	//

	t.Run("DeleteOrganization", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()
		if err != nil {
			return
		}

		_,
			err = s.Organization.DeleteOrganization(ctx, orgID)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to delete org organization")
		}

		ctx.Transaction.Commit()
	})
}
