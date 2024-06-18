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

// The restore operation allows an admin to upload a backup file.
// ID, created and revised attributes values are maintained as per backup.

import (
	"archive/zip"
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"strings"
	"time"

	"github.com/documize/community/core/env"
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
	"github.com/pkg/errors"
)

// Handler contains the runtime information such as logging and database.
type restoreHandler struct {
	Runtime   *env.Runtime
	Store     *store.Store
	Spec      m.ImportSpec
	Context   domain.RequestContext
	Zip       *zip.Reader
	MapOrgID  map[string]string
	MapUserID map[string]string
}

// During the restore process, it may be necessary to change
// ID values found in backup file with a value that exists in the
// target database.
//
// NOTE: this only applies to tenant backups as we have to restore data
// into the active tenant.
func (r *restoreHandler) remapOrg(id string) string {
	if n, ok := r.MapOrgID[id]; ok {
		return n
	}
	return id
}
func (r *restoreHandler) remapUser(id string) string {
	if n, ok := r.MapUserID[id]; ok {
		return n
	}
	return id
}

// PerformRestore will unzip backup file and verify contents
// are suitable for restore operation.
func (r *restoreHandler) PerformRestore(b []byte, l int64) (err error) {
	// Read zip file into handler for subsequent processing.
	z, err := zip.NewReader(bytes.NewReader(b), l)
	if err != nil {
		err = errors.Wrap(err, "cannot read zip file")
		return
	}
	r.Zip = z

	// Unpack manifest for backup host details.
	err = r.manifest()
	if err != nil {
		return
	}

	// Detect system backup file.
	r.Spec.GlobalBackup = (r.Spec.Manifest.OrgID == "*")
	// If user is not Global Admin then you cannot do system restore.
	if !r.Context.GlobalAdmin {
		r.Spec.GlobalBackup = false
	}

	// Process might require reassignment of ID values.
	r.MapOrgID = make(map[string]string)
	r.MapUserID = make(map[string]string)

	// Organization.
	err = r.dmzOrg()
	if err != nil {
		return
	}

	// User.
	err = r.dmzUser()
	if err != nil {
		return
	}

	// User Account.
	err = r.dmzUserAccount()
	if err != nil {
		return
	}

	// User Activity.
	err = r.dmzUserActivity()
	if err != nil {
		return
	}

	// User Config.
	err = r.dmzUserConfig()
	if err != nil {
		return
	}

	// Config.
	if r.Context.GlobalAdmin {
		err = r.dmzConfig()
		if err != nil {
			return
		}
	}

	// Audit Log.
	err = r.dmzAudit()
	if err != nil {
		return
	}

	// Action.
	err = r.dmzAction()
	if err != nil {
		return
	}

	// Space Label.
	err = r.dmzSpaceLabel()
	if err != nil {
		return
	}

	// Space.
	err = r.dmzSpace()
	if err != nil {
		return
	}

	// Category.
	err = r.dmzCategory()
	if err != nil {
		return
	}

	// Category Member.
	err = r.dmzCategoryMember()
	if err != nil {
		return
	}

	// Group.
	err = r.dmzGroup()
	if err != nil {
		return
	}

	// Group Member.
	err = r.dmzGroupMember()
	if err != nil {
		return
	}

	// Permission.
	err = r.dmzPermission()
	if err != nil {
		return
	}

	// Pin.
	err = r.dmzPin()
	if err != nil {
		return
	}

	// Section.
	err = r.dmzSection()
	if err != nil {
		return
	}

	// Section Meta.
	err = r.dmzSectionMeta()
	if err != nil {
		return
	}

	// Section Template.
	err = r.dmzSectionTemplate()
	if err != nil {
		return
	}

	// Section Revision.
	err = r.dmzSectionRevision()
	if err != nil {
		return
	}

	// Doc.
	err = r.dmzDoc()
	if err != nil {
		return
	}

	// Doc Vote.
	err = r.dmzDocVote()
	if err != nil {
		return
	}

	// Doc Link.
	err = r.dmzDocLink()
	if err != nil {
		return
	}

	// Doc Attachment.
	err = r.dmzDocAttachment()
	if err != nil {
		return
	}

	// Doc Comment.
	err = r.dmzDocComment()
	if err != nil {
		return
	}

	// Doc Share.
	err = r.dmzDocShare()
	if err != nil {
		return
	}

	return nil
}

