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
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/codegangsta/negroni"
	"github.com/documize/community/documize/api/plugins"
	"github.com/documize/community/documize/database"
	"github.com/documize/community/documize/web"
	"github.com/documize/community/wordsmith/environment"
	"github.com/documize/community/wordsmith/log"
	"github.com/gorilla/mux"
)

const (
	// AppVersion does what it says
	// Versioning scheme major.minor where "minor" is optional
	// e.g. 1, 2, 3, 4.1, 4.2, 5, 6, 7, 7.1, 8, 9, 10, ..... 127, 127.1, 128
	AppVersion = "12.2"
)

var port, certFile, keyFile, forcePort2SSL string

func init() {
	environment.GetString(&certFile, "cert", false, "the cert.pem file used for https", nil)
	environment.GetString(&keyFile, "key", false, "the key.pem file used for https", nil)
	environment.GetString(&port, "port", false, "http/https port number", nil)
	environment.GetString(&forcePort2SSL, "forcesslport", false, "redirect given http port number to TLS", nil)
}

var testHost string // used during automated testing

// Serve the Documize endpoint.
func Serve(ready chan struct{}) {
	err := plugins.LibSetup()

	if err != nil {
		log.Error("Terminating before running - invalid plugin.json", err)
		os.Exit(1)
	}

	log.Info(fmt.Sprintf("Documize version %s", AppVersion))

	router := mux.NewRouter()

	router.PathPrefix("/api/public/").Handler(negroni.New(
		negroni.HandlerFunc(cors),
		negroni.Wrap(buildUnsecureRoutes()),
	))

	router.PathPrefix("/api").Handler(negroni.New(
		negroni.HandlerFunc(Authorize),
		negroni.Wrap(buildSecureRoutes()),
	))

	router.PathPrefix("/").Handler(negroni.New(
		negroni.HandlerFunc(cors),
		negroni.Wrap(AppRouter()),
	))

	n := negroni.New()
	n.Use(negroni.NewStatic(web.StaticAssetsFileSystem()))
	n.Use(negroni.HandlerFunc(cors))
	n.Use(negroni.HandlerFunc(metrics))
	n.UseHandler(router)
	ready <- struct{}{}

	if certFile == "" && keyFile == "" {
		if port == "" {
			port = "80"
		}

		log.Info("Starting non-SSL server on " + port)

		n.Run(testHost + ":" + port)
	} else {
		if port == "" {
			port = "443"
		}

		if forcePort2SSL != "" {
			log.Info("Starting non-SSL server on " + forcePort2SSL + " and redirecting to SSL server on  " + port)

			go func() {
				err := http.ListenAndServe(":"+forcePort2SSL, http.HandlerFunc(
					func(w http.ResponseWriter, req *http.Request) {
						var host = strings.Replace(req.Host, forcePort2SSL, port, 1) + req.RequestURI
						http.Redirect(w, req, "https://"+host, http.StatusMovedPermanently)
					}))
				if err != nil {
					log.Error("ListenAndServe on "+forcePort2SSL, err)
				}
			}()
		}

		log.Info("Starting SSL server on " + port + " with " + certFile + " " + keyFile)

		server := &http.Server{Addr: ":" + port, Handler: n}
		server.SetKeepAlivesEnabled(true)
		if err := server.ListenAndServeTLS(certFile, keyFile); err != nil {
			log.Error("ListenAndServeTLS on "+port, err)
		}
	}
}

func buildUnsecureRoutes() *mux.Router {
	router := mux.NewRouter()

	router.HandleFunc("/api/public/meta", GetMeta).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/public/authenticate", Authenticate).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/public/validate", ValidateAuthToken).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/public/forgot", ForgotUserPassword).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/public/reset/{token}", ResetUserPassword).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/public/share/{folderID}", AcceptSharedFolder).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/public/attachments/{orgID}/{job}/{fileID}", AttachmentDownload).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/public/version", version).Methods("GET", "OPTIONS")

	return router
}

