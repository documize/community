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

package document

import (
	"database/sql"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"sort"
	"strings"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/request"
	"github.com/documize/community/core/response"
	"github.com/documize/community/core/streamutil"
	"github.com/documize/community/core/stringutil"
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/organization"
	"github.com/documize/community/domain/permission"
	indexer "github.com/documize/community/domain/search"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/activity"
	"github.com/documize/community/model/attachment"
	"github.com/documize/community/model/audit"
	"github.com/documize/community/model/category"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/link"
	"github.com/documize/community/model/page"
	pm "github.com/documize/community/model/permission"
	"github.com/documize/community/model/search"
	"github.com/documize/community/model/space"
	"github.com/documize/community/model/user"
	"github.com/documize/community/model/workflow"
)

// Handler contains the runtime information such as logging and database.
type Handler struct {
	Runtime *env.Runtime
	Store   *store.Store
	Indexer indexer.Indexer
}

// Get is an endpoint that returns the document-level information for a
// given documentID.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	method := "document.Get"
	ctx := domain.GetRequestContext(r)

	id := request.Param(r, "documentID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	document, err := h.Store.Document.Get(ctx, id)
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, id)
		return
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if !permission.CanViewSpaceDocument(ctx, *h.Store, document.SpaceID) {
		response.WriteForbiddenError(w)
		return
	}

	// draft mode does not record document views
	if document.Lifecycle == workflow.LifecycleLive {
		ctx.Transaction, err = h.Runtime.Db.Beginx()
		if err != nil {
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
			SpaceID:      document.SpaceID,
			DocumentID:   document.RefID,
			SourceType:   activity.SourceTypeDocument,
			ActivityType: activity.TypeRead})

		ctx.Transaction.Commit()
	}

	h.Store.Audit.Record(ctx, audit.EventTypeDocumentView)

	response.WriteJSON(w, document)
}