func (r *restoreHandler) manifest() (err error) {
	found, zi, err := r.readZip("manifest.json")
	if !found {
		err = errors.Wrap(err, "missing manifest.json")
		return
	}
	if err != nil {
		err = errors.Wrap(err, "failed to process manifest.json")
		return
	}
	err = json.Unmarshal(zi, &r.Spec.Manifest)
	if err != nil {
		err = errors.Wrap(err, "failed to read manifest as JSON")
		return
	}

	r.Runtime.Log.Info("Extracted manifest.json")

	return nil
}

// Reads file and unmarshals content as JSON.
func (r *restoreHandler) fileJSON(filename string, v interface{}) (err error) {
	found, zi, err := r.readZip(filename)
	if !found {
		err = errors.Wrap(err, fmt.Sprintf("missing %s", filename))
		return
	}
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to process %s", filename))
		return
	}
	err = json.Unmarshal(zi, &v)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to read %s as JSON", filename))
		return
	}

	return nil
}

// Fetches file from zip reader.
func (r *restoreHandler) readZip(filename string) (found bool, b []byte, err error) {
	found = false
	for _, zf := range r.Zip.File {
		if zf.Name == filename {
			src, e := zf.Open()
			if e != nil {
				e = errors.Wrap(e, fmt.Sprintf("cannot open %s", filename))
				return true, b, e
			}
			defer src.Close()

			b, e = ioutil.ReadAll(src)
			if e != nil {
				e = errors.Wrap(e, fmt.Sprintf("cannot read %s", filename))
				return true, b, e
			}

			found = true
			err = nil
			break
		}
	}

	return
}

// Organization.
func (r *restoreHandler) dmzOrg() (err error) {
	filename := "dmz_org.json"

	org := []orgExtended{}
	err = r.fileJSON(filename, &org)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// For global backup we recreate everything.
	// For tenant backup we just update the current OrgID to match
	// the one in the backup file, ensuring correct data linkage.
	if r.Spec.GlobalBackup {
		// Nuke all existing data.
		_, err = r.Context.Transaction.Exec("TRUNCATE TABLE dmz_org")
		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
			return
		}

		for i := range org {
			_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
                INSERT INTO dmz_org (c_refid, c_company, c_title, c_message,
                c_domain, c_service, c_email, c_anonaccess, c_authprovider, c_authconfig,
                c_maxtags, c_verified, c_serial, c_sub, c_active,
                c_theme, c_logo, c_locale, c_created, c_revised)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
				org[i].RefID, org[i].Company, org[i].Title, org[i].Message,
				strings.ToLower(org[i].Domain), org[i].ConversionEndpoint, strings.ToLower(org[i].Email),
				org[i].AllowAnonymousAccess, org[i].AuthProvider, org[i].AuthConfig,
				org[i].MaxTags, r.Runtime.StoreProvider.IsTrue(), org[i].Serial,
				org[i].Subscription, org[i].Active,
				org[i].Theme, org[i].Logo, org[i].Locale,
				org[i].Created, org[i].Revised)
			if err != nil {
				r.Context.Transaction.Rollback()
				err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, org[i].RefID))
				return
			}
		}
	} else {
		// There should only be one organization in the backup.
		// Bomb out if that is not the case.
		if len(org) != 1 {
			err = errors.Wrap(err, "tenant backup requires just one organization entry")
			return
		}

		// Existing orgID from database overrides all incoming orgID values
		// by using remapOrg().
		r.MapOrgID[org[0].RefID] = r.Spec.Org.RefID
		org[0].RefID = r.remapOrg(org[0].RefID) // e.g. remap orgID

		// Update org settings if allowed to do so.
		if !r.Spec.OverwriteOrg {
			org[0].AllowAnonymousAccess = r.Spec.Org.AllowAnonymousAccess
			org[0].AuthProvider = r.Spec.Org.AuthProvider
			org[0].AuthConfig = r.Spec.Org.AuthConfig
			org[0].Company = r.Spec.Org.Company
			org[0].ConversionEndpoint = r.Spec.Org.ConversionEndpoint
			org[0].Email = r.Spec.Org.Email
			org[0].MaxTags = r.Spec.Org.MaxTags
			org[0].Message = r.Spec.Org.Message
			org[0].Serial = r.Spec.Org.Serial
			org[0].Title = r.Spec.Org.Title
			org[0].Subscription = r.Spec.Org.Subscription
			org[0].Theme = r.Spec.Org.Theme
			org[0].Locale = r.Spec.Org.Locale
		}

		_, err = r.Context.Transaction.NamedExec(`UPDATE dmz_org SET
            c_anonaccess=:allowanonymousaccess,
            c_authprovider=:authprovider,
            c_authconfig=:authconfig,
            c_company=:company,
            c_service=:conversionendpoint,
            c_email=:email,
            c_maxtags=:maxtags,
            c_message=:message,
            c_title=:title,
            c_serial=:serial,
		    c_sub=:subscription,
			c_locale=:locale
            WHERE c_refid=:refid`, &org[0])
		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, "unable to overwrite current organization settings")
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(org)))

	return nil
}

