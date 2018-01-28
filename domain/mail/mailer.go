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

// jshint ignore:start

package mail

import (
	"net/smtp"
	"strings"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
)

// Mailer provides emailing facilities
type Mailer struct {
	Runtime     *env.Runtime
	Store       *domain.Store
	Context     domain.RequestContext
	Credentials Credentials
}

// Credentials holds SMTP endpoint and authentication methods
type Credentials struct {
	SMTPuserid   string
	SMTPpassword string
	SMTPhost     string
	SMTPport     string
	SMTPsender   string
}

// GetAuth to return SMTP authentication details
func (m *Mailer) GetAuth() smtp.Auth {
	a := smtp.PlainAuth("", m.Credentials.SMTPuserid, m.Credentials.SMTPpassword, m.Credentials.SMTPhost)
	return a
}

// GetHost to return SMTP host details
func (m *Mailer) GetHost() string {
	h := m.Credentials.SMTPhost + ":" + m.Credentials.SMTPport
	return h
}

// LoadCredentials loads up SMTP details from database
func (m *Mailer) LoadCredentials() {
	userID, _ := m.Store.Setting.Get("SMTP", "userid")
	m.Credentials.SMTPuserid = strings.TrimSpace(userID)

	pwd, _ := m.Store.Setting.Get("SMTP", "password")
	m.Credentials.SMTPpassword = strings.TrimSpace(pwd)

	host, _ := m.Store.Setting.Get("SMTP", "host")
	m.Credentials.SMTPhost = strings.TrimSpace(host)

	port, _ := m.Store.Setting.Get("SMTP", "port")
	m.Credentials.SMTPport = strings.TrimSpace(port)

	sender, _ := m.Store.Setting.Get("SMTP", "sender")
	m.Credentials.SMTPsender = strings.TrimSpace(sender)
}
