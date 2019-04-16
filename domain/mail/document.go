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
	"fmt"

	"github.com/documize/community/domain/smtp"
)

// DocumentApprover notifies user who has just been granted document approval rights.
func (m *Mailer) DocumentApprover(recipient, inviterName, inviterEmail, url, document string) {
	method := "DocumentApprover"
	m.Initialize()

	// check inviter name
	if inviterName == "Hello You" || len(inviterName) == 0 {
		inviterName = "Your colleague"
	}

	em := smtp.EmailMessage{}
	em.Subject = fmt.Sprintf("%s has granted you document approval", inviterName)
	em.ToEmail = recipient
	em.ToName = recipient
	em.ReplyTo = inviterEmail
	em.ReplyName = inviterName

	if IsBlockedEmailDomain(em.ToEmail) {
		return
	}

	parameters := struct {
		Subject     string
		Inviter     string
		URL         string
		Document    string
		SenderEmail string
	}{
		em.Subject,
		inviterName,
		url,
		document,
		m.Config.SenderEmail,
	}

	html, err := m.ParseTemplate("mail/document-approver.html", parameters)
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
		m.Runtime.Log.Info(fmt.Sprintf("%s unable to send email", method))
	}
}
