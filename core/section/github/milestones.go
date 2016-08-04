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
	"sort"
	"time"

	"github.com/documize/community/core/log"

	gogithub "github.com/google/go-github/github"
)

const (
	tagMilestonesData    = "milestonesData"
	milestonesTimeFormat = "January 2 2006"
)

type githubMilestone struct {
	Repo         string `json:"repo"`
	Name         string `json:"name"`
	URL          string `json:"url"`
	IsOpen       bool   `json:"isopen"`
	OpenIssues   int    `json:"openIssues"`
	ClosedIssues int    `json:"closedIssues"`
	CompleteMsg  string `json:"completeMsg"`
	DueDate      string `json:"dueDate"`
	UpdatedAt    string `json:"updatedAt"`
}

// sort milestones in order that that should be presented - by date updated.

type milestonesToSort []githubMilestone

func (s milestonesToSort) Len() int      { return len(s) }
func (s milestonesToSort) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s milestonesToSort) Less(i, j int) bool {
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

func init() {
	reports[tagMilestonesData] = report{refreshMilestones, renderMilestones, `
<div class="section-github-render">
	<h3>Milestones</h3>
	<div class="github-board">
	<ul class="github-list">
		{{range $data := .Milestones}}
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
						<div class="github-commit-title"><span class="label-name">{{$data.Repo}} - {{$data.Name}}</span> </div>
						<div class="github-commit-meta">
						  {{$data.DueDate}} Last updated {{$data.UpdatedAt}}. 
						  {{$data.CompleteMsg}} complete {{$data.OpenIssues}} open {{$data.ClosedIssues}} closed
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

func getMilestones(client *gogithub.Client, config *githubConfig) ([]githubMilestone, error) {

	ret := []githubMilestone{}

	hadRepo := make(map[string]bool)

	for _, orb := range config.Lists {
		rName := orb.Owner + "/" + orb.Repo

		if !hadRepo[rName] {

			for _, state := range []string{"open", "closed"} {

				opts := &gogithub.MilestoneListOptions{
					Sort:        "updated",
					State:       state,
					ListOptions: gogithub.ListOptions{PerPage: config.BranchLines}}

				guff, _, err := client.Issues.ListMilestones(orb.Owner, orb.Repo, opts)

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
						dd := "No due date."
						if v.DueOn != nil {
							// TODO refactor to add message in red if the milestone is overdue
							dd = "Due on " + (*v.DueOn).Format(milestonesTimeFormat) + "."
						}
						up := ""
						if v.UpdatedAt != nil {
							up = (*v.UpdatedAt).Format(milestonesTimeFormat)
						}

						ret = append(ret, githubMilestone{
							Repo:         rName,
							Name:         *v.Title,
							URL:          *v.HTMLURL,
							IsOpen:       *v.State == "open",
							OpenIssues:   *v.OpenIssues,
							ClosedIssues: *v.ClosedIssues,
							CompleteMsg:  fmt.Sprintf("%2.0f%%", float64(*v.ClosedIssues*100)/float64(*v.OpenIssues+*v.ClosedIssues)),
							DueDate:      dd,
							UpdatedAt:    up,
						})
					}
				}

			}

		}
		hadRepo[rName] = true

	}

	sort.Stable(milestonesToSort(ret))

	return ret, nil

}

func refreshMilestones(gr *githubRender, config *githubConfig, client *gogithub.Client) (err error) {

	gr.Milestones, err = getMilestones(client, config)
	if err != nil {
		log.Error("unable to get github milestones", err)
		return err
	}
	return nil
}

func renderMilestones(payload *githubRender, c *githubConfig) error {
	return nil
}