func buildSecureRoutes() *mux.Router {
	router := mux.NewRouter()

	// Import & Convert Document
	router.HandleFunc("/api/import/folder/{folderID}", UploadConvertDocument).Methods("POST", "OPTIONS")

	// Document
	router.HandleFunc("/api/documents/{documentID}/export", GetDocumentAsDocx).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/documents", GetDocumentsByTag).Methods("GET", "OPTIONS").Queries("filter", "tag")
	router.HandleFunc("/api/documents", GetDocumentsByFolder).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/documents/{documentID}", GetDocument).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/documents/{documentID}", UpdateDocument).Methods("PUT", "OPTIONS")
	router.HandleFunc("/api/documents/{documentID}", DeleteDocument).Methods("DELETE", "OPTIONS")
	// Document Meta

	router.HandleFunc("/api/documents/{documentID}/meta", GetDocumentMeta).Methods("GET", "OPTIONS")

	// Document Page
	router.HandleFunc("/api/documents/{documentID}/pages/level", ChangeDocumentPageLevel).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/documents/{documentID}/pages/sequence", ChangeDocumentPageSequence).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/documents/{documentID}/pages/batch", GetDocumentPagesBatch).Methods("POST", "OPTIONS")
	// router.HandleFunc("/api/documents/{documentID}/pages/{pageID}/revisions", GetDocumentPageRevisions).Methods("GET", "OPTIONS")
	// router.HandleFunc("/api/documents/{documentID}/pages/{pageID}/revisions/{revisionID}", GetDocumentPageDiff).Methods("GET", "OPTIONS")
	// router.HandleFunc("/api/documents/{documentID}/pages/{pageID}/revisions/{revisionID}", RollbackDocumentPage).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/documents/{documentID}/pages", GetDocumentPages).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/documents/{documentID}/pages/{pageID}", UpdateDocumentPage).Methods("PUT", "OPTIONS")
	router.HandleFunc("/api/documents/{documentID}/pages/{pageID}", DeleteDocumentPage).Methods("DELETE", "OPTIONS")
	router.HandleFunc("/api/documents/{documentID}/pages/{pageID}", DeleteDocumentPages).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/documents/{documentID}/pages/{pageID}", GetDocumentPage).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/documents/{documentID}/pages", AddDocumentPage).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/documents/{documentID}/attachments", GetAttachments).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/documents/{documentID}/attachments/{attachmentID}", DeleteAttachment).Methods("DELETE", "OPTIONS")
	router.HandleFunc("/api/documents/{documentID}/attachments", AddAttachments).Methods("POST", "OPTIONS")

	// Document Meta
	router.HandleFunc("/api/documents/{documentID}/pages/{pageID}/meta", GetDocumentPageMeta).Methods("GET", "OPTIONS")

	// Organization
	router.HandleFunc("/api/organizations/{orgID}", GetOrganization).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/organizations/{orgID}", UpdateOrganization).Methods("PUT", "OPTIONS")

	// Folder
	router.HandleFunc("/api/folders/{folderID}/move/{moveToId}", RemoveFolder).Methods("DELETE", "OPTIONS")
	router.HandleFunc("/api/folders/{folderID}/permissions", SetFolderPermissions).Methods("PUT", "OPTIONS")
	router.HandleFunc("/api/folders/{folderID}/permissions", GetFolderPermissions).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/folders/{folderID}/invitation", InviteToFolder).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/folders", GetFolderVisibility).Methods("GET", "OPTIONS").Queries("filter", "viewers")
	router.HandleFunc("/api/folders", AddFolder).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/folders", GetFolders).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/folders/{folderID}", GetFolder).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/folders/{folderID}", UpdateFolder).Methods("PUT", "OPTIONS")

	// Users
	router.HandleFunc("/api/users/{userID}/password", ChangeUserPassword).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/users/{userID}/permissions", GetUserFolderPermissions).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/users", AddUser).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/users/folder/{folderID}", GetFolderUsers).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/users", GetOrganizationUsers).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/users/{userID}", GetUser).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/users/{userID}", UpdateUser).Methods("PUT", "OPTIONS")
	router.HandleFunc("/api/users/{userID}", DeleteUser).Methods("DELETE", "OPTIONS")

	// Search
	router.HandleFunc("/api/search", SearchDocuments).Methods("GET", "OPTIONS")

	// Templates
	router.HandleFunc("/api/templates", GetSavedTemplates).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/templates/stock", GetStockTemplates).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/templates/{templateID}/folder/{folderID}", StartDocumentFromStockTemplate).Methods("POST", "OPTIONS").Queries("type", "stock")
	router.HandleFunc("/api/templates/{templateID}/folder/{folderID}", StartDocumentFromSavedTemplate).Methods("POST", "OPTIONS").Queries("type", "saved")

	// Sections
	router.HandleFunc("/api/sections", GetSections).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/sections", RunSectionCommand).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/sections/refresh", RefreshSections).Methods("GET", "OPTIONS")

	return router
}

func cors(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS, PATCH")
	w.Header().Set("Access-Control-Allow-Headers", "host, content-type, accept, authorization, origin, referer, user-agent, cache-control, x-requested-with")
	w.Header().Set("Access-Control-Expose-Headers", "x-documize-version")

	if r.Method == "OPTIONS" {
		if _, err := w.Write([]byte("")); err != nil {
			log.Error("cors", err)
		}
		return
	}

	next(w, r)
}

func metrics(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	w.Header().Add("X-Documize-Version", AppVersion)
	w.Header().Add("Cache-Control", "no-cache")

	// if certFile != "" && keyFile != "" {
	// 	w.Header().Add("Strict-Transport-Security", "max-age=63072000; includeSubDomains")
	// }

	next(w, r)
}

func version(w http.ResponseWriter, r *http.Request) {
	if _, err := w.Write([]byte(AppVersion)); err != nil {
		log.Error("versionHandler", err)
	}
}

// AppRouter configures single page app handler.
func AppRouter() *mux.Router {

	router := mux.NewRouter()

	switch web.SiteMode {
	case web.SiteModeOffline:
		log.Info("Serving OFFLINE web app")
	case web.SiteModeSetup:
		log.Info("Serving SETUP web app")
		router.HandleFunc("/setup", database.Create).Methods("POST", "OPTIONS")
	case web.SiteModeBadDB:
		log.Info("Serving BAD DATABASE web app")
	default:
		log.Info("Starting web app")
	}

	router.HandleFunc("/robots.txt", GetRobots).Methods("GET", "OPTIONS")
	router.HandleFunc("/sitemap.xml", GetSitemap).Methods("GET", "OPTIONS")
	router.HandleFunc("/{rest:.*}", web.EmberHandler)

	return router
}
