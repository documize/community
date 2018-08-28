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

// LDAPConfig connection information
type LDAPConfig struct {
	ServerHost                string `json:"serverHost"`
	ServerPort                int    `json:"serverPort"`
	EncryptionType            string `json:"encryptionType"`
	BaseDN                    string `json:"baseDN"`
	BindDN                    string `json:"bindDN"`
	BindPassword              string `json:"bindPassword"`
	GroupFilter               string `json:"groupFilter"`
	DisableLogout             bool   `json:"disableLogout"`
	DefaultPermissionAddSpace bool   `json:"defaultPermissionAddSpace"`
}

// LDAPUser details user record returned by LDAP
// type LDAPUser struct {
// 	ID        string `json:"id"`
// 	Username  string `json:"username"`
// 	Email     string `json:"email"`
// 	Firstname string `json:"firstName"`
// 	Lastname  string `json:"lastName"`
// 	Enabled   bool   `json:"enabled"`
// }

// LDAPAuthRequest data received via LDAP client library
// type LDAPAuthRequest struct {
// 	Domain    string `json:"domain"`
// 	Token     string `json:"token"`
// 	RemoteID  string `json:"remoteId"`
// 	Email     string `json:"email"`
// 	Username  string `json:"username"`
// 	Firstname string `json:"firstname"`
// 	Lastname  string `json:"lastname"`
// 	Enabled   bool   `json:"enabled"`
// }
