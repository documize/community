// Copyright 2018 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

package group

import "github.com/documize/community/model"

// Group defines a user group.
type Group struct {
	model.BaseEntity
	OrgID   string `json:"orgId"`
	Name    string `json:"name"`
	Purpose string `json:"purpose"`
	Members int    `json:"members"` // read-only info
}

// Member defines user membership of a user group.
type Member struct {
	ID        uint64 `json:"id"`
	OrgID     string `json:"orgId"`
	GroupID   string `json:"groupId"`
	UserID    string `json:"userId"`
	Firstname string `json:"firstname"` //read-only info
	Lastname  string `json:"lastname"`  //read-only info
}

// Record details user membership of a user group.
type Record struct {
	ID      uint64 `json:"id"`
	OrgID   string `json:"orgId"`
	GroupID string `json:"groupId"`
	UserID  string `json:"userId"`
	Name    string `json:"name"`
	Purpose string `json:"purpose"`
}

// UserHasGroupMembership returns true if user belongs to specified group.
func UserHasGroupMembership(r []Record, groupID, userID string) bool {
	for i := range r {
		if r[i].GroupID == groupID && r[i].UserID == userID {
			return true
		}
	}

	return false
}

// FilterGroupRecords returns only those records matching group ID.
func FilterGroupRecords(r []Record, groupID string) (m []Record) {
	m = []Record{}

	for i := range r {
		if r[i].GroupID == groupID {
			m = append(m, r[i])
		}
	}

	return
}