// Config.
func (r *restoreHandler) dmzConfig() (err error) {
	filename := "dmz_config.json"

	type config struct {
		ConfigKey   string `json:"key"`
		ConfigValue string `json:"config"`
	}
	c := []config{}
	err = r.fileJSON(filename, &c)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	for i := range c {
		// We skip database schema version setting as this varies
		// between database providers (e.g. MySQL v26, PostgreSQL v2).
		if strings.ToUpper(c[i].ConfigKey) == "META" {
			continue
		}
		err = r.Store.Setting.Set(c[i].ConfigKey, c[i].ConfigValue)
		if err != nil {
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, c[i].ConfigKey))
			return
		}
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(c)))

	return nil
}

// Audit Log.
func (r *restoreHandler) dmzAudit() (err error) {
	filename := "dmz_audit_log.json"

	log := []audit.AppEvent{}
	err = r.fileJSON(filename, &log)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_audit_log"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_audit_log WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range log {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind("INSERT INTO dmz_audit_log (c_orgid, c_userid, c_eventtype, c_ip, c_created) VALUES (?, ?, ?, ?, ?)"),
			r.remapOrg(log[i].OrgID), r.remapUser(log[i].UserID), log[i].Type, log[i].IP, log[i].Created)
		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %d", filename, log[i].ID))
			return
		}
	}

	_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind("INSERT INTO dmz_audit_log (c_orgid, c_userid, c_eventtype, c_ip, c_created) VALUES (?, ?, ?, ?, ?)"),
		r.Context.OrgID, r.Context.UserID, "restored-database", r.Context.ClientIP, time.Now().UTC())

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(log)))

	return nil
}

// Action.
func (r *restoreHandler) dmzAction() (err error) {
	filename := "dmz_action.json"

	ac := []action.UserAction{}
	err = r.fileJSON(filename, &ac)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_action"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_action WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range ac {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind("INSERT INTO dmz_action (c_refid, c_orgid, c_userid, c_docid, c_actiontype, c_note, c_requestorid, c_requested, c_due, c_reftype, c_reftypeid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"),
			ac[i].RefID, r.remapOrg(ac[i].OrgID), r.remapUser(ac[i].UserID), ac[i].DocumentID, ac[i].ActionType, ac[i].Note, ac[i].RequestorID, ac[i].Requested, ac[i].Due, ac[i].RefType, ac[i].RefTypeID)
		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, ac[i].RefID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(ac)))

	return nil
}

