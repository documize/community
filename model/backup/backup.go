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

// Package backup handle data backup/restore to/from ZIP format.
package backup

import (
	"github.com/documize/community/model/org"
	"time"

	"github.com/documize/community/core/env"
)

// Manifest contains backup meta information.
type Manifest struct {
	// ID is unique per backup.
	ID string `json:"id"`

	// A value of "*' means all tenants/oragnizations are backed up (requires global admin permission).
	// A genuine ID means only that specific organization is backed up.
	OrgID string `json:"org"`

	// Product edition at the time of the backup.
	Edition string `json:"edition"`

	// When the backup took place.
	Created time.Time `json:"created"`

	// Product version at the time of the backup.
	Major    string `json:"major"`
	Minor    string `json:"minor"`
	Patch    string `json:"patch"`
	Revision int    `json:"revision"`
	Version  string `json:"version"`

	// Database provider used by source system.
	StoreType env.StoreType `json:"storeType"`
}

// ExportSpec controls what data is exported to the backup file.
type ExportSpec struct {
	// A value of "*' means all tenants/oragnizations are backed up (requires global admin permission).
	// A genuine ID means only that specific organization is backed up.
	OrgID string `json:"org"`

	// Retain will keep the backup file on disk after operation is complete.
	// File is located in the same folder as the running executable.
	Retain bool `json:"retain"`
}

// SystemBackup happens if org ID is "*".
func (e *ExportSpec) SystemBackup() bool {
	return e.OrgID == "*"
}

// ImportSpec controls what content is imported and how.
type ImportSpec struct {
	// Overwrite current organization settings.
	OverwriteOrg bool `json:"overwriteOrg"`

	// Recreate users.
	CreateUsers bool `json:"createUsers"`

	// As found in backup file.
	Manifest Manifest

	// Handle to the current organization being used for restore process.
	Org org.Organization
}
