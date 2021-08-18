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

package server

import (
	"crypto/tls"
	"fmt"
	"net/http"
	"strings"

	"github.com/codegangsta/negroni"
	"github.com/documize/community/core/api/plugins"
	"github.com/documize/community/core/asset"
	"github.com/documize/community/core/database"
	"github.com/documize/community/core/env"
	"github.com/documize/community/domain/store"
	"github.com/documize/community/server/routing"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

var testHost string // used during automated testing

// Start router to handle all HTTP traffic.
func Start(rt *env.Runtime, s *store.Store, ready chan struct{}) {
	// decide which mode to serve up
	switch rt.Flags.SiteMode {
	case env.SiteModeOffline:
		rt.Log.Info("Serving OFFLINE web server")
	case env.SiteModeSetup:
		rt.Log.Info("Serving SETUP web server")
		dbHandler := database.Handler{Runtime: rt, Store: s}
		routing.Add(rt, routing.RoutePrefixPrivate, "setup", []string{"POST", "OPTIONS"}, nil, dbHandler.Setup)
	case env.SiteModeBadDB:
		rt.Log.Info("Serving BAD DATABASE web server")
	default:
		err := plugins.Setup(s)
		if err != nil {
			rt.Log.Error("plugin setup failed", err)
		}
		rt.Log.Info("Web Server: starting up")
	}

	// define middleware
	cm := middleware{Runtime: rt, Store: s}

	// define API endpoints
	routing.RegisterEndpoints(rt, s)

	// wire up API endpoints
	router := mux.NewRouter()

	// "/api/public/..."
	router.PathPrefix(routing.RoutePrefixPublic).Handler(negroni.New(
		negroni.HandlerFunc(cm.cors),
		negroni.Wrap(routing.BuildRoutes(rt, routing.RoutePrefixPublic)),
	))

	// "/api/..."
	router.PathPrefix(routing.RoutePrefixPrivate).Handler(negroni.New(
		negroni.HandlerFunc(cm.Authorize),
		negroni.Wrap(routing.BuildRoutes(rt, routing.RoutePrefixPrivate)),
	))

	// "/..."
	router.PathPrefix(routing.RoutePrefixRoot).Handler(negroni.New(
		negroni.HandlerFunc(cm.cors),
		negroni.Wrap(routing.BuildRoutes(rt, routing.RoutePrefixRoot)),
	))

	// Look out for reverse proxy headers.
	router.Use(handlers.ProxyHeaders)

	n := negroni.New()

	sfs, err := asset.GetPublicFileSystem(rt.Assets)
	if err != nil {
		rt.Log.Error("!!!!!!!!!! Cannot load public file system", err)
	}
	n.Use(negroni.NewStatic(sfs))

	n.Use(negroni.HandlerFunc(cm.cors))
	n.UseHandler(router)

	// tell caller we are ready to serve HTTP
	ready <- struct{}{}

	// start server
	if !rt.Flags.SSLEnabled() {
		rt.Log.Info("Web Server: binding non-SSL server on " + rt.Flags.HTTPPort)
		if rt.Flags.SiteMode == env.SiteModeSetup {
			rt.Log.Info("***")
			rt.Log.Info(fmt.Sprintf("*** Go to http://localhost:%s/setup in your web browser and complete setup wizard ***", rt.Flags.HTTPPort))
			rt.Log.Info("***")
		}

		n.Run(testHost + ":" + rt.Flags.HTTPPort)
	} else {
		if rt.Flags.ForceHTTPPort2SSL != "" {
			rt.Log.Info("Web Server: binding non-SSL server on " + rt.Flags.ForceHTTPPort2SSL + " and redirecting to SSL server on " + rt.Flags.HTTPPort)

			go func() {
				err := http.ListenAndServe(":"+rt.Flags.ForceHTTPPort2SSL, http.HandlerFunc(
					func(w http.ResponseWriter, req *http.Request) {
						w.Header().Set("Connection", "close")
						var host = strings.Replace(req.Host, rt.Flags.ForceHTTPPort2SSL, rt.Flags.HTTPPort, 1) + req.RequestURI
						http.Redirect(w, req, "https://"+host, http.StatusMovedPermanently)
					}))
				if err != nil {
					rt.Log.Error("ListenAndServe on "+rt.Flags.ForceHTTPPort2SSL, err)
				}
			}()
		}

		if rt.Flags.SiteMode == env.SiteModeSetup {
			rt.Log.Info("***")
			rt.Log.Info(fmt.Sprintf("*** Go to https://localhost:%s/setup in your web browser and complete setup wizard ***", rt.Flags.HTTPPort))
			rt.Log.Info("***")
		}

		rt.Log.Info("Web Server: starting SSL server on " + rt.Flags.HTTPPort + " with " + rt.Flags.SSLCertFile + " " + rt.Flags.SSLKeyFile)

		cfg := &tls.Config{
			MinVersion: tls.VersionTLS12,
		}

		server := &http.Server{Addr: ":" + rt.Flags.HTTPPort, Handler: n, TLSConfig: cfg}
		server.SetKeepAlivesEnabled(true)

		if err := server.ListenAndServeTLS(rt.Flags.SSLCertFile, rt.Flags.SSLKeyFile); err != nil {
			rt.Log.Error("ListenAndServeTLS on "+rt.Flags.HTTPPort, err)
		}
	}
}
