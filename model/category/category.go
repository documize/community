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

package category

import "github.com/documize/community/model"

// Category represents a category within a space that is persisted to the database.
type Category struct {
	model.BaseEntity
	OrgID     string `json:"orgId"`
	SpaceID   string `json:"spaceId"`
	Name      string `json:"category"`
	IsDefault bool   `json:"isDefault"`
}

// Member represents 0:M association between a document and category, persisted to the database.
type Member struct {
	model.BaseEntity
	OrgID      string `json:"orgId"`
	CategoryID string `json:"categoryId"`
	SpaceID    string `json:"spaceId"`
	DocumentID string `json:"documentId"`
}

// SummaryModel holds number of documents and users for space categories.
type SummaryModel struct {
	GroupType  string `json:"type"` // documents or users
	CategoryID string `json:"categoryId"`
	Count      int64  `json:"count"`
}

// FetchSpaceModel represents categories, summary and membership in a single payload.
// Designed to speed up front-end app.
type FetchSpaceModel struct {
	Category   []Category     `json:"category"`
	Summary    []SummaryModel `json:"summary"`
	Membership []Member       `json:"membership"`
}
