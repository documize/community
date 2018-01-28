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

// ShareSpaceExistingUser provides an existing user with a link to a newly shared space.
func (m *Mailer) ShareSpaceExistingUser(recipient, inviter, url, folder, intro string) {
	method := "ShareSpaceExistingUser"
	m.LoadCredentials()

	file, err := web.ReadFile("mail/share-space-existing-user.html")
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
	e.From = m.Credentials.SMTPsender
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

// ShareSpaceNewUser invites new user providing Credentials, explaining the product and stating who is inviting them.
func (m *Mailer) ShareSpaceNewUser(recipient, inviter, url, space, invitationMessage string) {
	method := "ShareSpaceNewUser"
	m.LoadCredentials()

	file, err := web.ReadFile("mail/share-space-new-user.html")
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to load email template", method), err)
		return
	}

	emailTemplate := string(file)

	// check inviter name
	if inviter == "Hello You" || len(inviter) == 0 {
		inviter = "Your colleague"
	}

	subject := fmt.Sprintf("%s has shared %s with you on Documize", inviter, space)

	e := NewEmail()
	e.From = m.Credentials.SMTPsender
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
		space,
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
