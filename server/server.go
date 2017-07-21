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
	"github.com/documize/community/core/api"
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
	routing.RegisterEndpoints(rt)

	err := plugins.LibSetup()
	if err != nil {
		rt.Log.Error("Terminating before running - invalid plugin.json", err)
		os.Exit(1)
	}

	rt.Log.Info(fmt.Sprintf("Starting %s version %s", api.Runtime.Product.Title, api.Runtime.Product.Version))

	switch api.Runtime.Flags.SiteMode {
	case web.SiteModeOffline:
		rt.Log.Info("Serving OFFLINE web server")
	case web.SiteModeSetup:
		routing.Add(rt, routing.RoutePrefixPrivate, "setup", []string{"POST", "OPTIONS"}, nil, database.Create)
		rt.Log.Info("Serving SETUP web server")
	case web.SiteModeBadDB:
		rt.Log.Info("Serving BAD DATABASE web server")
	default:
		rt.Log.Info("Starting web server")
	}

	router := mux.NewRouter()

	// "/api/public/..."
	router.PathPrefix(routing.RoutePrefixPublic).Handler(negroni.New(
		negroni.HandlerFunc(cors),
		negroni.Wrap(routing.BuildRoutes(rt, routing.RoutePrefixPublic)),
	))

	// "/api/..."
	router.PathPrefix(routing.RoutePrefixPrivate).Handler(negroni.New(
		negroni.HandlerFunc(endpoint.Authorize),
		negroni.Wrap(routing.BuildRoutes(rt, routing.RoutePrefixPrivate)),
	))

	// "/..."
	router.PathPrefix(routing.RoutePrefixRoot).Handler(negroni.New(
		negroni.HandlerFunc(cors),
		negroni.Wrap(routing.BuildRoutes(rt, routing.RoutePrefixRoot)),
	))

	n := negroni.New()
	n.Use(negroni.NewStatic(web.StaticAssetsFileSystem()))
	n.Use(negroni.HandlerFunc(cors))
	n.Use(negroni.HandlerFunc(metrics))
	n.UseHandler(router)

	if !api.Runtime.Flags.SSLEnabled() {
		rt.Log.Info("Starting non-SSL server on " + api.Runtime.Flags.HTTPPort)
		n.Run(testHost + ":" + api.Runtime.Flags.HTTPPort)
	} else {
		if api.Runtime.Flags.ForceHTTPPort2SSL != "" {
			rt.Log.Info("Starting non-SSL server on " + api.Runtime.Flags.ForceHTTPPort2SSL + " and redirecting to SSL server on  " + api.Runtime.Flags.HTTPPort)

			go func() {
				err := http.ListenAndServe(":"+api.Runtime.Flags.ForceHTTPPort2SSL, http.HandlerFunc(
					func(w http.ResponseWriter, req *http.Request) {
						w.Header().Set("Connection", "close")
						var host = strings.Replace(req.Host, api.Runtime.Flags.ForceHTTPPort2SSL, api.Runtime.Flags.HTTPPort, 1) + req.RequestURI
						http.Redirect(w, req, "https://"+host, http.StatusMovedPermanently)
					}))
				if err != nil {
					rt.Log.Error("ListenAndServe on "+api.Runtime.Flags.ForceHTTPPort2SSL, err)
				}
			}()
		}

		rt.Log.Info("Starting SSL server on " + api.Runtime.Flags.HTTPPort + " with " + api.Runtime.Flags.SSLCertFile + " " + api.Runtime.Flags.SSLKeyFile)

		// TODO: https://blog.gopheracademy.com/advent-2016/exposing-go-on-the-internet/

		server := &http.Server{Addr: ":" + api.Runtime.Flags.HTTPPort, Handler: n /*, TLSConfig: myTLSConfig*/}
		server.SetKeepAlivesEnabled(true)

		if err := server.ListenAndServeTLS(api.Runtime.Flags.SSLCertFile, api.Runtime.Flags.SSLKeyFile); err != nil {
			rt.Log.Error("ListenAndServeTLS on "+api.Runtime.Flags.HTTPPort, err)
		}
	}
}

func cors(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS, PATCH")
	w.Header().Set("Access-Control-Allow-Headers", "host, content-type, accept, authorization, origin, referer, user-agent, cache-control, x-requested-with")
	w.Header().Set("Access-Control-Expose-Headers", "x-documize-version, x-documize-status")

	if r.Method == "OPTIONS" {
		w.Header().Add("X-Documize-Version", api.Runtime.Product.Version)
		w.Header().Add("Cache-Control", "no-cache")

		w.Write([]byte(""))

		return
	}

	next(w, r)
}

func metrics(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	w.Header().Add("X-Documize-Version", api.Runtime.Product.Version)
	w.Header().Add("Cache-Control", "no-cache")

	// Prevent page from being displayed in an iframe
	w.Header().Add("X-Frame-Options", "DENY")

	next(w, r)
}
