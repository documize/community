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
	"testing"

	"github.com/documize/community/documize/api/entity"
)

const testName = "testLabelName"

func testAddLabel(t *testing.T, p *Persister) entity.Label {
	lab := entity.Label{
		BaseEntity: entity.BaseEntity{RefID: testLabelID},
		Name:       testName,                // string     `json:"name"`
		OrgID:      p.Context.OrgID,         // string     `json:"orgId"`
		UserID:     p.Context.UserID,        // string     `json:"userId"`
		Type:       entity.FolderTypePublic, //FolderType `json:"folderType"`
	}
	err := p.AddLabel(lab)
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)
	return lab
}

func testDeleteLabel(t *testing.T, p *Persister) {
	num, err := p.DeleteLabel(testLabelID)
	if err != nil {
		t.Error(err)
	}
	if num != 1 {
		t.Error("one record not deleted:", num)
	}
	p.testCommit(t)
}

func TestLabel(t *testing.T) {
	p := newTestPersister(t)
	defer deleteTestAuditTrail(t, p)

	lab := testAddLabel(t, p)
	defer testDeleteLabel(t, p)
	testAddLabelRole(t, p)
	defer testDeleteLabelRole(t, p)
	testAddUser(t, p)
	defer testDeleteUser(t, p)

	vis, err := p.GetFolderVisibility()
	if err != nil {
		t.Error(err)
	}
	for _, v := range vis {
		if v.LabelID == testLabelID {
			goto foundVis
		}
	}
	t.Error("test label not found in GetFolderVisibility()")
foundVis:
	p.testRollback(t)

	err = p.AddLabel(lab)
	if err == nil {
		t.Error("did not error on duplicate label")
	}
	p.testRollback(t)

	lab2, err := p.GetLabel(testLabelID)
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
	u := p.Context.UserID
	p.Context.UserID = gonzo
	_, err = p.GetLabel(testLabelID)
	if err != nil {
		t.Error(err)
	}
	p.testRollback(t)
	err = p.ChangeLabelOwner(gonzo, p.Context.UserID) // change it back for deletion
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)
	p.Context.UserID = u // put back the right one, so that we delete correctly on tidy-up

}
*/