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
func (m *Mailer) ShareSpaceExistingUser(recipient, inviter, url, folder, intro string) {
	method := "ShareSpaceExistingUser"
	m.Initialize()

	// check inviter name
	if inviter == "Hello You" || len(inviter) == 0 {
		inviter = "Your colleague"
	}

	em := smtp.EmailMessage{}
	em.Subject = fmt.Sprintf("%s has shared %s with you", inviter, folder)
	em.ToEmail = recipient
	em.ToName = recipient

	parameters := struct {
		Subject string
		Inviter string
		URL     string
		Folder  string
		Intro   string
	}{
		em.Subject,
		inviter,
		url,
		folder,
		intro,
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
func (m *Mailer) ShareSpaceNewUser(recipient, inviter, url, space, invitationMessage string) {
	method := "ShareSpaceNewUser"
	m.Initialize()

	// check inviter name
	if inviter == "Hello You" || len(inviter) == 0 {
		inviter = "Your colleague"
	}

	em := smtp.EmailMessage{}
	em.Subject = fmt.Sprintf("%s has shared %s with you on Documize", inviter, space)
	em.ToEmail = recipient
	em.ToName = recipient

	parameters := struct {
		Subject    string
		Inviter    string
		URL        string
		Invitation string
		Folder     string
	}{
		em.Subject,
		inviter,
		url,
		invitationMessage,
		space,
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
