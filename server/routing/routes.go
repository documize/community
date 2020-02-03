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
	"github.com/documize/community/domain/attachment"
	"github.com/documize/community/domain/auth"
	"github.com/documize/community/domain/auth/cas"
	"github.com/documize/community/domain/auth/keycloak"
	"github.com/documize/community/domain/auth/ldap"
	"github.com/documize/community/domain/backup"
	"github.com/documize/community/domain/block"
	"github.com/documize/community/domain/category"
	"github.com/documize/community/domain/conversion"
	"github.com/documize/community/domain/document"
	"github.com/documize/community/domain/group"
	"github.com/documize/community/domain/label"
	"github.com/documize/community/domain/link"
	"github.com/documize/community/domain/meta"
	"github.com/documize/community/domain/onboard"
	"github.com/documize/community/domain/organization"
	"github.com/documize/community/domain/page"
	"github.com/documize/community/domain/permission"
	"github.com/documize/community/domain/pin"
	"github.com/documize/community/domain/search"
	"github.com/documize/community/domain/section"
	"github.com/documize/community/domain/setting"
	"github.com/documize/community/domain/space"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/domain/template"
	"github.com/documize/community/domain/user"
	"github.com/documize/community/server/web"
)

// RegisterEndpoints register routes for serving API endpoints
func RegisterEndpoints(rt *env.Runtime, s *store.Store) {
	// base services
	indexer := search.NewIndexer(rt, s)

	// Pass server/application level contextual requirements into HTTP handlers
	// DO NOT pass in per request context (that is done by auth middleware per request)
	pin := pin.Handler{Runtime: rt, Store: s}
	auth := auth.Handler{Runtime: rt, Store: s}
	meta := meta.Handler{Runtime: rt, Store: s, Indexer: indexer}
	user := user.Handler{Runtime: rt, Store: s}
	link := link.Handler{Runtime: rt, Store: s}
	page := page.Handler{Runtime: rt, Store: s, Indexer: indexer}
	ldap := ldap.Handler{Runtime: rt, Store: s}
	space := space.Handler{Runtime: rt, Store: s}
	block := block.Handler{Runtime: rt, Store: s}
	group := group.Handler{Runtime: rt, Store: s}
	label := label.Handler{Runtime: rt, Store: s}
	backup := backup.Handler{Runtime: rt, Store: s, Indexer: indexer}
	section := section.Handler{Runtime: rt, Store: s}
	setting := setting.Handler{Runtime: rt, Store: s}
	category := category.Handler{Runtime: rt, Store: s}
	keycloak := keycloak.Handler{Runtime: rt, Store: s}
	cas := cas.Handler{Runtime: rt, Store: s}
	template := template.Handler{Runtime: rt, Store: s, Indexer: indexer}
	document := document.Handler{Runtime: rt, Store: s, Indexer: indexer}
	attachment := attachment.Handler{Runtime: rt, Store: s, Indexer: indexer}
	conversion := conversion.Handler{Runtime: rt, Store: s, Indexer: indexer}
	permission := permission.Handler{Runtime: rt, Store: s}
	organization := organization.Handler{Runtime: rt, Store: s}

	searchEndpoint := search.Handler{Runtime: rt, Store: s, Indexer: indexer}
	onboardEndpoint := onboard.Handler{Runtime: rt, Store: s, Indexer: indexer}

	// **************************************************
	// Non-secure public info routes
	// **************************************************

	AddPublic(rt, "meta", []string{"GET", "OPTIONS"}, nil, meta.Meta)
	AddPublic(rt, "meta/themes", []string{"GET", "OPTIONS"}, nil, meta.Themes)
	AddPublic(rt, "version", []string{"GET", "OPTIONS"}, nil,
		func(w http.ResponseWriter, r *http.Request) {
			_, _ = w.Write([]byte(rt.Product.Version))
		})

	// **************************************************
	// Non-secure public service routes
	// **************************************************

	AddPublic(rt, "authenticate/keycloak", []string{"POST", "OPTIONS"}, nil, keycloak.Authenticate)
	AddPublic(rt, "authenticate/ldap", []string{"POST", "OPTIONS"}, nil, ldap.Authenticate)
	AddPublic(rt, "authenticate/cas", []string{"POST", "OPTIONS"}, nil, cas.Authenticate)
	AddPublic(rt, "authenticate", []string{"POST", "OPTIONS"}, nil, auth.Login)
	AddPublic(rt, "validate", []string{"GET", "OPTIONS"}, nil, auth.ValidateToken)
	AddPublic(rt, "forgot", []string{"POST", "OPTIONS"}, nil, user.ForgotPassword)
	AddPublic(rt, "reset/{token}", []string{"POST", "OPTIONS"}, nil, user.ResetPassword)
	AddPublic(rt, "share/{spaceID}", []string{"POST", "OPTIONS"}, nil, space.AcceptInvitation)
	AddPublic(rt, "attachment/{orgID}/{attachmentID}", []string{"GET", "OPTIONS"}, nil, attachment.Download)
	AddPublic(rt, "logo", []string{"GET", "OPTIONS"}, []string{"default", "true"}, meta.DefaultLogo)
	AddPublic(rt, "logo", []string{"GET", "OPTIONS"}, nil, meta.Logo)

	// **************************************************
	// Secured private routes (require authentication)
	// **************************************************

	AddPrivate(rt, "import/folder/{spaceID}", []string{"POST", "OPTIONS"}, nil, conversion.UploadConvert)

	AddPrivate(rt, "documents", []string{"GET", "OPTIONS"}, nil, document.BySpace)
	AddPrivate(rt, "documents/{documentID}", []string{"GET", "OPTIONS"}, nil, document.Get)
	AddPrivate(rt, "documents/{documentID}", []string{"PUT", "OPTIONS"}, nil, document.Update)
	AddPrivate(rt, "documents/{documentID}", []string{"DELETE", "OPTIONS"}, nil, document.Delete)
	AddPrivate(rt, "documents/{documentID}/pages/level", []string{"POST", "OPTIONS"}, nil, page.ChangePageLevel)
	AddPrivate(rt, "documents/{documentID}/pages/sequence", []string{"POST", "OPTIONS"}, nil, page.ChangePageSequence)
	AddPrivate(rt, "documents/{documentID}/pages/{pageID}/revisions", []string{"GET", "OPTIONS"}, nil, page.GetRevisions)
	AddPrivate(rt, "documents/{documentID}/pages/{pageID}/revisions/{revisionID}", []string{"GET", "OPTIONS"}, nil, page.GetDiff)
	AddPrivate(rt, "documents/{documentID}/pages/{pageID}/revisions/{revisionID}", []string{"POST", "OPTIONS"}, nil, page.Rollback)
	AddPrivate(rt, "documents/{documentID}/revisions", []string{"GET", "OPTIONS"}, nil, page.GetDocumentRevisions)

	AddPrivate(rt, "documents/{documentID}/pages", []string{"GET", "OPTIONS"}, nil, page.GetPages)
	AddPrivate(rt, "documents/{documentID}/pages/{pageID}", []string{"PUT", "OPTIONS"}, nil, page.Update)
	AddPrivate(rt, "documents/{documentID}/pages/{pageID}", []string{"DELETE", "OPTIONS"}, nil, page.Delete)
	AddPrivate(rt, "documents/{documentID}/pages", []string{"DELETE", "OPTIONS"}, nil, page.DeletePages)
	AddPrivate(rt, "documents/{documentID}/pages/{pageID}", []string{"GET", "OPTIONS"}, nil, page.GetPage)
	AddPrivate(rt, "documents/{documentID}/pages", []string{"POST", "OPTIONS"}, nil, page.Add)
	AddPrivate(rt, "documents/{documentID}/attachments", []string{"GET", "OPTIONS"}, nil, attachment.Get)
	AddPrivate(rt, "documents/{documentID}/attachments/{attachmentID}", []string{"DELETE", "OPTIONS"}, nil, attachment.Delete)
	AddPrivate(rt, "documents/{documentID}/attachments", []string{"POST", "OPTIONS"}, nil, attachment.Add)
	AddPrivate(rt, "documents/{documentID}/pages/{pageID}/meta", []string{"GET", "OPTIONS"}, nil, page.GetMeta)
	AddPrivate(rt, "documents/{documentID}/pages/{pageID}/copy/{targetID}", []string{"POST", "OPTIONS"}, nil, page.Copy)
	AddPrivate(rt, "document/duplicate", []string{"POST", "OPTIONS"}, nil, document.Duplicate)
	AddPrivate(rt, "document/pinmove/{documentID}", []string{"POST", "OPTIONS"}, nil, document.PinMove)
	AddPrivate(rt, "document/pin/{documentID}", []string{"POST", "OPTIONS"}, nil, document.Pin)
	AddPrivate(rt, "document/unpin/{documentID}", []string{"DELETE", "OPTIONS"}, nil, document.Unpin)

	AddPrivate(rt, "organization/setting", []string{"GET", "OPTIONS"}, nil, setting.GetGlobalSetting)
	AddPrivate(rt, "organization/setting", []string{"POST", "OPTIONS"}, nil, setting.SaveGlobalSetting)
	AddPrivate(rt, "organization/{orgID}", []string{"GET", "OPTIONS"}, nil, organization.Get)
	AddPrivate(rt, "organization/{orgID}", []string{"PUT", "OPTIONS"}, nil, organization.Update)
	AddPrivate(rt, "organization/{orgID}/setting", []string{"GET", "OPTIONS"}, nil, setting.GetInstanceSetting)
	AddPrivate(rt, "organization/{orgID}/setting", []string{"POST", "OPTIONS"}, nil, setting.SaveInstanceSetting)
	AddPrivate(rt, "organization/{orgID}/logo", []string{"POST", "OPTIONS"}, nil, organization.UploadLogo)

	AddPrivate(rt, "space/{spaceID}", []string{"DELETE", "OPTIONS"}, nil, space.Delete)
	AddPrivate(rt, "space/{spaceID}/move/{moveToId}", []string{"DELETE", "OPTIONS"}, nil, space.Remove)
	AddPrivate(rt, "space/{spaceID}/invitation", []string{"POST", "OPTIONS"}, nil, space.Invite)
	AddPrivate(rt, "space/manage", []string{"GET", "OPTIONS"}, nil, space.Manage)
	AddPrivate(rt, "space/manage/owner/{spaceID}", []string{"POST", "OPTIONS"}, nil, space.ManageOwner)
	AddPrivate(rt, "space/{spaceID}", []string{"GET", "OPTIONS"}, nil, space.Get)
	AddPrivate(rt, "space", []string{"GET", "OPTIONS"}, nil, space.GetViewable)
	AddPrivate(rt, "space/{spaceID}", []string{"PUT", "OPTIONS"}, nil, space.Update)
	AddPrivate(rt, "space", []string{"POST", "OPTIONS"}, nil, space.Add)

	AddPrivate(rt, "label", []string{"POST", "OPTIONS"}, nil, label.Add)
	AddPrivate(rt, "label", []string{"GET", "OPTIONS"}, nil, label.Get)
	AddPrivate(rt, "label/{labelID}", []string{"PUT", "OPTIONS"}, nil, label.Update)
	AddPrivate(rt, "label/{labelID}", []string{"DELETE", "OPTIONS"}, nil, label.Delete)

	AddPrivate(rt, "category/space/{spaceID}/summary", []string{"GET", "OPTIONS"}, nil, category.GetSummary)
	AddPrivate(rt, "category/document/{documentID}", []string{"GET", "OPTIONS"}, nil, category.GetDocumentCategoryMembership)
	AddPrivate(rt, "category/space/{spaceID}", []string{"GET", "OPTIONS"}, []string{"filter", "all"}, category.GetAll)
	AddPrivate(rt, "category/space/{spaceID}", []string{"GET", "OPTIONS"}, nil, category.Get)
	AddPrivate(rt, "category/member/space/{spaceID}", []string{"GET", "OPTIONS"}, nil, category.GetSpaceCategoryMembers)
	AddPrivate(rt, "category/member", []string{"POST", "OPTIONS"}, nil, category.SetDocumentCategoryMembership)
	AddPrivate(rt, "category/{categoryID}", []string{"PUT", "OPTIONS"}, nil, category.Update)
	AddPrivate(rt, "category/{categoryID}", []string{"DELETE", "OPTIONS"}, nil, category.Delete)
	AddPrivate(rt, "category", []string{"POST", "OPTIONS"}, nil, category.Add)

	AddPrivate(rt, "users/{userID}/password", []string{"POST", "OPTIONS"}, nil, user.ChangePassword)
	AddPrivate(rt, "users", []string{"POST", "OPTIONS"}, nil, user.Add)
	AddPrivate(rt, "users/space/{spaceID}", []string{"GET", "OPTIONS"}, nil, user.GetSpaceUsers)
	AddPrivate(rt, "users", []string{"GET", "OPTIONS"}, nil, user.GetOrganizationUsers)
	AddPrivate(rt, "users/{userID}", []string{"GET", "OPTIONS"}, nil, user.Get)
	AddPrivate(rt, "users/{userID}", []string{"PUT", "OPTIONS"}, nil, user.Update)
	AddPrivate(rt, "users/{userID}", []string{"DELETE", "OPTIONS"}, nil, user.Delete)
	AddPrivate(rt, "users/match", []string{"POST", "OPTIONS"}, nil, user.MatchUsers)
	AddPrivate(rt, "users/import", []string{"POST", "OPTIONS"}, nil, user.BulkImport)

	AddPrivate(rt, "search", []string{"POST", "OPTIONS"}, nil, document.SearchDocuments)

	AddPrivate(rt, "templates", []string{"POST", "OPTIONS"}, nil, template.SaveAs)
	AddPrivate(rt, "templates/{templateID}/folder/{spaceID}", []string{"POST", "OPTIONS"}, []string{"type", "saved"}, template.Use)
	AddPrivate(rt, "templates/{spaceID}", []string{"GET", "OPTIONS"}, nil, template.SavedList)

	AddPrivate(rt, "sections", []string{"GET", "OPTIONS"}, nil, section.GetSections)
	AddPrivate(rt, "sections", []string{"POST", "OPTIONS"}, nil, section.RunSectionCommand)
	AddPrivate(rt, "sections/refresh", []string{"GET", "OPTIONS"}, nil, section.RefreshSections)
	AddPrivate(rt, "sections/blocks/space/{spaceID}", []string{"GET", "OPTIONS"}, nil, block.GetBySpace)
	AddPrivate(rt, "sections/blocks/{blockID}", []string{"GET", "OPTIONS"}, nil, block.Get)
	AddPrivate(rt, "sections/blocks/{blockID}", []string{"PUT", "OPTIONS"}, nil, block.Update)
	AddPrivate(rt, "sections/blocks/{blockID}", []string{"DELETE", "OPTIONS"}, nil, block.Delete)
	AddPrivate(rt, "sections/blocks", []string{"POST", "OPTIONS"}, nil, block.Add)

	AddPrivate(rt, "links/{spaceID}/{documentID}/{pageID}", []string{"GET", "OPTIONS"}, nil, link.GetLinkCandidates)
	AddPrivate(rt, "links", []string{"GET", "OPTIONS"}, nil, link.SearchLinkCandidates)
	AddPrivate(rt, "link/{linkID}", []string{"GET", "OPTIONS"}, nil, link.GetLink)
	AddPrivate(rt, "documents/{documentID}/links", []string{"GET", "OPTIONS"}, nil, document.DocumentLinks)

	AddPrivate(rt, "pin/{userID}", []string{"POST", "OPTIONS"}, nil, pin.Add)
	AddPrivate(rt, "pin/{userID}", []string{"GET", "OPTIONS"}, nil, pin.GetUserPins)
	AddPrivate(rt, "pin/{userID}/sequence", []string{"POST", "OPTIONS"}, nil, pin.UpdatePinSequence)
	AddPrivate(rt, "pin/{userID}/{pinID}", []string{"DELETE", "OPTIONS"}, nil, pin.DeleteUserPin)

	AddPrivate(rt, "group/{groupID}/members", []string{"GET", "OPTIONS"}, nil, group.GetGroupMembers)
	AddPrivate(rt, "group", []string{"POST", "OPTIONS"}, nil, group.Add)
	AddPrivate(rt, "group", []string{"GET", "OPTIONS"}, nil, group.Groups)
	AddPrivate(rt, "group/{groupID}", []string{"PUT", "OPTIONS"}, nil, group.Update)
	AddPrivate(rt, "group/{groupID}", []string{"DELETE", "OPTIONS"}, nil, group.Delete)
	AddPrivate(rt, "group/{groupID}/join/{userID}", []string{"POST", "OPTIONS"}, nil, group.JoinGroup)
	AddPrivate(rt, "group/{groupID}/leave/{userID}", []string{"DELETE", "OPTIONS"}, nil, group.LeaveGroup)

	AddPrivate(rt, "documents/{documentID}/permissions", []string{"GET", "OPTIONS"}, nil, permission.GetDocumentPermissions)
	AddPrivate(rt, "documents/{documentID}/permissions", []string{"PUT", "OPTIONS"}, nil, permission.SetDocumentPermissions)
	AddPrivate(rt, "documents/{documentID}/permissions/user", []string{"GET", "OPTIONS"}, nil, permission.GetUserDocumentPermissions)
	AddPrivate(rt, "space/{spaceID}/permissions", []string{"PUT", "OPTIONS"}, nil, permission.SetSpacePermissions)
	AddPrivate(rt, "space/{spaceID}/permissions/user", []string{"GET", "OPTIONS"}, nil, permission.GetUserSpacePermissions)
	AddPrivate(rt, "space/{spaceID}/permissions", []string{"GET", "OPTIONS"}, nil, permission.GetSpacePermissions)
	AddPrivate(rt, "category/{categoryID}/permission", []string{"PUT", "OPTIONS"}, nil, permission.SetCategoryPermissions)
	AddPrivate(rt, "category/{categoryID}/permission", []string{"GET", "OPTIONS"}, nil, permission.GetCategoryPermissions)
	AddPrivate(rt, "category/{categoryID}/user", []string{"GET", "OPTIONS"}, nil, permission.GetCategoryViewers)

	AddPrivate(rt, "export", []string{"POST", "OPTIONS"}, nil, document.Export)

	// fetch methods exist to speed up UI rendering by returning data in bulk
	AddPrivate(rt, "fetch/category/space/{spaceID}", []string{"GET", "OPTIONS"}, nil, category.FetchSpaceData)
	AddPrivate(rt, "fetch/document/{documentID}", []string{"GET", "OPTIONS"}, nil, document.FetchDocumentData)
	AddPrivate(rt, "fetch/page/{documentID}", []string{"GET", "OPTIONS"}, nil, page.FetchPages)

	// global admin routes
	AddPrivate(rt, "global/smtp", []string{"GET", "OPTIONS"}, nil, setting.SMTP)
	AddPrivate(rt, "global/smtp", []string{"PUT", "OPTIONS"}, nil, setting.SetSMTP)
	AddPrivate(rt, "global/auth", []string{"GET", "OPTIONS"}, nil, setting.AuthConfig)
	AddPrivate(rt, "global/auth", []string{"PUT", "OPTIONS"}, nil, setting.SetAuthConfig)
	AddPrivate(rt, "global/sync/keycloak", []string{"GET", "OPTIONS"}, nil, keycloak.Sync)
	AddPrivate(rt, "global/ldap/preview", []string{"POST", "OPTIONS"}, nil, ldap.Preview)
	AddPrivate(rt, "global/ldap/sync", []string{"GET", "OPTIONS"}, nil, ldap.Sync)
	AddPrivate(rt, "global/backup", []string{"POST", "OPTIONS"}, nil, backup.Backup)
	AddPrivate(rt, "global/restore", []string{"POST", "OPTIONS"}, nil, backup.Restore)
	AddPrivate(rt, "global/search/status", []string{"GET", "OPTIONS"}, nil, searchEndpoint.Status)
	AddPrivate(rt, "global/search/reindex", []string{"POST", "OPTIONS"}, nil, searchEndpoint.Reindex)

	AddPrivate(rt, "setup/onboard", []string{"POST", "OPTIONS"}, nil, onboardEndpoint.InstallSample)

	Add(rt, RoutePrefixRoot, "robots.txt", []string{"GET", "OPTIONS"}, nil, meta.RobotsTxt)
	Add(rt, RoutePrefixRoot, "sitemap.xml", []string{"GET", "OPTIONS"}, nil, meta.Sitemap)

	webHandler := web.Handler{Runtime: rt, Store: s}
	Add(rt, RoutePrefixRoot, "{rest:.*}", nil, nil, webHandler.EmberHandler)
}
