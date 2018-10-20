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

package link

import "github.com/documize/community/model"

// Link defines a reference between a section and another document/section/attachment.
type Link struct {
	model.BaseEntity
	OrgID            string `json:"orgId"`
	SpaceID          string `json:"spaceId"`
	UserID           string `json:"userId"`
	LinkType         string `json:"linkType"`
	SourceDocumentID string `json:"sourceDocumentId"`
	SourceSectionID  string `json:"sourcePageId"`
	TargetDocumentID string `json:"targetDocumentId"`
	TargetID         string `json:"targetId"`
	ExternalID       string `json:"externalId"`
	Orphan           bool   `json:"orphan"`
}

// Candidate defines a potential link to a document/section/attachment.
type Candidate struct {
	RefID      string `json:"id"`
	LinkType   string `json:"linkType"`
	SpaceID    string `json:"spaceId"`
	DocumentID string `json:"documentId"`
	TargetID   string `json:"targetId"`
	Title      string `json:"title"`   // what we label the link
	Context    string `json:"context"` // additional context (e.g. excerpt, parent, file extension)
}
