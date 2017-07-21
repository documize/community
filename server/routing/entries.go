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

	"github.com/documize/community/core/api"
	"github.com/documize/community/core/api/endpoint"
	"github.com/documize/community/core/env"
	"github.com/documize/community/server/web"
)

// RegisterEndpoints register routes for serving API endpoints
func RegisterEndpoints(rt env.Runtime) {
	//**************************************************
	// Non-secure routes
	//**************************************************
	Add(rt, RoutePrefixPublic, "meta", []string{"GET", "OPTIONS"}, nil, endpoint.GetMeta)
	Add(rt, RoutePrefixPublic, "authenticate/keycloak", []string{"POST", "OPTIONS"}, nil, endpoint.AuthenticateKeycloak)
	Add(rt, RoutePrefixPublic, "authenticate", []string{"POST", "OPTIONS"}, nil, endpoint.Authenticate)
	Add(rt, RoutePrefixPublic, "validate", []string{"GET", "OPTIONS"}, nil, endpoint.ValidateAuthToken)
	Add(rt, RoutePrefixPublic, "forgot", []string{"POST", "OPTIONS"}, nil, endpoint.ForgotUserPassword)
	Add(rt, RoutePrefixPublic, "reset/{token}", []string{"POST", "OPTIONS"}, nil, endpoint.ResetUserPassword)
	Add(rt, RoutePrefixPublic, "share/{folderID}", []string{"POST", "OPTIONS"}, nil, endpoint.AcceptSharedFolder)
	Add(rt, RoutePrefixPublic, "attachments/{orgID}/{attachmentID}", []string{"GET", "OPTIONS"}, nil, endpoint.AttachmentDownload)
	Add(rt, RoutePrefixPublic, "version", []string{"GET", "OPTIONS"}, nil, func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(api.Runtime.Product.Version))
	})

	//**************************************************
	// Secure routes
	//**************************************************

	// Import & Convert Document
	Add(rt, RoutePrefixPrivate, "import/folder/{folderID}", []string{"POST", "OPTIONS"}, nil, endpoint.UploadConvertDocument)

	// Document
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/export", []string{"GET", "OPTIONS"}, nil, endpoint.GetDocumentAsDocx)
	Add(rt, RoutePrefixPrivate, "documents", []string{"GET", "OPTIONS"}, []string{"filter", "tag"}, endpoint.GetDocumentsByTag)
	Add(rt, RoutePrefixPrivate, "documents", []string{"GET", "OPTIONS"}, nil, endpoint.GetDocumentsByFolder)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}", []string{"GET", "OPTIONS"}, nil, endpoint.GetDocument)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}", []string{"PUT", "OPTIONS"}, nil, endpoint.UpdateDocument)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}", []string{"DELETE", "OPTIONS"}, nil, endpoint.DeleteDocument)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/activity", []string{"GET", "OPTIONS"}, nil, endpoint.GetDocumentActivity)

	// Document Page
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
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/attachments", []string{"GET", "OPTIONS"}, nil, endpoint.GetAttachments)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/attachments/{attachmentID}", []string{"DELETE", "OPTIONS"}, nil, endpoint.DeleteAttachment)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/attachments", []string{"POST", "OPTIONS"}, nil, endpoint.AddAttachments)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}/meta", []string{"GET", "OPTIONS"}, nil, endpoint.GetDocumentPageMeta)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}/copy/{targetID}", []string{"POST", "OPTIONS"}, nil, endpoint.CopyPage)

	// Organization
	Add(rt, RoutePrefixPrivate, "organizations/{orgID}", []string{"GET", "OPTIONS"}, nil, endpoint.GetOrganization)
	Add(rt, RoutePrefixPrivate, "organizations/{orgID}", []string{"PUT", "OPTIONS"}, nil, endpoint.UpdateOrganization)

	// Folder
	Add(rt, RoutePrefixPrivate, "folders/{folderID}", []string{"DELETE", "OPTIONS"}, nil, endpoint.DeleteFolder)
	Add(rt, RoutePrefixPrivate, "folders/{folderID}/move/{moveToId}", []string{"DELETE", "OPTIONS"}, nil, endpoint.RemoveFolder)
	Add(rt, RoutePrefixPrivate, "folders/{folderID}/permissions", []string{"PUT", "OPTIONS"}, nil, endpoint.SetFolderPermissions)
	Add(rt, RoutePrefixPrivate, "folders/{folderID}/permissions", []string{"GET", "OPTIONS"}, nil, endpoint.GetFolderPermissions)
	Add(rt, RoutePrefixPrivate, "folders/{folderID}/invitation", []string{"POST", "OPTIONS"}, nil, endpoint.InviteToFolder)
	Add(rt, RoutePrefixPrivate, "folders", []string{"GET", "OPTIONS"}, []string{"filter", "viewers"}, endpoint.GetFolderVisibility)
	Add(rt, RoutePrefixPrivate, "folders", []string{"POST", "OPTIONS"}, nil, endpoint.AddFolder)
	Add(rt, RoutePrefixPrivate, "folders", []string{"GET", "OPTIONS"}, nil, endpoint.GetFolders)
	Add(rt, RoutePrefixPrivate, "folders/{folderID}", []string{"GET", "OPTIONS"}, nil, endpoint.GetFolder)
	Add(rt, RoutePrefixPrivate, "folders/{folderID}", []string{"PUT", "OPTIONS"}, nil, endpoint.UpdateFolder)

	// Users
	Add(rt, RoutePrefixPrivate, "users/{userID}/password", []string{"POST", "OPTIONS"}, nil, endpoint.ChangeUserPassword)
	Add(rt, RoutePrefixPrivate, "users/{userID}/permissions", []string{"GET", "OPTIONS"}, nil, endpoint.GetUserFolderPermissions)
	Add(rt, RoutePrefixPrivate, "users", []string{"POST", "OPTIONS"}, nil, endpoint.AddUser)
	Add(rt, RoutePrefixPrivate, "users/folder/{folderID}", []string{"GET", "OPTIONS"}, nil, endpoint.GetFolderUsers)
	Add(rt, RoutePrefixPrivate, "users", []string{"GET", "OPTIONS"}, nil, endpoint.GetOrganizationUsers)
	Add(rt, RoutePrefixPrivate, "users/{userID}", []string{"GET", "OPTIONS"}, nil, endpoint.GetUser)
	Add(rt, RoutePrefixPrivate, "users/{userID}", []string{"PUT", "OPTIONS"}, nil, endpoint.UpdateUser)
	Add(rt, RoutePrefixPrivate, "users/{userID}", []string{"DELETE", "OPTIONS"}, nil, endpoint.DeleteUser)
	Add(rt, RoutePrefixPrivate, "users/sync", []string{"GET", "OPTIONS"}, nil, endpoint.SyncKeycloak)

	// Search
	Add(rt, RoutePrefixPrivate, "search", []string{"GET", "OPTIONS"}, nil, endpoint.SearchDocuments)

	// Templates
	Add(rt, RoutePrefixPrivate, "templates", []string{"POST", "OPTIONS"}, nil, endpoint.SaveAsTemplate)
	Add(rt, RoutePrefixPrivate, "templates", []string{"GET", "OPTIONS"}, nil, endpoint.GetSavedTemplates)
	Add(rt, RoutePrefixPrivate, "templates/stock", []string{"GET", "OPTIONS"}, nil, endpoint.GetStockTemplates)
	Add(rt, RoutePrefixPrivate, "templates/{templateID}/folder/{folderID}", []string{"POST", "OPTIONS"}, []string{"type", "stock"}, endpoint.StartDocumentFromStockTemplate)
	Add(rt, RoutePrefixPrivate, "templates/{templateID}/folder/{folderID}", []string{"POST", "OPTIONS"}, []string{"type", "saved"}, endpoint.StartDocumentFromSavedTemplate)

	// Sections
	Add(rt, RoutePrefixPrivate, "sections", []string{"GET", "OPTIONS"}, nil, endpoint.GetSections)
	Add(rt, RoutePrefixPrivate, "sections", []string{"POST", "OPTIONS"}, nil, endpoint.RunSectionCommand)
	Add(rt, RoutePrefixPrivate, "sections/refresh", []string{"GET", "OPTIONS"}, nil, endpoint.RefreshSections)
	Add(rt, RoutePrefixPrivate, "sections/blocks/space/{folderID}", []string{"GET", "OPTIONS"}, nil, endpoint.GetBlocksForSpace)
	Add(rt, RoutePrefixPrivate, "sections/blocks/{blockID}", []string{"GET", "OPTIONS"}, nil, endpoint.GetBlock)
	Add(rt, RoutePrefixPrivate, "sections/blocks/{blockID}", []string{"PUT", "OPTIONS"}, nil, endpoint.UpdateBlock)
	Add(rt, RoutePrefixPrivate, "sections/blocks/{blockID}", []string{"DELETE", "OPTIONS"}, nil, endpoint.DeleteBlock)
	Add(rt, RoutePrefixPrivate, "sections/blocks", []string{"POST", "OPTIONS"}, nil, endpoint.AddBlock)
	Add(rt, RoutePrefixPrivate, "sections/targets", []string{"GET", "OPTIONS"}, nil, endpoint.GetPageMoveCopyTargets)

	// Links
	Add(rt, RoutePrefixPrivate, "links/{folderID}/{documentID}/{pageID}", []string{"GET", "OPTIONS"}, nil, endpoint.GetLinkCandidates)
	Add(rt, RoutePrefixPrivate, "links", []string{"GET", "OPTIONS"}, nil, endpoint.SearchLinkCandidates)
	Add(rt, RoutePrefixPrivate, "documents/{documentID}/links", []string{"GET", "OPTIONS"}, nil, endpoint.GetDocumentLinks)

	// Global installation-wide config
	Add(rt, RoutePrefixPrivate, "global/smtp", []string{"GET", "OPTIONS"}, nil, endpoint.GetSMTPConfig)
	Add(rt, RoutePrefixPrivate, "global/smtp", []string{"PUT", "OPTIONS"}, nil, endpoint.SaveSMTPConfig)
	Add(rt, RoutePrefixPrivate, "global/license", []string{"GET", "OPTIONS"}, nil, endpoint.GetLicense)
	Add(rt, RoutePrefixPrivate, "global/license", []string{"PUT", "OPTIONS"}, nil, endpoint.SaveLicense)
	Add(rt, RoutePrefixPrivate, "global/auth", []string{"GET", "OPTIONS"}, nil, endpoint.GetAuthConfig)
	Add(rt, RoutePrefixPrivate, "global/auth", []string{"PUT", "OPTIONS"}, nil, endpoint.SaveAuthConfig)

	// Pinned items
	Add(rt, RoutePrefixPrivate, "pin/{userID}", []string{"POST", "OPTIONS"}, nil, endpoint.AddPin)
	Add(rt, RoutePrefixPrivate, "pin/{userID}", []string{"GET", "OPTIONS"}, nil, endpoint.GetUserPins)
	Add(rt, RoutePrefixPrivate, "pin/{userID}/sequence", []string{"POST", "OPTIONS"}, nil, endpoint.UpdatePinSequence)
	Add(rt, RoutePrefixPrivate, "pin/{userID}/{pinID}", []string{"DELETE", "OPTIONS"}, nil, endpoint.DeleteUserPin)

	// Single page app handler
	Add(rt, RoutePrefixRoot, "robots.txt", []string{"GET", "OPTIONS"}, nil, endpoint.GetRobots)
	Add(rt, RoutePrefixRoot, "sitemap.xml", []string{"GET", "OPTIONS"}, nil, endpoint.GetSitemap)
	Add(rt, RoutePrefixRoot, "{rest:.*}", nil, nil, web.EmberHandler)
}
