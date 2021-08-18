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

// Package onboard handles the setup of sample data for a new Documize instance.
package onboard

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/pkg/errors"

	"github.com/documize/community/core/asset"
	"github.com/documize/community/core/env"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	indexer "github.com/documize/community/domain/search"
	"github.com/documize/community/domain/store"
	om "github.com/documize/community/model/onboard"
	"github.com/documize/community/model/permission"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime  *env.Runtime
	Store    *store.Store
	Indexer  indexer.Indexer
	MappedID map[string]string
}

// InstallSample inserts sample data into database.
func (h *Handler) InstallSample(w http.ResponseWriter, r *http.Request) {
	ctx := domain.GetRequestContext(r)

	// Only proceed if we are in good standing.
	if !h.Runtime.Product.IsValid(ctx) {
		response.WriteBadLicense(w)
		return
	}

	if !ctx.Administrator {
		response.WriteForbiddenError(w)
		return
	}

	// Only proceed if we have no spaces and documents.
	// This prevents sample data restore inside existing live instance.
	spaces, docs := h.Store.Onboard.ContentCounts(ctx.OrgID)
	if spaces > 0 || docs > 0 {
		h.Runtime.Log.Info("Unable to install sample data when database contains spaces/docs")
		response.WriteForbiddenError(w)
		return
	}

	// Load sample data from embedded assets.
	data := h.loadSampleData()
	if data.LoadFailure {
		response.WriteError(w, "Unable to unpack sample data")
		h.Runtime.Log.Info("Unable to unpack sample data")
		return
	}

	data.Context = ctx

	err := h.processSampleData(data)
	if err != nil {
		response.WriteError(w, "Unable to process sample data")
		h.Runtime.Log.Error("Unable to process sample data", err)
		return
	}

	h.Runtime.Log.Info("Onboarding complete")

	h.Runtime.Log.Info("Building search index")
	go h.Indexer.Rebuild(ctx)

	response.WriteEmpty(w)
}

// Read sample data that is stored as embedded asset.
func (h *Handler) loadSampleData() (data om.SampleData) {
	h.loadFile(data, "dmz_category.json", &data.Category)
	h.loadFile(data, "dmz_category_member.json", &data.CategoryMember)
	h.loadFile(data, "dmz_doc.json", &data.Document)
	h.loadFile(data, "dmz_doc_attachment.json", &data.DocumentAttachment)
	h.loadFile(data, "dmz_doc_link.json", &data.DocumentLink)
	h.loadFile(data, "dmz_section.json", &data.Section)
	h.loadFile(data, "dmz_section_meta.json", &data.SectionMeta)
	h.loadFile(data, "dmz_space.json", &data.Space)
	h.loadFile(data, "dmz_space_label.json", &data.SpaceLabel)

	return
}

func (h *Handler) loadFile(data om.SampleData, filename string, v interface{}) {
	err := h.unpackFile(filename, &v)
	if err != nil {
		data.LoadFailure = true
	}
}

// Reads file and unmarshals content as JSON.
func (h *Handler) unpackFile(filename string, v interface{}) (err error) {
	content, _, err := asset.FetchStatic(h.Runtime.Assets, "onboard/"+filename)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("missing %s", filename))
		h.Runtime.Log.Error("failed to load file", err)
		return
	}

	err = json.Unmarshal([]byte(content), &v)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("failed to read %s as JSON", filename))
		h.Runtime.Log.Error("failed to load file", err)
		return
	}

	return nil
}

// Returns new ID based on old ID.
func (h *Handler) getMappedID(table, old string) string {
	// Return mapped ID if we have one.
	key := table + "_" + old
	if n, ok := h.MappedID[key]; ok {
		return n
	}

	// Generate new ID and send back.
	newID := uniqueid.Generate()
	h.MappedID[table+"_"+old] = newID
	return newID
}

