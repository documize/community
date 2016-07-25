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
	"encoding/json"
	"html/template"
	"net/http"
	"strconv"
	"strings"

	"github.com/documize/community/core/log"
	"github.com/documize/community/core/section/provider"

	gogithub "github.com/google/go-github/github"
)

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

const tagIssuesData = "issuesData"

func init() {
	reports[tagIssuesData] = report{commandIssuesData, refreshIssues, renderIssues, `
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
`}
}

func wrapLabels(labels []gogithub.Label) string {
	l := ""
	for _, ll := range labels {
		l += `<span class="github-issue-label" style="background-color:#` + *ll.Color + `">` + *ll.Name + `</span> `
	}
	return l
}

func (*Provider) getIssues(client *gogithub.Client, config githubConfig) ([]githubIssue, error) {

	ret := []githubIssue{}

	isRequired := make([]int, 0, 10)
	for _, s := range strings.Split(strings.Replace(config.IssuesText, "#", "", -1), ",") {
		i, err := strconv.Atoi(strings.TrimSpace(s))
		if err == nil {
			isRequired = append(isRequired, i)
		}
	}
	if len(isRequired) > 0 {

		for _, i := range isRequired {

			issue, _, err := client.Issues.Get(config.Owner, config.Repo, i)

			if err == nil {
				n := ""
				p := issue.User
				if p != nil {
					if p.Login != nil {
						n = *p.Login
					}
				}
				l := wrapLabels(issue.Labels)
				ret = append(ret, githubIssue{
					Name:    n,
					Message: *issue.Title,
					Date:    issue.CreatedAt.Format("January 2 2006, 15:04"),
					Updated: issue.UpdatedAt.Format("January 2 2006, 15:04"),
					URL:     template.URL(*issue.HTMLURL),
					Labels:  template.HTML(l),
					ID:      *issue.Number,
					IsOpen:  *issue.State == "open",
				})
			}
		}

	} else {

		opts := &gogithub.IssueListByRepoOptions{
			Sort:        "updated",
			State:       config.IssueState.ID,
			ListOptions: gogithub.ListOptions{PerPage: config.BranchLines}}

		if config.SincePtr != nil {
			opts.Since = *config.SincePtr
		}

		for _, lab := range config.Lists {
			if lab.Included {
				opts.Labels = append(opts.Labels, lab.Name)
			}
		}

		guff, _, err := client.Issues.ListByRepo(config.Owner, config.Repo, opts)

		if err != nil {
			return ret, err
		}

		for _, v := range guff {
			n := ""
			ptr := v.User
			if ptr != nil {
				if ptr.Login != nil {
					n = *ptr.Login
				}
			}
			l := wrapLabels(v.Labels)
			ret = append(ret, githubIssue{
				Name:    n,
				Message: *v.Title,
				Date:    v.CreatedAt.Format("January 2 2006, 15:04"),
				Updated: v.UpdatedAt.Format("January 2 2006, 15:04"),
				URL:     template.URL(*v.HTMLURL),
				Labels:  template.HTML(l),
				ID:      *v.Number,
				IsOpen:  *v.State == "open",
			})
		}
	}

	return ret, nil

}

func commandIssuesData(p *Provider, client *gogithub.Client, config githubConfig, w http.ResponseWriter) {
	render, err := p.getIssues(client, config)
	if err != nil {
		log.Error("github getIssues:", err)
		provider.WriteError(w, "github", err)
		return
	}

	provider.WriteJSON(w, render)
}

func refreshIssues(p *Provider, c githubConfig, data string) string {
	refreshed, err := p.getIssues(p.githubClient(c), c)
	if err != nil {
		log.Error("unable to get github issues", err)
		return data
	}
	j, err := json.Marshal(refreshed)
	if err != nil {
		log.Error("unable to marshall github issues", err)
		return data
	}
	return string(j)
}

func renderIssues(c *githubConfig, payload *githubRender, data string) error {
	raw := []githubIssue{}

	if len(data) > 0 {
		err := json.Unmarshal([]byte(data), &raw)
		if err != nil {
			return err
		}
	}
	payload.Issues = raw
	if strings.TrimSpace(c.IssuesText) != "" {
		payload.ShowIssueNumbers = true
		payload.DateMessage = c.IssuesText
	} else {
		if len(c.Lists) > 0 {
			for _, v := range c.Lists {
				if v.Included {
					payload.ShowList = true
					break
				}
			}
			payload.List = c.Lists
		}
	}
	return nil
}
