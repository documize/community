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
//
// TODO: explore writing straight to HTTP response via https://github.com/mholt/archiver

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
	"github.com/documize/community/model/action"
	"github.com/documize/community/model/activity"
	"github.com/documize/community/model/attachment"
	"github.com/documize/community/model/audit"
	m "github.com/documize/community/model/backup"
	"github.com/documize/community/model/block"
	"github.com/documize/community/model/category"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/group"
	"github.com/documize/community/model/label"
	"github.com/documize/community/model/link"
	"github.com/documize/community/model/page"
	"github.com/documize/community/model/permission"
	"github.com/documize/community/model/pin"
	"github.com/documize/community/model/space"
	uuid "github.com/nu7hatch/gouuid"
	"github.com/pkg/errors"
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
	j, err := json.Marshal(v)
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

// Produce collection of files to be included in backup file.
func (b backerHandler) produce(id string) (files []backupItem, err error) {
	// Backup manifest
	c, err := b.manifest(id)
	if err != nil {
		return
	}
	files = append(files, backupItem{Filename: "manifest.json", Content: c})

	// Organization
	err = b.dmzOrg(&files)
	if err != nil {
		return
	}

	// Config, User Config
	err = b.dmzConfig(&files)
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

	// Activity, Audit
	err = b.dmzActivity(&files)
	if err != nil {
		return
	}

	// Pin
	err = b.dmzPin(&files)
	if err != nil {
		return
	}

	// Space Label
	err = b.dmzSpaceLabel(&files)
	if err != nil {
		return
	}

	// Space, Permission.
	err = b.dmzSpace(&files)
	if err != nil {
		return
	}

	// Category, Category Member.
	err = b.dmzCategory(&files)
	if err != nil {
		return
	}

	// Section, Section Meta, Section Revision, Section Template.
	err = b.dmzSection(&files)
	if err != nil {
		return
	}

	// Document, Link, Vote, Comment, Share, Attachment.
	err = b.dmzDocument(&files)
	if err != nil {
		return
	}

	// Action
	err = b.dmzAction(&files)
	if err != nil {
		return
	}

	return
}

