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
	"sort"
	"time"

	"github.com/documize/community/core/log"

	gogithub "github.com/google/go-github/github"
)

type githubPullRequest struct {
	Repo      string `json:"repo"`
	Name      string `json:"name"`
	URL       string `json:"url"`
	IsOpen    bool   `json:"isopen"`
	UpdatedAt string `json:"updatedAt"`
}

// sort pull requests in order that that should be presented - by date updated, closed first.

type prToSort []githubPullRequest

func (s prToSort) Len() int      { return len(s) }
func (s prToSort) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s prToSort) Less(i, j int) bool {
	if !s[i].IsOpen && s[j].IsOpen {
		return true
	}
	if s[i].IsOpen && !s[j].IsOpen {
		return false
	}
	// TODO this seems a very slow approach
	iDate, iErr := time.Parse(milestonesTimeFormat, s[i].UpdatedAt)
	log.IfErr(iErr)
	jDate, jErr := time.Parse(milestonesTimeFormat, s[j].UpdatedAt)
	log.IfErr(jErr)
	return iDate.Before(jDate)

}

const (
	tagPullRequestData = "pullRequestData"

	rawPRsvg  = `<path d="M11 11.28V5c-.03-.78-.34-1.47-.94-2.06C9.46 2.35 8.78 2.03 8 2H7V0L4 3l3 3V4h1c.27.02.48.11.69.31.21.2.3.42.31.69v6.28A1.993 1.993 0 0 0 10 15a1.993 1.993 0 0 0 1-3.72zm-1 2.92c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zM4 3c0-1.11-.89-2-2-2a1.993 1.993 0 0 0-1 3.72v6.56A1.993 1.993 0 0 0 2 15a1.993 1.993 0 0 0 1-3.72V4.72c.59-.34 1-.98 1-1.72zm-.8 10c0 .66-.55 1.2-1.2 1.2-.65 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z"></path>`
	openPRsvg = `	
	<span title="Open Pull Request" >
			<svg height="16" width="12" version="1.1" viewBox="0 0 12 16">
				` + rawPRsvg + `
			</svg>							
	</span>
	`
	closedPRsvg = `	
	<span title="Closed Pull Request" >
			<svg height="8" width="6" version="1.1" viewBox="0 0 12 16">
				` + rawPRsvg + `
			</svg>							
	</span>
	`
)

func init() {
	reports[tagPullRequestData] = report{refreshPullReqs, renderPullReqs, `
<div class="section-github-render">
	<h3>Pull Requests</h3>
	<div class="github-board">
	<ul class="github-list">
		{{range $data := .PullRequests}}
			<li class="github-commit-item">
				<a class="link" href="{{$data.URL}}">
					<div class="issue-avatar">
						{{if $data.IsOpen}}
							` + openPRsvg + `
						{{else}}
							` + closedPRsvg + `
						{{end}}
				  	</div>
					<div class="github-commit-body">
						<div class="github-commit-title"><span class="label-name">{{$data.Repo}} - {{$data.Name}}</span> </div>
						<div class="github-commit-meta">
						 Last updated {{$data.UpdatedAt}}
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

func getPullReqs(client *gogithub.Client, config *githubConfig) ([]githubPullRequest, error) {

	ret := []githubPullRequest{}

	hadRepo := make(map[string]bool)

	for _, orb := range config.Lists {
		if orb.Included {
			rName := orb.Owner + "/" + orb.Repo

			if !hadRepo[rName] {

				for _, state := range []string{"open", "closed"} {

					opts := &gogithub.PullRequestListOptions{
						Sort:        "updated",
						State:       state,
						ListOptions: gogithub.ListOptions{PerPage: config.BranchLines}}

					guff, _, err := client.PullRequests.List(orb.Owner, orb.Repo, opts)

					if err != nil {
						return ret, err
					}

					for _, v := range guff {
						include := true
						if state == "closed" {
							if config.SincePtr != nil {
								if (*config.SincePtr).After(*v.ClosedAt) {
									include = false
								}
							}
						}
						if include {
							up := ""
							if v.UpdatedAt != nil {
								up = (*v.UpdatedAt).Format(milestonesTimeFormat)
							}

							ret = append(ret, githubPullRequest{
								Repo:      rName,
								Name:      *v.Title,
								URL:       *v.HTMLURL,
								IsOpen:    *v.State == "open",
								UpdatedAt: up,
							})
						}
					}

				}

			}
			hadRepo[rName] = true
		}

	}

	sort.Stable(prToSort(ret))

	return ret, nil

}

func refreshPullReqs(gr *githubRender, config *githubConfig, client *gogithub.Client) (err error) {

	gr.PullRequests, err = getPullReqs(client, config)
	if err != nil {
		log.Error("unable to get github Pull Requests", err)
		return err
	}

	gr.OpenPRs = 0
	gr.ClosedPRs = 0
	for _, v := range gr.PullRequests {
		if v.IsOpen {
			gr.OpenPRs++
		} else {
			gr.ClosedPRs++
		}
	}

	return nil
}

func renderPullReqs(payload *githubRender, c *githubConfig) error {
	return nil
}
