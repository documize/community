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
	"github.com/documize/community/wordsmith/environment"
)

const testAtt = "TestAttachment"
const testFileID = "testFileID"

func TestAttachment(t *testing.T) {

	environment.Parse("db")

	p := newTestPersister(t)
	defer deleteTestAuditTrail(t, p)
	att := entity.Attachment{
		BaseEntity: entity.BaseEntity{RefID: testAtt},
		OrgID:      p.Context.OrgID,     // string `json:"orgId"`
		DocumentID: testDocID,           // string `json:"documentId"`
		Job:        testJobID,           // string `json:"job"`
		FileID:     testFileID,          // string `json:"fileId"`
		Filename:   "testFilename.test", // string `json:"filename"`
		Data:       []byte{1, 2, 3},     // `json:"-"`
		Extension:  "",                  // NOTE calculated by AddAttachment // string `json:"extension"`
	}

	err := p.AddAttachment(att)
	if err != nil {
		t.Error(err)
	}
	p.testCommit(t)
	defer func() {
		num, err := p.DeleteAttachment(testAtt)
		if err != nil {
			t.Error(err)
		}
		if num != 1 {
			t.Error("one record not deleted:", num)
		}
		p.testCommit(t)
	}()

	list, err := p.GetAttachments(testDocID)
	if err != nil {
		t.Error(err)
	}
	if len(list) != 1 {
		t.Errorf("wrong number of attachemnts %d", len(list))
	} else {
		if list[0].FileID != att.FileID {
			t.Errorf("wanted %s got %s", att.FileID, list[0].FileID)
		}
	}
	p.testRollback(t)

	list, err = p.GetAttachmentsWithData(testDocID)
	if err != nil {
		t.Error(err)
	}
	if len(list) != 1 {
		t.Errorf("wrong number of attachemnts %d", len(list))
	} else {
		if list[0].Data[1] != att.Data[1] {
			t.Errorf("wanted %d got %d", att.Data[1], list[0].Data[1])
		}
	}
	p.testRollback(t)

	ga, err := p.GetAttachmentByJobAndFileID(p.Context.OrgID, testJobID, testFileID)
	if err != nil {
		t.Error(err)
	}
	if ga.FileID != att.FileID {
		t.Errorf("wanted %s got %s", att.FileID, ga.FileID)
	}
	p.testRollback(t)

	_, err = p.GetAttachmentByJobAndFileID("X", "Y", "Z")
	if err == nil {
		t.Error("did not error when it should have")
	}
	p.testRollback(t)

	err = p.AddAttachment(att)
	if err == nil {
		t.Error("did not error on duplicate attachment")
	}
	p.testRollback(t)
}
*/
