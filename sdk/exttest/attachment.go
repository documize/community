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

package exttest

import (
	"testing"

	"github.com/documize/community/sdk"
)

func testDocAttachments(t *testing.T, c *documize.Client, testFile, testData string) {
	atts, err := c.GetAttachments(testData)
	if err != nil {
		t.Error(err)
	}
	for a := range atts {
		err = c.GetAttachmentData(&atts[a])
		if err != nil {
			t.Error(err)
		}
		if atts[a].Filename == "test.txt" {
			if string(atts[a].Data) != "This is a test text file.\n" {
				t.Error("incorrect content to attachment")
			}
			goto foundAtt
		}
		//t.Logf("DEBUG %d atts= %#v ; err=%v; data=%s", a, atts[a], err,string(atts[a].Data))
	}
	t.Error("Attachment test.txt not found")
foundAtt:
	dingbat := "dingbat\n"
	err = c.AddAttachment(testFile, "dingbat.txt", []byte(dingbat))
	if err != nil {
		t.Error(err)
	} else {
		atts, err = c.GetAttachments(testFile)
		if err != nil {
			t.Error(err)
		} else {
			if len(atts) != 1 {
				t.Error("should be exactly 1 attachment")
			} else {
				err = c.GetAttachmentData(&atts[0])
				if err != nil {
					t.Error(err)
				} else {
					if string(atts[0].Data) != dingbat {
						t.Error("Wrong data in attachement")
					}
					err = c.DeleteAttachment(&atts[0])
					if err != nil {
						t.Error(err)
					}
					atts, err = c.GetAttachments(testFile)
					if err != nil {
						t.Error(err)
					} else {
						if len(atts) != 0 {
							t.Error("should be no attachments")
						}
					}
				}
			}
		}
	}
	// errors
	atts, err = c.GetAttachments("XXXXXXX")
	if len(atts) != 0 {
		if err == nil {
			t.Error("Get attachments of unknown file did not error")
		} else {
			t.Log("INFO: get attachments of unknown file msg:", err)
		}
	}
	/* TODO improve failure modes
	att := &entity.Attachment{}
	err = c.GetAttachmentData(att)
	if len(att.Data) > 0 {
		if err == nil {
			t.Error("Get attachment data of blank file did not error")
		} else {
			t.Log("INFO: get attachments of blank file msg:", err)
		}
	}
	err = c.AddAttachment("YYYYYYYYYYYY", "dingbat.txt", []byte(dingbat))
	if err != nil {
		t.Error("Did not error adding attachment to bad file id")
	} else {
		t.Log("INFO: add attachment to unknown file msg:", err)
	}
	err = c.DeleteAttachment(&entity.Attachment{})
	if err != nil {
		t.Error("Did not error deleting attachment of blank data")
	} else {
		t.Log("INFO: delete attachment to blank file msg:", err)
	}
	*/
}
