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
	"fmt"
	"html/template"
	"sort"

	"github.com/documize/community/core/log"

	gogithub "github.com/google/go-github/github"
)

type githubBranchCommits struct {
	Name        string             `json:"name"`
	URL         string             `json:"url"`
	CommitCount int                `json:"commitCount"`
	Days        []githubDayCommits `json:"days"`
}

type githubDayCommits struct {
	Day     string         `json:"day"`
	Commits []githubCommit `json:"commits"`
}

type githubCommit struct {
	Date    string       `json:"date"`
	Message string       `json:"message"`
	URL     template.URL `json:"url"`
	Name    string       `json:"name"`
	Avatar  string       `json:"avatar"`
}

type githubAuthorStats struct {
	Author      string `json:"author"`
	Avatar      string `json:"avatar"`
	CommitCount int    `json:"commitCount"`
	//TotalChanges int    `json:"totalChanges"`
}

// sort stats in order that that should be presented.
type asToSort []githubAuthorStats

func (s asToSort) Len() int      { return len(s) }
func (s asToSort) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s asToSort) Less(i, j int) bool {
	return s[i].CommitCount > s[j].CommitCount
}

const tagCommitsData = "commitsData"

func init() {
	reports[tagCommitsData] = report{refreshCommits, renderCommits, `
<h3>Commits</h3>
<div class="section-github-render">
	<table style="width:80%">
		<tr>
			<th>{{.CommitCount}} commits since {{.Config.Since}}{{.Config.DateMessage}}</th>
    		<th>Author</th>
    		<th>#commits</th>
  		</tr>
		{{range $stats := .AuthorStats}}
			<tr>
				<td>
					<div class="github-avatar">
						<img alt="@{{$stats.Author}}" src="{{$stats.Avatar}}" height="36" width="36">
					</div>
				</td>
				<td>{{$stats.Author}}</td>
				<td>{{$stats.CommitCount}}</td>
			</tr>
		{{end}}
	</table>
	{{range $branch := .BranchCommits}}
		<h4>
			There are {{ $branch.CommitCount }} commits for branch <a href="{{$branch.URL}}">{{$branch.Name}}</a>.
		</h4>
		<div class="github-board">
			{{range $data := $branch.Days}}
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
	{{end}}
</div>
`}
}

func getCommits(client *gogithub.Client, config *githubConfig) ([]githubBranchCommits, []githubAuthorStats, error) {

	authorStats := make(map[string]githubAuthorStats)

	overall := []githubBranchCommits{}

	for _, orb := range config.Lists {

		opts := &gogithub.CommitsListOptions{
			SHA:         config.Branch,
			ListOptions: gogithub.ListOptions{PerPage: config.BranchLines}}

		if config.SincePtr != nil {
			opts.Since = *config.SincePtr
		}

		guff, _, err := client.Repositories.ListCommits(orb.Owner, orb.Repo, opts)

		if err != nil {
			return nil, nil, err
		}

		if len(guff) == 0 {
			return []githubBranchCommits{}, []githubAuthorStats{}, nil
		}

		day := ""
		newDay := ""
		ret := []githubDayCommits{}

		for k, v := range guff {

			if guff[k].Commit != nil {
				if guff[k].Commit.Committer.Date != nil {
					y, m, d := (*guff[k].Commit.Committer.Date).Date()
					newDay = fmt.Sprintf("%s %d, %d", m.String(), d, y)
				}
			}
			if day != newDay {
				day = newDay
				ret = append(ret, githubDayCommits{
					Day: day,
				})
			}

			var d, m, u string
			if v.Commit != nil {
				if v.Commit.Committer.Date != nil {
					// d = fmt.Sprintf("%v", *v.Commit.Committer.Date)
					d = v.Commit.Committer.Date.Format("January 2 2006, 15:04")
				}
				if v.Commit.Message != nil {
					m = *v.Commit.Message
				}
			}
			/* Use author rather than committer
			var a, l string
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
			*/

			if v.HTMLURL != nil {
				u = *v.HTMLURL
			}

			//  update of author commits
			al, aa := "", githubGravatar
			if v.Author != nil {
				if v.Author.Login != nil {
					al = *v.Author.Login
				}
				if v.Author.AvatarURL != nil {
					aa = *v.Author.AvatarURL
				}
				cum := authorStats[al]
				cum.Author = al
				cum.Avatar = aa
				cum.CommitCount++
				/* TODO review, this code removed as too slow
				cmt, _, err := client.Repositories.GetCommit(orb.Owner, orb.Repo, *v.SHA)
				if err == nil {
					if cmt.Stats != nil {
						if cmt.Stats.Total != nil {
							cum.TotalChanges += (*cmt.Stats.Total)
						}
					}
				}
				*/
				authorStats[al] = cum
			}

			ret[len(ret)-1].Commits = append(ret[len(ret)-1].Commits, githubCommit{
				Name:    al,
				Message: m,
				Date:    d,
				Avatar:  aa,
				URL:     template.URL(u),
			})
		}

		overall = append(overall, githubBranchCommits{
			Name: fmt.Sprintf("%s/%s:%s", orb.Owner, orb.Repo, orb.Name),
			URL:  fmt.Sprintf("https://github.com/%s/%s/tree/%s", orb.Owner, orb.Repo, orb.Name),
			Days: ret,
		})

	}

	retStats := make([]githubAuthorStats, 0, len(authorStats))
	for _, v := range authorStats {
		retStats = append(retStats, v)
	}
	sort.Stable(asToSort(retStats))

	return overall, retStats, nil

}

func refreshCommits(gr *githubRender, config *githubConfig, client *gogithub.Client) (err error) {

	gr.BranchCommits, gr.AuthorStats, err = getCommits(client, config)
	if err != nil {
		log.Error("github refreshCommits:", err)
		return err
	}
	return nil
}

func renderCommits(payload *githubRender, c *githubConfig) error {
	payload.CommitCount = 0
	for l, list := range payload.BranchCommits {
		payload.BranchCommits[l].CommitCount = 0
		for _, day := range list.Days {
			payload.BranchCommits[l].CommitCount += len(day.Commits)
			payload.CommitCount += len(day.Commits)
		}
	}
	return nil
}
