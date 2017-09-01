package space

import (
	"testing"

	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain/test"
	"github.com/documize/community/model/space"
)

// TestSpace tests all space database operations.
func TestSpace(t *testing.T) {
	rt, s, ctx := test.SetupTest()
	spaceID := uniqueid.Generate()
	var err error

	t.Run("Add Space", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()
		if err != nil {
			return
		}
		sp := space.Space{}
		sp.RefID = spaceID
		sp.OrgID = ctx.OrgID
		sp.Type = space.ScopePrivate
		sp.UserID = ctx.UserID
		sp.Name = "test"

		err = s.Space.Add(ctx, sp)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to delete space")
		}
		ctx.Transaction.Commit()

		sp2, err := s.Space.Get(ctx, sp.RefID)
		if err != nil || sp.Name != sp2.Name {
			t.Error("failed to create space")
		}
	})

	t.Run("Update Space", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()

		sp, err := s.Space.Get(ctx, spaceID)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to get space")
			return
		}

		sp.Name = "test update"
		err = s.Space.Update(ctx, sp)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to update space")
			return
		}

		ctx.Transaction.Commit()

		sp, err = s.Space.Get(ctx, spaceID)
		if err != nil || sp.Name != "test update" {
			t.Error("failed to update space")
		}
	})

	t.Run("Delete Space", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()

		_, err = s.Space.Delete(ctx, spaceID)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to delete space")
			return
		}

		ctx.Transaction.Commit()
	})
}
