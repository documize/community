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

package ldap

import (
	"crypto/tls"
	"fmt"

	lm "github.com/documize/community/model/auth"
	"github.com/pkg/errors"
	ld "gopkg.in/ldap.v2"
)

// Connect establishes connection to LDAP server.
func Connect(c lm.LDAPConfig) (l *ld.Conn, err error) {
	address := fmt.Sprintf("%s:%d", c.ServerHost, c.ServerPort)

	fmt.Println("Connecting to LDAP server", address)

	l, err = ld.Dial("tcp", address)
	if err != nil {
		err = errors.Wrap(err, "unable to dial LDAP server")
		return
	}

	if c.EncryptionType == "starttls" {
		fmt.Println("Using StartTLS with LDAP server")
		err = l.StartTLS(&tls.Config{InsecureSkipVerify: true})
		if err != nil {
			err = errors.Wrap(err, "unable to startTLS with LDAP server")
			return
		}
	}

	return
}
