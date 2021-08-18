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
	"fmt"
	"html/template"

	"github.com/documize/community/core/asset"
	"github.com/documize/community/core/env"
	"github.com/documize/community/core/mail"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/setting"
	ds "github.com/documize/community/domain/smtp"
	"github.com/documize/community/domain/store"
	"github.com/pkg/errors"
)

// Mailer provides emailing facilities
type Mailer struct {
	Runtime *env.Runtime
	Store   *store.Store
	Context domain.RequestContext
	Config  ds.Config
	Dialer  *mail.Dialer
}

// Initialize prepares mailer instance for action.
func (m *Mailer) Initialize() {
	m.Config = setting.GetSMTPConfig(m.Store)
	m.Dialer, _ = ds.Connect(m.Config)
}

// ParseTemplate produces email template.
func (m *Mailer) ParseTemplate(filename string, params interface{}) (html string, err error) {
	html = ""

	content, _, err := asset.FetchStatic(m.Runtime.Assets, filename)
	if err != nil {
		err = errors.Wrap(err, fmt.Sprintf("missing %s", filename))
		m.Runtime.Log.Error("failed to load mail template", err)
		return
	}

	buffer := new(bytes.Buffer)
	t := template.Must(template.New("emailTemplate").Parse(content))
	t.Execute(buffer, &params)

	html = buffer.String()

	return
}