// Insert data into database using sample data loaded from embedded assets.
func (h *Handler) processSampleData(data om.SampleData) (err error) {
	data.Context.Transaction, _ = h.Runtime.StartTx(sql.LevelReadUncommitted)

	h.MappedID = make(map[string]string)

	// Space Label.
	h.Runtime.Log.Info(fmt.Sprintf("Installing (%d) space labels", len(data.SpaceLabel)))
	for i := range data.SpaceLabel {
		_, err = data.Context.Transaction.Exec(h.Runtime.Db.Rebind(`
            INSERT INTO dmz_space_label
            (c_refid, c_orgid, c_name, c_color, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?)`),
			h.getMappedID("label", data.SpaceLabel[i].RefID),
			data.Context.OrgID,
			data.SpaceLabel[i].Name,
			data.SpaceLabel[i].Color,
			data.SpaceLabel[i].Created,
			data.SpaceLabel[i].Revised)

		if err != nil {
			h.Runtime.Rollback(data.Context.Transaction)
			err = errors.Wrap(err, fmt.Sprintf("unable to insert space label %s", data.SpaceLabel[i].RefID))
			return
		}
	}

	// Space.
	h.Runtime.Log.Info(fmt.Sprintf("Installing (%d) spaces", len(data.Space)))
	for i := range data.Space {
		_, err = data.Context.Transaction.Exec(h.Runtime.Db.Rebind(`
            INSERT INTO dmz_space
                (c_refid, c_name, c_orgid, c_userid, c_type, c_lifecycle,
                c_likes, c_icon, c_desc, c_count_category, c_count_content,
                c_labelid, c_created, c_revised)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			h.getMappedID("space", data.Space[i].RefID),
			data.Space[i].Name,
			data.Context.OrgID,
			data.Context.UserID,
			data.Space[i].Type,
			data.Space[i].Lifecycle,
			data.Space[i].Likes,
			data.Space[i].Icon,
			data.Space[i].Description,
			data.Space[i].CountCategory,
			data.Space[i].CountContent,
			h.getMappedID("label", data.Space[i].LabelID),
			data.Space[i].Created, data.Space[i].Revised)

		if err != nil {
			h.Runtime.Rollback(data.Context.Transaction)
			err = errors.Wrap(err, fmt.Sprintf("unable to insert space record %s", data.Space[i].RefID))
			return
		}
	}

	// Category.
	h.Runtime.Log.Info(fmt.Sprintf("Installing (%d) categories", len(data.Category)))
	for i := range data.Category {
		_, err = data.Context.Transaction.Exec(h.Runtime.Db.Rebind(`
            INSERT INTO dmz_category (c_refid, c_orgid, c_spaceid, c_name, c_default, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?)`),
			h.getMappedID("category", data.Category[i].RefID),
			data.Context.OrgID,
			h.getMappedID("space", data.Category[i].SpaceID),
			data.Category[i].Name,
			data.Category[i].IsDefault,
			data.Category[i].Created,
			data.Category[i].Revised)

		if err != nil {
			h.Runtime.Rollback(data.Context.Transaction)
			err = errors.Wrap(err, fmt.Sprintf("unable to insert category %s", data.Category[i].RefID))
			return
		}
	}

	// Category Member.
	h.Runtime.Log.Info(fmt.Sprintf("Installing category member (%d)", len(data.CategoryMember)))
	for i := range data.CategoryMember {
		_, err = data.Context.Transaction.Exec(h.Runtime.Db.Rebind(`
            INSERT INTO dmz_category_member
            (c_refid, c_orgid, c_categoryid, c_spaceid, c_docid, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?)`),
			h.getMappedID("category_member", data.CategoryMember[i].RefID),
			data.Context.OrgID,
			h.getMappedID("category", data.CategoryMember[i].CategoryID),
			h.getMappedID("space", data.CategoryMember[i].SpaceID),
			h.getMappedID("document", data.CategoryMember[i].DocumentID),
			data.CategoryMember[i].Created,
			data.CategoryMember[i].Revised)

		if err != nil {
			h.Runtime.Rollback(data.Context.Transaction)
			err = errors.Wrap(err, fmt.Sprintf("unable to insert category %s", data.Category[i].RefID))
			return
		}
	}

	// Assign permissions per space space.
	perm := permission.Permission{}
	perm.OrgID = data.Context.OrgID
	perm.Who = permission.UserPermission
	perm.WhoID = data.Context.UserID
	perm.Scope = permission.ScopeRow
	perm.Location = permission.LocationSpace

	for i := range data.Space {
		perm.RefID = h.getMappedID("space", data.Space[i].RefID)
		perm.Action = "" // we send array for actions below

		err = h.Store.Permission.AddPermissions(data.Context, perm,
			permission.SpaceOwner, permission.SpaceManage, permission.SpaceView,
			permission.DocumentAdd, permission.DocumentCopy, permission.DocumentDelete,
			permission.DocumentEdit, permission.DocumentMove,
			permission.DocumentTemplate, permission.DocumentApprove,
			permission.DocumentVersion, permission.DocumentLifecycle)

		if err != nil {
			h.Runtime.Rollback(data.Context.Transaction)
			err = errors.Wrap(err, fmt.Sprintf("unable to insert space permission %s", data.Space[i].RefID))
			return
		}
	}

	// Assign permissions per category.
	for i := range data.Category {
		pc := permission.Permission{}
		pc.OrgID = data.Context.OrgID
		pc.Who = permission.UserPermission
		pc.WhoID = data.Context.UserID
		pc.Scope = permission.ScopeRow
		pc.Location = permission.LocationCategory
		pc.RefID = h.getMappedID("category", data.Category[i].RefID)
		pc.Action = permission.CategoryView

		err = h.Store.Permission.AddPermission(data.Context, pc)
		if err != nil {
			h.Runtime.Rollback(data.Context.Transaction)
			err = errors.Wrap(err, fmt.Sprintf("unable to insert category permission %s", data.Category[i].RefID))
			return
		}
	}

	// Document.
	h.Runtime.Log.Info(fmt.Sprintf("Installing document (%d)", len(data.Document)))
	for i := range data.Document {
		_, err = data.Context.Transaction.Exec(h.Runtime.Db.Rebind(`
            INSERT INTO dmz_doc
            (c_refid, c_orgid, c_spaceid, c_userid, c_job, c_location,
            c_name, c_desc, c_slug, c_tags, c_template, c_protection, c_approval,
            c_lifecycle, c_versioned, c_versionid, c_versionorder, c_groupid, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			h.getMappedID("document", data.Document[i].RefID),
			data.Context.OrgID,
			h.getMappedID("space", data.Document[i].SpaceID),
			data.Context.UserID,
			data.Document[i].Job,
			data.Document[i].Location,
			data.Document[i].Name,
			data.Document[i].Excerpt,
			data.Document[i].Slug,
			data.Document[i].Tags,
			data.Document[i].Template,
			data.Document[i].Protection,
			data.Document[i].Approval,
			data.Document[i].Lifecycle,
			data.Document[i].Versioned,
			data.Document[i].VersionID,
			data.Document[i].VersionOrder,
			data.Document[i].GroupID,
			data.Document[i].Created,
			data.Document[i].Revised)

		if err != nil {
			h.Runtime.Rollback(data.Context.Transaction)
			err = errors.Wrap(err, fmt.Sprintf("unable to insert document %s", data.Document[i].RefID))
			return
		}
	}

	// Document Attachment.
	h.Runtime.Log.Info(fmt.Sprintf("Installing document attachment (%d)", len(data.DocumentAttachment)))
	for i := range data.DocumentAttachment {
		_, err = data.Context.Transaction.Exec(h.Runtime.Db.Rebind(`
            INSERT INTO dmz_doc_attachment
            (c_refid, c_orgid, c_docid, c_sectionid, c_job, c_fileid,
            c_filename, c_data, c_extension, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			h.getMappedID("document_attachment", data.DocumentAttachment[i].RefID),
			data.Context.OrgID,
			h.getMappedID("document", data.DocumentAttachment[i].DocumentID),
			h.getMappedID("section", data.DocumentAttachment[i].SectionID),
			data.DocumentAttachment[i].Job,
			data.DocumentAttachment[i].FileID,
			data.DocumentAttachment[i].Filename,
			data.DocumentAttachment[i].Data,
			data.DocumentAttachment[i].Extension,
			data.DocumentAttachment[i].Created,
			data.DocumentAttachment[i].Revised)

		if err != nil {
			h.Runtime.Rollback(data.Context.Transaction)
			err = errors.Wrap(err, fmt.Sprintf("unable to insert document attachment %s", data.DocumentAttachment[i].RefID))
			return
		}
	}

	// Document Link.
	h.Runtime.Log.Info(fmt.Sprintf("Installing document link (%d)", len(data.DocumentLink)))
	for i := range data.DocumentLink {
		targetID := ""
		if data.DocumentLink[i].LinkType == "file" {
			targetID = h.getMappedID("document_attachment", data.DocumentLink[i].TargetID)
		} else if data.DocumentLink[i].LinkType == "document" {
			targetID = h.getMappedID("document", data.DocumentLink[i].TargetID)
		} else {
			targetID = h.getMappedID("section", data.DocumentLink[i].TargetID)
		}

		_, err = data.Context.Transaction.Exec(h.Runtime.Db.Rebind(`
            INSERT INTO dmz_doc_link
            (c_refid, c_orgid, c_spaceid, c_userid, c_sourcedocid, c_sourcesectionid,
            c_targetdocid, c_targetid, c_externalid, c_type, c_orphan, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			h.getMappedID("document_link", data.DocumentLink[i].RefID),
			data.Context.OrgID,
			h.getMappedID("space", data.DocumentLink[i].SpaceID),
			data.Context.UserID,
			h.getMappedID("document", data.DocumentLink[i].SourceDocumentID),
			h.getMappedID("section", data.DocumentLink[i].SourceSectionID),
			h.getMappedID("document", data.DocumentLink[i].TargetDocumentID),
			targetID,
			data.DocumentLink[i].ExternalID,
			data.DocumentLink[i].LinkType,
			data.DocumentLink[i].Orphan,
			data.DocumentLink[i].Created,
			data.DocumentLink[i].Revised)

		if err != nil {
			h.Runtime.Rollback(data.Context.Transaction)
			err = errors.Wrap(err, fmt.Sprintf("unable to insert document link %s", data.DocumentLink[i].RefID))
			return
		}
	}

	// Document Section.
	h.Runtime.Log.Info(fmt.Sprintf("Installing section (%d)", len(data.Section)))
	for i := range data.Section {
		_, err = data.Context.Transaction.Exec(h.Runtime.Db.Rebind(`
            INSERT INTO dmz_section
            (c_refid, c_orgid, c_docid, c_userid, c_contenttype, c_type, c_level, c_name, c_body,
            c_revisions, c_sequence, c_templateid, c_status, c_relativeid, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			h.getMappedID("section", data.Section[i].RefID),
			data.Context.OrgID,
			h.getMappedID("document", data.Section[i].DocumentID),
			data.Context.UserID,
			data.Section[i].ContentType,
			data.Section[i].Type,
			data.Section[i].Level,
			data.Section[i].Name,
			data.Section[i].Body,
			data.Section[i].Revisions,
			data.Section[i].Sequence,
			h.getMappedID("section", data.Section[i].TemplateID),
			data.Section[i].Status,
			h.getMappedID("section", data.Section[i].RelativeID),
			data.Section[i].Created,
			data.Section[i].Revised)

		if err != nil {
			h.Runtime.Rollback(data.Context.Transaction)
			err = errors.Wrap(err, fmt.Sprintf("unable to insert section %s", data.Section[i].RefID))
			return
		}
	}

	// Document Section Meta.
	h.Runtime.Log.Info(fmt.Sprintf("Installing section meta (%d)", len(data.SectionMeta)))
	for i := range data.SectionMeta {
		_, err = data.Context.Transaction.Exec(h.Runtime.Db.Rebind(`
            INSERT INTO dmz_section_meta
            (c_sectionid, c_orgid, c_userid, c_docid, c_rawbody,
            c_config, c_external, c_created, c_revised)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),
			h.getMappedID("section", data.SectionMeta[i].SectionID),
			data.Context.OrgID,
			data.Context.UserID,
			h.getMappedID("document", data.SectionMeta[i].DocumentID),
			data.SectionMeta[i].RawBody,
			data.SectionMeta[i].Config,
			data.SectionMeta[i].ExternalSource,
			data.SectionMeta[i].Created,
			data.SectionMeta[i].Revised)

		if err != nil {
			h.Runtime.Rollback(data.Context.Transaction)
			err = errors.Wrap(err, fmt.Sprintf("unable to insert section meta %s", data.SectionMeta[i].SectionID))
			return
		}
	}

	ok := h.Runtime.Commit(data.Context.Transaction)
	if !ok {
		h.Runtime.Rollback(data.Context.Transaction)
		return
	}

	return nil
}