// Space Label.
func (r *restoreHandler) dmzSpaceLabel() (err error) {
	filename := "dmz_space_label.json"

	label := []label.Label{}
	err = r.fileJSON(filename, &label)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_space_label"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_space_label WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range label {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_space_label
            (c_refid, c_orgid, c_name, c_color, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?)`),
			label[i].RefID, r.remapOrg(label[i].OrgID), label[i].Name, label[i].Color,
			label[i].Created, label[i].Revised)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, label[i].RefID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(label)))

	return nil
}

// Space.
func (r *restoreHandler) dmzSpace() (err error) {
	filename := "dmz_space.json"

	sp := []space.Space{}
	err = r.fileJSON(filename, &sp)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_space"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_space WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range sp {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_space
                (c_refid, c_name, c_orgid, c_userid, c_type, c_lifecycle,
                c_likes, c_icon, c_desc, c_count_category, c_count_content,
                c_labelid, c_created, c_revised)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			sp[i].RefID, sp[i].Name, r.remapOrg(sp[i].OrgID),
			r.remapUser(sp[i].UserID), sp[i].Type, sp[i].Lifecycle,
			sp[i].Likes, sp[i].Icon, sp[i].Description, sp[i].CountCategory,
			sp[i].CountContent, sp[i].LabelID, sp[i].Created, sp[i].Revised)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, sp[i].RefID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(sp)))

	return nil
}

// Category.
func (r *restoreHandler) dmzCategory() (err error) {
	filename := "dmz_category.json"

	ct := []category.Category{}
	err = r.fileJSON(filename, &ct)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_category"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_category WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range ct {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_category (c_refid, c_orgid, c_spaceid, c_name, c_default, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?)`),
			ct[i].RefID, r.remapOrg(ct[i].OrgID), ct[i].SpaceID, ct[i].Name, ct[i].IsDefault, ct[i].Created, ct[i].Revised)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, ct[i].RefID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(ct)))

	return nil
}

// Category Member.
func (r *restoreHandler) dmzCategoryMember() (err error) {
	filename := "dmz_category_member.json"

	cm := []category.Member{}
	err = r.fileJSON(filename, &cm)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_category_member"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_category_member WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range cm {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_category_member
            (c_refid, c_orgid, c_categoryid, c_spaceid, c_docid, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?)`),
			cm[i].RefID, r.remapOrg(cm[i].OrgID), cm[i].CategoryID, cm[i].SpaceID, cm[i].DocumentID, cm[i].Created, cm[i].Revised)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, cm[i].RefID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(cm)))

	return nil
}

// Group.
func (r *restoreHandler) dmzGroup() (err error) {
	filename := "dmz_group.json"

	gr := []group.Group{}
	err = r.fileJSON(filename, &gr)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_group"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_group WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range gr {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_group
            (c_refid, c_orgid, c_name, c_desc, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?)`),
			gr[i].RefID, r.remapOrg(gr[i].OrgID), gr[i].Name, gr[i].Purpose, gr[i].Created, gr[i].Revised)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, gr[i].RefID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(gr)))

	return nil
}

