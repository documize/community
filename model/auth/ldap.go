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

import (
	"strings"
)

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
// Sources of filter names:
//      https://docs.oracle.com/cd/E26217_01/E26214/html/ldap-filters-attrs-users.html
//      https://social.technet.microsoft.com/wiki/contents/articles/5392.active-directory-ldap-syntax-filters.aspx

// LDAPConfig that specifies LDAP server connection details and query filters.
type LDAPConfig struct {
	ServerHost                string         `json:"serverHost"`
	ServerPort                int            `json:"serverPort"`
	ServerType                ServerType     `json:"serverType"`
	EncryptionType            EncryptionType `json:"encryptionType"`
	BaseDN                    string         `json:"baseDN"`
	BindDN                    string         `json:"bindDN"`
	BindPassword              string         `json:"bindPassword"`
	UserFilter                string         `json:"userFilter"`
	GroupFilter               string         `json:"groupFilter"`
	DisableLogout             bool           `json:"disableLogout"`
	DefaultPermissionAddSpace bool           `json:"defaultPermissionAddSpace"`
	AllowFormsAuth            bool           `json:"allowFormsAuth"`           // enable dual login via LDAP + email/password
	AttributeUserRDN          string         `json:"attributeUserRDN"`         // usually uid (LDAP) or sAMAccountName (AD)
	AttributeUserFirstname    string         `json:"attributeUserFirstname"`   // usually givenName
	AttributeUserLastname     string         `json:"attributeUserLastname"`    // usually sn
	AttributeUserEmail        string         `json:"attributeUserEmail"`       // usually mail
	AttributeUserDisplayName  string         `json:"attributeUserDisplayName"` // usually displayName
	AttributeUserGroupName    string         `json:"attributeUserGroupName"`   // usually memberOf
	AttributeGroupMember      string         `json:"attributeGroupMember"`     // usually member
}

// ServerType identifies the LDAP server type
type ServerType string

const (
	// ServerTypeLDAP represents a generic LDAP server OpenLDAP.
	ServerTypeLDAP = "ldap"
	// ServerTypeAD represents Microsoft Active Directory server.
	ServerTypeAD = "ad"
)

// EncryptionType determines encryption method for LDAP connection.EncryptionType
type EncryptionType string

const (
	// EncryptionTypeNone is none.
	EncryptionTypeNone = "none"

	// EncryptionTypeStartTLS is using start TLS.
	EncryptionTypeStartTLS = "starttls"
)

const (
	// MaxPageSize controls how many query results are
	// fetched at once from the LDAP server.
	// See https://answers.splunk.com/answers/1538/what-is-ldap-error-size-limit-exceeded.html
	MaxPageSize = 250
)

// Clean ensures configuration data is formatted correctly.
func (c *LDAPConfig) Clean() {
	c.BaseDN = strings.TrimSpace(c.BaseDN)
	c.BindDN = strings.TrimSpace(c.BindDN)
	c.BindPassword = strings.TrimSpace(c.BindPassword)
	c.ServerHost = strings.TrimSpace(c.ServerHost)
	c.UserFilter = strings.TrimSpace(c.UserFilter)
	c.GroupFilter = strings.TrimSpace(c.GroupFilter)

	if c.ServerPort == 0 {
		c.ServerPort = 389
	}
	if c.ServerType == "" {
		c.ServerType = ServerTypeLDAP
	}
	if c.EncryptionType == "" {
		c.EncryptionType = "none"
	}
	if c.EncryptionType != EncryptionTypeNone && c.EncryptionType != EncryptionTypeStartTLS {
		c.EncryptionType = EncryptionTypeNone
	}

	c.AttributeUserRDN = strings.TrimSpace(c.AttributeUserRDN)
	c.AttributeUserFirstname = strings.TrimSpace(c.AttributeUserFirstname)
	c.AttributeUserLastname = strings.TrimSpace(c.AttributeUserLastname)
	c.AttributeUserEmail = strings.TrimSpace(c.AttributeUserEmail)
	c.AttributeUserDisplayName = strings.TrimSpace(c.AttributeUserDisplayName)
	c.AttributeUserGroupName = strings.TrimSpace(c.AttributeUserGroupName)

	c.AttributeGroupMember = strings.TrimSpace(c.AttributeGroupMember)
}

// GetUserFilterAttributes gathers the fields that can be requested
// when executing a user-based object filter.
func (c *LDAPConfig) GetUserFilterAttributes() []string {
	a := []string{}

	// defaults
	a = append(a, "dn")
	a = append(a, "cn")

	if len(c.AttributeUserRDN) > 0 {
		a = append(a, c.AttributeUserRDN)
	}

	if len(c.AttributeUserFirstname) > 0 {
		a = append(a, c.AttributeUserFirstname)
	}

	if len(c.AttributeUserLastname) > 0 {
		a = append(a, c.AttributeUserLastname)
	}

	if len(c.AttributeUserEmail) > 0 {
		a = append(a, c.AttributeUserEmail)
	}

	if len(c.AttributeUserDisplayName) > 0 {
		a = append(a, c.AttributeUserDisplayName)
	}

	if len(c.AttributeUserGroupName) > 0 {
		a = append(a, c.AttributeUserGroupName)
	}

	return a
}

// GetGroupFilterAttributes gathers the fields that can be requested
// when executing a group-based object filter.
func (c *LDAPConfig) GetGroupFilterAttributes() []string {
	a := []string{}

	// defaults
	a = append(a, "dn")
	a = append(a, "cn")

	if len(c.AttributeGroupMember) > 0 {
		a = append(a, c.AttributeGroupMember)
	}

	return a
}

// LDAPUser details user record returned by LDAP
type LDAPUser struct {
	RemoteID  string `json:"remoteId"`
	CN        string `json:"cn"`
	Email     string `json:"email"`
	Firstname string `json:"firstName"`
	Lastname  string `json:"lastName"`
}
