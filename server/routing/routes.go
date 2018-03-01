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

package routing

import (
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/attachment"
	"github.com/documize/community/domain/auth"
	"github.com/documize/community/domain/auth/keycloak"
	"github.com/documize/community/domain/block"
	"github.com/documize/community/domain/category"
	"github.com/documize/community/domain/conversion"
	"github.com/documize/community/domain/document"
	"github.com/documize/community/domain/group"
	"github.com/documize/community/domain/link"
	"github.com/documize/community/domain/meta"
	"github.com/documize/community/domain/organization"
	"github.com/documize/community/domain/page"
	"github.com/documize/community/domain/permission"
	"github.com/documize/community/domain/pin"
	"github.com/documize/community/domain/search"
	"github.com/documize/community/domain/section"
	"github.com/documize/community/domain/setting"
	"github.com/documize/community/domain/space"
	"github.com/documize/community/domain/template"
	"github.com/documize/community/domain/user"
	"github.com/documize/community/server/web"
)

// RegisterEndpoints register routes for serving API endpoints
func RegisterEndpoints(rt *env.Runtime, s *domain.Store) {
	// base services
	indexer := search.NewIndexer(rt, s)

	// Pass server/application level contextual requirements into HTTP handlers
	// DO NOT pass in per request context (that is done by auth middleware per request)
	pin := pin.Handler{Runtime: rt, Store: s}
	auth := auth.Handler{Runtime: rt, Store: s}
	meta := meta.Handler{Runtime: rt, Store: s}
	user := user.Handler{Runtime: rt, Store: s}
	link := link.Handler{Runtime: rt, Store: s}
	page := page.Handler{Runtime: rt, Store: s, Indexer: indexer}
	space := space.Handler{Runtime: rt, Store: s}
	block := block.Handler{Runtime: rt, Store: s}
	group := group.Handler{Runtime: rt, Store: s}
	section := section.Handler{Runtime: rt, Store: s}
	setting := setting.Handler{Runtime: rt, Store: s}
	category := category.Handler{Runtime: rt, Store: s}
	keycloak := keycloak.Handler{Runtime: rt, Store: s}
	template := template.Handler{Runtime: rt, Store: s, Indexer: indexer}
	document := document.Handler{Runtime: rt, Store: s, Indexer: indexer}
	attachment := attachment.Handler{Runtime: rt, Store: s, Indexer: indexer}
	conversion := conversion.Handler{Runtime: rt, Store: s, Indexer: indexer}
	permission := permission.Handler{Runtime: rt, Store: s}
	organization := organization.Handler{Runtime: rt, Store: s}

	//**************************************************
	// Non-secure routes
	//**************************************************
	Add(rt, RoutePrefixPublic, "meta", []string{"GET", "OPTIONS"}, nil, meta.Meta)
	Add(rt, RoutePrefixPublic, "authenticate/keycloak", []string{"POST", "OPTIONS"}, nil, keycloak.Authenticate)
	Add(rt, RoutePrefixPublic, "authenticate", []string{"POST", "OPTIONS"}, nil, auth.Login)
	Add(rt, RoutePrefixPublic, "validate", []string{"GET", "OPTIONS"}, nil, auth.ValidateToken)
	Add(rt, RoutePrefixPublic, "forgot", []string{"POST", "OPTIONS"}, nil, user.ForgotPassword)
	Add(rt, RoutePrefixPublic, "reset/{token}", []string{"POST", "OPTIONS"}, nil, user.ResetPassword)
	Add(rt, RoutePrefixPublic, "share/{spaceID}", []string{"POST", "OPTIONS"}, nil, space.AcceptInvitation)
	Add(rt, RoutePrefixPublic, "attachments/{orgID}/{attachmentID}", []string{"GET", "OPTIONS"}, nil, attachment.Download)
	Add(rt, RoutePrefixPublic, "version", []string{"GET", "OPTIONS"}, nil, func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(rt.Product.Version))
	})

	//**************************************************
	// Secure routes
	//**************************************************

	Add(rt, RoutePrefixPrivate, "import/folder/{folderID}", []string{"POST", "OPTIONS"}, nil, conversion.UploadConvert)

	Add(rt, RoutePrefixPrivate, "documents", []string{"GET", "OPTIONS"}, nil, document.BySpace)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}", []string{"GET", "OPTIONS"}, nil, document.Get)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}", []string{"PUT", "OPTIONS"}, nil, document.Update)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}", []string{"DELETE", "OPTIONS"}, nil, document.Delete)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/permissions", []string{"GET", "OPTIONS"}, nil, permission.GetDocumentPermissions)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/permissions", []string{"PUT", "OPTIONS"}, nil, permission.SetDocumentPermissions)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/permissions/user", []string{"GET", "OPTIONS"}, nil, permission.GetUserDocumentPermissions)

	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/level", []string{"POST", "OPTIONS"}, nil, page.ChangePageLevel)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/sequence", []string{"POST", "OPTIONS"}, nil, page.ChangePageSequence)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}/revisions", []string{"GET", "OPTIONS"}, nil, page.GetRevisions)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}/revisions/{revisionID}", []string{"GET", "OPTIONS"}, nil, page.GetDiff)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}/revisions/{revisionID}", []string{"POST", "OPTIONS"}, nil, page.Rollback)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/revisions", []string{"GET", "OPTIONS"}, nil, page.GetDocumentRevisions)

	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages", []string{"GET", "OPTIONS"}, nil, page.GetPages)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}", []string{"PUT", "OPTIONS"}, nil, page.Update)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}", []string{"DELETE", "OPTIONS"}, nil, page.Delete)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages", []string{"DELETE", "OPTIONS"}, nil, page.DeletePages)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}", []string{"GET", "OPTIONS"}, nil, page.GetPage)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages", []string{"POST", "OPTIONS"}, nil, page.Add)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/attachments", []string{"GET", "OPTIONS"}, nil, attachment.Get)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/attachments/{attachmentID}", []string{"DELETE", "OPTIONS"}, nil, attachment.Delete)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/attachments", []string{"POST", "OPTIONS"}, nil, attachment.Add)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}/meta", []string{"GET", "OPTIONS"}, nil, page.GetMeta)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}/copy/{targetID}", []string{"POST", "OPTIONS"}, nil, page.Copy)

	Add(rt, RoutePrefixPrivate, "organizations/{orgID}", []string{"GET", "OPTIONS"}, nil, organization.Get)
	Add(rt, RoutePrefixPrivate, "organizations/{orgID}", []string{"PUT", "OPTIONS"}, nil, organization.Update)

	Add(rt, RoutePrefixPrivate, "space/{spaceID}", []string{"DELETE", "OPTIONS"}, nil, space.Delete)
	Add(rt, RoutePrefixPrivate, "space/{spaceID}/move/{moveToId}", []string{"DELETE", "OPTIONS"}, nil, space.Remove)
	Add(rt, RoutePrefixPrivate, "space/{spaceID}/permissions", []string{"PUT", "OPTIONS"}, nil, permission.SetSpacePermissions)
	Add(rt, RoutePrefixPrivate, "space/{spaceID}/permissions/user", []string{"GET", "OPTIONS"}, nil, permission.GetUserSpacePermissions)
	Add(rt, RoutePrefixPrivate, "space/{spaceID}/permissions", []string{"GET", "OPTIONS"}, nil, permission.GetSpacePermissions)
	Add(rt, RoutePrefixPrivate, "space/{spaceID}/invitation", []string{"POST", "OPTIONS"}, nil, space.Invite)
	Add(rt, RoutePrefixPrivate, "space/manage", []string{"GET", "OPTIONS"}, nil, space.GetAll)
	Add(rt, RoutePrefixPrivate, "space/{spaceID}", []string{"GET", "OPTIONS"}, nil, space.Get)
	Add(rt, RoutePrefixPrivate, "space", []string{"GET", "OPTIONS"}, nil, space.GetViewable)
	Add(rt, RoutePrefixPrivate, "space/{spaceID}", []string{"PUT", "OPTIONS"}, nil, space.Update)
	Add(rt, RoutePrefixPrivate, "space", []string{"POST", "OPTIONS"}, nil, space.Add)

	Add(rt, RoutePrefixPrivate, "category/space/{spaceID}/summary", []string{"GET", "OPTIONS"}, nil, category.GetSummary)
	Add(rt, RoutePrefixPrivate, "category/document/{documentID}", []string{"GET", "OPTIONS"}, nil, category.GetDocumentCategoryMembership)
	Add(rt, RoutePrefixPrivate, "category/{categoryID}/permission", []string{"PUT", "OPTIONS"}, nil, permission.SetCategoryPermissions)
	Add(rt, RoutePrefixPrivate, "category/{categoryID}/permission", []string{"GET", "OPTIONS"}, nil, permission.GetCategoryPermissions)
	Add(rt, RoutePrefixPrivate, "category/space/{spaceID}", []string{"GET", "OPTIONS"}, []string{"filter", "all"}, category.GetAll)
	Add(rt, RoutePrefixPrivate, "category/space/{spaceID}", []string{"GET", "OPTIONS"}, nil, category.Get)
	Add(rt, RoutePrefixPrivate, "category/{categoryID}/user", []string{"GET", "OPTIONS"}, nil, permission.GetCategoryViewers)
	Add(rt, RoutePrefixPrivate, "category/member/space/{spaceID}", []string{"GET", "OPTIONS"}, nil, category.GetSpaceCategoryMembers)
	Add(rt, RoutePrefixPrivate, "category/member", []string{"POST", "OPTIONS"}, nil, category.SetDocumentCategoryMembership)
	Add(rt, RoutePrefixPrivate, "category/{categoryID}", []string{"PUT", "OPTIONS"}, nil, category.Update)
	Add(rt, RoutePrefixPrivate, "category/{categoryID}", []string{"DELETE", "OPTIONS"}, nil, category.Delete)
	Add(rt, RoutePrefixPrivate, "category", []string{"POST", "OPTIONS"}, nil, category.Add)

	Add(rt, RoutePrefixPrivate, "users/{userID}/password", []string{"POST", "OPTIONS"}, nil, user.ChangePassword)
	Add(rt, RoutePrefixPrivate, "users", []string{"POST", "OPTIONS"}, nil, user.Add)
	Add(rt, RoutePrefixPrivate, "users/space/{spaceID}", []string{"GET", "OPTIONS"}, nil, user.GetSpaceUsers)
	Add(rt, RoutePrefixPrivate, "users", []string{"GET", "OPTIONS"}, nil, user.GetOrganizationUsers)
	Add(rt, RoutePrefixPrivate, "users/{userID}", []string{"GET", "OPTIONS"}, nil, user.Get)
	Add(rt, RoutePrefixPrivate, "users/{userID}", []string{"PUT", "OPTIONS"}, nil, user.Update)
	Add(rt, RoutePrefixPrivate, "users/{userID}", []string{"DELETE", "OPTIONS"}, nil, user.Delete)
	Add(rt, RoutePrefixPrivate, "users/sync", []string{"GET", "OPTIONS"}, nil, keycloak.Sync)
	Add(rt, RoutePrefixPrivate, "users/match", []string{"POST", "OPTIONS"}, nil, user.MatchUsers)
	Add(rt, RoutePrefixPrivate, "users/import", []string{"POST", "OPTIONS"}, nil, user.BulkImport)

	Add(rt, RoutePrefixPrivate, "search", []string{"POST", "OPTIONS"}, nil, document.SearchDocuments)

	Add(rt, RoutePrefixPrivate, "templates", []string{"POST", "OPTIONS"}, nil, template.SaveAs)
	Add(rt, RoutePrefixPrivate, "templates/{templateID}/folder/{folderID}", []string{"POST", "OPTIONS"}, []string{"type", "saved"}, template.Use)
	Add(rt, RoutePrefixPrivate, "templates/{folderID}", []string{"GET", "OPTIONS"}, nil, template.SavedList)

	Add(rt, RoutePrefixPrivate, "sections", []string{"GET", "OPTIONS"}, nil, section.GetSections)
	Add(rt, RoutePrefixPrivate, "sections", []string{"POST", "OPTIONS"}, nil, section.RunSectionCommand)
	Add(rt, RoutePrefixPrivate, "sections/refresh", []string{"GET", "OPTIONS"}, nil, section.RefreshSections)
	Add(rt, RoutePrefixPrivate, "sections/blocks/space/{folderID}", []string{"GET", "OPTIONS"}, nil, block.GetBySpace)
	Add(rt, RoutePrefixPrivate, "sections/blocks/{blockID}", []string{"GET", "OPTIONS"}, nil, block.Get)
	Add(rt, RoutePrefixPrivate, "sections/blocks/{blockID}", []string{"PUT", "OPTIONS"}, nil, block.Update)
	Add(rt, RoutePrefixPrivate, "sections/blocks/{blockID}", []string{"DELETE", "OPTIONS"}, nil, block.Delete)
	Add(rt, RoutePrefixPrivate, "sections/blocks", []string{"POST", "OPTIONS"}, nil, block.Add)

	Add(rt, RoutePrefixPrivate, "links/{folderID}/{documentID}/{pageID}", []string{"GET", "OPTIONS"}, nil, link.GetLinkCandidates)
	Add(rt, RoutePrefixPrivate, "links", []string{"GET", "OPTIONS"}, nil, link.SearchLinkCandidates)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/links", []string{"GET", "OPTIONS"}, nil, document.DocumentLinks)

	Add(rt, RoutePrefixPrivate, "global/smtp", []string{"GET", "OPTIONS"}, nil, setting.SMTP)
	Add(rt, RoutePrefixPrivate, "global/smtp", []string{"PUT", "OPTIONS"}, nil, setting.SetSMTP)
	Add(rt, RoutePrefixPrivate, "global/license", []string{"GET", "OPTIONS"}, nil, setting.License)
	Add(rt, RoutePrefixPrivate, "global/license", []string{"PUT", "OPTIONS"}, nil, setting.SetLicense)
	Add(rt, RoutePrefixPrivate, "global/auth", []string{"GET", "OPTIONS"}, nil, setting.AuthConfig)
	Add(rt, RoutePrefixPrivate, "global/auth", []string{"PUT", "OPTIONS"}, nil, setting.SetAuthConfig)

	Add(rt, RoutePrefixPrivate, "pin/{userID}", []string{"POST", "OPTIONS"}, nil, pin.Add)
	Add(rt, RoutePrefixPrivate, "pin/{userID}", []string{"GET", "OPTIONS"}, nil, pin.GetUserPins)
	Add(rt, RoutePrefixPrivate, "pin/{userID}/sequence", []string{"POST", "OPTIONS"}, nil, pin.UpdatePinSequence)
	Add(rt, RoutePrefixPrivate, "pin/{userID}/{pinID}", []string{"DELETE", "OPTIONS"}, nil, pin.DeleteUserPin)

	Add(rt, RoutePrefixPrivate, "group/{groupID}/members", []string{"GET", "OPTIONS"}, nil, group.GetGroupMembers)
	Add(rt, RoutePrefixPrivate, "group", []string{"POST", "OPTIONS"}, nil, group.Add)
	Add(rt, RoutePrefixPrivate, "group", []string{"GET", "OPTIONS"}, nil, group.Groups)
	Add(rt, RoutePrefixPrivate, "group/{groupID}", []string{"PUT", "OPTIONS"}, nil, group.Update)
	Add(rt, RoutePrefixPrivate, "group/{groupID}", []string{"DELETE", "OPTIONS"}, nil, group.Delete)
	Add(rt, RoutePrefixPrivate, "group/{groupID}/join/{userID}", []string{"POST", "OPTIONS"}, nil, group.JoinGroup)
	Add(rt, RoutePrefixPrivate, "group/{groupID}/leave/{userID}", []string{"DELETE", "OPTIONS"}, nil, group.LeaveGroup)

	// fetch methods exist to speed up UI rendering by returning data in bulk
	Add(rt, RoutePrefixPrivate, "fetch/category/space/{spaceID}", []string{"GET", "OPTIONS"}, nil, category.FetchSpaceData)
	Add(rt, RoutePrefixPrivate, "fetch/document/{documentID}", []string{"GET", "OPTIONS"}, nil, document.FetchDocumentData)
	Add(rt, RoutePrefixPrivate, "fetch/page/{documentID}", []string{"GET", "OPTIONS"}, nil, page.FetchPages)

	Add(rt, RoutePrefixRoot, "robots.txt", []string{"GET", "OPTIONS"}, nil, meta.RobotsTxt)
	Add(rt, RoutePrefixRoot, "sitemap.xml", []string{"GET", "OPTIONS"}, nil, meta.Sitemap)

	webHandler := web.Handler{Runtime: rt, Store: s}
	Add(rt, RoutePrefixRoot, "{rest:.*}", nil, nil, webHandler.EmberHandler)
}
