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

package label

import "github.com/documize/community/model"

// Label represents a name and color combination that
// can be assigned to spaces.
type Label struct {
	model.BaseEntity
	OrgID string `json:"orgId"`
	Name  string `json:"name"`
	Color string `json:"color"`
}
