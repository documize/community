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

package organization

import (
	"net/http"
	"strings"
)

// GetRequestSubdomain extracts subdomain from referring URL.
func GetRequestSubdomain(r *http.Request) string {
	return urlSubdomain(r.Referer())
}

// GetSubdomainFromHost extracts the subdomain from the requesting URL.
func GetSubdomainFromHost(r *http.Request) string {
	return urlSubdomain(r.Host)
}

func urlSubdomain(url string) string {
	url = strings.ToLower(url)
	url = strings.Replace(url, "https://", "", 1)
	url = strings.Replace(url, "http://", "", 1)

	parts := strings.Split(url, ".")

	if len(parts) >= 2 {
		url = parts[0]
	} else {
		url = ""
	}

	return url
}
