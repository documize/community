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

package env

import (
	"fmt"
	"time"
)

// Edition is either Community or Enterprise.
type Edition string

// Package controls feature-set within edition.
type Package string

// Plan tells us if instance if self-hosted or Documize SaaS/Cloud.
type Plan string

// Seats represents number of users.
type Seats int

const (
	// CommunityEdition is AGPL licensed open core of product.
	CommunityEdition Edition = "Community"

	// EnterpriseEdition is proprietary closed-source product.
	EnterpriseEdition Edition = "Enterprise"

	// PackageEssentials provides core capabilities.
	PackageEssentials Package = "Essentials"

	// PackageAdvanced provides analytics, reporting,
	// content lifecycle, content verisoning, and audit logs.
	PackageAdvanced Package = "Advanced"

	// PackagePremium provides actions, feedback capture,
	// approvals workflow, secure external sharing.
	PackagePremium Package = "Premium"

	// PackageDataCenter provides multi-tenanting
	// and a bunch of professional services.
	PackageDataCenter Package = "Data Center"

	// PlanCloud represents *.documize.com hosting.
	PlanCloud Plan = "Cloud"

	// PlanSelfHost represents privately hosted Documize instance.
	PlanSelfHost Plan = "Self-host"

	// Seats0 is 0 users.
	Seats0 Seats = 0

	// Seats1 is 10 users.
	Seats1 Seats = 10

	// Seats2 is 25 users.
	Seats2 Seats = 25

	//Seats3 is 50 users.
	Seats3 Seats = 50

	// Seats4 is 100 users.
	Seats4 Seats = 100

	//Seats5 is 250 users.
	Seats5 Seats = 250

	// Seats6 is unlimited.
	Seats6 Seats = 9999
)

// Product provides meta information about product and licensing.
type Product struct {
	Edition  Edition
	Title    string
	Version  string
	Major    string
	Minor    string
	Patch    string
	Revision int
	License  License
}

// License provides details of product license.
type License struct {
	Name    string    `json:"name"`
	Email   string    `json:"email"`
	Edition Edition   `json:"edition"`
	Package Package   `json:"package"`
	Plan    Plan      `json:"plan"`
	Start   time.Time `json:"start"`
	End     time.Time `json:"end"`
	Seats   Seats     `json:"seats"`
	Trial   bool      `json:"trial"`

	// UserCount is number of users within Documize instance by tenant.
	// Provided at runtime.
	UserCount map[string]int
}

// IsEmpty determines if we have a license.
func (l *License) IsEmpty() bool {
	return l.Seats == Seats0 &&
		len(l.Name) == 0 && len(l.Email) == 0 && l.Start.Year() == 1 && l.End.Year() == 1
}

// Status returns formatted message stating if license is empty/populated and invalid/valid.
func (l *License) Status(orgID string) string {
	lp := "populated"
	if l.IsEmpty() {
		lp = "empty"
	}
	lv := "invalid"
	if l.IsValid(orgID) {
		lv = "valid"
	}

	return fmt.Sprintf("License is %s and %s", lp, lv)
}

// IsValid returns if license is valid for specified tenant.
func (l *License) IsValid(orgID string) bool {
	valid := false

	// Community edition is always valid.
	if l.Edition == CommunityEdition {
		valid = true
	}

	// Enterprise edition is valid if subcription date is
	// greater than now and we have enough users/seats.
	if l.Edition == EnterpriseEdition {
		if time.Now().UTC().Before(l.End) && l.UserCount[orgID] <= int(l.Seats) {
			valid = true
		}
	}

	// Empty means we cannot be valid
	if l.IsEmpty() || len(l.UserCount) == 0 {
		valid = false
	}

	return valid
}

// LicenseData holds encrypted data and is unpacked into License.
type LicenseData struct {
	Key       string `json:"key"`
	Signature string `json:"signature"`
}

// LicenseUserAcount states number of active users by tenant.
type LicenseUserAcount struct {
	OrgID string `json:"orgId"`
	Users int    `json:"users"`
}
