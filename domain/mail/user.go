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

package mail

import (
	"fmt"

	"github.com/documize/community/domain/smtp"
)

// InviteNewUser invites someone new providing credentials, explaining the product and stating who is inviting them.
func (m *Mailer) InviteNewUser(recipient, inviterName, inviterEmail, url, username, password string) {
	method := "InviteNewUser"
	m.Initialize()

	// check inviter name
	if inviterName == "Hello You" || len(inviterName) == 0 {
		inviterName = "Your colleague"
	}

	em := smtp.EmailMessage{}
	em.Subject = fmt.Sprintf("%s has invited you to Documize", inviterName)
	em.ToEmail = recipient
	em.ToName = recipient
	em.ReplyTo = inviterEmail
	em.ReplyName = inviterName

	parameters := struct {
		Subject  string
		Inviter  string
		URL      string
		Username string
		Password string
	}{
		em.Subject,
		inviterName,
		url,
		recipient,
		password,
	}

	html, err := m.ParseTemplate("mail/invite-new-user.html", parameters)
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to load email template", method), err)
		return
	}
	em.BodyHTML = html

	ok, err := smtp.SendMessage(m.Dialer, m.Config, em)
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to send email", method), err)
	}
	if !ok {
		m.Runtime.Log.Info(fmt.Sprintf("%s unable to send email"))
	}
}

// InviteExistingUser invites a known user to an organization.
func (m *Mailer) InviteExistingUser(recipient, inviterName, inviterEmail, url string) {
	method := "InviteExistingUser"
	m.Initialize()

	// check inviter name
	if inviterName == "Hello You" || len(inviterName) == 0 {
		inviterName = "Your colleague"
	}

	em := smtp.EmailMessage{}
	em.Subject = fmt.Sprintf("%s has invited you to their Documize account", inviterName)
	em.ToEmail = recipient
	em.ToName = recipient
	em.ReplyTo = inviterEmail
	em.ReplyName = inviterName

	parameters := struct {
		Subject string
		Inviter string
		URL     string
	}{
		em.Subject,
		inviterName,
		url,
	}

	html, err := m.ParseTemplate("mail/invite-existing-user.html", parameters)
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to load email template", method), err)
		return
	}
	em.BodyHTML = html

	ok, err := smtp.SendMessage(m.Dialer, m.Config, em)
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to send email", method), err)
	}
	if !ok {
		m.Runtime.Log.Info(fmt.Sprintf("%s unable to send email"))
	}
}

// PasswordReset sends a reset email with an embedded token.
func (m *Mailer) PasswordReset(recipient, url string) {
	method := "PasswordReset"
	m.Initialize()

	em := smtp.EmailMessage{}
	em.Subject = "Documize password reset request"
	em.ToEmail = recipient
	em.ToName = recipient

	parameters := struct {
		Subject string
		URL     string
	}{
		em.Subject,
		url,
	}

	html, err := m.ParseTemplate("mail/password-reset.html", parameters)
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to load email template", method), err)
		return
	}
	em.BodyHTML = html

	ok, err := smtp.SendMessage(m.Dialer, m.Config, em)
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to send email", method), err)
	}
	if !ok {
		m.Runtime.Log.Info(fmt.Sprintf("%s unable to send email"))
	}
}
