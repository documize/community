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
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/server/web"
)

// Mailer provides emailing facilities
type Mailer struct {
	Runtime     *env.Runtime
	Store       *domain.Store
	Context     domain.RequestContext
	credentials credentials
}

// InviteNewUser invites someone new providing credentials, explaining the product and stating who is inviting them.
func (m *Mailer) InviteNewUser(recipient, inviter, url, username, password string) {
	method := "InviteNewUser"
	m.loadCredentials()

	file, err := web.ReadFile("mail/invite-new-user.html")
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to load email template", method), err)
		return
	}

	emailTemplate := string(file)

	// check inviter name
	if inviter == "Hello You" || len(inviter) == 0 {
		inviter = "Your colleague"
	}

	subject := fmt.Sprintf("%s has invited you to Documize", inviter)

	e := NewEmail()
	e.From = m.credentials.SMTPsender
	e.To = []string{recipient}
	e.Subject = subject

	parameters := struct {
		Subject  string
		Inviter  string
		Url      string
		Username string
		Password string
	}{
		subject,
		inviter,
		url,
		recipient,
		password,
	}

	buffer := new(bytes.Buffer)
	t := template.Must(template.New("emailTemplate").Parse(emailTemplate))
	t.Execute(buffer, &parameters)
	e.HTML = buffer.Bytes()

	err = e.Send(m.GetHost(), m.GetAuth())
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to send email", method), err)
	}
}

// InviteExistingUser invites a known user to an organization.
func (m *Mailer) InviteExistingUser(recipient, inviter, url string) {
	method := "InviteExistingUser"
	m.loadCredentials()

	file, err := web.ReadFile("mail/invite-existing-user.html")
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to load email template", method), err)
		return
	}

	emailTemplate := string(file)

	// check inviter name
	if inviter == "Hello You" || len(inviter) == 0 {
		inviter = "Your colleague"
	}

	subject := fmt.Sprintf("%s has invited you to their Documize account", inviter)

	e := NewEmail()
	e.From = m.credentials.SMTPsender
	e.To = []string{recipient}
	e.Subject = subject

	parameters := struct {
		Subject string
		Inviter string
		Url     string
	}{
		subject,
		inviter,
		url,
	}

	buffer := new(bytes.Buffer)
	t := template.Must(template.New("emailTemplate").Parse(emailTemplate))
	t.Execute(buffer, &parameters)
	e.HTML = buffer.Bytes()

	err = e.Send(m.GetHost(), m.GetAuth())
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to send email", method), err)
	}
}

// PasswordReset sends a reset email with an embedded token.
func (m *Mailer) PasswordReset(recipient, url string) {
	method := "PasswordReset"
	m.loadCredentials()

	file, err := web.ReadFile("mail/password-reset.html")
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to load email template", method), err)
		return
	}

	emailTemplate := string(file)

	subject := "Documize password reset request"

	e := NewEmail()
	e.From = m.credentials.SMTPsender //e.g. "Documize <hello@documize.com>"
	e.To = []string{recipient}
	e.Subject = subject

	parameters := struct {
		Subject string
		Url     string
	}{
		subject,
		url,
	}

	buffer := new(bytes.Buffer)
	t := template.Must(template.New("emailTemplate").Parse(emailTemplate))
	t.Execute(buffer, &parameters)
	e.HTML = buffer.Bytes()

	err = e.Send(m.GetHost(), m.GetAuth())
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to send email", method), err)
	}
}

// ShareFolderExistingUser provides an existing user with a link to a newly shared folder.
func (m *Mailer) ShareFolderExistingUser(recipient, inviter, url, folder, intro string) {
	method := "ShareFolderExistingUser"
	m.loadCredentials()

	file, err := web.ReadFile("mail/share-folder-existing-user.html")
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to load email template", method), err)
		return
	}

	emailTemplate := string(file)

	// check inviter name
	if inviter == "Hello You" || len(inviter) == 0 {
		inviter = "Your colleague"
	}

	subject := fmt.Sprintf("%s has shared %s with you", inviter, folder)

	e := NewEmail()
	e.From = m.credentials.SMTPsender
	e.To = []string{recipient}
	e.Subject = subject

	parameters := struct {
		Subject string
		Inviter string
		Url     string
		Folder  string
		Intro   string
	}{
		subject,
		inviter,
		url,
		folder,
		intro,
	}

	buffer := new(bytes.Buffer)
	t := template.Must(template.New("emailTemplate").Parse(emailTemplate))
	t.Execute(buffer, &parameters)
	e.HTML = buffer.Bytes()

	err = e.Send(m.GetHost(), m.GetAuth())
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to send email", method), err)
	}
}

// ShareFolderNewUser invites new user providing credentials, explaining the product and stating who is inviting them.
func (m *Mailer) ShareFolderNewUser(recipient, inviter, url, folder, invitationMessage string) {
	method := "ShareFolderNewUser"
	m.loadCredentials()

	file, err := web.ReadFile("mail/share-folder-new-user.html")
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to load email template", method), err)
		return
	}

	emailTemplate := string(file)

	// check inviter name
	if inviter == "Hello You" || len(inviter) == 0 {
		inviter = "Your colleague"
	}

	subject := fmt.Sprintf("%s has shared %s with you on Documize", inviter, folder)

	e := NewEmail()
	e.From = m.credentials.SMTPsender
	e.To = []string{recipient}
	e.Subject = subject

	parameters := struct {
		Subject    string
		Inviter    string
		Url        string
		Invitation string
		Folder     string
	}{
		subject,
		inviter,
		url,
		invitationMessage,
		folder,
	}

	buffer := new(bytes.Buffer)
	t := template.Must(template.New("emailTemplate").Parse(emailTemplate))
	t.Execute(buffer, &parameters)
	e.HTML = buffer.Bytes()

	err = e.Send(m.GetHost(), m.GetAuth())
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to send email", method), err)
	}
}

type credentials struct {
	SMTPuserid   string
	SMTPpassword string
	SMTPhost     string
	SMTPport     string
	SMTPsender   string
}

// GetAuth to return SMTP authentication details
func (m *Mailer) GetAuth() smtp.Auth {
	a := smtp.PlainAuth("", m.credentials.SMTPuserid, m.credentials.SMTPpassword, m.credentials.SMTPhost)
	return a
}

// GetHost to return SMTP host details
func (m *Mailer) GetHost() string {
	h := m.credentials.SMTPhost + ":" + m.credentials.SMTPport
	return h
}

func (m *Mailer) loadCredentials() {
	m.credentials.SMTPuserid = m.Store.Setting.Get("SMTP", "userid")
	m.credentials.SMTPpassword = m.Store.Setting.Get("SMTP", "password")
	m.credentials.SMTPhost = m.Store.Setting.Get("SMTP", "host")
	m.credentials.SMTPport = m.Store.Setting.Get("SMTP", "port")
	m.credentials.SMTPsender = m.Store.Setting.Get("SMTP", "sender")
}
