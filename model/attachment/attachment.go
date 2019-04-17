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

package attachment

import "github.com/documize/community/model"

// Attachment represents an attachment to a document.
type Attachment struct {
	model.BaseEntity
	OrgID      string `json:"orgId"`
	DocumentID string `json:"documentId"`
	SectionID  string `json:"pageId"`
	Job        string `json:"job"`
	FileID     string `json:"fileId"`
	Filename   string `json:"filename"`
	Data       []byte `json:"data"`
	Extension  string `json:"extension"`
}
