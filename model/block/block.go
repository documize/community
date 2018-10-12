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

package block

import "github.com/documize/community/model"

// Block represents a section that has been published as a reusable content block.
type Block struct {
	model.BaseEntity
	OrgID          string `json:"orgId"`
	SpaceID        string `json:"spaceId"`
	UserID         string `json:"userId"`
	ContentType    string `json:"contentType"`
	Type           string `json:"pageType"`
	Name           string `json:"title"`
	Body           string `json:"body"`
	Excerpt        string `json:"excerpt"`
	RawBody        string `json:"rawBody"`        // a blob of data
	Config         string `json:"config"`         // JSON based custom config for this type
	ExternalSource bool   `json:"externalSource"` // true indicates data sourced externally
	Used           uint64 `json:"used"`
	Firstname      string `json:"firstname"`
	Lastname       string `json:"lastname"`
}
