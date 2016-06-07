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

package section

import (
	"fmt"

	"github.com/documize/community/documize/section/asana"
	"github.com/documize/community/documize/section/code"
	"github.com/documize/community/documize/section/docusign"
	"github.com/documize/community/documize/section/gemini"
	"github.com/documize/community/documize/section/github"
	"github.com/documize/community/documize/section/intercom"
	"github.com/documize/community/documize/section/mailchimp"
	"github.com/documize/community/documize/section/markdown"
	"github.com/documize/community/documize/section/provider"
	"github.com/documize/community/documize/section/salesforce"
	"github.com/documize/community/documize/section/stripe"
	"github.com/documize/community/documize/section/table"
	"github.com/documize/community/documize/section/trello"
	"github.com/documize/community/documize/section/wysiwyg"
	"github.com/documize/community/documize/section/zendesk"
	"github.com/documize/community/wordsmith/log"
)

// Register sections
func Register() {
	provider.Register("asana", &asana.Provider{})
	provider.Register("code", &code.Provider{})
	provider.Register("docusign", &docusign.Provider{})
	provider.Register("gemini", &gemini.Provider{})
	provider.Register("github", &github.Provider{})
	provider.Register("intercom", &intercom.Provider{})
	provider.Register("mailchimp", &mailchimp.Provider{})
	provider.Register("markdown", &markdown.Provider{})
	provider.Register("salesforce", &salesforce.Provider{})
	provider.Register("stripe", &stripe.Provider{})
	provider.Register("table", &table.Provider{})
	provider.Register("trello", &trello.Provider{})
	provider.Register("wysiwyg", &wysiwyg.Provider{})
	provider.Register("zendesk", &zendesk.Provider{})

	p := provider.List()
	log.Info(fmt.Sprintf("Documize registered %d smart sections", len(p)))
}
