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

package papertrail

import "strings"

// the HTML that is rendered by this section.
const renderTemplate = `
{{if .HasData}}
<p >The <a href="https://papertrailapp.com">Papertrail log</a> for query <em>{{.Config.Query}}</em> contains {{.Count}} entries.</p>
<table class="basic-table section-papertrail-table">
	<thead>
		<tr>
			<th class="bordered no-width">Date</th>
			<th class="bordered no-width">Severity</th>
			<th class="bordered">Message</th>
		</tr>
	</thead>
	<tbody>
		{{range $item := .Events}}
		<tr>
			<td class="bordered no-width color-gray-600">{{ $item.Dated }}</td>
			<td class="bordered no-width">{{ $item.Severity }}</td>
			<td class="bordered width-90">{{ $item.Message }}</td>
		</tr>
		{{end}}
	</tbody>
</table>
{{else}}
<p>There are no Papertrail log entries to see.</p>
{{end}}
`

// Papertrail helpers
type papertrailRender struct {
	Config        papertrailConfig
	Events        []papertrailEvent
	Count         int
	Authenticated bool
	HasData       bool
}

type papertrailSearch struct {
	Events []papertrailEvent `json:"events"`
}

type papertrailEvent struct {
	ID       string `json:"id"`
	Dated    string `json:"display_received_at"`
	Message  string `json:"message"`
	Severity string `json:"severity"`
}

type papertrailConfig struct {
	APIToken string           `json:"APIToken"` // only contains the correct token just after it is typed in
	Query    string           `json:"query"`
	Max      int              `json:"max"`
	Group    papertrailOption `json:"group"`
	System   papertrailOption `json:"system"`
}

func (c *papertrailConfig) Clean() {
	c.APIToken = strings.TrimSpace(c.APIToken)
	c.Query = strings.TrimSpace(c.Query)
}

type papertrailOption struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type papertrailOptions struct {
	Groups  []papertrailOption `json:"groups"`
	Systems []papertrailOption `json:"systems"`
}
