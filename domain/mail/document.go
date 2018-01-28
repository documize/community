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

// DocumentApprover notifies user who has just been granted document approval rights.
func (m *Mailer) DocumentApprover(recipient, inviter, url, document string) {
	method := "DocumentApprover"
	m.LoadCredentials()

	file, err := web.ReadFile("mail/document-approver.html")
	if err != nil {
		m.Runtime.Log.Error(fmt.Sprintf("%s - unable to load email template", method), err)
		return
	}

	emailTemplate := string(file)

	// check inviter name
	if inviter == "Hello You" || len(inviter) == 0 {
		inviter = "Your colleague"
	}

	subject := fmt.Sprintf("%s has granted you document approval", inviter)

	e := NewEmail()
	e.From = m.Credentials.SMTPsender
	e.To = []string{recipient}
	e.Subject = subject

	parameters := struct {
		Subject  string
		Inviter  string
		Url      string
		Document string
	}{
		subject,
		inviter,
		url,
		document,
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
