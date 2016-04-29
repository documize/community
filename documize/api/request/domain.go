package request

import (
	"net/http"
	"strings"
)

// find the subdomain (which is actually the organisation )
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

	return CheckDomain(url)
}

// GetRequestSubdomain extracts subdomain from referring URL.
func GetRequestSubdomain(r *http.Request) string {
	return urlSubdomain(r.Referer())
}

// GetSubdomainFromHost extracts the subdomain from the requesting URL.
func GetSubdomainFromHost(r *http.Request) string {
	return urlSubdomain(r.Host)
}