// Group Member.
func (r *restoreHandler) dmzGroupMember() (err error) {
	filename := "dmz_group_member.json"

	gm := []group.Member{}
	err = r.fileJSON(filename, &gm)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_group_member"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_group_member WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range gm {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_group_member
            (c_orgid, c_groupid, c_userid)
            VALUES (?, ?, ?)`),
			r.remapOrg(gm[i].OrgID), gm[i].GroupID, r.remapUser(gm[i].UserID))

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, gm[i].UserID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(gm)))

	return nil
}

// Permission.
func (r *restoreHandler) dmzPermission() (err error) {
	filename := "dmz_permission.json"

	pm := []permission.Permission{}
	err = r.fileJSON(filename, &pm)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_permission"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_permission WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range pm {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_permission
            (c_orgid, c_who, c_whoid, c_action, c_scope, c_location, c_refid, c_created)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`),
			r.remapOrg(pm[i].OrgID), string(pm[i].Who), r.remapUser(pm[i].WhoID),
			string(pm[i].Action), string(pm[i].Scope),
			string(pm[i].Location), pm[i].RefID, pm[i].Created)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, pm[i].WhoID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(pm)))

	return nil
}

// Pin.
func (r *restoreHandler) dmzPin() (err error) {
	filename := "dmz_pin.json"

	pin := []pin.Pin{}
	err = r.fileJSON(filename, &pin)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_pin"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_pin WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range pin {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_pin
            (c_refid, c_orgid, c_userid, c_spaceid, c_docid, c_name, c_sequence, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			pin[i].RefID, r.remapOrg(pin[i].OrgID), r.remapUser(pin[i].UserID), pin[i].SpaceID,
			pin[i].DocumentID, pin[i].Name, pin[i].Sequence, pin[i].Created, pin[i].Revised)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, pin[i].RefID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(pin)))

	return nil
}

// Section.
func (r *restoreHandler) dmzSection() (err error) {
	filename := "dmz_section.json"

	sc := []page.Page{}
	err = r.fileJSON(filename, &sc)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_section"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_section WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range sc {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_section
            (c_refid, c_orgid, c_docid, c_userid, c_contenttype, c_type, c_level, c_name, c_body,
            c_revisions, c_sequence, c_templateid, c_status, c_relativeid, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			sc[i].RefID, r.remapOrg(sc[i].OrgID), sc[i].DocumentID, r.remapUser(sc[i].UserID),
			sc[i].ContentType, sc[i].Type, sc[i].Level, sc[i].Name,
			sc[i].Body, sc[i].Revisions, sc[i].Sequence, sc[i].TemplateID,
			sc[i].Status, sc[i].RelativeID, sc[i].Created, sc[i].Revised)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, sc[i].RefID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(sc)))

	return nil
}

// Section Meta
func (r *restoreHandler) dmzSectionMeta() (err error) {
	filename := "dmz_section_meta.json"

	sm := []page.Meta{}
	err = r.fileJSON(filename, &sm)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_section_meta"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_section_meta WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)

	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range sm {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_section_meta
            (c_sectionid, c_orgid, c_userid, c_docid, c_rawbody,
            c_config, c_external, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			sm[i].SectionID, r.remapOrg(sm[i].OrgID), r.remapUser(sm[i].UserID), sm[i].DocumentID,
			sm[i].RawBody, sm[i].Config, sm[i].ExternalSource,
			sm[i].Created, sm[i].Revised)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, sm[i].SectionID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(sm)))

	return nil
}

// Section Revision
func (r *restoreHandler) dmzSectionRevision() (err error) {
	filename := "dmz_section_revision.json"

	sr := []page.Revision{}
	err = r.fileJSON(filename, &sr)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_section_revision"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_section_revision WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range sr {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_section_revision
            (c_refid, c_orgid, c_docid, c_ownerid, c_sectionid, c_userid, c_contenttype,
            c_type, c_name, c_body, c_rawbody, c_config, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			sr[i].RefID, r.remapOrg(sr[i].OrgID), sr[i].DocumentID, sr[i].OwnerID,
			sr[i].SectionID, r.remapUser(sr[i].UserID), sr[i].ContentType, sr[i].Type, sr[i].Name,
			sr[i].Body, sr[i].RawBody, sr[i].Config, sr[i].Created, sr[i].Revised)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, sr[i].SectionID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(sr)))

	return nil
}

