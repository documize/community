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

// Package setting manages both global and user level settings
package setting

import (
	"strconv"

	"github.com/documize/community/domain/smtp"
	"github.com/documize/community/domain/store"
)

// GetSMTPConfig returns SMTP configuration.
func GetSMTPConfig(s *store.Store) (c smtp.Config) {
	c = smtp.Config{}

	// server
	c.Host, _ = s.Setting.Get("SMTP", "host")
	port, _ := s.Setting.Get("SMTP", "port")
	c.Port, _ = strconv.Atoi(port)

	// credentials
	c.Username, _ = s.Setting.Get("SMTP", "userid")
	c.Password, _ = s.Setting.Get("SMTP", "password")

	// sender
	c.SenderEmail, _ = s.Setting.Get("SMTP", "sender")
	c.SenderName, _ = s.Setting.Get("SMTP", "senderName")
	if c.SenderName == "" {
		c.SenderName = "Documize Community"
	}

	// anon auth?
	anon, _ := s.Setting.Get("SMTP", "anonymous")
	c.AnonymousAuth, _ = strconv.ParseBool(anon)

	// base64 encode creds?
	b64, _ := s.Setting.Get("SMTP", "base64creds")
	c.Base64EncodeCredentials, _ = strconv.ParseBool(b64)

	// SSL?
	ssl, _ := s.Setting.Get("SMTP", "usessl")
	c.UseSSL, _ = strconv.ParseBool(ssl)

	// verify SSL?
	verifySSL, _ := s.Setting.Get("SMTP", "verifyssl")
	c.SkipSSLVerify, _ = strconv.ParseBool(verifySSL)
	c.SkipSSLVerify = true

	c.SenderFQDN, _ = s.Setting.Get("SMTP", "fqdn")

	return
}
