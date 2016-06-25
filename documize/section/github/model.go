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

import "strings"

type githubRender struct {
	Config        githubConfig
	Repo          githubRepo
	BranchCommits []githubBranchCommits
	CommitCount   int
	OpenIssues    []githubIssue
}

var renderTemplates = map[string]string{
	"commits": `
<div class="section-github-render">
	<p>There are {{ .CommitCount }} commits for branch <a href="{{.Config.BranchURL}}">{{.Config.Branch}}</a> of repository <a href="{{ .Repo.URL }}">{{.Repo.Name}}.</a></p>
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
	"open_issues": `
<div class="section-github-render">
	<p>The issues for repository <a href="{{ .Repo.URL }}/issues">{{.Repo.Name}}.</a></p>
	<div class="github-board">
	<ul class="github-list">
		{{range $data := .OpenIssues}}
			<li class="github-commit-item">
				<a class="link" href="{{$data.URL}}">
					<div class="github-avatar">
						<img alt="@{{$data.Name}}" src="{{$data.Avatar}}" height="36" width="36">
					</div>
					<div class="github-commit-body">
						<div class="github-commit-title">{{$data.Message}}</div>
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
}

type githubBranchCommits struct {
	Name    string `json:"name"`
	Day     string `json:"day"`
	Commits []githubCommit
}

type githubCommit struct {
	Date    string `json:"date"`
	Message string `json:"message"`
	URL     string `json:"url"`
	Name    string `json:"name"`
	Avatar  string `json:"avatar"`
}

type githubIssue struct {
	Date    string `json:"date"`
	Message string `json:"message"`
	URL     string `json:"url"`
	Name    string `json:"name"`
	Avatar  string `json:"avatar"`
}

type githubConfig struct {
	AppKey      string         `json:"appKey"` // TODO keep?
	Token       string         `json:"token"`
	Owner       string         `json:"owner_name"`
	Repo        string         `json:"repo_name"`
	Branch      string         `json:"branch"`
	BranchURL   string         `json:"branchURL"`
	BranchSince string         `json:"branchSince"`
	BranchLines int            `json:"branchLines"`
	OwnerInfo   githubOwner    `json:"owner"`
	RepoInfo    githubRepo     `json:"repo"`
	ReportInfo  githubReport   `json:"report"`
	ClientID    string         `json:"clientId"`
	CallbackURL string         `json:"callbackUrl"`
	Lists       []githubBranch `json:"lists"`
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
}

type githubCallbackT struct {
	AccessToken string `json:"access_token"`
}