// Section Template
func (r *restoreHandler) dmzSectionTemplate() (err error) {
	filename := "dmz_section_template.json"

	st := []block.Block{}
	err = r.fileJSON(filename, &st)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_section_template"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_section_template WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range st {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_section_template
            (c_refid, c_orgid, c_spaceid, c_userid, c_contenttype,
            c_type, c_name, c_body, c_desc, c_rawbody, c_used,
            c_config, c_external, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			st[i].RefID, r.remapOrg(st[i].OrgID), st[i].SpaceID, r.remapUser(st[i].UserID),
			st[i].ContentType, st[i].Type,
			st[i].Name, st[i].Body, st[i].Excerpt, st[i].RawBody, st[i].Used,
			st[i].Config, st[i].ExternalSource, st[i].Created, st[i].Revised)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, st[i].RefID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(st)))

	return nil
}

// Doc
func (r *restoreHandler) dmzDoc() (err error) {
	filename := "dmz_doc.json"

	doc := []doc.Document{}
	err = r.fileJSON(filename, &doc)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_doc"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_doc WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range doc {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_doc
            (c_refid, c_orgid, c_spaceid, c_userid, c_job, c_location,
            c_name, c_desc, c_slug, c_tags, c_template, c_protection, c_approval,
			c_lifecycle, c_versioned, c_versionid, c_versionorder, c_seq, c_groupid,
			c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			doc[i].RefID, r.remapOrg(doc[i].OrgID), doc[i].SpaceID, r.remapUser(doc[i].UserID), doc[i].Job,
			doc[i].Location, doc[i].Name, doc[i].Excerpt, doc[i].Slug, doc[i].Tags,
			doc[i].Template, doc[i].Protection, doc[i].Approval, doc[i].Lifecycle,
			doc[i].Versioned, doc[i].VersionID, doc[i].VersionOrder, doc[i].Sequence, doc[i].GroupID,
			doc[i].Created, doc[i].Revised)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, doc[i].RefID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(doc)))

	return nil
}

// Doc Vote
func (r *restoreHandler) dmzDocVote() (err error) {
	filename := "dmz_doc_vote.json"

	type vote struct {
		RefID      string    `json:"refId"`
		OrgID      string    `json:"orgId"`
		DocumentID string    `json:"documentId"`
		VoterID    string    `json:"voterId"`
		Vote       int       `json:"vote"`
		Created    time.Time `json:"created"`
		Revised    time.Time `json:"revised"`
	}
	v := []vote{}
	err = r.fileJSON(filename, &v)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_doc_vote"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_doc_vote WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range v {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_doc_vote (c_refid, c_orgid, c_docid, c_voter, c_vote, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?)`),
			v[i].RefID, r.remapOrg(v[i].OrgID), v[i].DocumentID, v[i].VoterID, v[i].Vote, v[i].Created, v[i].Revised)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, v[i].RefID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(v)))

	return nil
}

// Doc Link
func (r *restoreHandler) dmzDocLink() (err error) {
	filename := "dmz_doc_link.json"

	lk := []link.Link{}
	err = r.fileJSON(filename, &lk)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_doc_link"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_doc_link WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range lk {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_doc_link
            (c_refid, c_orgid, c_spaceid, c_userid, c_sourcedocid, c_sourcesectionid,
            c_targetdocid, c_targetid, c_externalid, c_type, c_orphan, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			lk[i].RefID, r.remapOrg(lk[i].OrgID), lk[i].SpaceID, r.remapUser(lk[i].UserID),
			lk[i].SourceDocumentID, lk[i].SourceSectionID,
			lk[i].TargetDocumentID, lk[i].TargetID, lk[i].ExternalID, lk[i].LinkType, lk[i].Orphan,
			lk[i].Created, lk[i].Revised)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, lk[i].RefID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(lk)))

	return nil
}

