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

package jira

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"net/http"

	jira "github.com/andygrunwald/go-jira"
	"github.com/documize/community/core/env"
	"github.com/documize/community/domain/section/provider"
	"github.com/documize/community/domain/store"
)

//
const (
	logID = "jira"
)

// Provider represents Gemini
type Provider struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Meta describes us.
func (*Provider) Meta() provider.TypeMeta {
	section := provider.TypeMeta{}
	section.ID = "dca48000-8a60-438c-b6d1-e4160f3ac8e3"
	section.Title = "Jira"
	section.Description = "Issue tracking"
	section.ContentType = "jira"
	section.PageType = "tab"

	return section
}

// Render converts Jira data into HTML suitable for browser rendering.
func (p *Provider) Render(ctx *provider.Context, config, data string) string {
	var c = jiraConfig{}
	err := json.Unmarshal([]byte(config), &c)
	if err != nil {
		p.Runtime.Log.Error("Unable to read Jira config", err)
		return ""
	}

	creds, err := getCredentials(ctx, p.Store)
	if err != nil {
		p.Runtime.Log.Error("unable to fetch Jira connector configuration", err)
		return ""
	}

	client, _, err := authenticate(creds)
	if err != nil {
		p.Runtime.Log.Error("unable to authenticate with Jira", err)
		return ""
	}

	issues, err := getIssues(c, client)

	return generateGrid(creds.URL, issues)
}

// Refresh fetches latest issues list.
func (p *Provider) Refresh(ctx *provider.Context, config, data string) (newData string) {
	var c = jiraConfig{}
	err := json.Unmarshal([]byte(config), &c)
	if err != nil {
		p.Runtime.Log.Error("Unable to read Jira config", err)
		return
	}

	creds, err := getCredentials(ctx, p.Store)
	if err != nil {
		p.Runtime.Log.Error("unable to fetch Jira connector configuration", err)
		return
	}

	client, _, err := authenticate(creds)
	if err != nil {
		p.Runtime.Log.Error("unable to authenticate with Jira", err)
		return
	}

	issues, err := getIssues(c, client)

	j, err := json.Marshal(issues)
	if err != nil {
		p.Runtime.Log.Error("unable to marshal Jira items", err)
		return
	}

	newData = string(j)

	return
}

// Command handles authentication and issues list preview.
func (p *Provider) Command(ctx *provider.Context, w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	method := query.Get("method")

	if len(method) == 0 {
		provider.WriteMessage(w, logID, "missing method name")
		return
	}

	switch method {
	case "previewIssues":
		previewIssues(ctx, p.Store, w, r)
	case "previewGrid":
		previewGrid(ctx, p.Store, w, r)
	case "auth":
		auth(ctx, p.Store, w, r)
	}
}

func auth(ctx *provider.Context, store *store.Store, w http.ResponseWriter, r *http.Request) {
	creds, err := getCredentials(ctx, store)
	if err != nil {
		provider.WriteForbidden(w)
		return
	}

	// Authenticate
	_, _, err = authenticate(creds)
	if err != nil {
		fmt.Println(err)
		provider.WriteError(w, logID, err)
		return
	}

	provider.WriteJSON(w, "OK")
}

func previewIssues(ctx *provider.Context, store *store.Store, w http.ResponseWriter, r *http.Request) {
	creds, err := getCredentials(ctx, store)
	if err != nil {
		provider.WriteForbidden(w)
		return
	}

	client, _, err := authenticate(creds)
	if err != nil {
		fmt.Println(err)
		provider.WriteError(w, logID, err)
		return
	}

	config, err := readConfig(ctx, store, w, r)
	if err != nil {
		fmt.Println(err)
		provider.WriteError(w, logID, err)
		return
	}

	issues, err := getIssues(config, client)

	provider.WriteJSON(w, issues)
}

func previewGrid(ctx *provider.Context, store *store.Store, w http.ResponseWriter, r *http.Request) {
	creds, err := getCredentials(ctx, store)
	if err != nil {
		provider.WriteForbidden(w)
		return
	}

	client, _, err := authenticate(creds)
	if err != nil {
		fmt.Println(err)
		provider.WriteError(w, logID, err)
		return
	}

	config, err := readConfig(ctx, store, w, r)
	if err != nil {
		fmt.Println(err)
		provider.WriteError(w, logID, err)
		return
	}

	issues, err := getIssues(config, client)

	w.Header().Set("Content-Type", "html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(generateGrid(creds.URL, issues)))
}

// Pull config from HTTP request.
func readConfig(ctx *provider.Context, store *store.Store, w http.ResponseWriter, r *http.Request) (config jiraConfig, err error) {
	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		return
	}

	err = json.Unmarshal(body, &config)
	if err != nil {
		return
	}

	return
}