// DocumentLinks is an endpoint returning the links for a document.
func (h *Handler) DocumentLinks(w http.ResponseWriter, r *http.Request) {
	method := "document.DocumentLinks"
	ctx := domain.GetRequestContext(r)

	id := request.Param(r, "documentID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	l, err := h.Store.Link.GetDocumentOutboundLinks(ctx, id)
	if len(l) == 0 {
		l = []link.Link{}
	}
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	response.WriteJSON(w, l)
}

// BySpace is an endpoint that returns the documents for given space.
func (h *Handler) BySpace(w http.ResponseWriter, r *http.Request) {
	method := "document.BySpace"
	ctx := domain.GetRequestContext(r)

	spaceID := request.Query(r, "space")
	if len(spaceID) == 0 {
		response.WriteMissingDataError(w, method, "space")
		return
	}

	if !permission.CanViewSpace(ctx, *h.Store, spaceID) {
		response.WriteForbiddenError(w)
		return
	}

	// Can user view drafts?
	viewDrafts := permission.CanViewDrafts(ctx, *h.Store, spaceID)

	// Get complete list of documents regardless of category permission
	// and versioning.
	documents, err := h.Store.Document.GetBySpace(ctx, spaceID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Remove documents that cannot be seen due to lack of
	// category view/access permission.
	cats, err := h.Store.Category.GetBySpace(ctx, spaceID)
	members, err := h.Store.Category.GetSpaceCategoryMembership(ctx, spaceID)
	filtered := FilterCategoryProtected(documents, cats, members, viewDrafts)

	// Keep the latest version when faced with multiple versions.
	filtered = FilterLastVersion(filtered)

	// Sort document list by ID.
	sort.Sort(doc.ByID(filtered))

	// Attach category membership to each document.
	// Put category names into map for easier retrieval.
	catNames := make(map[string]string)
	for i := range cats {
		catNames[cats[i].RefID] = cats[i].Name
	}
	// Loop the smaller list which is categories assigned to documents.
	for i := range members {
		// Get name of category
		cn := catNames[members[i].CategoryID]
		// Find document that is assigned this category.
		j := sort.Search(len(filtered), func(k int) bool { return filtered[k].RefID <= members[i].DocumentID })
		// Attach category name to document
		if j < len(filtered) && filtered[j].RefID == members[i].DocumentID {
			filtered[j].Category = append(filtered[j].Category, cn)
		}
	}

	sortedDocs := doc.SortedDocs{}

	for j := range filtered {
		if filtered[j].Sequence == doc.Unsequenced {
			sortedDocs.Unpinned = append(sortedDocs.Unpinned, filtered[j])
		} else {
			sortedDocs.Pinned = append(sortedDocs.Pinned, filtered[j])
		}
	}

	// Sort document list by title.
	sort.Sort(doc.ByName(sortedDocs.Unpinned))

	// Sort document list by sequence.
	sort.Sort(doc.BySeq(sortedDocs.Pinned))

	final := sortedDocs.Pinned
	final = append(final, sortedDocs.Unpinned...)

	response.WriteJSON(w, final)
}

// Update updates an existing document using the format described
// in NewDocumentModel() encoded as JSON in the request.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	method := "document.Update"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	if !permission.CanChangeDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	d := doc.Document{}
	err = json.Unmarshal(body, &d)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	d.RefID = documentID

	var ok bool
	ctx.Transaction, ok = h.Runtime.StartTx(sql.LevelReadUncommitted)
	if !ok {
		h.Runtime.Log.Info("unable to start transaction " + method)
		response.WriteServerError(w, method, err)
		return
	}

	// If space changed for document, remove document categories.
	oldDoc, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		h.Runtime.Rollback(ctx.Transaction)
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if oldDoc.SpaceID != d.SpaceID {
		_, _ = h.Store.Category.RemoveDocumentCategories(ctx, d.RefID)
		err = h.Store.Document.MoveActivity(ctx, documentID, oldDoc.SpaceID, d.SpaceID)
		if err != nil {
			h.Runtime.Rollback(ctx.Transaction)
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	// d.Name = bluemonday.StrictPolicy().Sanitize(d.Name)
	// d.Excerpt = bluemonday.StrictPolicy().Sanitize(d.Excerpt)

	err = h.Store.Document.Update(ctx, d)
	if err != nil {
		h.Runtime.Rollback(ctx.Transaction)
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// If document part of versioned document group
	// then document name must be applied to all documents
	// in the group.
	if len(d.GroupID) > 0 {
		err = h.Store.Document.UpdateGroup(ctx, d)
		if err != nil {
			h.Runtime.Rollback(ctx.Transaction)
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	// Detect change in document status/lifecycle.
	if d.Lifecycle != oldDoc.Lifecycle {
		// Record document being marked as archived.
		if d.Lifecycle == workflow.LifecycleArchived {
			h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
				SpaceID:      d.SpaceID,
				DocumentID:   documentID,
				SourceType:   activity.SourceTypeDocument,
				ActivityType: activity.TypeArchived})
		}

		// Record document being marked as draft.
		if d.Lifecycle == workflow.LifecycleDraft {
			h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
				SpaceID:      d.SpaceID,
				DocumentID:   documentID,
				SourceType:   activity.SourceTypeDocument,
				ActivityType: activity.TypeDraft})
		}

		// Record document being marked as live.
		if d.Lifecycle == workflow.LifecycleLive {
			h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
				SpaceID:      d.SpaceID,
				DocumentID:   documentID,
				SourceType:   activity.SourceTypeDocument,
				ActivityType: activity.TypePublished})
		}
	}

	h.Runtime.Commit(ctx.Transaction)

	_ = h.Store.Space.SetStats(ctx, d.SpaceID)
	if oldDoc.SpaceID != d.SpaceID {
		_ = h.Store.Space.SetStats(ctx, oldDoc.SpaceID)
	}

	h.Store.Audit.Record(ctx, audit.EventTypeDocumentUpdate)

	// Live document indexed for search.
	if d.Lifecycle == workflow.LifecycleLive {
		a, _ := h.Store.Attachment.GetAttachments(ctx, documentID)
		go h.Indexer.IndexDocument(ctx, d, a)

		pages, _ := h.Store.Page.GetPages(ctx, d.RefID)
		for i := range pages {
			go h.Indexer.IndexContent(ctx, pages[i])
		}
	} else {
		go h.Indexer.DeleteDocument(ctx, d.RefID)
	}

	response.WriteEmpty(w)
}

