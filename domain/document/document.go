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
	"github.com/documize/community/core/uniqueid"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/model/category"
	"github.com/documize/community/model/doc"
	"github.com/documize/community/model/page"
	"github.com/documize/community/model/workflow"
	"github.com/pkg/errors"
)

// FilterCategoryProtected removes documents that cannot be seen by user due to
// document cateogory viewing permissions.
func FilterCategoryProtected(docs []doc.Document, cats []category.Category, members []category.Member, viewDrafts bool) (filtered []doc.Document) {
	filtered = []doc.Document{}

	for _, doc := range docs {
		hasCategory := false
		canSeeCategory := false
		skip := false

		// drafts included if user can see them
		if doc.Lifecycle == workflow.LifecycleDraft && !viewDrafts {
			skip = true
		}

		// archived never included
		if doc.Lifecycle == workflow.LifecycleArchived {
			skip = true
		}

	OUTER:

		for _, m := range members {
			if m.DocumentID == doc.RefID {
				hasCategory = true
				for _, cat := range cats {
					if cat.RefID == m.CategoryID {
						canSeeCategory = true
						continue OUTER
					}
				}
			}
		}

		if !skip && (!hasCategory || canSeeCategory) {
			filtered = append(filtered, doc)
		}
	}

	return
}

// CopyDocument clones an existing document
func CopyDocument(ctx domain.RequestContext, s store.Store, documentID string) (newDocumentID string, err error) {
	unseq := doc.Unsequenced

	doc, err := s.Document.Get(ctx, documentID)
	if err != nil {
		err = errors.Wrap(err, "unable to fetch existing document")
		return
	}

	newDocumentID = uniqueid.Generate()
	doc.RefID = newDocumentID
	doc.ID = 0
	doc.Versioned = false
	doc.VersionID = ""
	doc.GroupID = ""
	doc.Template = false
	doc.Sequence = unseq

	// Duplicate pages and associated meta
	pages, err := s.Page.GetPages(ctx, documentID)
	if err != nil {
		err = errors.Wrap(err, "unable to get existing pages")
		return
	}

	var pageModel []page.NewPage

	for _, p := range pages {
		p.DocumentID = newDocumentID
		p.ID = 0

		meta, err2 := s.Page.GetPageMeta(ctx, p.RefID)
		if err2 != nil {
			err = errors.Wrap(err, "unable to get existing pages meta")
			return
		}

		pageID := uniqueid.Generate()
		p.RefID = pageID
		meta.SectionID = pageID
		meta.DocumentID = newDocumentID

		m := page.NewPage{}
		m.Page = p
		m.Meta = meta

		pageModel = append(pageModel, m)
	}

	// Duplicate attachments
	attachments, _ := s.Attachment.GetAttachments(ctx, documentID)
	for i, a := range attachments {
		a.DocumentID = newDocumentID
		a.RefID = uniqueid.Generate()
		a.ID = 0
		attachments[i] = a
	}

	// Now create the template: document, attachments, pages and their meta
	err = s.Document.Add(ctx, doc)
	if err != nil {
		err = errors.Wrap(err, "unable to add copied document")
		return
	}

	for _, a := range attachments {
		err = s.Attachment.Add(ctx, a)
		if err != nil {
			err = errors.Wrap(err, "unable to add copied attachment")
			return
		}
	}

	for _, m := range pageModel {
		err = s.Page.Add(ctx, m)
		if err != nil {
			err = errors.Wrap(err, "unable to add copied page")
			return
		}
	}

	cats, err := s.Category.GetDocumentCategoryMembership(ctx, documentID)
	if err != nil {
		err = errors.Wrap(err, "unable to add copied page")
		return
	}

	for ci := range cats {
		cm := category.Member{}
		cm.DocumentID = newDocumentID
		cm.CategoryID = cats[ci].RefID
		cm.OrgID = ctx.OrgID
		cm.RefID = uniqueid.Generate()
		s.Category.AssociateDocument(ctx, cm)
		if err != nil {
			err = errors.Wrap(err, "unable to add copied page")
			return
		}
	}

	return
}

// FilterLastVersion returns the latest version of each document
// by removing all previous versions.
// If a document is not versioned, it is returned as-is.
func FilterLastVersion(docs []doc.Document) (filtered []doc.Document) {
	filtered = []doc.Document{}
	prev := make(map[string]bool)

	for _, doc := range docs {
		add := false

		if doc.GroupID == "" {
			add = true
		} else {
			if _, isExisting := prev[doc.GroupID]; !isExisting {
				add = true
				prev[doc.GroupID] = true
			} else {
				add = false
			}
		}

		if add {
			filtered = append(filtered, doc)
		}
	}

	return
}
