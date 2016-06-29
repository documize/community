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

package github

import (
	"html/template"
	"strings"
	"time"

	"github.com/documize/community/wordsmith/log"
)

type githubRender struct {
	Config           githubConfig
	Repo             githubRepo
	List             []githubBranch
	ShowList         bool
	BranchCommits    []githubBranchCommits
	CommitCount      int
	Issues           []githubIssue
	IssueNum         int
	IssueNumActivity []githubIssueActivity
	Limit            int
	DateMessage      string
}

var renderTemplates = map[string]string{
	"commits_data": `
<div class="section-github-render">
	<p>
		There are {{ .CommitCount }} commits for branch <a href="{{.Config.BranchURL}}">{{.Config.Branch}}</a> of repository <a href="{{ .Repo.URL }}">{{.Repo.Name}}.</a>
		Up to {{ .Limit }} items are shown{{ .DateMessage }}.
	</p>
	<div class="github-board">
		{{range $data := .BranchCommits}}
			<div class="github-group-title">
				Commits on {{ $data.Day }}
			</div>
			<ul class="github-list">
				{{range $commit := $data.Commits}}
					<li class="github-commit-item">
						<a class="link" href="{{$commit.URL}}">
							<div class="github-avatar">
								<img alt="@{{$commit.Name}}" src="{{$commit.Avatar}}" height="36" width="36">
							</div>
							<div class="github-commit-body">
								<div class="github-commit-title">{{$commit.Message}}</div>
								<div class="github-commit-meta">{{$commit.Name}} committed on {{$commit.Date}}</div>
							</div>
						</a>
						<div class="clearfix" />
					</li>
				{{end}}
			</ul>
		{{end}}
	</div>
</div>
`,
	"issues_data": `
<div class="section-github-render">
	<p>
		The open issues for repository <a href="{{ .Repo.URL }}/issues">{{.Repo.Name}}</a>
		{{if .ShowList}}
			with label(s)
			{{range $label := .List}}
				{{if $label.Included}}
					<span style="background-color:#{{$label.Color}}">{{$label.Name}}</span>
				{{end}}
			{{end}}
		{{end}}
		. 
		Up to {{ .Limit }} items are shown{{ .DateMessage }}.
	</p>
	<div class="github-board">
	<ul class="github-list">
		{{range $data := .Issues}}
			<li class="github-commit-item">
				<a class="link" href="{{$data.URL}}">
					<div class="github-avatar">
						<img alt="@{{$data.Name}}" src="{{$data.Avatar}}" height="36" width="36">
					</div>
					<div class="github-commit-body">
						<div class="github-commit-title">{{$data.Message}}</div>
						<div class="github-commit-meta">
							{{$data.Name}} committed on {{$data.Date}} {{$data.Labels}}
						</div>
					</div>
				</a>
				<div class="clearfix" />
			</li>
		{{end}}
	</ul>
	</div>
</div>
`,
	"issuenum_data": `
<div class="section-github-render">
	<p>
		Activity for issue #{{.IssueNum}} in repository <a href="{{ .Repo.URL }}/issues">{{.Repo.Name}}.</a>
		Up to {{ .Limit }} items are shown{{ .DateMessage }}.
	</p>
	<div class="github-board">
	<ul class="github-list">
		{{range $data := .IssueNumActivity}}
			<li class="github-commit-item">
				<a class="link" href="{{$data.URL}}">
					<div class="github-avatar">
						<img alt="@{{$data.Name}}" src="{{$data.Avatar}}" height="36" width="36">
					</div>
					<div class="github-commit-body">
						<div class="github-commit-title">{{$data.Event}}: {{$data.Message}}</div> 
						<div class="github-commit-meta">{{$data.Name}} committed on {{$data.Date}}</div>
					</div>
				</a>
				<div class="clearfix" />
			</li>
		{{end}}
	</ul>
	</div>
</div>
`,
}

type githubReport struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type githubOwner struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type githubRepo struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Included bool   `json:"included"`
	Owner    string `json:"owner"`
	Repo     string `json:"repo"`
	Private  bool   `json:"private"` // TODO review field use
	URL      string `json:"url"`
}

type githubBranch struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Included bool   `json:"included"`
	URL      string `json:"url"`
	Color    string `json:"color,omitempty"`
}

type githubBranchCommits struct {
	Name    string `json:"name"`
	Day     string `json:"day"`
	Commits []githubCommit
}

type githubCommit struct {
	Date    string       `json:"date"`
	Message string       `json:"message"`
	URL     template.URL `json:"url"`
	Name    string       `json:"name"`
	Avatar  string       `json:"avatar"`
}

type githubIssue struct {
	Date    string        `json:"date"`
	Message string        `json:"message"`
	URL     template.URL  `json:"url"`
	Name    string        `json:"name"`
	Avatar  string        `json:"avatar"`
	Labels  template.HTML `json:"labels"`
}

type githubIssueActivity struct {
	Date    string        `json:"date"`
	Event   string        `json:"event"`
	Message template.HTML `json:"message"`
	URL     template.URL  `json:"url"`
	Name    string        `json:"name"`
	Avatar  string        `json:"avatar"`
}

type githubConfig struct {
	AppKey      string         `json:"appKey"` // TODO keep?
	Token       string         `json:"token"`
	Owner       string         `json:"owner_name"`
	Repo        string         `json:"repo_name"`
	Branch      string         `json:"branch"`
	BranchURL   string         `json:"branchURL"`
	BranchSince string         `json:"branchSince,omitempty"`
	SincePtr    *time.Time     `json:"-"`
	BranchLines int            `json:"branchLines,omitempty,string"`
	OwnerInfo   githubOwner    `json:"owner"`
	RepoInfo    githubRepo     `json:"repo"`
	ReportInfo  githubReport   `json:"report"`
	ClientID    string         `json:"clientId"`
	CallbackURL string         `json:"callbackUrl"`
	Lists       []githubBranch `json:"lists,omitempty"`
	IssueNum    int            `json:"issueNum,omitempty,string"`
}

func (c *githubConfig) Clean() {
	c.AppKey = strings.TrimSpace(c.AppKey) // TODO keep?
	c.Token = strings.TrimSpace(c.Token)
	c.Owner = c.OwnerInfo.Name
	c.Repo = c.RepoInfo.Repo
	for _, l := range c.Lists {
		if l.Included {
			c.Branch = l.Name
			c.BranchURL = l.URL
			break
		}
	}
	if len(c.BranchSince) >= len("yyyy/mm/dd hh:ss") {
		var since time.Time
		tt := []byte("yyyy-mm-ddThh:mm:00Z")
		for _, i := range []int{0, 1, 2, 3, 5, 6, 8, 9, 11, 12, 14, 15} {
			tt[i] = byte(c.BranchSince[i])
		}
		err := since.UnmarshalText(tt)
		if err != nil {
			log.ErrorString("Date unmarshall '" + c.BranchSince + "'->'" + string(tt) + "' error: " + err.Error())
		} else {
			c.SincePtr = &since
		}
	}
}

type githubCallbackT struct {
	AccessToken string `json:"access_token"`
}
