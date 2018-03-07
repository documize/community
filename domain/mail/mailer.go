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
	"bytes"
	"html/template"

	"github.com/documize/community/core/env"
	"github.com/documize/community/core/mail"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/setting"
	ds "github.com/documize/community/domain/smtp"
	"github.com/documize/community/server/web"
)

// Mailer provides emailing facilities
type Mailer struct {
	Runtime *env.Runtime
	Store   *domain.Store
	Context domain.RequestContext
	Config  ds.Config
	Dialer  *mail.Dialer
}

// Initialize prepares mailer instance for action.
func (m *Mailer) Initialize() {
	m.Config = setting.GetSMTPConfig(m.Store)
	m.Dialer, _ = ds.Connect(m.Config)
}

// Send prepares and sends email.
func (m *Mailer) Send(em ds.EmailMessage) (ok bool, err error) {
	ok, err = ds.SendMessage(m.Dialer, m.Config, em)
	return
}

// ParseTemplate produces email template.
func (m *Mailer) ParseTemplate(filename string, params interface{}) (html string, err error) {
	html = ""

	file, err := web.ReadFile(filename)
	if err != nil {
		return
	}

	emailTemplate := string(file)
	buffer := new(bytes.Buffer)

	t := template.Must(template.New("emailTemplate").Parse(emailTemplate))
	t.Execute(buffer, &params)

	html = buffer.String()

	return
}