// Manifest describes envrionement of backup source.
func (b backerHandler) manifest(id string) (string, error) {
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

// Organization.
func (b backerHandler) dmzOrg(files *[]backupItem) (err error) {
	w := ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" WHERE c_refid='%s' ", b.Spec.OrgID)
	}

	o := []orgExtended{}
	err = b.Runtime.Db.Select(&o, `SELECT id, c_refid AS refid,
        c_title AS title, c_message AS message, c_domain AS domain,
        c_service AS conversionendpoint, c_email AS email, c_serial AS serial, c_active AS active,
        c_anonaccess AS allowanonymousaccess, c_authprovider AS authprovider,
	    coalesce(c_sub,`+b.Runtime.StoreProvider.JSONEmpty()+`) AS subscription,
        coalesce(c_authconfig,`+b.Runtime.StoreProvider.JSONEmpty()+`) AS authconfig, c_maxtags AS maxtags,
        c_theme AS theme, c_logo AS logo, c_locale as locale, c_created AS created, c_revised AS revised
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

// Config, User Config.
func (b backerHandler) dmzConfig(files *[]backupItem) (err error) {
	c := []config{}
	err = b.Runtime.Db.Select(&c, `SELECT c_key AS configkey, c_config AS configvalue FROM dmz_config`)
	if err != nil {
		return
	}

	content, err := toJSON(c)
	if err != nil {
		return
	}

	if b.Spec.SystemBackup() {
		*files = append(*files, backupItem{Filename: "dmz_config.json", Content: content})
	}

	w := ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" where c_orgid='%s' ", b.Spec.OrgID)
	}

	uc := []userConfig{}
	err = b.Runtime.Db.Select(&uc, `select c_orgid AS orgid, c_userid AS userid,
	c_key AS configkey, c_config AS configvalue FROM dmz_user_config`+w)
	if err != nil {
		return
	}

	content, err = toJSON(uc)
	if err != nil {
		return
	}
	*files = append(*files, backupItem{Filename: "dmz_user_config.json", Content: content})

	return
}

// User, Account.
func (b backerHandler) dmzUserAccount(files *[]backupItem) (err error) {
	w := ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" , dmz_user_account a WHERE u.c_refid=a.c_userid AND a.c_orgid='%s' ", b.Spec.OrgID)
	}

	u := []m.User{}
	err = b.Runtime.Db.Select(&u, `SELECT u.id, u.c_refid AS refid,
        u.c_firstname AS firstname, u.c_lastname AS lastname, u.c_email AS email,
        u.c_initials AS initials, u.c_globaladmin AS globaladmin,
        u.c_password AS password, u.c_salt AS salt, u.c_reset AS reset, u.c_lastversion AS lastversion, u.c_locale as locale,
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

// Activity, Audit
func (b backerHandler) dmzActivity(files *[]backupItem) (err error) {
	w := ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" WHERE c_orgid='%s' ", b.Spec.OrgID)
	}

	ac := []activity.UserActivity{}
	err = b.Runtime.Db.Select(&ac, `
        SELECT id, c_orgid AS orgid, c_userid AS userid, c_spaceid AS spaceid,
        c_docid AS documentid, c_sectionid AS sectionid, c_sourcetype AS sourcetype,
        c_activitytype AS activitytype, c_metadata AS metadata, c_created AS created
        FROM dmz_user_activity`+w)
	if err != nil {
		return errors.Wrap(err, "select.activity")
	}

	content, err := toJSON(ac)
	if err != nil {
		return errors.Wrap(err, "json.activity")
	}
	*files = append(*files, backupItem{Filename: "dmz_user_activity.json", Content: content})

	w = ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" WHERE c_orgid='%s' ", b.Spec.OrgID)
	}

	al := []audit.AppEvent{}
	err = b.Runtime.Db.Select(&al, `
        SELECT c_orgid AS orgid, c_userid AS userid, c_eventtype AS type,
        c_ip AS ip, c_created AS created
        FROM dmz_audit_log`+w)
	if err != nil {
		return errors.Wrap(err, "select.audit")
	}

	content, err = toJSON(al)
	if err != nil {
		return errors.Wrap(err, "json.audit")
	}
	*files = append(*files, backupItem{Filename: "dmz_audit_log.json", Content: content})

	return
}

// Pin
func (b backerHandler) dmzPin(files *[]backupItem) (err error) {
	w := ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" WHERE c_orgid='%s' ", b.Spec.OrgID)
	}

	p := []pin.Pin{}
	err = b.Runtime.Db.Select(&p, `
        SELECT id, c_refid AS refid,
        c_orgid AS orgid, c_userid AS userid, c_spaceid AS spaceid, c_docid AS documentid,
        c_name AS name, c_sequence AS sequence, c_created AS created, c_revised AS revised
        FROM dmz_pin`+w)
	if err != nil {
		return errors.Wrap(err, "select.pin")
	}

	content, err := toJSON(p)
	if err != nil {
		return errors.Wrap(err, "json.pin")
	}
	*files = append(*files, backupItem{Filename: "dmz_pin.json", Content: content})

	return
}

// Space Label
func (b backerHandler) dmzSpaceLabel(files *[]backupItem) (err error) {
	w := ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" WHERE c_orgid='%s' ", b.Spec.OrgID)
	}

	l := []label.Label{}
	err = b.Runtime.Db.Select(&l, `
        SELECT id, c_refid AS refid,
        c_orgid AS orgid, c_name AS name, c_color AS color,
        c_created AS created, c_revised AS revised
        FROM dmz_space_label`+w)
	if err != nil {
		return errors.Wrap(err, "select.space_label")
	}

	content, err := toJSON(l)
	if err != nil {
		return errors.Wrap(err, "json.space_label")
	}
	*files = append(*files, backupItem{Filename: "dmz_space_label.json", Content: content})

	return
}

