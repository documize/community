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
	"context"
	"fmt"
	"html/template"
	"sort"

	gogithub "github.com/google/go-github/github"
)

type githubMilestone struct {
	Repo         string       `json:"repo"`
	Private      bool         `json:"private"`
	Name         string       `json:"name"`
	URL          template.URL `json:"url"`
	IsOpen       bool         `json:"isopen"`
	OpenIssues   int          `json:"openIssues"`
	ClosedIssues int          `json:"closedIssues"`
	CompleteMsg  string       `json:"completeMsg"`
	DueDate      string       `json:"dueDate"`
	UpdatedAt    string       `json:"updatedAt"`
	Progress     uint         `json:"progress"`
	IsMilestone  bool         `json:"isMilestone"`
}

// sort milestones in order that that should be presented.

type milestonesToSort []githubMilestone

func (s milestonesToSort) Len() int      { return len(s) }
func (s milestonesToSort) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s milestonesToSort) Less(i, j int) bool {
	if s[i].Repo < s[j].Repo {
		return true
	}
	if s[i].Repo > s[j].Repo {
		return false
	}
	if !s[i].IsOpen && s[j].IsOpen {
		return true
	}
	if s[i].IsOpen && !s[j].IsOpen {
		return false
	}
	if s[i].Name != noMilestone && s[j].Name == noMilestone {
		return true
	}
	if s[i].Name == noMilestone && s[j].Name != noMilestone {
		return false
	}
	if s[i].Progress == s[j].Progress { // order equal progress milestones
		return s[i].Name < s[j].Name
	}
	return s[i].Progress >= s[j].Progress // put more complete milestones first
}

const (
	tagMilestonesData    = "milestonesData"
	milestonesTimeFormat = "January 2 2006"
	noMilestone          = "no milestone"
)

func init() {
	reports[tagMilestonesData] = report{refreshMilestones, renderMilestones, milestonesTemplate}
}

func getMilestones(client *gogithub.Client, config *githubConfig) ([]githubMilestone, error) {

	if !config.ShowMilestones {
		return nil, nil
	}

	ret := []githubMilestone{}

	hadRepo := make(map[string]bool)

	for _, orb := range config.Lists {
		if orb.Included {
			rName := orb.Owner + "/" + orb.Repo

			if !hadRepo[rName] {

				for _, state := range []string{"open", "closed"} {

					opts := &gogithub.MilestoneListOptions{
						Sort:        "updated",
						State:       state,
						ListOptions: gogithub.ListOptions{PerPage: config.BranchLines}}

					guff, _, err := client.Issues.ListMilestones(context.Background(), orb.Owner, orb.Repo, opts)

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
							dd := "no due date"
							if v.DueOn != nil {
								// TODO refactor to add message in red if the milestone is overdue
								dd = "due " + (*v.DueOn).Format(milestonesTimeFormat) + ""
							}
							up := ""
							if v.UpdatedAt != nil {
								up = (*v.UpdatedAt).Format(milestonesTimeFormat)
							}

							progress := float64(*v.ClosedIssues*100) / float64(*v.OpenIssues+*v.ClosedIssues)

							ret = append(ret, githubMilestone{
								Repo:    repoName(rName),
								Private: orb.Private,
								Name:    *v.Title,
								URL: template.URL(fmt.Sprintf(
									"https://github.com/%s/%s/milestone/%d",
									orb.Owner, orb.Repo, *v.Number)), // *v.HTMLURL does not give the correct value
								IsOpen:       *v.State == "open",
								OpenIssues:   *v.OpenIssues,
								ClosedIssues: *v.ClosedIssues,
								CompleteMsg:  fmt.Sprintf("%2.0f%%", progress),
								DueDate:      dd,
								UpdatedAt:    up,
								Progress:     uint(progress),
								IsMilestone:  true,
							})
						}
					}

				}
			}
			hadRepo[rName] = true
		}

	}

	return ret, nil

}

func refreshMilestones(gr *githubRender, config *githubConfig, client *gogithub.Client) (err error) {

	if !config.ShowMilestones {
		return nil
	}

	gr.Milestones, err = getMilestones(client, config)
	if err != nil {
		return err
	}
	gr.OpenMS = 0
	gr.ClosedMS = 0
	for _, v := range gr.Milestones {
		if v.IsOpen {
			gr.OpenMS++
		} else {
			gr.ClosedMS++
		}
	}
	gr.HasMilestones = (gr.OpenMS + gr.ClosedMS) > 0

	return nil
}

func renderMilestones(payload *githubRender, c *githubConfig) error {

	if !c.ShowMilestones {
		return nil
	}

	hadRepo := make(map[string]bool)
	payload.RepoCount = 0
	for _, orb := range payload.List {
		rName := orb.Owner + "/" + orb.Repo
		if !hadRepo[rName] {
			if orb.Included {

				payload.RepoCount++
				issuesOpen, issuesClosed := 0, 0
				for _, iss := range payload.Issues {
					if iss.Repo == repoName(rName) {
						if iss.Milestone == noMilestone {
							if iss.IsOpen {
								issuesOpen++
							} else {
								issuesClosed++
							}
						}
					}
				}
				if issuesClosed+issuesOpen > 0 {
					//payload.Milestones = append(payload.Milestones, githubMilestone{
					//	Repo: orb.Repo, Private: orb.Private, Name: noMilestone, IsOpen: true,
					//	OpenIssues: issuesOpen, ClosedIssues: issuesClosed, URL: template.URL(orb.URL),
					//})
				}

				hadRepo[rName] = true
			}
		}
	}

	sort.Sort(milestonesToSort(payload.Milestones))

	return nil
}