// Get Jira connector configuration.
func getCredentials(ctx *provider.Context, store *store.Store) (login jiraLogin, err error) {
	creds, err := store.Setting.GetUser(ctx.OrgID, "", "jira", "")

	err = json.Unmarshal([]byte(creds), &login)
	if err != nil {
		return login, err
	}

	return
}

// Perform Jira login.
func authenticate(login jiraLogin) (c *jira.Client, u *jira.User, err error) {
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	// client := &http.Client{Transport: tr}

	tp := jira.BasicAuthTransport{Username: login.Username, Password: login.Secret, Transport: tr}
	c, err = jira.NewClient(tp.Client(), login.URL)
	if err != nil {
		fmt.Println("Cannot authenticate with Jira:", err)
		return
	}

	u, _, err = c.User.Get(login.Username)
	if err != nil {
		fmt.Println("Cannot get authenticated Jira user:", err)
		return
	}

	return
}

// Fetch Jira issues using configuration criteria.
func getIssues(config jiraConfig, client *jira.Client) (issues []jira.Issue, err error) {
	opts := &jira.SearchOptions{Expand: "", MaxResults: 500, StartAt: 0}
	issues, _, err = client.Issue.Search(config.JQL, opts)

	return
}

// Generate issues grid
func generateGrid(jiraURL string, issues []jira.Issue) string {
	t := template.New("issues")
	t, _ = t.Parse(renderTemplate)

	payload := jiraGrid{}
	payload.ItemCount = len(issues)
	payload.Issues = issues
	payload.JiraURL = jiraURL

	buffer := new(bytes.Buffer)
	err := t.Execute(buffer, payload)

	if err != nil {
		fmt.Println("Jira render error", err)
	}

	return buffer.String()
}

type jiraConfig struct {
	JQL       string `json:"jql"`
	ItemCount int    `json:"itemCount"`
}

type jiraLogin struct {
	URL      string `json:"url"`
	Username string `json:"username"`
	Secret   string `json:"secret"`
}

type jiraGrid struct {
	JiraURL   string       `json:"url"`
	Issues    []jira.Issue `json:"issues"`
	ItemCount int          `json:"itemCount"`
}

type jiraFilter struct {
	Name string `json:"name"`
	JQL  string `json:"jql"`
}

// the HTML that is rendered by this section.
const renderTemplate = `
<p>{{.ItemCount}} items</p>
<table class="basic-table section-jira-table">
	<thead>
		<tr>
			<th class="bordered no-width">Key</th>
			<th class="bordered no-width">T</th>
			<th class="bordered no-width">Status</th>
			<th class="bordered no-width">P</th>
			<th class="bordered no-width">Component/s</th>
			<th class="bordered">Summary</th>
			<th class="bordered no-width">Assignee</th>
			<th class="bordered no-width">Fix Version/s</th>
		</tr>
	</thead>
	<tbody>
        {{$app := .JiraURL}}
        {{range $item := .Issues}}
            <tr>
                <td class="bordered no-width"><a href="{{ $app }}/browse/{{ $item.Key }}">{{ $item.Key }}&nbsp;</a></td>
                <td class="bordered no-width"><img class="section-jira-icon" src='{{ $item.Fields.Type.IconURL }}' /></td>
                <td class="bordered no-width"><span class="seciton-jira-status">{{ $item.Fields.Status.Name }}</span>&nbsp;</td>
                <td class="bordered no-width"><img class="section-jira-icon" src='{{ $item.Fields.Priority.IconURL }}' /></td>
                <td class="bordered no-width">
                    {{range $comp := $item.Fields.Components}}
                        {{ $comp.Name }}
                    {{end}}
                    &nbsp;
                </td>
                <td class="bordered no-width">{{ $item.Fields.Summary }}&nbsp;</td>
                <td class="bordered no-width">
                    {{if $item.Fields.Assignee}}
                        {{$item.Fields.Assignee.DisplayName}}
                    {{end}}
                    &nbsp;
                </td>
                <td class="bordered no-width">
                    {{range $ver := $item.Fields.FixVersions}}
                        {{ $ver.Name }}
                    {{end}}
                    &nbsp;
                </td>
            </tr>
		{{end}}
	</tbody>
</table>
`
