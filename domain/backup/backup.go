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

// The backup process can be told to export all data or just for the
// current organization (tenant).
//
// Selected data is marshalled to JSON format and then zipped up
// into a single file on the server. The resultant file is then sent
// to the caller (e.g. web browser) as a file download. Unless specified,
// the file is deleted at the end of the process.
//
// The backup file contains a manifest file that describes the backup.

import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/account"
	m "github.com/documize/community/model/backup"
	"github.com/documize/community/model/group"
	"github.com/documize/community/model/org"
	"github.com/documize/community/model/space"
	"github.com/documize/community/model/user"
	uuid "github.com/nu7hatch/gouuid"
)

// Handler contains the runtime information such as logging and database.
type backerHandler struct {
	Runtime *env.Runtime
	Store   *store.Store
	Spec    m.ExportSpec
	Context domain.RequestContext
}

// Represents backup file.
type backupItem struct {
	Filename, Content string
}

// Export data to JSON format, indented to look nice.
func toJSON(v interface{}) (string, error) {
	j, err := json.MarshalIndent(v, "", "    ")
	if err != nil {
		return "", err
	}

	return string(j), nil
}

// GenerateBackup produces ZIP file of specified content.GenerateBackup
// File is located at the same location as the running program.
// NOTE: it is up to the caller to remove the file from disk.
func (b backerHandler) GenerateBackup() (filename string, err error) {
	// As precaution we first generate short string first.
	var id = uniqueid.Generate()
	newUUID, err := uuid.NewV4()
	if err == nil {
		id = newUUID.String()
	}
	filename = fmt.Sprintf("dmz-backup-%s.zip", id)

	bf, err := os.Create(filename)
	if err != nil {
		return
	}
	defer bf.Close()

	// Create a zip writer on the file write
	zw := zip.NewWriter(bf)

	// Get the files to write to the ZIP file.
	files, err := b.produce(id)
	if err != nil {
		return filename, err
	}

	// Write backup data to zip file on disk.
	for _, file := range files {
		fileWriter, e2 := zw.Create(file.Filename)
		if e2 != nil {
			return filename, e2
		}
		_, e2 = fileWriter.Write([]byte(file.Content))
		if err != nil {
			return filename, e2
		}
	}

	// Close out process.
	err = zw.Close()
	if err != nil {
		return
	}

	return filename, nil
}

// Manifest describes envrionement of backup source.
func (b backerHandler) getManifest(id string) (string, error) {
	m := m.Manifest{
		ID:        id,
		Edition:   b.Runtime.Product.Edition,
		Version:   b.Runtime.Product.Version,
		Major:     b.Runtime.Product.Major,
		Minor:     b.Runtime.Product.Minor,
		Patch:     b.Runtime.Product.Patch,
		Revision:  b.Runtime.Product.Revision,
		StoreType: b.Runtime.StoreProvider.Type(),
		Created:   time.Now().UTC(),
		OrgID:     b.Spec.OrgID,
	}

	s, err := toJSON(m)

	return s, err
}

// Produce collection of files to be included in backup file.
func (b backerHandler) produce(id string) (files []backupItem, err error) {
	// Backup manifest
	c, err := b.getManifest(id)
	if err != nil {
		return
	}
	files = append(files, backupItem{Filename: "manifest.json", Content: c})

	// Organization
	err = b.dmzOrg(&files)
	if err != nil {
		return
	}

	// User, Account
	err = b.dmzUserAccount(&files)
	if err != nil {
		return
	}

	// Group, Member
	err = b.dmzGroup(&files)
	if err != nil {
		return
	}

	// Space
	err = b.dmzSpace(&files)
	if err != nil {
		return
	}

	return
}