// Delete is an endpoint that deletes a document specified by documentID.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	method := "document.Delete"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	doc, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// If locked document then no can do
	if doc.Protection == workflow.ProtectionLock {
		response.WriteForbiddenError(w)
		h.Runtime.Log.Info("attempted action on locked document")
		return
	}

	// If approval workflow then only approvers can delete page
	if doc.Protection == workflow.ProtectionReview {
		approvers, err := permission.GetUsersWithDocumentPermission(ctx, *h.Store, doc.SpaceID, doc.RefID, pm.DocumentApprove)
		if err != nil {
			response.WriteForbiddenError(w)
			h.Runtime.Log.Error(method, err)
			return
		}

		if !user.Exists(approvers, ctx.UserID) {
			response.WriteForbiddenError(w)
			h.Runtime.Log.Info("attempted action on document when not approver")
			return
		}
	}

	// permission check
	if !permission.CanDeleteDocument(ctx, *h.Store, documentID) {
		response.WriteForbiddenError(w)
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	_, err = h.Store.Document.Delete(ctx, documentID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	_, err = h.Store.Pin.DeletePinnedDocument(ctx, documentID)
	if err != nil && err != sql.ErrNoRows {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Link.MarkOrphanDocumentLink(ctx, documentID)
	h.Store.Link.DeleteSourceDocumentLinks(ctx, documentID)

	// Draft actions are not logged
	if doc.Lifecycle == workflow.LifecycleLive {
		h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
			SpaceID:      doc.SpaceID,
			DocumentID:   documentID,
			SourceType:   activity.SourceTypeDocument,
			ActivityType: activity.TypeDeleted})
	}

	ctx.Transaction.Commit()

	h.Store.Space.SetStats(ctx, doc.SpaceID)
	h.Store.Audit.Record(ctx, audit.EventTypeDocumentDelete)

	go h.Indexer.DeleteDocument(ctx, documentID)

	response.WriteEmpty(w)
}

// SearchDocuments endpoint takes a list of keywords and returns a list of
// document references matching those keywords.
func (h *Handler) SearchDocuments(w http.ResponseWriter, r *http.Request) {
	method := "document.SearchDocuments"
	ctx := domain.GetRequestContext(r)

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	// Get search criteria.
	options := search.QueryOptions{}
	err = json.Unmarshal(body, &options)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}
	options.Keywords = strings.TrimSpace(options.Keywords)

	// Get documents for search criteria.
	results, err := h.Store.Search.Documents(ctx, options)
	if err != nil {
		h.Runtime.Log.Error(method, err)
	}

	// Generate slugs for search URL.
	for key, result := range results {
		results[key].DocumentSlug = stringutil.MakeSlug(result.Document)
		results[key].SpaceSlug = stringutil.MakeSlug(result.Space)
	}

	// Remove documents that cannot be seen due to lack of
	// category view/access permission.
	cats, err := h.Store.Category.GetByOrg(ctx, ctx.UserID)
	members, err := h.Store.Category.GetOrgCategoryMembership(ctx, ctx.UserID)
	filtered := indexer.FilterCategoryProtected(results, cats, members)

	// Record user search history.
	if !options.SkipLog {
		if len(filtered) > 0 {
			go h.recordSearchActivity(ctx, filtered, options.Keywords)
		} else {
			ctx.Transaction, err = h.Runtime.Db.Beginx()
			if err != nil {
				h.Runtime.Log.Error(method, err)
				return
			}

			h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
				SpaceID:      "",
				DocumentID:   "",
				Metadata:     options.Keywords,
				SourceType:   activity.SourceTypeSearch,
				ActivityType: activity.TypeSearched})

			ctx.Transaction.Commit()
		}
	}

	h.Store.Audit.Record(ctx, audit.EventTypeSearch)

	response.WriteJSON(w, filtered)
}

