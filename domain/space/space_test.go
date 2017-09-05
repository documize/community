package space

import (
	"database/sql"
	"testing"

	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain/test"
	"github.com/documize/community/model/space"
)

// TestSpace tests all space database operations.
func TestSpace(t *testing.T) {
	rt, s, ctx := test.SetupTest()
	spaceID := uniqueid.Generate()
	spaceID2 := uniqueid.Generate()
	sp := space.Space{}
	sp2 := space.Space{}
	r := space.Role{}
	r2 := space.Role{}
	r3 := space.Role{}
	var err error

	t.Run("Add Space", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()
		if err != nil {
			return
		}

		sp.RefID = spaceID
		sp.OrgID = ctx.OrgID
		sp.UserID = ctx.UserID
		sp.Type = space.ScopePublic
		sp.Name = "PublicTestSpace"

		err = s.Space.Add(ctx, sp)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to add sp space")
		}

		r.RefID = uniqueid.Generate()
		r.LabelID = spaceID
		r.OrgID = ctx.OrgID
		r.UserID = "testAddSpace"
		r.CanView = true
		r.CanEdit = true

		err = s.Space.AddRole(ctx, r)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to add role r")
		}

		ctx.Transaction.Commit()

		spGet, err := s.Space.Get(ctx, sp.RefID)
		if err != nil || sp.Name != spGet.Name {
			t.Error("failed to get sp space")
		}
	})

	t.Run("Update Space", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()

		sp, err := s.Space.Get(ctx, spaceID)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to get space prior to update")
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
			t.Error("failed to get the space after update")
		}
	})

	t.Run("Get All", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()
		if err != nil {
			return
		}

		sp2.UserID = ctx.UserID
		sp2.RefID = spaceID2
		sp2.OrgID = ctx.OrgID
		sp2.Type = space.ScopePrivate
		sp2.Name = "PrivateTestSpace"

		err = s.Space.Add(ctx, sp2)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to add sp2")
		}

		r2.RefID = uniqueid.Generate()
		r2.LabelID = spaceID2
		r2.OrgID = ctx.OrgID
		r2.UserID = ctx.UserID
		r2.CanView = true
		r2.CanEdit = true

		err = s.Space.AddRole(ctx, r2)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to add role")
		}

		ctx.Transaction.Commit()

		spSlice, err := s.Space.GetAll(ctx)
		if err != nil || spSlice == nil {
			t.Error("failed to get all spaces")
		}
	})

	t.Run("PublicSpaces", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()
		if err != nil {
			return
		}

		spSlice, err := s.Space.PublicSpaces(ctx, sp.OrgID)
		if err != nil || spSlice == nil {
			t.Error("failed to get public spaces")
		}

		ctx.Transaction.Commit()
	})

	t.Run("Change Owner", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()
		if err != nil {
			return
		}
		newUserID := "Updated Owner"

		err := s.Space.ChangeOwner(ctx, sp.UserID, newUserID)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to change Owner")
			return
		}
		ctx.Transaction.Commit()

		sp, err = s.Space.Get(ctx, spaceID)
		if err != nil || sp.UserID != newUserID {
			t.Error("failed to get space w/ new owner")
		}
	})

	t.Run("Viewers", func(t *testing.T) {
		viewers, err := s.Space.Viewers(ctx)
		if err != nil || viewers == nil {
			t.Error("failed to get viewers")
			return
		}
	})

	t.Run("Add Role", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()

		r3.CanView = true
		r3.CanEdit = true
		r3.RefID = uniqueid.Generate()
		r3.LabelID = spaceID
		r3.OrgID = ctx.OrgID
		r3.UserID = "testAddRole"

		err = s.Space.AddRole(ctx, r3)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to add role")
			return
		}
		ctx.Transaction.Commit()

		roles, err := s.Space.GetRoles(ctx, spaceID)
		if err != nil || roles == nil {
			t.Error("Could not get any roles")
			return
		}
		// TODO: could we Verify the role was added with the if r3.UserID == Returned.UserID?
	})

	t.Run("Get User Roles", func(t *testing.T) {
		userRoles, err := s.Space.GetUserRoles(ctx)
		if err != nil || userRoles == nil {
			t.Error("failed to get user roles")
			return
		}
	})

	t.Run("Move space Roles", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()
		err := s.Space.MoveSpaceRoles(ctx, spaceID, spaceID2)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to move space roles")
			return
		}
		ctx.Transaction.Commit()
	})

	t.Run("Delete Role", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()
		rowsDeleted, err := s.Space.DeleteRole(ctx, r3.RefID)
		if err != nil || rowsDeleted == 0 {
			ctx.Transaction.Rollback()
			t.Error("failed to delete roles")
			return
		}
		ctx.Transaction.Commit()
	})

	t.Run("Delete space Roles", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()
		_, err := s.Space.DeleteSpaceRoles(ctx, spaceID)
		if err != nil && err != sql.ErrNoRows {
			ctx.Transaction.Rollback()
			t.Error("failed to delete space roles")
			return
		}
		ctx.Transaction.Commit()
	})

	t.Run("Delete user space Roles", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()
		_, err := s.Space.DeleteUserSpaceRoles(ctx, spaceID2, ctx.UserID)
		if err != nil && err != sql.ErrNoRows {
			ctx.Transaction.Rollback()
			t.Error("failed to delete user space roles")
			return
		}
		ctx.Transaction.Commit()
	})

	//Delete spaces last, otherwise tests may fail

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

	//
	// teardown code goes here
	//

	t.Run("Delete sp2 Space", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()

		_, err = s.Space.Delete(ctx, spaceID2)
		if err != nil {
			ctx.Transaction.Rollback()
			t.Error("failed to delete space in teardown")
			return
		}

		ctx.Transaction.Commit()
	})

	t.Run("Delete r Role", func(t *testing.T) {
		ctx.Transaction, err = rt.Db.Beginx()
		rowsDeleted, err := s.Space.DeleteRole(ctx, r.RefID)
		if err != nil || rowsDeleted == 0 {
			ctx.Transaction.Rollback()
			t.Error("failed to delete role r in teardown")
			return
		}
		ctx.Transaction.Commit()
	})
}
