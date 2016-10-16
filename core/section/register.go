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

	"github.com/documize/community/core/log"
	"github.com/documize/community/core/section/airtable"
	"github.com/documize/community/core/section/code"
	"github.com/documize/community/core/section/gemini"
	"github.com/documize/community/core/section/github"
	"github.com/documize/community/core/section/markdown"
	"github.com/documize/community/core/section/papertrail"
	"github.com/documize/community/core/section/provider"
	"github.com/documize/community/core/section/table"
	"github.com/documize/community/core/section/trello"
	"github.com/documize/community/core/section/wysiwyg"
)

// Register sections
func Register() {
	provider.Register("code", &code.Provider{})
	provider.Register("gemini", &gemini.Provider{})
	provider.Register("github", &github.Provider{})
	provider.Register("markdown", &markdown.Provider{})
	provider.Register("papertrail", &papertrail.Provider{})
	provider.Register("table", &table.Provider{})
	provider.Register("trello", &trello.Provider{})
	provider.Register("wysiwyg", &wysiwyg.Provider{})
	provider.Register("airtable", &airtable.Provider{})
	p := provider.List()
	log.Info(fmt.Sprintf("Documize registered %d smart sections", len(p)))
}
