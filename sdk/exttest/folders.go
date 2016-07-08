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
	"github.com/documize/community/documize/api/entity"
)

func testFolders(t *testing.T, c *documize.Client, myFolder *entity.Label) {

	perms, err := c.GetFolderPermissions(myFolder.RefID)
	if err != nil {
		t.Error(err)
	} else {
		//t.Logf("INFO: folder perms %#v", *perms)
	}
	err = c.SetFolderPermissions(myFolder.RefID, "test message", perms)
	if err != nil {
		t.Error(err)
	} else {
		//t.Logf("INFO: set empty folder perms")
	}

	fv, err := c.GetFoldersVisibility()
	if err != nil {
		t.Error(err)
	} else {
		//t.Logf("INFO: folder vis %#v", fv)
		_ = fv
	}

	myFolder.Name += " - Modified"
	err = c.UpdateFolder(myFolder)
	if err != nil {
		t.Error(err)
	}

	fi, err := c.GetFolder(myFolder.RefID)
	if err != nil {
		t.Error(err)
	} else {
		//t.Logf("INFO: folder info %#v", fi)
		_ = fi
	}
}