// Doc Attachment
func (r *restoreHandler) dmzDocAttachment() (err error) {
	filename := "dmz_doc_attachment.json"

	at := []attachment.Attachment{}
	err = r.fileJSON(filename, &at)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_doc_attachment"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_doc_attachment WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range at {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_doc_attachment
            (c_refid, c_orgid, c_docid, c_sectionid, c_job, c_fileid,
            c_filename, c_data, c_extension, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			at[i].RefID, r.remapOrg(at[i].OrgID), at[i].DocumentID, at[i].SectionID,
			at[i].Job, at[i].FileID, at[i].Filename,
			at[i].Data, at[i].Extension, at[i].Created, at[i].Revised)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, at[i].RefID))
			r.Runtime.Log.Error("warning", err)
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(at)))

	return nil
}

// Doc Comment
func (r *restoreHandler) dmzDocComment() (err error) {
	filename := "dmz_doc_comment.json"

	cm := []comment{}
	err = r.fileJSON(filename, &cm)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_doc_comment"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_doc_comment WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range cm {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_doc_comment
            (c_refid, c_orgid, c_userid, c_docid, c_email, c_feedback, c_replyto, c_sectionid, c_created)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			cm[i].RefID, r.remapOrg(cm[i].OrgID), r.remapUser(cm[i].UserID), cm[i].DocumentID,
			cm[i].Email, cm[i].Feedback, cm[i].ReplyTo, cm[i].SectionID, cm[i].Created)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, cm[i].RefID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(cm)))

	return nil
}

// Doc Share
func (r *restoreHandler) dmzDocShare() (err error) {
	filename := "dmz_doc_share.json"

	type share struct {
		ID         uint64    `json:"id"`
		OrgID      string    `json:"orgId"`
		UserID     string    `json:"userId"`
		DocumentID string    `json:"documentId"`
		Email      string    `json:"email"`
		Message    string    `json:"message"`
		Viewed     string    `json:"viewed"`  // recording each view as |date-viewed|date-viewed|
		Secret     string    `json:"secret"`  // secure token used to access document
		Expires    string    `json:"expires"` // number of days from creation, value of 0 means never
		Active     bool      `json:"active"`
		Created    time.Time `json:"created"`
	}
	sh := []share{}
	err = r.fileJSON(filename, &sh)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_doc_share"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_doc_share WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range sh {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_doc_share
            (c_orgid, c_userid, c_docid, c_email, c_message,
            c_secret, c_expires, c_active, c_created)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			r.remapOrg(sh[i].OrgID), r.remapUser(sh[i].UserID), sh[i].DocumentID, sh[i].Email, sh[i].Message,
			sh[i].Secret, sh[i].Expires, sh[i].Active, sh[i].Created)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %d", filename, sh[i].ID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(sh)))

	return nil
}

// User.
func (r *restoreHandler) dmzUser() (err error) {
	filename := "dmz_user.json"

	u := []m.User{}
	err = r.fileJSON(filename, &u)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	if r.Spec.GlobalBackup {
		_, err = r.Context.Transaction.Exec("TRUNCATE TABLE dmz_user")
		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
			return
		}
	}

	for i := range u {
		// For tenant backups we first check to see if user exists.
		insert := true
		if !r.Spec.GlobalBackup {
			row := r.Runtime.Db.QueryRow(r.Runtime.Db.Rebind("SELECT COALESCE(c_refid, '') AS userid FROM dmz_user WHERE c_email=?"), u[i].Email)
			userID := ""
			err = row.Scan(&userID)
			if err == sql.ErrNoRows {
				err = nil
				insert = true
			}
			if err != nil {
				r.Context.Transaction.Rollback()
				err = errors.Wrap(err, fmt.Sprintf("unable to check email %s", u[i].Email))
				return
			}
			// Existing userID from database overrides all incoming userID values by using remapUser().
			if len(userID) > 0 {
				r.MapUserID[u[i].RefID] = userID
				insert = false
			}
		}

		if insert {
			_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_user
            (c_refid, c_firstname, c_lastname, c_email, c_initials, c_globaladmin,
            c_password, c_salt, c_reset, c_active, c_lastversion, c_locale, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
				r.remapUser(u[i].RefID), u[i].Firstname, u[i].Lastname, strings.ToLower(u[i].Email), u[i].Initials,
				u[i].GlobalAdmin, u[i].Password, u[i].Salt, u[i].Reset, u[i].Active,
				u[i].LastVersion, u[i].Locale, u[i].Created, u[i].Revised)

			if err != nil {
				r.Context.Transaction.Rollback()
				err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, u[i].RefID))
				return
			}
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(u)))

	return nil
}

