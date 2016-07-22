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
	"time"

	"github.com/documize/community/core/log"
)

const tagIssuesData = "issuesData"
const tagCommitsData = "commitsData"

type githubRender struct {
	Config           githubConfig
	Repo             githubRepo
	List             []githubBranch
	ShowList         bool
	ShowIssueNumbers bool
	BranchCommits    []githubBranchCommits
	CommitCount      int
	Issues           []githubIssue
	//IssueNum         int
	//IssueNumActivity []githubIssueActivity
	Limit       int
	DateMessage string
}

var renderTemplates = map[string]string{
	tagCommitsData: `
<div class="section-github-render">
	<p>
		There are {{ .CommitCount }} commits for branch <a href="{{.Config.BranchURL}}">{{.Config.Branch}}</a> of repository <a href="{{ .Repo.URL }}">{{.Repo.Name}}.</a>
		Showing {{ .Limit }} items {{ .DateMessage }}.
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
	tagIssuesData: `
<div class="section-github-render">
	<p>
		{{if .ShowIssueNumbers}}
			Showing Selected Issues
		{{else}}
			{{ .Config.IssueState.Name }}
		{{end}}
		    for repository <a href="{{ .Repo.URL }}/issues">{{.Repo.Name}}</a>
		{{if .ShowList}}
			labelled
			{{range $label := .List}}
				{{if $label.Included}}
					<span class="github-issue-label" style="background-color:#{{$label.Color}}">{{$label.Name}}</span>
				{{end}}
			{{end}}
		{{end}}
		{{if .ShowIssueNumbers}}
			issue(s) {{ .DateMessage }}.
		{{else}}
			up to {{ .Limit }} items are shown{{ .DateMessage }}.
		{{end}}
	</p>
	<div class="github-board">
	<ul class="github-list">
		{{range $data := .Issues}}
			<li class="github-commit-item">
				<a class="link" href="{{$data.URL}}">
					<div class="issue-avatar">
						{{if $data.IsOpen}}
							<span title="Open issue">
								<svg height="16" version="1.1" viewBox="0 0 14 16" width="14"><path d="M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"></path></svg>
							</span>
						{{else}}
							<span title="Closed issue">
								<svg height="16" version="1.1" viewBox="0 0 16 16" width="16"><path d="M7 10h2v2H7v-2zm2-6H7v5h2V4zm1.5 1.5l-1 1L12 9l4-4.5-1-1L12 7l-1.5-1.5zM8 13.7A5.71 5.71 0 0 1 2.3 8c0-3.14 2.56-5.7 5.7-5.7 1.83 0 3.45.88 4.5 2.2l.92-.92A6.947 6.947 0 0 0 8 1C4.14 1 1 4.14 1 8s3.14 7 7 7 7-3.14 7-7l-1.52 1.52c-.66 2.41-2.86 4.19-5.48 4.19v-.01z"></path></svg>
							</span>
						{{end}}
				  	</div>
					<div class="github-commit-body">
						<div class="github-commit-title"><span class="label-name">{{$data.Message}}</span> {{$data.Labels}}</div>
						<div class="github-commit-meta">
							#{{$data.ID}} opened on {{$data.Date}} by {{$data.Name}}, last updated {{$data.Updated}}
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
	/* "issuenum_data": `
	   <div class="section-github-render">
	   	<p>
	   		Activity for issue #{{.IssueNum}} in repository <a href="{{ .Repo.URL }}/issues">{{.Repo.Name}}.</a>
	   		Up to {{ .Limit }} items are shown{{ .DateMessage }}.
	   	</p>
	   	<div class="github-board">
	   	<ul class="github-list">
	   		{{range $data := .IssueNumActivity}}
	   			<li class="github-commit-item">
	   				<div class="github-avatar">
	   					<img alt="@{{$data.Name}}" src="{{$data.Avatar}}" height="36" width="36">
	   				</div>
	   				<div class="github-commit-meta">
	   					{{$data.Name}} <a class="link" href="{{$data.URL}}">{{$data.Event}}</a> {{$data.Date}}
	   				</div>
	   				<div class="github-commit-body">
	   					<div class="github-commit-title">
	   						{{$data.Message}}
	   					</div>
	   				</div>
	   				<div class="clearfix" />
	   			</li>
	   		{{end}}
	   	</ul>
	   	</div>
	   </div>
	   `,*/
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
	ID      int           `json:"id"`
	Date    string        `json:"date"`
	Updated string        `json:"dated"`
	Message string        `json:"message"`
	URL     template.URL  `json:"url"`
	Name    string        `json:"name"`
	Avatar  string        `json:"avatar"`
	Labels  template.HTML `json:"labels"`
	IsOpen  bool          `json:"isopen"`
}

/*
type githubIssueActivity struct {
	Date    string        `json:"date"`
	Event   string        `json:"event"`
	Message template.HTML `json:"message"`
	URL     template.URL  `json:"url"`
	Name    string        `json:"name"`
	Avatar  string        `json:"avatar"`
}
*/

type githubConfig struct {
	Token       string         `json:"-"` // NOTE very important that the secret Token is not leaked to the client side, so "-"
	UserID      string         `json:"userId"`
	PageID      string         `json:"pageId"`
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
	IssueState  githubReport   `json:"state,omitempty"`
	IssuesText  string         `json:"issues,omitempty"`
	//IssueNum    int            `json:"issueNum,omitempty,string"`
}

func (c *githubConfig) Clean() {
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
			tt[i] = c.BranchSince[i]
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
