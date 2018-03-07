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
func (m *Mailer) DocumentApprover(recipient, inviter, url, document string) {
	method := "DocumentApprover"
	m.Initialize()

	// check inviter name
	if inviter == "Hello You" || len(inviter) == 0 {
		inviter = "Your colleague"
	}

	em := smtp.EmailMessage{}
	em.Subject = fmt.Sprintf("%s has granted you document approval", inviter)
	em.ToEmail = recipient
	em.ToName = recipient

	parameters := struct {
		Subject  string
		Inviter  string
		URL      string
		Document string
	}{
		em.Subject,
		inviter,
		url,
		document,
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
		m.Runtime.Log.Info(fmt.Sprintf("%s unable to send email"))
	}
}
