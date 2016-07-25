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
	"fmt"
	"html/template"
	"net/http"

	"github.com/documize/community/core/log"
	"github.com/documize/community/core/section/provider"

	gogithub "github.com/google/go-github/github"
)

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

const tagCommitsData = "commitsData"

func init() {
	reports[tagCommitsData] = report{commandCommitsData, refreshCommits, renderCommits, `
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
`}
}

func (*Provider) getCommits(client *gogithub.Client, config githubConfig) ([]githubBranchCommits, error) {

	opts := &gogithub.CommitsListOptions{
		SHA:         config.Branch,
		ListOptions: gogithub.ListOptions{PerPage: config.BranchLines}}

	if config.SincePtr != nil {
		opts.Since = *config.SincePtr
	}

	guff, _, err := client.Repositories.ListCommits(config.Owner, config.Repo, opts)

	if err != nil {
		return nil, err
	}

	if len(guff) == 0 {
		return []githubBranchCommits{}, nil
	}

	day := ""
	newDay := ""
	ret := []githubBranchCommits{}

	for k, v := range guff {

		if guff[k].Commit != nil {
			if guff[k].Commit.Committer.Date != nil {
				y, m, d := (*guff[k].Commit.Committer.Date).Date()
				newDay = fmt.Sprintf("%s %d, %d", m.String(), d, y)
			}
		}
		if day != newDay {
			day = newDay
			ret = append(ret, githubBranchCommits{
				Name: fmt.Sprintf("%s/%s:%s", config.Owner, config.Repo, config.Branch),
				Day:  day,
			})
		}

		var a, d, l, m, u string
		if v.Commit != nil {
			if v.Commit.Committer.Date != nil {
				// d = fmt.Sprintf("%v", *v.Commit.Committer.Date)
				d = v.Commit.Committer.Date.Format("January 2 2006, 15:04")
			}
			if v.Commit.Message != nil {
				m = *v.Commit.Message
			}
		}
		if v.Committer != nil {
			if v.Committer.Login != nil {
				l = *v.Committer.Login
			}
			if v.Committer.AvatarURL != nil {
				a = *v.Committer.AvatarURL
			}
		}
		if a == "" {
			a = githubGravatar
		}
		if v.HTMLURL != nil {
			u = *v.HTMLURL
		}
		ret[len(ret)-1].Commits = append(ret[len(ret)-1].Commits, githubCommit{
			Name:    l,
			Message: m,
			Date:    d,
			Avatar:  a,
			URL:     template.URL(u),
		})
	}

	return ret, nil

}

func commandCommitsData(p *Provider, client *gogithub.Client, config githubConfig, w http.ResponseWriter) {

	render, err := p.getCommits(client, config)
	if err != nil {
		log.Error("github getCommits:", err)
		provider.WriteError(w, "github", err)
		return
	}

	provider.WriteJSON(w, render)

}

func refreshCommits(p *Provider, c githubConfig, data string) string {

	refreshed, err := p.getCommits(p.githubClient(c), c)
	if err != nil {
		log.Error("unable to get github commits", err)
		return data
	}
	j, err := json.Marshal(refreshed)
	if err != nil {
		log.Error("unable to marshall github commits", err)
		return data
	}
	return string(j)

}

func renderCommits(c *githubConfig, payload *githubRender, data string) error {

	raw := []githubBranchCommits{}
	if err := json.Unmarshal([]byte(data), &raw); err != nil {
		return err
	}
	c.ReportInfo.ID = tagCommitsData
	payload.BranchCommits = raw
	for _, list := range raw {
		payload.CommitCount += len(list.Commits)
	}
	return nil

}
