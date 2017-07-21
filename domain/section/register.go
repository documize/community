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

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain/section/airtable"
	"github.com/documize/community/domain/section/code"
	"github.com/documize/community/domain/section/gemini"
	"github.com/documize/community/domain/section/github"
	"github.com/documize/community/domain/section/markdown"
	"github.com/documize/community/domain/section/papertrail"
	"github.com/documize/community/domain/section/provider"
	"github.com/documize/community/domain/section/table"
	"github.com/documize/community/domain/section/trello"
	"github.com/documize/community/domain/section/wysiwyg"
)

// Register sections
func Register(rt env.Runtime) {
	provider.Register("code", &code.Provider{Runtime: rt})
	provider.Register("gemini", &gemini.Provider{Runtime: rt})
	provider.Register("github", &github.Provider{Runtime: rt})
	provider.Register("markdown", &markdown.Provider{Runtime: rt})
	provider.Register("papertrail", &papertrail.Provider{Runtime: rt})
	provider.Register("table", &table.Provider{Runtime: rt})
	provider.Register("code", &code.Provider{Runtime: rt})
	provider.Register("trello", &trello.Provider{Runtime: rt})
	provider.Register("wysiwyg", &wysiwyg.Provider{Runtime: rt})
	provider.Register("airtable", &airtable.Provider{Runtime: rt})

	p := provider.List()
	rt.Log.Info(fmt.Sprintf("Registered %d sections", len(p)))
}
