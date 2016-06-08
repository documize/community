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

package gemini

import "strings"

// the HTML that is rendered by this section.
const renderTemplate = `
{{if .Authenticated}}
<p class="margin-left-20">The Gemini workspace <a href="{{.Config.URL}}/workspace/{{.Config.WorkspaceID}}/items">{{.Config.WorkspaceName}}</a> contains {{.Config.ItemCount}} items.</p>
<table class="basic-table section-gemini-table">
	<thead>
		<tr>
			<th class="bordered no-width">Item Key</th>
			<th class="bordered">Title</th>
			<th class="bordered no-width">Type</th>
			<th class="bordered no-width">Status</th>
		</tr>
	</thead>
	<tbody>
		{{$wid := .Config.WorkspaceID}}
		{{$app := .Config.URL}}
		{{range $item := .Items}}
		<tr>
			<td class="bordered no-width"><a href="{{ $app }}/workspace/{{ $wid }}/item/{{ $item.ID }}">{{ $item.IssueKey }}</a></td>
			<td class="bordered">{{ $item.Title }}</td>
			<td class="bordered no-width"><img src='{{ $item.TypeImage }}' />&nbsp;{{ $item.Type }}</td>
			<td class="bordered no-width"><img src='{{ $item.StatusImage }}' />&nbsp;{{ $item.Status }}</td>
		</tr>
		{{end}}
	</tbody>
</table>
{{else}}
<p>Authenticate with Gemini to see items.</p>
{{end}}
`

// Gemini helpers
type geminiRender struct {
	Config        geminiConfig
	Items         []geminiItem
	Authenticated bool
}

type geminiItem struct {
	ID          int64
	IssueKey    string
	Title       string
	Type        string
	TypeImage   string
	Status      string
	StatusImage string
}

type geminiUser struct {
	BaseEntity struct {
		ID        int    `json:"id"`
		Username  string `json:"username"`
		Firstname string `json:"firstname"`
		Surname   string `json:"surname"`
		Email     string `json:"email"`
	}
}

type geminiConfig struct {
	URL           string                 `json:"url"`
	Username      string                 `json:"username"`
	APIKey        string                 `json:"apikey"`
	UserID        int64                  `json:"userId"`
	WorkspaceID   int64                  `json:"workspaceId"`
	WorkspaceName string                 `json:"workspaceName"`
	ItemCount     int                    `json:"itemCount"`
	Filter        map[string]interface{} `json:"filter"`
}

func (c *geminiConfig) Clean() {
	c.APIKey = strings.TrimSpace(c.APIKey)
	c.Username = strings.TrimSpace(c.Username)
	c.URL = strings.TrimSpace(c.URL)
}
