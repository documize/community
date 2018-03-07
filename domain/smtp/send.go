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

// Package smtp provides access to SMTP server for sending email.
package smtp

import (
	"crypto/tls"
	"encoding/base64"
	"strings"

	"github.com/documize/community/core/mail"
)

// Config is used to create SMTP server connection
type Config struct {
	// IP/hostname of SMTP server
	Host string

	// Port number of SMTP server
	Port int

	// Username for authentication with SMTP server
	Username string

	// Password for authentication with SMTP server
	Password string

	// SenderEmail is FROM address
	SenderEmail string

	// SenderName is FROM display name
	SenderName string

	// AnonymousAuth does not send username/password to server
	AnonymousAuth bool

	// Base64EncodeCredentials encodes User and Password as base64 before sending to SMTP server
	Base64EncodeCredentials bool

	// UseSSL uses SMTP SSL connection with SMTP server
	UseSSL bool

	// SkipSSLVerify allows unverified certificates
	SkipSSLVerify bool
}

// Connect returns open connection to server for sending email
func Connect(c Config) (d *mail.Dialer, err error) {
	// prepare credentials
	u := strings.TrimSpace(c.Username)
	p := strings.TrimSpace(c.Password)

	// anonymous, no credentials
	if c.AnonymousAuth {
		u = ""
		p = ""
	}

	// base64 encode if required
	if c.Base64EncodeCredentials {
		u = base64.StdEncoding.EncodeToString([]byte(u))
		p = base64.StdEncoding.EncodeToString([]byte(p))
	}

	// basic server
	d = mail.NewDialer(c.Host, c.Port, u, p)

	// use SSL
	d.SSL = c.UseSSL

	// verify SSL cert chain
	d.TLSConfig = &tls.Config{InsecureSkipVerify: c.SkipSSLVerify}

	// TLS mode
	d.StartTLSPolicy = mail.OpportunisticStartTLS

	return d, nil
}

// EmailMessage represents email to be sent.
type EmailMessage struct {
	ToEmail  string
	ToName   string
	Subject  string
	BodyHTML string
}

// SendMessage sends email using specified SMTP connection
func SendMessage(d *mail.Dialer, c Config, em EmailMessage) (b bool, err error) {
	m := mail.NewMessage()

	// participants
	m.SetHeader("From", m.FormatAddress(c.SenderEmail, c.SenderName))
	m.SetHeader("To", m.FormatAddress(em.ToEmail, em.ToName))

	// content
	m.SetHeader("Subject", em.Subject)
	m.SetBody("text/html", em.BodyHTML)

	// send email
	if err = d.DialAndSend(m); err != nil {
		return false, err
	}
	return true, nil
}
