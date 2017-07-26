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

	"github.com/documize/community/core/api/endpoint"
	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/attachment"
	"github.com/documize/community/domain/auth"
	"github.com/documize/community/domain/link"
	"github.com/documize/community/domain/meta"
	"github.com/documize/community/domain/organization"
	"github.com/documize/community/domain/pin"
	"github.com/documize/community/domain/setting"
	"github.com/documize/community/domain/space"
	"github.com/documize/community/domain/user"
	"github.com/documize/community/server/web"
)

// RegisterEndpoints register routes for serving API endpoints
func RegisterEndpoints(rt *env.Runtime, s *domain.Store) {
	// We pass server/application level contextual requirements into HTTP handlers
	// DO NOT pass in per request context (that is done by auth middleware per request)
	pin := pin.Handler{Runtime: rt, Store: s}
	auth := auth.Handler{Runtime: rt, Store: s}
	meta := meta.Handler{Runtime: rt, Store: s}
	user := user.Handler{Runtime: rt, Store: s}
	link := link.Handler{Runtime: rt, Store: s}
	space := space.Handler{Runtime: rt, Store: s}
	setting := setting.Handler{Runtime: rt, Store: s}
	attachment := attachment.Handler{Runtime: rt, Store: s}
	organization := organization.Handler{Runtime: rt, Store: s}

	//**************************************************
	// Non-secure routes
	//**************************************************
	Add(rt, RoutePrefixPublic, "meta", []string{"GET", "OPTIONS"}, nil, meta.Meta)
	Add(rt, RoutePrefixPublic, "authenticate/keycloak", []string{"POST", "OPTIONS"}, nil, endpoint.AuthenticateKeycloak)
	Add(rt, RoutePrefixPublic, "authenticate", []string{"POST", "OPTIONS"}, nil, auth.Login)
	Add(rt, RoutePrefixPublic, "validate", []string{"GET", "OPTIONS"}, nil, auth.ValidateToken)
	Add(rt, RoutePrefixPublic, "forgot", []string{"POST", "OPTIONS"}, nil, user.ForgotPassword)
	Add(rt, RoutePrefixPublic, "reset/{token}", []string{"POST", "OPTIONS"}, nil, user.ResetPassword)
	Add(rt, RoutePrefixPublic, "share/{folderID}", []string{"POST", "OPTIONS"}, nil, space.AcceptInvitation)
	Add(rt, RoutePrefixPublic, "attachments/{orgID}/{attachmentID}", []string{"GET", "OPTIONS"}, nil, attachment.Download)
	Add(rt, RoutePrefixPublic, "version", []string{"GET", "OPTIONS"}, nil, func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(rt.Product.Version))
	})

	//**************************************************
	// Secure routes
	//**************************************************

	// Import & Convert Document
	Add(rt, RoutePrefixPrivate, "import/folder/{folderID}", []string{"POST", "OPTIONS"}, nil, endpoint.UploadConvertDocument)

	Add(rt, RoutePrefixPrivate, "documents/{documentID}/export", []string{"GET", "OPTIONS"}, nil, endpoint.GetDocumentAsDocx)
	Add(rt, RoutePrefixPrivate, "documents", []string{"GET", "OPTIONS"}, []string{"filter", "tag"}, endpoint.GetDocumentsByTag)
	Add(rt, RoutePrefixPrivate, "documents", []string{"GET", "OPTIONS"}, nil, endpoint.GetDocumentsByFolder)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}", []string{"GET", "OPTIONS"}, nil, endpoint.GetDocument)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}", []string{"PUT", "OPTIONS"}, nil, endpoint.UpdateDocument)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}", []string{"DELETE", "OPTIONS"}, nil, endpoint.DeleteDocument)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/activity", []string{"GET", "OPTIONS"}, nil, endpoint.GetDocumentActivity)

	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/level", []string{"POST", "OPTIONS"}, nil, endpoint.ChangeDocumentPageLevel)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/sequence", []string{"POST", "OPTIONS"}, nil, endpoint.ChangeDocumentPageSequence)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/batch", []string{"POST", "OPTIONS"}, nil, endpoint.GetDocumentPagesBatch)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}/revisions", []string{"GET", "OPTIONS"}, nil, endpoint.GetDocumentPageRevisions)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}/revisions/{revisionID}", []string{"GET", "OPTIONS"}, nil, endpoint.GetDocumentPageDiff)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}/revisions/{revisionID}", []string{"POST", "OPTIONS"}, nil, endpoint.RollbackDocumentPage)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/revisions", []string{"GET", "OPTIONS"}, nil, endpoint.GetDocumentRevisions)

	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages", []string{"GET", "OPTIONS"}, nil, endpoint.GetDocumentPages)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}", []string{"PUT", "OPTIONS"}, nil, endpoint.UpdateDocumentPage)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}", []string{"DELETE", "OPTIONS"}, nil, endpoint.DeleteDocumentPage)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages", []string{"DELETE", "OPTIONS"}, nil, endpoint.DeleteDocumentPages)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}", []string{"GET", "OPTIONS"}, nil, endpoint.GetDocumentPage)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages", []string{"POST", "OPTIONS"}, nil, endpoint.AddDocumentPage)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/attachments", []string{"GET", "OPTIONS"}, nil, attachment.Get)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/attachments/{attachmentID}", []string{"DELETE", "OPTIONS"}, nil, attachment.Delete)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/attachments", []string{"POST", "OPTIONS"}, nil, attachment.Add)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}/meta", []string{"GET", "OPTIONS"}, nil, endpoint.GetDocumentPageMeta)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}/copy/{targetID}", []string{"POST", "OPTIONS"}, nil, endpoint.CopyPage)

	Add(rt, RoutePrefixPrivate, "organizations/{orgID}", []string{"GET", "OPTIONS"}, nil, organization.Get)
	Add(rt, RoutePrefixPrivate, "organizations/{orgID}", []string{"PUT", "OPTIONS"}, nil, organization.Update)

	Add(rt, RoutePrefixPrivate, "folders/{folderID}", []string{"DELETE", "OPTIONS"}, nil, space.Delete)
	Add(rt, RoutePrefixPrivate, "folders/{folderID}/move/{moveToId}", []string{"DELETE", "OPTIONS"}, nil, space.Remove)
	Add(rt, RoutePrefixPrivate, "folders/{folderID}/permissions", []string{"PUT", "OPTIONS"}, nil, space.SetPermissions)
	Add(rt, RoutePrefixPrivate, "folders/{folderID}/permissions", []string{"GET", "OPTIONS"}, nil, space.GetPermissions)
	Add(rt, RoutePrefixPrivate, "folders/{folderID}/invitation", []string{"POST", "OPTIONS"}, nil, space.Invite)
	Add(rt, RoutePrefixPrivate, "folders", []string{"GET", "OPTIONS"}, []string{"filter", "viewers"}, space.GetSpaceViewers)
	Add(rt, RoutePrefixPrivate, "folders", []string{"POST", "OPTIONS"}, nil, space.Add)
	Add(rt, RoutePrefixPrivate, "folders", []string{"GET", "OPTIONS"}, nil, space.GetAll)
	Add(rt, RoutePrefixPrivate, "folders/{folderID}", []string{"GET", "OPTIONS"}, nil, space.Get)
	Add(rt, RoutePrefixPrivate, "folders/{folderID}", []string{"PUT", "OPTIONS"}, nil, space.Update)

	Add(rt, RoutePrefixPrivate, "users/{userID}/password", []string{"POST", "OPTIONS"}, nil, user.ChangePassword)
	Add(rt, RoutePrefixPrivate, "users/{userID}/permissions", []string{"GET", "OPTIONS"}, nil, user.UserSpacePermissions)
	Add(rt, RoutePrefixPrivate, "users", []string{"POST", "OPTIONS"}, nil, user.Add)
	Add(rt, RoutePrefixPrivate, "users/folder/{folderID}", []string{"GET", "OPTIONS"}, nil, user.GetSpaceUsers)
	Add(rt, RoutePrefixPrivate, "users", []string{"GET", "OPTIONS"}, nil, user.GetOrganizationUsers)
	Add(rt, RoutePrefixPrivate, "users/{userID}", []string{"GET", "OPTIONS"}, nil, user.Get)
	Add(rt, RoutePrefixPrivate, "users/{userID}", []string{"PUT", "OPTIONS"}, nil, user.Update)
	Add(rt, RoutePrefixPrivate, "users/{userID}", []string{"DELETE", "OPTIONS"}, nil, user.Delete)
	Add(rt, RoutePrefixPrivate, "users/sync", []string{"GET", "OPTIONS"}, nil, endpoint.SyncKeycloak)

	Add(rt, RoutePrefixPrivate, "search", []string{"GET", "OPTIONS"}, nil, endpoint.SearchDocuments)

	Add(rt, RoutePrefixPrivate, "templates", []string{"POST", "OPTIONS"}, nil, endpoint.SaveAsTemplate)
	Add(rt, RoutePrefixPrivate, "templates", []string{"GET", "OPTIONS"}, nil, endpoint.GetSavedTemplates)
	Add(rt, RoutePrefixPrivate, "templates/stock", []string{"GET", "OPTIONS"}, nil, endpoint.GetStockTemplates)
	Add(rt, RoutePrefixPrivate, "templates/{templateID}/folder/{folderID}", []string{"POST", "OPTIONS"}, []string{"type", "stock"}, endpoint.StartDocumentFromStockTemplate)
	Add(rt, RoutePrefixPrivate, "templates/{templateID}/folder/{folderID}", []string{"POST", "OPTIONS"}, []string{"type", "saved"}, endpoint.StartDocumentFromSavedTemplate)

	Add(rt, RoutePrefixPrivate, "sections", []string{"GET", "OPTIONS"}, nil, endpoint.GetSections)
	Add(rt, RoutePrefixPrivate, "sections", []string{"POST", "OPTIONS"}, nil, endpoint.RunSectionCommand)
	Add(rt, RoutePrefixPrivate, "sections/refresh", []string{"GET", "OPTIONS"}, nil, endpoint.RefreshSections)
	Add(rt, RoutePrefixPrivate, "sections/blocks/space/{folderID}", []string{"GET", "OPTIONS"}, nil, endpoint.GetBlocksForSpace)
	Add(rt, RoutePrefixPrivate, "sections/blocks/{blockID}", []string{"GET", "OPTIONS"}, nil, endpoint.GetBlock)
	Add(rt, RoutePrefixPrivate, "sections/blocks/{blockID}", []string{"PUT", "OPTIONS"}, nil, endpoint.UpdateBlock)
	Add(rt, RoutePrefixPrivate, "sections/blocks/{blockID}", []string{"DELETE", "OPTIONS"}, nil, endpoint.DeleteBlock)
	Add(rt, RoutePrefixPrivate, "sections/blocks", []string{"POST", "OPTIONS"}, nil, endpoint.AddBlock)
	Add(rt, RoutePrefixPrivate, "sections/targets", []string{"GET", "OPTIONS"}, nil, endpoint.GetPageMoveCopyTargets)

	Add(rt, RoutePrefixPrivate, "links/{folderID}/{documentID}/{pageID}", []string{"GET", "OPTIONS"}, nil, link.GetLinkCandidates)
	Add(rt, RoutePrefixPrivate, "links", []string{"GET", "OPTIONS"}, nil, link.SearchLinkCandidates)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/links", []string{"GET", "OPTIONS"}, nil, endpoint.GetDocumentLinks)

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

	Add(rt, RoutePrefixRoot, "robots.txt", []string{"GET", "OPTIONS"}, nil, meta.RobotsTxt)
	Add(rt, RoutePrefixRoot, "sitemap.xml", []string{"GET", "OPTIONS"}, nil, meta.Sitemap)
	Add(rt, RoutePrefixRoot, "{rest:.*}", nil, nil, web.EmberHandler)
}
