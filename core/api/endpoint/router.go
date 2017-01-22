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

package endpoint

import (
	"encoding/json"
	"net/http"
	"sort"
	"strings"

	"github.com/documize/community/core/log"
	"github.com/documize/community/core/web"
	"github.com/gorilla/mux"
)

const (
	// RoutePrefixPublic used for the unsecured api
	RoutePrefixPublic = "/api/public/"
	// RoutePrefixPrivate used for secured api (requiring api)
	RoutePrefixPrivate = "/api/"
	// RoutePrefixRoot used for unsecured endpoints at root (e.g. robots.txt)
	RoutePrefixRoot = "/"
)

type routeDef struct {
	Prefix  string
	Path    string
	Methods []string
	Queries []string
}

// RouteFunc describes end-point functions
type RouteFunc func(http.ResponseWriter, *http.Request)

type routeMap map[string]RouteFunc

var routes = make(routeMap)

func routesKey(prefix, path string, methods, queries []string) (string, error) {
	rd := routeDef{
		Prefix:  prefix,
		Path:    path,
		Methods: methods,
		Queries: queries,
	}
	b, e := json.Marshal(rd)
	return string(b), e
}

// Add an endpoint to those that will be processed when Serve() is called.
func Add(prefix, path string, methods, queries []string, endPtFn RouteFunc) error {
	k, e := routesKey(prefix, path, methods, queries)
	if e != nil {
		return e
	}
	routes[k] = endPtFn
	return nil
}

// Remove an endpoint.
func Remove(prefix, path string, methods, queries []string) error {
	k, e := routesKey(prefix, path, methods, queries)
	if e != nil {
		return e
	}
	delete(routes, k)
	return nil
}

type routeSortItem struct {
	def routeDef
	fun RouteFunc
	ord int
}

type routeSorter []routeSortItem

func (s routeSorter) Len() int      { return len(s) }
func (s routeSorter) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s routeSorter) Less(i, j int) bool {
	if s[i].def.Prefix == s[j].def.Prefix && s[i].def.Path == s[j].def.Path {
		return len(s[i].def.Queries) > len(s[j].def.Queries)
	}
	return s[i].ord < s[j].ord
}

func buildRoutes(prefix string) *mux.Router {
	var rs routeSorter
	for k, v := range routes {
		var rd routeDef
		if err := json.Unmarshal([]byte(k), &rd); err != nil {
			log.Error("buildRoutes json.Unmarshal", err)
		} else {
			if rd.Prefix == prefix {
				order := strings.Index(rd.Path, "{")
				if order == -1 {
					order = len(rd.Path)
				}
				order = -order
				rs = append(rs, routeSortItem{def: rd, fun: v, ord: order})
			}
		}
	}
	sort.Sort(rs)
	router := mux.NewRouter()
	for _, it := range rs {
		//fmt.Printf("DEBUG buildRoutes: %d %#v\n", it.ord, it.def)

		x := router.HandleFunc(it.def.Prefix+it.def.Path, it.fun)
		if len(it.def.Methods) > 0 {
			y := x.Methods(it.def.Methods...)
			if len(it.def.Queries) > 0 {
				y.Queries(it.def.Queries...)
			}
		}
	}
	return router
}

