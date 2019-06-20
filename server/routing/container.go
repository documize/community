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
	"encoding/json"
	"net/http"
	"sort"
	"strings"

	"github.com/documize/community/core/env"
	"github.com/gorilla/mux"
)

const (
	// RoutePrefixPublic used for the unsecured api
	RoutePrefixPublic = "/api/public/"
	// RoutePrefixPrivate used for secured api (requiring api)
	RoutePrefixPrivate = "/api/"
	// RoutePrefixRoot used for unsecured endpoints at root (e.g. robots.txt)
	RoutePrefixRoot = "/"
	// RoutePrefixTesting used for isolated testing of routes with custom middleware
	RoutePrefixTesting = "/testing/"
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

func routesKey(rt *env.Runtime, prefix, path string, methods, queries []string) (string, error) {
	rd := routeDef{
		Prefix:  prefix,
		Path:    path,
		Methods: methods,
		Queries: queries,
	}
	b, e := json.Marshal(rd)

	if e != nil {
		rt.Log.Error("routesKey failed for "+path, e)
	}

	return string(b), e
}

// Add an endpoint to those that will be processed when Serve() is called.
func Add(rt *env.Runtime, prefix, path string, methods, queries []string, endPtFn RouteFunc) {
	k, e := routesKey(rt, prefix, path, methods, queries)
	if e != nil {
		rt.Log.Error("unable to add route", e)
		return
	}

	routes[k] = endPtFn
}

// AddPrivate endpoint
func AddPrivate(rt *env.Runtime, path string, methods, queries []string, endPtFn RouteFunc)  {
	Add(rt, RoutePrefixPrivate, path, methods, queries, endPtFn)
}

// AddPublic endpoint
func AddPublic(rt *env.Runtime, path string, methods, queries []string, endPtFn RouteFunc)  {
	Add(rt, RoutePrefixPublic, path, methods, queries, endPtFn)
}

// Remove an endpoint.
func Remove(rt *env.Runtime, prefix, path string, methods, queries []string) error {
	k, e := routesKey(rt, prefix, path, methods, queries)
	if e != nil {
		return e
	}
	delete(routes, k)
	return nil
}

// BuildRoutes returns all matching routes for specified scope.
func BuildRoutes(rt *env.Runtime, prefix string) *mux.Router {
	var rs routeSorter
	for k, v := range routes {
		var rd routeDef
		if err := json.Unmarshal([]byte(k), &rd); err != nil {
			rt.Log.Error("buildRoutes json.Unmarshal", err)
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
