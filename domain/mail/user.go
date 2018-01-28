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

	"github.com/documize/community/server/web"
)

// InviteNewUser invites someone new providing credentials, explaining the product and stating who is inviting them.
func (m *Mailer) InviteNewUser(recipient, inviter, url, username, password string) {
	method := "InviteNewUser"
	m.LoadCredentials()

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
	e.From = m.Credentials.SMTPsender
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
	m.LoadCredentials()

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
	e.From = m.Credentials.SMTPsender
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
	m.LoadCredentials()

	file, err := web.ReadFile("mail/password-reset.html")
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to load email template", method), err)
		return
	}

	emailTemplate := string(file)

	subject := "Documize password reset request"

	e := NewEmail()
	e.From = m.Credentials.SMTPsender //e.g. "Documize <hello@documize.com>"
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
