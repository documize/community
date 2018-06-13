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

// ShareSpaceExistingUser provides an existing user with a link to a newly shared space.
func (m *Mailer) ShareSpaceExistingUser(recipient, inviterName, inviterEmail, url, folder, intro string) {
	method := "ShareSpaceExistingUser"
	m.Initialize()

	// check inviter name
	if inviterName == "Hello You" || len(inviterName) == 0 {
		inviterName = "Your colleague"
	}

	em := smtp.EmailMessage{}
	em.Subject = fmt.Sprintf("%s has shared %s with you", inviterName, folder)
	em.ToEmail = recipient
	em.ToName = recipient
	em.ReplyTo = inviterEmail
	em.ReplyName = inviterName

	parameters := struct {
		Subject     string
		Inviter     string
		URL         string
		Folder      string
		Intro       string
		SenderEmail string
	}{
		em.Subject,
		inviterName,
		url,
		folder,
		intro,
		m.Config.SenderEmail,
	}

	html, err := m.ParseTemplate("mail/share-space-existing-user.html", parameters)
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

// ShareSpaceNewUser invites new user providing Credentials, explaining the product and stating who is inviting them.
func (m *Mailer) ShareSpaceNewUser(recipient, inviterName, inviterEmail, url, space, invitationMessage string) {
	method := "ShareSpaceNewUser"
	m.Initialize()

	// check inviter name
	if inviterName == "Hello You" || len(inviterName) == 0 {
		inviterName = "Your colleague"
	}

	em := smtp.EmailMessage{}
	em.Subject = fmt.Sprintf("%s has shared %s with you on Documize", inviterName, space)
	em.ToEmail = recipient
	em.ToName = recipient
	em.ReplyTo = inviterEmail
	em.ReplyName = inviterName

	parameters := struct {
		Subject     string
		Inviter     string
		URL         string
		Invitation  string
		Folder      string
		SenderEmail string
	}{
		em.Subject,
		inviterName,
		url,
		invitationMessage,
		space,
		m.Config.SenderEmail,
	}

	html, err := m.ParseTemplate("mail/share-space-new-user.html", parameters)
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
