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
	"github.com/documize/community/core"
	"github.com/documize/community/core/api/plugins"
	"github.com/documize/community/core/database"
	"github.com/documize/community/core/environment"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/web"
	"github.com/gorilla/mux"
)

var port, certFile, keyFile, forcePort2SSL string

// Product details app edition and version
var Product core.ProdInfo

func init() {
	Product.Major = "1"
	Product.Minor = "46"
	Product.Patch = "1"
	Product.Version = fmt.Sprintf("%s.%s.%s", Product.Major, Product.Minor, Product.Patch)
	Product.Edition = "Community"
	Product.Title = fmt.Sprintf("%s Edition", Product.Edition)
	Product.License = core.License{}
	Product.License.Valid = true

	environment.GetString(&certFile, "cert", false, "the cert.pem file used for https", nil)
	environment.GetString(&keyFile, "key", false, "the key.pem file used for https", nil)
	environment.GetString(&port, "port", false, "http/https port number", nil)
	environment.GetString(&forcePort2SSL, "forcesslport", false, "redirect given http port number to TLS", nil)

	log.Info("Server.Init complete")
}

var testHost string // used during automated testing

// Serve the Documize endpoint.
func Serve(ready chan struct{}) {
	err := plugins.LibSetup()

	if err != nil {
		log.Error("Terminating before running - invalid plugin.json", err)
		os.Exit(1)
	}

	log.Info(fmt.Sprintf("Starting %s version %s", Product.Title, Product.Version))

	switch web.SiteMode {
	case web.SiteModeOffline:
		log.Info("Serving OFFLINE web app")
	case web.SiteModeSetup:
		Add(RoutePrefixPrivate, "setup", []string{"POST", "OPTIONS"}, nil, database.Create)
		log.Info("Serving SETUP web app")
	case web.SiteModeBadDB:
		log.Info("Serving BAD DATABASE web app")
	default:
		log.Info("Starting web app")
	}

	router := mux.NewRouter()

	// "/api/public/..."
	router.PathPrefix(RoutePrefixPublic).Handler(negroni.New(
		negroni.HandlerFunc(cors),
		negroni.Wrap(buildRoutes(RoutePrefixPublic)),
	))

	// "/api/..."
	router.PathPrefix(RoutePrefixPrivate).Handler(negroni.New(
		negroni.HandlerFunc(Authorize),
		negroni.Wrap(buildRoutes(RoutePrefixPrivate)),
	))

	// "/..."
	router.PathPrefix(RoutePrefixRoot).Handler(negroni.New(
		negroni.HandlerFunc(cors),
		negroni.Wrap(buildRoutes(RoutePrefixRoot)),
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

		// TODO: https://blog.gopheracademy.com/advent-2016/exposing-go-on-the-internet/

		server := &http.Server{Addr: ":" + port, Handler: n /*, TLSConfig: myTLSConfig*/}
		server.SetKeepAlivesEnabled(true)
		if err := server.ListenAndServeTLS(certFile, keyFile); err != nil {
			log.Error("ListenAndServeTLS on "+port, err)
		}
	}
}

func cors(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS, PATCH")
	w.Header().Set("Access-Control-Allow-Headers", "host, content-type, accept, authorization, origin, referer, user-agent, cache-control, x-requested-with")
	w.Header().Set("Access-Control-Expose-Headers", "x-documize-version, x-documize-status")

	if r.Method == "OPTIONS" {
		w.Header().Add("X-Documize-Version", Product.Version)
		w.Header().Add("Cache-Control", "no-cache")

		if _, err := w.Write([]byte("")); err != nil {
			log.Error("cors", err)
		}
		return
	}

	next(w, r)
}

func metrics(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	w.Header().Add("X-Documize-Version", Product.Version)
	w.Header().Add("Cache-Control", "no-cache")
	// Prevent page from being displayed in an iframe
	w.Header().Add("X-Frame-Options", "DENY")

	// Force SSL delivery
	// if certFile != "" && keyFile != "" {
	// 	w.Header().Add("Strict-Transport-Security", "max-age=63072000; includeSubDomains")
	// }

	next(w, r)
}

func version(w http.ResponseWriter, r *http.Request) {
	if _, err := w.Write([]byte(Product.Version)); err != nil {
		log.Error("versionHandler", err)
	}
}