// Space, Permission.
func (b backerHandler) dmzSpace(files *[]backupItem) (err error) {
	w := ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" WHERE c_orgid='%s' ", b.Spec.OrgID)
	}

	sp := []space.Space{}
	err = b.Runtime.Db.Select(&sp, `SELECT id, c_refid AS refid,
        c_name AS name, c_orgid AS orgid, c_userid AS userid,
        c_type AS type, c_lifecycle AS lifecycle, c_likes AS likes,
        c_icon AS icon, c_labelid AS labelid, c_desc AS description,
        c_count_category As countcategory, c_count_content AS countcontent,
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

	w = ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" WHERE c_orgid='%s' ", b.Spec.OrgID)
	}

	p := []permission.Permission{}
	err = b.Runtime.Db.Select(&p, `
        SELECT id, c_orgid AS orgid, c_who AS who, c_whoid AS whoid,
        c_action AS action, c_scope AS scope, c_location AS location,
        c_refid AS refid, c_created AS created
        FROM dmz_permission`+w)
	if err != nil {
		return errors.Wrap(err, "select.permission")
	}

	content, err = toJSON(p)
	if err != nil {
		return errors.Wrap(err, "json.permission")
	}
	*files = append(*files, backupItem{Filename: "dmz_permission.json", Content: content})

	return
}

// Category, Category Member.
func (b backerHandler) dmzCategory(files *[]backupItem) (err error) {
	w := ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" WHERE c_orgid='%s' ", b.Spec.OrgID)
	}

	cat := []category.Category{}
	err = b.Runtime.Db.Select(&cat, `
        SELECT id, c_refid AS refid,
        c_orgid AS orgid, c_spaceid AS spaceid,
		c_name AS name, c_default AS isdefault,
		c_created AS created, c_revised AS revised
        FROM dmz_category`+w)
	if err != nil {
		return errors.Wrap(err, "select.category")
	}

	content, err := toJSON(cat)
	if err != nil {
		return errors.Wrap(err, "json.category")
	}
	*files = append(*files, backupItem{Filename: "dmz_category.json", Content: content})

	w = ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" WHERE c_orgid='%s' ", b.Spec.OrgID)
	}

	cm := []category.Member{}
	err = b.Runtime.Db.Select(&cm, `
        SELECT id, c_refid AS refid, c_orgid AS orgid,
        c_spaceid AS spaceid, c_categoryid AS categoryid,
        c_docid AS documentid, c_created AS created, c_revised AS revised
        FROM dmz_category_member`+w)
	if err != nil {
		return errors.Wrap(err, "select.categorymember")
	}

	content, err = toJSON(cm)
	if err != nil {
		return errors.Wrap(err, "json.categorymember")
	}
	*files = append(*files, backupItem{Filename: "dmz_category_member.json", Content: content})

	return
}

// Section, Section Meta, Section Revision, Section Template.
func (b backerHandler) dmzSection(files *[]backupItem) (err error) {
	w := ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" WHERE c_orgid='%s' ", b.Spec.OrgID)
	}

	// Section
	sec := []page.Page{}
	err = b.Runtime.Db.Select(&sec, `
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_docid AS documentid, c_userid AS userid, c_contenttype AS contenttype, c_type AS type,
        c_level AS level, c_sequence AS sequence, c_name AS name, c_body AS body, c_revisions AS revisions, c_templateid AS templateid,
        c_status AS status, c_relativeid AS relativeid, c_created AS created, c_revised AS revised
        FROM dmz_section`+w)
	if err != nil {
		return errors.Wrap(err, "select.section")
	}

	content, err := toJSON(sec)
	if err != nil {
		return errors.Wrap(err, "json.section")
	}
	*files = append(*files, backupItem{Filename: "dmz_section.json", Content: content})

	// Section Meta
	sm := []page.Meta{}
	err = b.Runtime.Db.Select(&sm, `
        SELECT id, c_sectionid AS sectionid,
        c_orgid AS orgid, c_userid AS userid, c_docid AS documentid,
        c_rawbody AS rawbody, coalesce(c_config,`+b.Runtime.StoreProvider.JSONEmpty()+`) as config,
        c_external AS externalsource, c_created AS created, c_revised AS revised
        FROM dmz_section_meta`+w)
	if err != nil {
		return errors.Wrap(err, "select.sectionmeta")
	}

	content, err = toJSON(sm)
	if err != nil {
		return errors.Wrap(err, "json.sectionmeta")
	}
	*files = append(*files, backupItem{Filename: "dmz_section_meta.json", Content: content})

	// Section Revision
	sr := []page.Revision{}
	err = b.Runtime.Db.Select(&sr, `
        SELECT id, c_refid AS refid,
        c_orgid AS orgid, c_docid AS documentid, c_ownerid AS  ownerid,
        c_sectionid AS sectionid,
        c_userid AS userid, c_contenttype AS contenttype, c_type AS type,
        c_name AS name, c_body AS body, coalesce(c_rawbody, '') as rawbody,
        coalesce(c_config,`+b.Runtime.StoreProvider.JSONEmpty()+`) as config,
        c_created AS created, c_revised AS revised
        FROM dmz_section_revision`+w)
	if err != nil {
		return errors.Wrap(err, "select.sectionrevision")
	}

	content, err = toJSON(sr)
	if err != nil {
		return errors.Wrap(err, "json.sectionrevision")
	}
	*files = append(*files, backupItem{Filename: "dmz_section_revision.json", Content: content})

	// Section Template
	st := []block.Block{}
	err = b.Runtime.Db.Select(&st, `
        SELECT id, c_refid as refid,
        c_orgid as orgid,
        c_spaceid AS spaceid, c_userid AS userid, c_contenttype AS contenttype, c_type AS type,
        c_name AS name, c_body AS body, c_desc AS excerpt, c_rawbody AS rawbody,
        c_config AS config, c_external AS externalsource, c_used AS used,
        c_created AS created, c_revised AS revised
        FROM dmz_section_template`+w)
	if err != nil {
		return errors.Wrap(err, "select.sectiontemplate")
	}

	content, err = toJSON(st)
	if err != nil {
		return errors.Wrap(err, "json.sectiontemplate")
	}
	*files = append(*files, backupItem{Filename: "dmz_section_template.json", Content: content})

	return
}

// Document, Link, Vote, Comment, Share, Attachment.
func (b backerHandler) dmzDocument(files *[]backupItem) (err error) {
	w := ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" WHERE c_orgid='%s' ", b.Spec.OrgID)
	}

	// Document
	d := []doc.Document{}
	err = b.Runtime.Db.Select(&d, `
        SELECT id, c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_userid AS userid,
        c_job AS job, c_location AS location, c_name AS name, c_desc AS excerpt, c_slug AS slug,
        c_tags AS tags, c_template AS template, c_protection AS protection, c_approval AS approval,
        c_lifecycle AS lifecycle, c_versioned AS versioned, c_versionid AS versionid,
        c_versionorder AS versionorder, c_seq AS sequence, c_groupid AS groupid, c_created AS created, c_revised AS revised
        FROM dmz_doc`+w)
	if err != nil {
		return errors.Wrap(err, "select.document")
	}

	content, err := toJSON(d)
	if err != nil {
		return errors.Wrap(err, "json.document")
	}
	*files = append(*files, backupItem{Filename: "dmz_doc.json", Content: content})

	// Vote
	vt := []vote{}
	err = b.Runtime.Db.Select(&vt, `
        SELECT c_refid AS refid, c_orgid AS orgid,
        c_voter AS voterid, c_vote AS vote,
        c_docid AS documentid, c_created AS created, c_revised AS revised
        FROM dmz_doc_vote`+w)
	if err != nil {
		return errors.Wrap(err, "select.docvote")
	}

	content, err = toJSON(vt)
	if err != nil {
		return errors.Wrap(err, "json.docvote")
	}
	*files = append(*files, backupItem{Filename: "dmz_doc_vote.json", Content: content})

	// Link
	ln := []link.Link{}
	err = b.Runtime.Db.Select(&ln, `
        select c_refid AS refid, c_orgid AS orgid, c_spaceid AS spaceid, c_userid AS userid,
        c_sourcedocid AS sourcedocumentid, c_sourcesectionid AS sourcesectionid,
        c_targetdocid AS targetdocumentid, c_targetid AS targetid, c_externalid AS externalid,
        c_type as linktype, c_orphan As orphan, c_created AS created, c_revised AS revised
        FROM dmz_doc_link`+w)
	if err != nil {
		return errors.Wrap(err, "select.doclink")
	}

	content, err = toJSON(ln)
	if err != nil {
		return errors.Wrap(err, "json.doclink")
	}
	*files = append(*files, backupItem{Filename: "dmz_doc_link.json", Content: content})

	// Comment
	cm := []comment{}
	err = b.Runtime.Db.Select(&cm, `
        SELECT c_refid AS refid, c_orgid AS orgid, c_docid AS documentid,
        c_userid AS userid, c_email AS email,
		c_feedback AS feedback, c_sectionid AS sectionid, c_replyto AS replyto,
		c_created AS created
        FROM dmz_doc_comment`+w)
	if err != nil {
		return errors.Wrap(err, "select.doccomment")
	}

	content, err = toJSON(cm)
	if err != nil {
		return errors.Wrap(err, "json.doccomment")
	}
	*files = append(*files, backupItem{Filename: "dmz_doc_comment.json", Content: content})

	// Share
	sh := []share{}
	err = b.Runtime.Db.Select(&sh, `
        SELECT id AS id, c_orgid AS orgid, c_docid AS documentid,
        c_userid AS userid, c_email AS email, c_message AS message, c_viewed AS viewed,
        c_expires AS expires, c_active AS active, c_secret AS secret, c_created AS created
        FROM dmz_doc_share`+w)
	if err != nil {
		return errors.Wrap(err, "select.docshare")
	}

	content, err = toJSON(sh)
	if err != nil {
		return errors.Wrap(err, "json.docshare")
	}
	*files = append(*files, backupItem{Filename: "dmz_doc_share.json", Content: content})

	// Attachment
	at := []attachment.Attachment{}
	err = b.Runtime.Db.Select(&at, `
        SELECT id, c_refid AS refid,
        c_orgid AS orgid, c_docid AS documentid, c_sectionid AS sectionid, c_job AS job, c_fileid AS fileid,
        c_filename AS filename, c_data AS data, c_extension AS extension,
        c_created AS created, c_revised AS revised
        FROM dmz_doc_attachment`+w)
	if err != nil {
		return errors.Wrap(err, "select.docattachment")
	}

	content, err = toJSON(at)
	if err != nil {
		return errors.Wrap(err, "json.docattachment")
	}
	*files = append(*files, backupItem{Filename: "dmz_doc_attachment.json", Content: content})

	return
}

// Action
func (b backerHandler) dmzAction(files *[]backupItem) (err error) {
	w := ""
	if !b.Spec.SystemBackup() {
		w = fmt.Sprintf(" WHERE c_orgid='%s' ", b.Spec.OrgID)
	}

	ac := []action.UserAction{}
	err = b.Runtime.Db.Select(&ac, `
        SELECT c_refid AS refid, c_orgid AS orgid, c_docid AS documentid, c_userid AS userid,
        c_actiontype AS actiontype, c_note AS note, c_requestorid AS requestorid, c_requested AS requested, c_due AS due,
        c_completed AS completed, c_iscomplete AS iscomplete, c_reftype AS reftype, c_reftypeid AS reftypeid,
        c_created AS created, c_revised AS revised
        FROM dmz_action`+w)
	if err != nil {
		return errors.Wrap(err, "select.action")
	}

	content, err := toJSON(ac)
	if err != nil {
		return errors.Wrap(err, "json.action")
	}
	*files = append(*files, backupItem{Filename: "dmz_action.json", Content: content})

	return
}