// Account.
func (r *restoreHandler) dmzUserAccount() (err error) {
	filename := "dmz_user_account.json"

	ac := []account.Account{}
	err = r.fileJSON(filename, &ac)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_user_account"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_user_account WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range ac {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_user_account
            (c_refid, c_orgid, c_userid, c_admin, c_editor, c_users,
            c_analytics, c_active, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			ac[i].RefID, r.remapOrg(ac[i].OrgID), r.remapUser(ac[i].UserID), ac[i].Admin, ac[i].Editor,
			ac[i].Users, ac[i].Analytics, ac[i].Active, ac[i].Created, ac[i].Revised)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, ac[i].RefID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(ac)))

	return nil
}

// User Activity.
func (r *restoreHandler) dmzUserActivity() (err error) {
	filename := "dmz_user_activity.json"

	ac := []activity.UserActivity{}
	err = r.fileJSON(filename, &ac)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_user_activity"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_user_activity WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range ac {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_user_activity
            (c_orgid, c_userid, c_spaceid, c_docid, c_sectionid, c_sourcetype,
            c_activitytype, c_metadata, c_created)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			r.remapOrg(ac[i].OrgID), r.remapUser(ac[i].UserID), ac[i].SpaceID, ac[i].DocumentID,
			ac[i].SectionID, ac[i].SourceType, ac[i].ActivityType,
			ac[i].Metadata, ac[i].Created)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, ac[i].UserID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(ac)))

	return nil
}

// User Config.
func (r *restoreHandler) dmzUserConfig() (err error) {
	filename := "dmz_user_config.json"

	type userConfig struct {
		OrgID       string `json:"orgId"`
		UserID      string `json:"userId"`
		ConfigKey   string `json:"key"`
		ConfigValue string `json:"config"`
	}
	uc := []userConfig{}
	err = r.fileJSON(filename, &uc)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to load %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Extracted %s", filename))

	r.Context.Transaction, err = r.Runtime.Db.Beginx()
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("unable to start TX for %s", filename))
		return
	}

	// Nuke all existing data.
	nuke := "TRUNCATE TABLE dmz_user_config"
	if !r.Spec.GlobalBackup {
		nuke = fmt.Sprintf("DELETE FROM dmz_user_config WHERE c_orgid='%s'", r.Spec.Org.RefID)
	}
	_, err = r.Context.Transaction.Exec(nuke)
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to truncate table %s", filename))
		return
	}

	for i := range uc {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_user_config
            (c_orgid, c_userid, c_key, c_config)
            VALUES (?, ?, ?, ?)`),
			r.remapOrg(uc[i].OrgID), r.remapUser(uc[i].UserID), uc[i].ConfigKey, uc[i].ConfigValue)

		if err != nil {
			r.Context.Transaction.Rollback()
			err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, uc[i].UserID))
			return
		}
	}

	err = r.Context.Transaction.Commit()
	if err != nil {
		r.Context.Transaction.Rollback()
		err = errors.Wrap(err, fmt.Sprintf("unable to commit %s", filename))
		return
	}

	r.Runtime.Log.Info(fmt.Sprintf("Processed %s %d records", filename, len(uc)))

	return nil
}
