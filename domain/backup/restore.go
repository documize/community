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
	"encoding/json"
	"fmt"
	"io/ioutil"
	"strings"
	"time"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/action"
	"github.com/documize/community/model/audit"
	m "github.com/documize/community/model/backup"
	"github.com/documize/community/model/category"
	"github.com/documize/community/model/org"
	"github.com/documize/community/model/space"
	"github.com/pkg/errors"
)

// Handler contains the runtime information such as logging and database.
type restoreHandler struct {
	Runtime *env.Runtime
	Store   *store.Store
	Spec    m.ImportSpec
	Context domain.RequestContext
	Zip     *zip.Reader
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

	// Organization.
	err = r.dmzOrg()
	if err != nil {
		return
	}

	// Config.
	err = r.dmzConfig()
	if err != nil {
		return
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

	// CategoryMember.
	err = r.dmzCategoryMember()
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

	org := []org.Organization{}
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

	for i := range org {
		// If same tenant (domain) then patch OrgID.
		if org[i].Domain == r.Spec.Org.Domain {
			org[i].RefID = r.Spec.Org.RefID

			// Update org settings if allowed to do so.
			if !r.Spec.OverwriteOrg {
				org[i].AllowAnonymousAccess = r.Spec.Org.AllowAnonymousAccess
				org[i].AuthProvider = r.Spec.Org.AuthProvider
				org[i].AuthConfig = r.Spec.Org.AuthConfig
				org[i].Company = r.Spec.Org.Company
				org[i].ConversionEndpoint = r.Spec.Org.ConversionEndpoint
				org[i].Email = r.Spec.Org.Email
				org[i].MaxTags = r.Spec.Org.MaxTags
				org[i].Message = r.Spec.Org.Message
				org[i].Serial = r.Spec.Org.Serial
				org[i].Title = r.Spec.Org.Title
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
                c_serial=:serial
                WHERE c_refid=:refid`, &org[i])
			if err != nil {
				r.Context.Transaction.Rollback()
				err = errors.Wrap(err, "unable to overwrite current organization settings")
				return
			}
		} else {
			// Add new organization.
			_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
                INSERT INTO dmz_org (c_refid, c_company, c_title, c_message,
                    c_domain, c_service, c_email, c_anonaccess, c_authprovider, c_authconfig,
                    c_maxtags, c_verified, c_serial, c_active, c_created, c_revised)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
				org[i].RefID, org[i].Company, org[i].Title, org[i].Message,
				strings.ToLower(org[i].Domain), org[i].ConversionEndpoint, strings.ToLower(org[i].Email),
				org[i].AllowAnonymousAccess, org[i].AuthProvider, org[i].AuthConfig,
				org[i].MaxTags, true, org[i].Serial, org[i].Active, org[i].Created, org[i].Revised)
			if err != nil {
				r.Context.Transaction.Rollback()
				err = errors.Wrap(err, fmt.Sprintf("unable to insert %s %s", filename, org[i].RefID))
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

	for i := range log {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind("INSERT INTO dmz_audit_log (c_orgid, c_userid, c_eventtype, c_ip, c_created) VALUES (?, ?, ?, ?, ?)"),
			log[i].OrgID, log[i].UserID, log[i].Type, log[i].IP, log[i].Created)
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

	for i := range ac {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind("INSERT INTO dmz_action (c_refid, c_orgid, c_userid, c_docid, c_actiontype, c_note, c_requestorid, c_requested, c_due, c_reftype, c_reftypeid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"),
			ac[i].RefID, ac[i].OrgID, ac[i].UserID, ac[i].DocumentID, ac[i].ActionType, ac[i].Note, ac[i].RequestorID, ac[i].Requested, ac[i].Due, ac[i].RefType, ac[i].RefTypeID)
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

	for i := range sp {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind("INSERT INTO dmz_space (c_refid, c_name, c_orgid, c_userid, c_type, c_lifecycle, c_likes, c_created, c_revised) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"),
			sp[i].RefID, sp[i].Name, sp[i].OrgID, sp[i].UserID, sp[i].Type, sp[i].Lifecycle, sp[i].Likes, sp[i].Created, sp[i].Revised)

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

	for i := range ct {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_category (c_refid, c_orgid, c_spaceid, c_name, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?)`),
			ct[i].RefID, ct[i].OrgID, ct[i].SpaceID, ct[i].Name, ct[i].Created, ct[i].Revised)

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

// CategoryMember.
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

	for i := range cm {
		_, err = r.Context.Transaction.Exec(r.Runtime.Db.Rebind(`
            INSERT INTO dmz_category_member
            (c_refid, c_orgid, c_categoryid, c_spaceid, c_docid, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?)`),
			cm[i].RefID, cm[i].OrgID, cm[i].CategoryID, cm[i].SpaceID, cm[i].DocumentID, cm[i].Created, cm[i].Revised)

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