// Organization.
func (b backerHandler) dmzOrg(files *[]backupItem) (err error) {
	w := ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" WHERE c_refid='%s' ", b.Spec.OrgID)
	}

	o := []org.Organization{}
	err = b.Runtime.Db.Select(&o, `SELECT id, c_refid AS refid,
        c_title AS title, c_message AS message, c_domain AS domain,
        c_service AS conversionendpoint, c_email AS email, c_serial AS serial, c_active AS active,
        c_anonaccess AS allowanonymousaccess, c_authprovider AS authprovider,
        coalesce(c_authconfig,`+b.Runtime.StoreProvider.JSONEmpty()+`) AS authconfig, c_maxtags AS maxtags,
        c_created AS created, c_revised AS revised
        FROM dmz_org`+w)
	if err != nil {
		return
	}

	content, err := toJSON(o)
	if err != nil {
		return
	}
	*files = append(*files, backupItem{Filename: "dmz_org.json", Content: content})

	return
}

// User, Account.
func (b backerHandler) dmzUserAccount(files *[]backupItem) (err error) {
	w := ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" , dmz_user_account a WHERE u.c_refid=a.c_userid AND a.c_orgid='%s' ", b.Spec.OrgID)
	}

	u := []user.User{}
	err = b.Runtime.Db.Select(&u, `SELECT u.id, u.c_refid AS refid,
        u.c_firstname AS firstname, u.c_lastname AS lastname, u.c_email AS email,
        u.c_initials AS initials, u.c_globaladmin AS globaladmin,
        u.c_password AS password, u.c_salt AS salt, u.c_reset AS reset, u.c_lastversion AS lastversion,
        u.c_created AS created, u.c_revised AS revised
        FROM dmz_user u`+w)
	if err != nil {
		return
	}

	content, err := toJSON(u)
	if err != nil {
		return
	}
	*files = append(*files, backupItem{Filename: "dmz_user.json", Content: content})

	w = ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" WHERE c_orgid='%s' ", b.Spec.OrgID)
	}
	acc := []account.Account{}
	err = b.Runtime.Db.Select(&acc, `SELECT id, c_refid AS refid, c_orgid AS orgid, c_userid AS userid,
	c_editor AS editor, c_admin AS admin, c_users AS users, c_analytics AS analytics,
	c_active AS active, c_created AS created, c_revised AS revised
	FROM dmz_user_account`+w)
	if err != nil {
		return
	}

	content, err = toJSON(acc)
	if err != nil {
		return
	}
	*files = append(*files, backupItem{Filename: "dmz_user_account.json", Content: content})

	return
}

// Group, Group Member.
func (b backerHandler) dmzGroup(files *[]backupItem) (err error) {
	w := ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" WHERE c_orgid='%s' ", b.Spec.OrgID)
	}

	g := []group.Group{}
	err = b.Runtime.Db.Select(&g, `
        SELECT id, c_refid AS refid,
        c_orgid AS orgid, c_name AS name, c_desc AS purpose,
        c_created AS created, c_revised AS revised
        FROM dmz_group`+w)
	if err != nil {
		return
	}

	content, err := toJSON(g)
	if err != nil {
		return
	}
	*files = append(*files, backupItem{Filename: "dmz_group.json", Content: content})

	w = ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" WHERE c_orgid='%s' ", b.Spec.OrgID)
	}
	gm := []group.Member{}
	err = b.Runtime.Db.Select(&gm, `
        SELECT id, c_orgid AS orgid, c_groupid AS groupid, c_userid AS userid
        FROM dmz_group_member`+w)
	if err != nil {
		return
	}

	content, err = toJSON(gm)
	if err != nil {
		return
	}
	*files = append(*files, backupItem{Filename: "dmz_group_member.json", Content: content})

	return
}

// Space.
func (b backerHandler) dmzSpace(files *[]backupItem) (err error) {
	w := ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" WHERE c_orgid='%s' ", b.Spec.OrgID)
	}

	sp := []space.Space{}
	err = b.Runtime.Db.Select(&sp, `SELECT id, c_refid AS refid,
        c_name AS name, c_orgid AS orgid, c_userid AS userid,
        c_type AS type, c_lifecycle AS lifecycle, c_likes AS likes,
        c_created AS created, c_revised AS revised
        FROM dmz_space`+w)
	if err != nil {
		return
	}

	content, err := toJSON(sp)
	if err != nil {
		return
	}
	*files = append(*files, backupItem{Filename: "dmz_space.json", Content: content})

	return
}