// Record search request once per document.
// But only if document is partof shared space at the time of the search.
func (h *Handler) recordSearchActivity(ctx domain.RequestContext, q []search.QueryResult, keywords string) {
	method := "recordSearchActivity"
	var err error
	prev := make(map[string]bool)

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		h.Runtime.Log.Error(method, err)
		return
	}

	for i := range q {
		// Empty space ID usually signals private document
		// hence search activity should not be visible to others.
		if len(q[i].SpaceID) == 0 {
			continue
		}
		sp, err := h.Store.Space.Get(ctx, q[i].SpaceID)
		if err != nil || len(sp.RefID) == 0 || sp.Type == space.ScopePrivate {
			continue
		}

		if _, isExisting := prev[q[i].DocumentID]; !isExisting {
			h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
				SpaceID:      q[i].SpaceID,
				DocumentID:   q[i].DocumentID,
				Metadata:     keywords,
				SourceType:   activity.SourceTypeSearch,
				ActivityType: activity.TypeSearched})

			prev[q[i].DocumentID] = true
		}
	}

	ctx.Transaction.Commit()
}

// FetchDocumentData returns all document data in single API call.
func (h *Handler) FetchDocumentData(w http.ResponseWriter, r *http.Request) {
	method := "document.FetchDocumentData"
	ctx := domain.GetRequestContext(r)

	id := request.Param(r, "documentID")
	if len(id) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	document, err := h.Store.Document.Get(ctx, id)
	if err == sql.ErrNoRows {
		response.WriteNotFoundError(w, method, id)
		return
	}
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if !permission.CanViewSpaceDocument(ctx, *h.Store, document.SpaceID) {
		response.WriteForbiddenError(w)
		return
	}

	// Don't serve archived document.
	if document.Lifecycle == workflow.LifecycleArchived {
		response.WriteForbiddenError(w)
		return
	}

	// Check if draft document can been seen by user.
	if document.Lifecycle == workflow.LifecycleDraft && !permission.CanViewDrafts(ctx, *h.Store, document.SpaceID) {
		response.WriteForbiddenError(w)
		return
	}

	// If document has been assigned one or more categories,
	// we check to see if user can view this document.
	cat, err := h.Store.Category.GetDocumentCategoryMembership(ctx, document.RefID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	perm, err := h.Store.Permission.GetUserCategoryPermissions(ctx, ctx.UserID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	see := []category.Category{}
	for _, c := range cat {
		for _, p := range perm {
			if p.RefID == c.RefID {
				see = append(see, c)
				break
			}
		}
	}

	// User cannot view document if document has categories assigned
	// but user cannot see any of them.
	if len(cat) > 0 && len(see) == 0 {
		response.WriteForbiddenError(w)
		return
	}

	// permissions
	perms, err := h.Store.Permission.GetUserSpacePermissions(ctx, document.SpaceID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	if len(perms) == 0 {
		perms = []pm.Permission{}
	}
	record := pm.DecodeUserPermissions(perms)

	roles, err := h.Store.Permission.GetUserDocumentPermissions(ctx, document.RefID)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	if len(roles) == 0 {
		roles = []pm.Permission{}
	}
	rolesRecord := pm.DecodeUserDocumentPermissions(roles)

	// links
	l, err := h.Store.Link.GetDocumentOutboundLinks(ctx, id)
	if len(l) == 0 {
		l = []link.Link{}
	}
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// spaces
	sp, err := h.Store.Space.GetViewable(ctx)
	if err != nil && err != sql.ErrNoRows {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	if len(sp) == 0 {
		sp = []space.Space{}
	}

	// Get version information for this document.
	v := []doc.Version{}
	if len(document.GroupID) > 0 {
		// Get versions
		vt, err := h.Store.Document.GetVersions(ctx, document.GroupID)
		if err != nil {
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
		// Determine which document versions user can see.
		for i := range vt {
			// Everyone can see live documents
			if vt[i].Lifecycle == workflow.LifecycleLive {
				v = append(v, vt[i])
			}
			// Only lifecycle admins can see draft documents
			if vt[i].Lifecycle == workflow.LifecycleDraft && record.DocumentLifecycle {
				v = append(v, vt[i])
			}
		}
	}

	// Attachments.
	a, err := h.Store.Attachment.GetAttachments(ctx, id)
	if err != nil && err != sql.ErrNoRows {
		h.Runtime.Log.Error("get attachment", err)
		response.WriteServerError(w, method, err)
		return
	}
	if len(a) == 0 {
		a = []attachment.Attachment{}
	}

	// Prepare response.
	data := BulkDocumentData{}
	data.Document = document
	data.Permissions = record
	data.Roles = rolesRecord
	data.Links = l
	data.Spaces = sp
	data.Versions = v
	data.Attachments = a

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if document.Lifecycle == workflow.LifecycleLive {
		h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
			SpaceID:      document.SpaceID,
			DocumentID:   document.RefID,
			SourceType:   activity.SourceTypeDocument,
			ActivityType: activity.TypeRead})
	}

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeDocumentView)

	response.WriteJSON(w, data)
}

// BulkDocumentData represents all data associated for a single document.
// Used by FetchDocumentData() bulk data load call.
type BulkDocumentData struct {
	Document    doc.Document            `json:"document"`
	Permissions pm.Record               `json:"permissions"`
	Roles       pm.DocumentRecord       `json:"roles"`
	Spaces      []space.Space           `json:"folders"`
	Links       []link.Link             `json:"links"`
	Versions    []doc.Version           `json:"versions"`
	Attachments []attachment.Attachment `json:"attachments"`
}

// Export returns content as self-enclosed HTML file.
func (h *Handler) Export(w http.ResponseWriter, r *http.Request) {
	method := "document.Export"
	ctx := domain.GetRequestContext(r)

	// Deduce ORG if anon user.
	if len(ctx.OrgID) == 0 {
		ctx.Subdomain = organization.GetSubdomainFromHost(r)
		org, err := h.Store.Organization.GetOrganizationByDomain(ctx.Subdomain)
		if err != nil {
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
		ctx.OrgID = org.RefID
	}

	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	spec := exportSpec{}
	err = json.Unmarshal(body, &spec)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	export, err := BuildExport(ctx, *h.Store, spec)
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(export))
}

// Duplicate makes a copy of a document.
// Name of new document is required.
func (h *Handler) Duplicate(w http.ResponseWriter, r *http.Request) {
	method := "document.Duplicate"
	ctx := domain.GetRequestContext(r)

	// Holds old to new ref ID values.
	pageRefMap := make(map[string]string)

	// Parse payload
	defer streamutil.Close(r.Body)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	m := doc.DuplicateModel{}
	err = json.Unmarshal(body, &m)
	if err != nil {
		response.WriteBadRequestError(w, method, err.Error())
		h.Runtime.Log.Error(method, err)
		return
	}

	// Check permissions
	if !permission.CanViewDocument(ctx, *h.Store, m.DocumentID) {
		response.WriteForbiddenError(w)
		return
	}
	if !permission.CanUploadDocument(ctx, *h.Store, m.SpaceID) {
		response.WriteForbiddenError(w)
		return
	}

	ctx.Transaction, err = h.Runtime.Db.Beginx()
	if err != nil {
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Get document to be duplicated.
	d, err := h.Store.Document.Get(ctx, m.DocumentID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Assign new ID and remove versioning info.
	d.RefID = uniqueid.Generate()
	d.GroupID = ""
	d.Name = m.Name

	// Fetch doc attachments, links.
	da, err := h.Store.Attachment.GetAttachmentsWithData(ctx, m.DocumentID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	dl, err := h.Store.Link.GetDocumentOutboundLinks(ctx, m.DocumentID)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	// Fetch published and unpublished sections.
	pages, err := h.Store.Page.GetPages(ctx, m.DocumentID)
	if err != nil && err != sql.ErrNoRows {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	if len(pages) == 0 {
		pages = []page.Page{}
	}
	unpublished, err := h.Store.Page.GetUnpublishedPages(ctx, m.DocumentID)
	if err != nil && err != sql.ErrNoRows {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	if len(unpublished) == 0 {
		unpublished = []page.Page{}
	}
	pages = append(pages, unpublished...)
	meta, err := h.Store.Page.GetDocumentPageMeta(ctx, m.DocumentID, false)
	if err != nil && err != sql.ErrNoRows {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	if len(meta) == 0 {
		meta = []page.Meta{}
	}

	// Duplicate the complete document starting with the document.
	err = h.Store.Document.Add(ctx, d)
	if err != nil {
		ctx.Transaction.Rollback()
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}
	// Attachments
	for i := range da {
		da[i].RefID = uniqueid.Generate()
		da[i].DocumentID = d.RefID

		err = h.Store.Attachment.Add(ctx, da[i])
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	// Sections
	for j := range pages {
		// Create mapping between old and new section IDs.
		pageRefMap[pages[j].RefID] = uniqueid.Generate()

		// Get meta for section
		sm := page.Meta{}
		for k := range meta {
			if meta[k].SectionID == pages[j].RefID {
				sm = meta[k]
				break
			}
		}

		// Get attachments for section.
		sa, err := h.Store.Attachment.GetSectionAttachments(ctx, pages[j].RefID)
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		pages[j].RefID = pageRefMap[pages[j].RefID]
		pages[j].DocumentID = d.RefID
		sm.DocumentID = d.RefID
		sm.SectionID = pages[j].RefID

		err = h.Store.Page.Add(ctx, page.NewPage{Page: pages[j], Meta: sm})
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}

		// Now add any section attachments.
		for n := range sa {
			sa[n].RefID = uniqueid.Generate()
			sa[n].DocumentID = d.RefID
			sa[n].SectionID = pages[j].RefID

			err = h.Store.Attachment.Add(ctx, sa[n])
			if err != nil {
				ctx.Transaction.Rollback()
				response.WriteServerError(w, method, err)
				h.Runtime.Log.Error(method, err)
				return
			}
		}
	}
	// Links
	for l := range dl {
		// Update common meta for all links.
		dl[l].RefID = uniqueid.Generate()
		dl[l].SourceDocumentID = d.RefID

		// Remap section ID.
		if len(dl[l].SourceSectionID) > 0 && len(pageRefMap[dl[l].SourceSectionID]) > 0 {
			dl[l].SourceSectionID = pageRefMap[dl[l].SourceSectionID]
		}

		err = h.Store.Link.Add(ctx, dl[l])
		if err != nil {
			ctx.Transaction.Rollback()
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	// Record activity and finish.
	h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		SpaceID:      d.SpaceID,
		DocumentID:   d.RefID,
		SourceType:   activity.SourceTypeDocument,
		ActivityType: activity.TypeCreated})

	ctx.Transaction.Commit()

	h.Store.Audit.Record(ctx, audit.EventTypeDocumentAdd)

	// Update search index if published.
	if d.Lifecycle == workflow.LifecycleLive {
		a, _ := h.Store.Attachment.GetAttachments(ctx, d.RefID)
		go h.Indexer.IndexDocument(ctx, d, a)

		pages, _ := h.Store.Page.GetPages(ctx, d.RefID)
		for i := range pages {
			go h.Indexer.IndexContent(ctx, pages[i])
		}
	} else {
		go h.Indexer.DeleteDocument(ctx, d.RefID)
	}

	response.WriteEmpty(w)
}

// Pin marks existing document with sequence number so that it
// appears at the top-most space view.
func (h *Handler) Pin(w http.ResponseWriter, r *http.Request) {
	method := "document.Pin"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	var ok bool
	ctx.Transaction, ok = h.Runtime.StartTx(sql.LevelReadUncommitted)
	if !ok {
		h.Runtime.Log.Info("unable to start transaction " + method)
		response.WriteServerError(w, method, errors.New("unable to start transaction"))
		return
	}

	d, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		h.Runtime.Rollback(ctx.Transaction)
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if !permission.CanManageSpace(ctx, *h.Store, d.SpaceID) {
		h.Runtime.Rollback(ctx.Transaction)
		response.WriteForbiddenError(w)
		return
	}

	// Calculate the next sequence number for this newly pinned document.
	seq, err := h.Store.Document.PinSequence(ctx, d.SpaceID)
	if err != nil {
		h.Runtime.Rollback(ctx.Transaction)
		h.Runtime.Log.Error(method, err)
		response.WriteServerError(w, method, err)
		return
	}

	err = h.Store.Document.Pin(ctx, documentID, seq+1)
	if err != nil {
		h.Runtime.Rollback(ctx.Transaction)
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		SpaceID:      d.SpaceID,
		DocumentID:   documentID,
		SourceType:   activity.SourceTypeDocument,
		ActivityType: activity.TypePinned})

	h.Runtime.Commit(ctx.Transaction)

	h.Store.Audit.Record(ctx, audit.EventTypeDocPinAdd)

	response.WriteEmpty(w)
}

// Unpin removes an existing document from the space pinned list.
func (h *Handler) Unpin(w http.ResponseWriter, r *http.Request) {
	method := "document.Unpin"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	var ok bool
	ctx.Transaction, ok = h.Runtime.StartTx(sql.LevelReadUncommitted)
	if !ok {
		h.Runtime.Log.Info("unable to start transaction " + method)
		response.WriteServerError(w, method, errors.New("unable to start transaction"))
		return
	}

	d, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		h.Runtime.Rollback(ctx.Transaction)
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if !permission.CanManageSpace(ctx, *h.Store, d.SpaceID) {
		h.Runtime.Rollback(ctx.Transaction)
		response.WriteForbiddenError(w)
		return
	}

	err = h.Store.Document.Unpin(ctx, documentID)
	if err != nil {
		h.Runtime.Rollback(ctx.Transaction)
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		SpaceID:      d.SpaceID,
		DocumentID:   documentID,
		SourceType:   activity.SourceTypeDocument,
		ActivityType: activity.TypeUnpinned})

	h.Runtime.Commit(ctx.Transaction)

	h.Store.Audit.Record(ctx, audit.EventTypeDocPinRemove)

	response.WriteEmpty(w)
}

// PinMove moves pinned document up or down in the sequence.
func (h *Handler) PinMove(w http.ResponseWriter, r *http.Request) {
	method := "document.PinMove"
	ctx := domain.GetRequestContext(r)

	documentID := request.Param(r, "documentID")
	if len(documentID) == 0 {
		response.WriteMissingDataError(w, method, "documentID")
		return
	}

	direction := request.Query(r, "direction")
	if len(direction) == 0 {
		response.WriteMissingDataError(w, method, "direction")
		return
	}

	var ok bool
	ctx.Transaction, ok = h.Runtime.StartTx(sql.LevelReadUncommitted)
	if !ok {
		h.Runtime.Log.Info("unable to start transaction " + method)
		response.WriteServerError(w, method, errors.New("unable to start transaction"))
		return
	}

	d, err := h.Store.Document.Get(ctx, documentID)
	if err != nil {
		h.Runtime.Rollback(ctx.Transaction)
		response.WriteServerError(w, method, err)
		h.Runtime.Log.Error(method, err)
		return
	}

	if !permission.CanManageSpace(ctx, *h.Store, d.SpaceID) {
		h.Runtime.Rollback(ctx.Transaction)
		response.WriteForbiddenError(w)
		return
	}

	// Get all pinned documents in the space.
	pinnedDocs, err := h.Store.Document.Pinned(ctx, d.SpaceID)
	if err != nil {
		h.Runtime.Rollback(ctx.Transaction)
		h.Runtime.Log.Error(method, err)
		response.WriteServerError(w, method, err)
		return
	}

	// Sort document list by sequence.
	sort.Sort(doc.BySeq(pinnedDocs))

	// Resequence the documents.
	for i := range pinnedDocs {
		if pinnedDocs[i].RefID == documentID {
			if direction == "u" {
				if i-1 >= 0 {
					me := pinnedDocs[i].Sequence
					target := pinnedDocs[i-1].Sequence

					pinnedDocs[i-1].Sequence = me
					pinnedDocs[i].Sequence = target
				}
			}
			if direction == "d" {
				if i+1 < len(pinnedDocs) {
					me := pinnedDocs[i].Sequence
					target := pinnedDocs[i+1].Sequence

					pinnedDocs[i+1].Sequence = me
					pinnedDocs[i].Sequence = target
				}
			}

			break
		}
	}

	// Sort document list by sequence.
	sort.Sort(doc.BySeq(pinnedDocs))

	// Save the resequenced documents.
	for i := range pinnedDocs {
		err = h.Store.Document.Pin(ctx, pinnedDocs[i].RefID, i+1)
		if err != nil {
			h.Runtime.Rollback(ctx.Transaction)
			response.WriteServerError(w, method, err)
			h.Runtime.Log.Error(method, err)
			return
		}
	}

	h.Store.Activity.RecordUserActivity(ctx, activity.UserActivity{
		SpaceID:      d.SpaceID,
		DocumentID:   documentID,
		SourceType:   activity.SourceTypeDocument,
		ActivityType: activity.TypePinSequence})

	h.Store.Audit.Record(ctx, audit.EventTypeDocPinChange)

	h.Runtime.Commit(ctx.Transaction)

	response.WriteEmpty(w)
}
