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
	"sort"
	"time"

	"github.com/documize/community/core/log"

	gogithub "github.com/google/go-github/github"
)

const (
	tagIssuesData    = "issuesData"
	issuesTimeFormat = "January 2 2006, 15:04"
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
	Repo    string        `json:"repo"`
}

// sort issues in order that that should be presented - by date updated.
type issuesToSort []githubIssue

func (s issuesToSort) Len() int      { return len(s) }
func (s issuesToSort) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s issuesToSort) Less(i, j int) bool {
	if !s[i].IsOpen && s[j].IsOpen {
		return true
	}
	if s[i].IsOpen && !s[j].IsOpen {
		return false
	}
	// TODO this seems a very slow approach
	iDate, iErr := time.Parse(issuesTimeFormat, s[i].Updated)
	log.IfErr(iErr)
	jDate, jErr := time.Parse(issuesTimeFormat, s[j].Updated)
	log.IfErr(jErr)
	return iDate.Before(jDate)
}

func init() {
	reports[tagIssuesData] = report{refreshIssues, renderIssues, `
<div class="section-github-render">
	<h3>Issues</h3>
	<p>
		During the period since {{.Config.Since}}{{.Config.DateMessage}}, {{.ClosedIssues}} issues were closed, while {{.OpenIssues}} remain open. 
		{{if .ShowList}}
			Labelled
			{{range $label := .List}}
				{{if $label.Included}}
					<span class="github-issue-label" style="background-color:#{{$label.Color}}">{{$label.Name}}</span>
				{{end}}
			{{end}}
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
							#{{$data.ID}} opened on {{$data.Date}} by {{$data.Name}} in {{$data.Repo}}, last updated {{$data.Updated}}
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

func getIssues(client *gogithub.Client, config *githubConfig) ([]githubIssue, error) {

	ret := []githubIssue{}

	hadRepo := make(map[string]bool)

	for _, orb := range config.Lists {

		rName := orb.Owner + "/" + orb.Repo

		if !hadRepo[rName] {

			for _, state := range []string{"open", "closed"} {

				opts := &gogithub.IssueListByRepoOptions{
					Sort:        "updated",
					State:       state,
					ListOptions: gogithub.ListOptions{PerPage: config.BranchLines}}

				if config.SincePtr != nil && state == "closed" /* we want all the open ones */ {
					opts.Since = *config.SincePtr
				}

				/* TODO refactor to select certain lables
				for _, lab := range config.Lists {
					if lab.Included {
						opts.Labels = append(opts.Labels, lab.Name)
					}
				}
				*/

				guff, _, err := client.Issues.ListByRepo(orb.Owner, orb.Repo, opts)

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
						Date:    v.CreatedAt.Format(issuesTimeFormat),
						Updated: v.UpdatedAt.Format(issuesTimeFormat),
						URL:     template.URL(*v.HTMLURL),
						Labels:  template.HTML(l),
						ID:      *v.Number,
						IsOpen:  *v.State == "open",
						Repo:    rName,
					})
				}
			}
		}
		hadRepo[rName] = true

	}

	sort.Stable(issuesToSort(ret))

	return ret, nil

}

func refreshIssues(gr *githubRender, config *githubConfig, client *gogithub.Client) (err error) {
	gr.Issues, err = getIssues(client, config)
	if err != nil {
		log.Error("unable to get github issues (cmd)", err)
		return err
	}

	gr.OpenIssues = 0
	gr.ClosedIssues = 0
	for _, v := range gr.Issues {
		if v.IsOpen {
			gr.OpenIssues++
		} else {
			gr.ClosedIssues++
		}
	}

	return nil
}

func renderIssues(payload *githubRender, c *githubConfig) error {
	return nil
}
