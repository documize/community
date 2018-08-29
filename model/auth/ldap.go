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

// LDAPConfig that specifies LDAP server connection details and query filters.
//
//
// Example for Active Directory -- filter users that belong to SomeGroupName:
//      (&(objectCategory=Person)(sAMAccountName=*)(memberOf=cn=SomeGroupName,ou=users,dc=example,dc=com))
//
// Example for Active Directory -- filter all users that belong to SomeGroupName:
//      (&(objectCategory=Person)(sAMAccountName=*)(memberOf:1.2.840.113556.1.4.1941:=cn=SomeGroupName,ou=users,dc=example,dc=com))
//
// Example for Active Directory -- filter all users that belong to MyGroup1, MyGroup2 or MyGroup3:
//      (&(objectCategory=Person)(sAMAccountName=*)(|(memberOf=cn=MyGroup1,ou=users,dc=example,dc=com)(memberOf=cn=MyGroup2,ou=users,dc=example,dc=com)(memberOf=cn=MyGroup3,ou=users,dc=example,dc=com)))
//
// Example of group filter that returns users belonging to either Developers or Administrators group:
//      (&(objectCategory=Group)(|(cn=developers)(cn=administrators)))
//
type LDAPConfig struct {
	ServerHost                string `json:"serverHost"`
	ServerPort                int    `json:"serverPort"`
	EncryptionType            string `json:"encryptionType"`
	BaseDN                    string `json:"baseDN"`
	BindDN                    string `json:"bindDN"`
	BindPassword              string `json:"bindPassword"`
	UserFilter                string `json:"userFilter"`
	GroupFilter               string `json:"groupFilter"`
	DisableLogout             bool   `json:"disableLogout"`
	DefaultPermissionAddSpace bool   `json:"defaultPermissionAddSpace"`
	AttributeUserRDN          string `json:"attributeUserRDN"`
	AttributeUserID           string `json:"attributeUserID"` // uid or sAMAccountName
	AttributeUserFirstname    string `json:"attributeUserFirstname"`
	AttributeUserLastname     string `json:"attributeUserLastname"`
	AttributeUserEmail        string `json:"attributeUserEmail"`
	AttributeUserDisplayName  string `json:"attributeUserDisplayName"`
	AttributeUserGroupName    string `json:"attributeUserGroupName"`
	AttributeGroupMember      string `json:"attributeGroupMember"`
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
