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

package workflow

// Protection tell us how to handle data item changes
type Protection int

const (
	// NoProtection means no protection so data item changes are permitted
	NoProtection Protection = 0

	// Lock means no data itme changes
	Lock Protection = 1

	// Review means changes must be reviewed and approved
	Review Protection = 2
)

// Approval tells us how some data item change is to be approved
type Approval int

const (
	// NoApproval means no approval necessary
	NoApproval Approval = 0

	// Anybody can approve data item change
	Anybody Approval = 1

	// Majority must approve data item change
	Majority Approval = 2

	// Unanimous approval must be given for data item change
	Unanimous Approval = 3
)