func init() {

	// **** add Unsecure Routes

	log.IfErr(Add(RoutePrefixPublic, "meta", []string{"GET", "OPTIONS"}, nil, GetMeta))
	log.IfErr(Add(RoutePrefixPublic, "authenticate", []string{"POST", "OPTIONS"}, nil, Authenticate))
	log.IfErr(Add(RoutePrefixPublic, "validate", []string{"GET", "OPTIONS"}, nil, ValidateAuthToken))
	log.IfErr(Add(RoutePrefixPublic, "forgot", []string{"POST", "OPTIONS"}, nil, ForgotUserPassword))
	log.IfErr(Add(RoutePrefixPublic, "reset/{token}", []string{"POST", "OPTIONS"}, nil, ResetUserPassword))
	log.IfErr(Add(RoutePrefixPublic, "share/{folderID}", []string{"POST", "OPTIONS"}, nil, AcceptSharedFolder))
	log.IfErr(Add(RoutePrefixPublic, "attachments/{orgID}/{attachmentID}", []string{"GET", "OPTIONS"}, nil, AttachmentDownload))
	log.IfErr(Add(RoutePrefixPublic, "version", []string{"GET", "OPTIONS"}, nil, version))

	// **** add secure routes

	// Import & Convert Document
	log.IfErr(Add(RoutePrefixPrivate, "import/folder/{folderID}", []string{"POST", "OPTIONS"}, nil, UploadConvertDocument))

	// Document
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/export", []string{"GET", "OPTIONS"}, nil, GetDocumentAsDocx))
	log.IfErr(Add(RoutePrefixPrivate, "documents", []string{"GET", "OPTIONS"}, []string{"filter", "tag"}, GetDocumentsByTag))
	log.IfErr(Add(RoutePrefixPrivate, "documents", []string{"GET", "OPTIONS"}, nil, GetDocumentsByFolder))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}", []string{"GET", "OPTIONS"}, nil, GetDocument))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}", []string{"PUT", "OPTIONS"}, nil, UpdateDocument))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}", []string{"DELETE", "OPTIONS"}, nil, DeleteDocument))

	// Document Meta
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/meta", []string{"GET", "OPTIONS"}, nil, GetDocumentMeta))

	// Document Page
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/pages/level", []string{"POST", "OPTIONS"}, nil, ChangeDocumentPageLevel))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/pages/sequence", []string{"POST", "OPTIONS"}, nil, ChangeDocumentPageSequence))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/pages/batch", []string{"POST", "OPTIONS"}, nil, GetDocumentPagesBatch))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}/revisions", []string{"GET", "OPTIONS"}, nil, GetDocumentPageRevisions))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}/revisions/{revisionID}", []string{"GET", "OPTIONS"}, nil, GetDocumentPageDiff))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}/revisions/{revisionID}", []string{"POST", "OPTIONS"}, nil, RollbackDocumentPage))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/revisions", []string{"GET", "OPTIONS"}, nil, GetDocumentRevisions))

	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/pages", []string{"GET", "OPTIONS"}, nil, GetDocumentPages))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}", []string{"PUT", "OPTIONS"}, nil, UpdateDocumentPage))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}", []string{"DELETE", "OPTIONS"}, nil, DeleteDocumentPage))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/pages", []string{"DELETE", "OPTIONS"}, nil, DeleteDocumentPages))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}", []string{"GET", "OPTIONS"}, nil, GetDocumentPage))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/pages", []string{"POST", "OPTIONS"}, nil, AddDocumentPage))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/attachments", []string{"GET", "OPTIONS"}, nil, GetAttachments))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/attachments/{attachmentID}", []string{"DELETE", "OPTIONS"}, nil, DeleteAttachment))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/attachments", []string{"POST", "OPTIONS"}, nil, AddAttachments))

	// Document Page Meta
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/pages/{pageID}/meta", []string{"GET", "OPTIONS"}, nil, GetDocumentPageMeta))

	// Organization
	log.IfErr(Add(RoutePrefixPrivate, "organizations/{orgID}", []string{"GET", "OPTIONS"}, nil, GetOrganization))
	log.IfErr(Add(RoutePrefixPrivate, "organizations/{orgID}", []string{"PUT", "OPTIONS"}, nil, UpdateOrganization))

	// Folder
	log.IfErr(Add(RoutePrefixPrivate, "folders/{folderID}/move/{moveToId}", []string{"DELETE", "OPTIONS"}, nil, RemoveFolder))
	log.IfErr(Add(RoutePrefixPrivate, "folders/{folderID}/permissions", []string{"PUT", "OPTIONS"}, nil, SetFolderPermissions))
	log.IfErr(Add(RoutePrefixPrivate, "folders/{folderID}/permissions", []string{"GET", "OPTIONS"}, nil, GetFolderPermissions))
	log.IfErr(Add(RoutePrefixPrivate, "folders/{folderID}/invitation", []string{"POST", "OPTIONS"}, nil, InviteToFolder))
	log.IfErr(Add(RoutePrefixPrivate, "folders", []string{"GET", "OPTIONS"}, []string{"filter", "viewers"}, GetFolderVisibility))
	log.IfErr(Add(RoutePrefixPrivate, "folders", []string{"POST", "OPTIONS"}, nil, AddFolder))
	log.IfErr(Add(RoutePrefixPrivate, "folders", []string{"GET", "OPTIONS"}, nil, GetFolders))
	log.IfErr(Add(RoutePrefixPrivate, "folders/{folderID}", []string{"GET", "OPTIONS"}, nil, GetFolder))
	log.IfErr(Add(RoutePrefixPrivate, "folders/{folderID}", []string{"PUT", "OPTIONS"}, nil, UpdateFolder))

	// Users
	log.IfErr(Add(RoutePrefixPrivate, "users/{userID}/password", []string{"POST", "OPTIONS"}, nil, ChangeUserPassword))
	log.IfErr(Add(RoutePrefixPrivate, "users/{userID}/permissions", []string{"GET", "OPTIONS"}, nil, GetUserFolderPermissions))
	log.IfErr(Add(RoutePrefixPrivate, "users", []string{"POST", "OPTIONS"}, nil, AddUser))
	log.IfErr(Add(RoutePrefixPrivate, "users/folder/{folderID}", []string{"GET", "OPTIONS"}, nil, GetFolderUsers))
	log.IfErr(Add(RoutePrefixPrivate, "users", []string{"GET", "OPTIONS"}, nil, GetOrganizationUsers))
	log.IfErr(Add(RoutePrefixPrivate, "users/{userID}", []string{"GET", "OPTIONS"}, nil, GetUser))
	log.IfErr(Add(RoutePrefixPrivate, "users/{userID}", []string{"PUT", "OPTIONS"}, nil, UpdateUser))
	log.IfErr(Add(RoutePrefixPrivate, "users/{userID}", []string{"DELETE", "OPTIONS"}, nil, DeleteUser))

	// Search
	log.IfErr(Add(RoutePrefixPrivate, "search", []string{"GET", "OPTIONS"}, nil, SearchDocuments))

	// Templates
	log.IfErr(Add(RoutePrefixPrivate, "templates", []string{"POST", "OPTIONS"}, nil, SaveAsTemplate))
	log.IfErr(Add(RoutePrefixPrivate, "templates", []string{"GET", "OPTIONS"}, nil, GetSavedTemplates))
	log.IfErr(Add(RoutePrefixPrivate, "templates/stock", []string{"GET", "OPTIONS"}, nil, GetStockTemplates))
	log.IfErr(Add(RoutePrefixPrivate, "templates/{templateID}/folder/{folderID}", []string{"POST", "OPTIONS"}, []string{"type", "stock"}, StartDocumentFromStockTemplate))
	log.IfErr(Add(RoutePrefixPrivate, "templates/{templateID}/folder/{folderID}", []string{"POST", "OPTIONS"}, []string{"type", "saved"}, StartDocumentFromSavedTemplate))

	// Sections
	log.IfErr(Add(RoutePrefixPrivate, "sections", []string{"GET", "OPTIONS"}, nil, GetSections))
	log.IfErr(Add(RoutePrefixPrivate, "sections", []string{"POST", "OPTIONS"}, nil, RunSectionCommand))
	log.IfErr(Add(RoutePrefixPrivate, "sections/refresh", []string{"GET", "OPTIONS"}, nil, RefreshSections))
	log.IfErr(Add(RoutePrefixPrivate, "sections/blocks/space/{folderID}", []string{"GET", "OPTIONS"}, nil, GetBlocksForSpace))
	log.IfErr(Add(RoutePrefixPrivate, "sections/blocks/{blockID}", []string{"GET", "OPTIONS"}, nil, GetBlock))
	log.IfErr(Add(RoutePrefixPrivate, "sections/blocks/{blockID}", []string{"PUT", "OPTIONS"}, nil, UpdateBlock))
	log.IfErr(Add(RoutePrefixPrivate, "sections/blocks", []string{"POST", "OPTIONS"}, nil, AddBlock))

	// Links
	log.IfErr(Add(RoutePrefixPrivate, "links/{folderID}/{documentID}/{pageID}", []string{"GET", "OPTIONS"}, nil, GetLinkCandidates))
	log.IfErr(Add(RoutePrefixPrivate, "links", []string{"GET", "OPTIONS"}, nil, SearchLinkCandidates))
	log.IfErr(Add(RoutePrefixPrivate, "documents/{documentID}/links", []string{"GET", "OPTIONS"}, nil, GetDocumentLinks))

	// Global installation-wide config
	log.IfErr(Add(RoutePrefixPrivate, "global", []string{"GET", "OPTIONS"}, nil, GetGlobalConfig))
	log.IfErr(Add(RoutePrefixPrivate, "global", []string{"PUT", "OPTIONS"}, nil, SaveGlobalConfig))

	// Pinned items
	log.IfErr(Add(RoutePrefixPrivate, "pin/{userID}", []string{"POST", "OPTIONS"}, nil, AddPin))
	log.IfErr(Add(RoutePrefixPrivate, "pin/{userID}", []string{"GET", "OPTIONS"}, nil, GetUserPins))
	log.IfErr(Add(RoutePrefixPrivate, "pin/{userID}/sequence", []string{"POST", "OPTIONS"}, nil, UpdatePinSequence))
	log.IfErr(Add(RoutePrefixPrivate, "pin/{userID}/{pinID}", []string{"DELETE", "OPTIONS"}, nil, DeleteUserPin))

	// Single page app handler
	log.IfErr(Add(RoutePrefixRoot, "robots.txt", []string{"GET", "OPTIONS"}, nil, GetRobots))
	log.IfErr(Add(RoutePrefixRoot, "sitemap.xml", []string{"GET", "OPTIONS"}, nil, GetSitemap))
	log.IfErr(Add(RoutePrefixRoot, "{rest:.*}", nil, nil, web.EmberHandler))
}
