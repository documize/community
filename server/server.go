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
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/codegangsta/negroni"
	"github.com/documize/community/core/api/endpoint"
	"github.com/documize/community/core/api/plugins"
	"github.com/documize/community/core/database"
	"github.com/documize/community/core/env"
	"github.com/documize/community/server/routing"
	"github.com/documize/community/server/web"
	"github.com/gorilla/mux"
)

var testHost string // used during automated testing

// Start router to handle all HTTP traffic.
func Start(rt env.Runtime, ready chan struct{}) {

	err := plugins.LibSetup()
	if err != nil {
		rt.Log.Error("Terminating before running - invalid plugin.json", err)
		os.Exit(1)
	}

	rt.Log.Info(fmt.Sprintf("Starting %s version %s", rt.Product.Title, rt.Product.Version))

	// decide which mode to serve up
	switch rt.Flags.SiteMode {
	case env.SiteModeOffline:
		rt.Log.Info("Serving OFFLINE web server")
	case env.SiteModeSetup:
		routing.Add(rt, routing.RoutePrefixPrivate, "setup", []string{"POST", "OPTIONS"}, nil, database.Create)
		rt.Log.Info("Serving SETUP web server")
	case env.SiteModeBadDB:
		rt.Log.Info("Serving BAD DATABASE web server")
	default:
		rt.Log.Info("Starting web server")
	}

	// define middleware
	cm := middleware{Runtime: rt}

	// define API endpoints
	routing.RegisterEndpoints(rt)

	// wire up API endpoints
	router := mux.NewRouter()

	// "/api/public/..."
	router.PathPrefix(routing.RoutePrefixPublic).Handler(negroni.New(
		negroni.HandlerFunc(cm.cors),
		negroni.Wrap(routing.BuildRoutes(rt, routing.RoutePrefixPublic)),
	))

	// "/api/..."
	router.PathPrefix(routing.RoutePrefixPrivate).Handler(negroni.New(
		negroni.HandlerFunc(endpoint.Authorize),
		negroni.Wrap(routing.BuildRoutes(rt, routing.RoutePrefixPrivate)),
	))

	// "/..."
	router.PathPrefix(routing.RoutePrefixRoot).Handler(negroni.New(
		negroni.HandlerFunc(cm.cors),
		negroni.Wrap(routing.BuildRoutes(rt, routing.RoutePrefixRoot)),
	))

	n := negroni.New()
	n.Use(negroni.NewStatic(web.StaticAssetsFileSystem()))
	n.Use(negroni.HandlerFunc(cm.cors))
	n.Use(negroni.HandlerFunc(cm.metrics))
	n.UseHandler(router)

	// start server
	if !rt.Flags.SSLEnabled() {
		rt.Log.Info("Starting non-SSL server on " + rt.Flags.HTTPPort)
		n.Run(testHost + ":" + rt.Flags.HTTPPort)
	} else {
		if rt.Flags.ForceHTTPPort2SSL != "" {
			rt.Log.Info("Starting non-SSL server on " + rt.Flags.ForceHTTPPort2SSL + " and redirecting to SSL server on  " + rt.Flags.HTTPPort)

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

		rt.Log.Info("Starting SSL server on " + rt.Flags.HTTPPort + " with " + rt.Flags.SSLCertFile + " " + rt.Flags.SSLKeyFile)

		// TODO: https://blog.gopheracademy.com/advent-2016/exposing-go-on-the-internet/

		server := &http.Server{Addr: ":" + rt.Flags.HTTPPort, Handler: n /*, TLSConfig: myTLSConfig*/}
		server.SetKeepAlivesEnabled(true)

		if err := server.ListenAndServeTLS(rt.Flags.SSLCertFile, rt.Flags.SSLKeyFile); err != nil {
			rt.Log.Error("ListenAndServeTLS on "+rt.Flags.HTTPPort, err)
		}
	}
}
