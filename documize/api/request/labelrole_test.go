package request
/* TODO(Elliott)
import (
	"testing"

	"github.com/documize/community/documize/api/entity"
)

const testLabelRoleID = "testLabelRoleID"

func testAddLabelRole(t *testing.T, p *Persister) entity.LabelRole {
	labrole := entity.LabelRole{
		BaseEntityObfuscated: entity.BaseEntityObfuscated{RefID: testLabelRoleID},
		OrgID:                p.Context.OrgID,  // string     `json:"orgId"`
		LabelID:              testLabelID,      // string `json:"userId"`
		UserID:               p.Context.UserID, // string     `json:"userId"`
		CanView:              true,             // bool   `json:"canView"`
		CanEdit:              true,             // bool   `json:"canEdit"`
	}
	err := p.AddLabelRole(labrole)
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)
	return labrole
}

func testDeleteLabelRole(t *testing.T, p *Persister) {
	num, err := p.DeleteLabelRole(testLabelRoleID)
	if err != nil {
		t.Error(err)
	}
	if num != 1 {
		t.Error("one record not deleted:", num)
	}
	p.testCommit(t)
}

func TestLabelRole(t *testing.T) {
	p := newTestPersister(t)
	defer deleteTestAuditTrail(t, p)

	labRole := testAddLabelRole(t, p)
	defer testDeleteLabelRole(t, p)

	testAddDocument(t, p)
	defer testDeleteDocument(t, p)

	err := p.AddLabelRole(labRole)
	if err == nil {
		t.Error("did not error on duplicate label")
	}
	p.testRollback(t)

	labs, err := p.GetLabelRoles(testLabelID)
	if err != nil {
		t.Error(err)
	}
	if len(labs) != 1 {
		t.Errorf("wrong number of labels %d", len(labs))
	} else {
		if labs[0].LabelID != testLabelID {
			t.Errorf("wrong data")
		}
	}
	p.testRollback(t)

	labs, err = p.GetLabelRoles("XXXXXXXXX")
	if err != nil {
		t.Error(err)
	}
	if len(labs) != 0 {
		t.Errorf("wrong number of labels %d", len(labs))
	}
	p.testRollback(t)

	labs, err = p.GetUserLabelRoles()
	if err != nil {
		t.Error(err)
	}
	if len(labs) != 1 {
		t.Errorf("wrong number of labels %d", len(labs))
	} else {
		if labs[0].LabelID != testLabelID {
			t.Errorf("wrong data")
		}
	}
	p.testRollback(t)

	if !p.CanUploadDocument(testLabelID) {
		t.Error("unexpected result for can upload document")
	}

	if !p.CanChangeDocument(testDocID) {
		t.Error("unexpected result for can change document")
	}

	_, err = p.DeleteLabelRoles(testLabelID)
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)
	labs, err = p.GetUserLabelRoles()
	if err != nil {
		t.Error(err)
	}
	if len(labs) != 0 {
		t.Errorf("wrong number of labels %d, record not deleted", len(labs))
	}
	p.testRollback(t)
	testAddLabelRole(t, p) // reset

	_, err = p.DeleteUserFolderRoles(testLabelID, p.Context.UserID)
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)
	labs, err = p.GetUserLabelRoles()
	if err != nil {
		t.Error(err)
	}
	if len(labs) != 0 {
		t.Errorf("wrong number of labels %d, record not deleted", len(labs))
	}
	p.testRollback(t)
	testAddLabelRole(t, p) // reset

	g := "Gonzo"
	err = p.MoveLabelRoles(testLabelID, g)
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)
	labs, err = p.GetLabelRoles(g)
	if err != nil {
		t.Error(err)
	}
	if len(labs) != 1 {
		t.Errorf("wrong number of labels %d", len(labs))
	} else {
		if labs[0].LabelID != g {
			t.Errorf("wrong data")
		}
	}
	p.testRollback(t)

	if p.CanUploadDocument(testLabelID) { // Gonzo
		t.Error("unexpected result for can upload document")
	}

	if p.CanChangeDocument(testDocID) { // Gonzo
		t.Error("unexpected result for can change document")
	}

	if p.CanChangeDocument("XXXXXXX") { // unknown docID
		t.Error("unexpected result for can change document")
	}

	/*
	   	lab2, err := p.GetLabelRoles(testLabelID)
	   	if err != nil {
	   		t.Error(err)
	   	}
	   	if lab.Name != lab2.Name {
	   		t.Error("wrong data returned")
	   	}
	   	p.testRollback(t)

	   	_, err = p.GetLabel("XXXXXXXXX")
	   	if err == nil {
	   		t.Error("did not error when it should have")
	   	}
	   	p.testRollback(t)

	   	list, err := p.GetPublicFolders(p.Context.OrgID)
	   	if err != nil {
	   		t.Error(err)
	   	}
	   	if len(list) != 1 {
	   		t.Errorf("wrong number of public folders %d", len(list))
	   	} else {
	   		if list[0].Name != lab.Name {
	   			t.Errorf("wanted %s got %s", lab.Name, list[0].Name)
	   		}
	   	}
	   	p.testRollback(t)

	   	t.Log("TODO p.GetFolderVisibility() requires user and labelrole recorde")

	   	lab.Type = entity.FolderTypePrivate
	   	err = p.UpdateLabel(lab)
	   	if err != nil {
	   		t.Error(err)
	   	}
	   	p.testCommit(t)

	   	labels, err := p.GetLabels()
	   	if err != nil {
	   		t.Error(err)
	   	}
	   	for _, l := range labels {
	   		if l.BaseEntity.RefID == testLabelID {
	   			goto foundLabel
	   		}
	   	}
	   	t.Error("test label not found in GetLabels()")
	   foundLabel:
	   	p.testRollback(t)

	   	gonzo := "Gonzo"
	   	err = p.ChangeLabelOwner(p.Context.UserID, gonzo)
	   	if err != nil {
	   		t.Error(err)
	   	}
	   	p.testCommit(t)
	   	p.Context.UserID = gonzo
	   	_, err = p.GetLabel(testLabelID)
	   	if err != nil {
	   		t.Error(err)
	   	}
	   	p.testRollback(t)

	*/
//}
