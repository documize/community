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

package auth

// KeycloakAuthRequest data received via Keycloak client library
type KeycloakAuthRequest struct {
	Domain    string `json:"domain"`
	Token     string `json:"token"`
	RemoteID  string `json:"remoteId"`
	Email     string `json:"email"`
	Username  string `json:"username"`
	Firstname string `json:"firstname"`
	Lastname  string `json:"lastname"`
	Enabled   bool   `json:"enabled"`
}

// KeycloakConfig server configuration
type KeycloakConfig struct {
	URL                       string `json:"url"`
	Realm                     string `json:"realm"`
	ClientID                  string `json:"clientId"`
	PublicKey                 string `json:"publicKey"`
	AdminUser                 string `json:"adminUser"`
	AdminPassword             string `json:"adminPassword"`
	Group                     string `json:"group"`
	DisableLogout             bool   `json:"disableLogout"`
	DefaultPermissionAddSpace bool   `json:"defaultPermissionAddSpace"`
}

// KeycloakAPIAuth is returned when authenticating with Keycloak REST API.
type KeycloakAPIAuth struct {
	AccessToken string `json:"access_token"`
}

// KeycloakUser details user record returned by Keycloak
type KeycloakUser struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Firstname string `json:"firstName"`
	Lastname  string `json:"lastName"`
	Enabled   bool   `json:"enabled"`
}
