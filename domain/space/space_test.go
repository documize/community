package space

import (
	"testing"

	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain/test"
	"github.com/documize/community/model/space"
)

//add a new space and get it. if the get returns the same space as the one just added it passes the test
func TestAddSpace(t *testing.T) {
	//Setup - get the necessary info to add a space, generate a test space
	rt, s, ctx := test.SetupTest()
	var err error

	//Run test - Add a space to the DB, read it to make sure it was added correctly
	ctx.Transaction, err = rt.Db.Beginx()
	if err != nil {
		return
	}
	sp := space.Space{}
	sp.RefID = uniqueid.Generate()
	sp.OrgID = ctx.OrgID
	sp.Type = space.ScopePrivate
	sp.UserID = ctx.UserID
	sp.Name = "test"

	err = s.Space.Add(ctx, sp)
	if err != nil {
		ctx.Transaction.Rollback()
		return
	}
	ctx.Transaction.Commit()

	sp2, err := s.Space.Get(ctx, sp.RefID)
	if err != nil {
		return
	}

	if sp.Name != sp2.Name {
		t.Errorf("Test Failed, space one (%v) does not match space 2(%v)", sp, sp2)
	}
}

// Function to create a space with an identifier, remove it and then try get it using that Identifier, if it doesnt get it, it is removed
// func TestRemoveSpace(t *testing.T) {
// 	//Setup - get the necessary info to add a space, generate a test space
// 	rt, s, ctx := test.SetupTest()
// 	var err error
// 	println("marker 1")

// 	//Run test - Add a space
// 	ctx.Transaction, err = rt.Db.Beginx()
// 	if err != nil {
// 		return
// 	}

// 	println("marker 2")

// 	sp := space.Space{}
// 	sp.RefID = uniqueid.Generate()
// 	sp.OrgID = ctx.OrgID
// 	sp.Type = space.ScopePrivate
// 	sp.UserID = ctx.UserID
// 	sp.Name = "test-toBeDeleted"

// 	println("marker 3")

// 	err = s.Space.Add(ctx, sp)
// 	if err != nil {
// 		ctx.Transaction.Rollback()
// 		return
// 	}
// 	ctx.Transaction.Commit()

// 	//Remove the space
// 	ctx.Transaction, err = rt.Db.Beginx()

// 	_, err = s.Space.Delete(ctx, sp.RefID)

// 	move := "moveToId"

// 	err = s.Document.MoveDocumentSpace(ctx, sp.RefID, move)

// 	err = s.Space.MoveSpaceRoles(ctx, sp.RefID, move)

// 	_, err = s.Pin.DeletePinnedSpace(ctx, sp.RefID)

// 	s.Audit.Record(ctx, audit.EventTypeSpaceDelete)

// 	ctx.Transaction.Commit()

// 	_, err = s.Space.Get(ctx, sp.RefID)
// }
