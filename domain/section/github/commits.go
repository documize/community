// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize unity Edition) is licensed under
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
	"time"

	gogithub "github.com/google/go-github/github"
)

const commitTimeFormat = "2006-01-02, 15:04"

type githubCommit struct {
	Owner      string       `json:"owner"`
	Repo       string       `json:"repo"`
	ShowRepo   bool         `json:"showRepo"`
	Branch     string       `json:"branch"`
	ShowBranch bool         `json:"showBranch"`
	Date       string       `json:"date"`
	BinDate    time.Time    `json:"-"` // only used for sorting
	ShowDate   bool         `json:"showDate"`
	Login      string       `json:"login"`
	Name       string       `json:"name"`
	Avatar     string       `json:"avatar"`
	Message    string       `json:"message"`
	URL        template.URL `json:"url"`
}

type githubAuthorStats struct {
	Author       string   `json:"author"`
	Login        string   `json:"login"`
	Avatar       string   `json:"avatar"`
	CommitCount  int      `json:"commitCount"`
	Repos        []string `json:"repos"`
	OpenIssues   int      `json:"openIssues"`
	ClosedIssues int      `json:"closedIssues"`
}

// order commits in a way that makes sense of the table
type orderCommits []githubCommit

func (s orderCommits) Len() int      { return len(s) }
func (s orderCommits) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s orderCommits) Less(i, j int) bool {
	if s[i].Repo == s[j].Repo {
		if s[i].Branch == s[j].Branch {
			if s[i].BinDate == s[j].BinDate {
				return s[i].Name < s[j].Name
			}
			return s[i].BinDate.Before(s[j].BinDate)
		}
		return s[i].Branch < s[j].Branch
	}
	return s[i].Repo < s[j].Repo
}

// sort stats in order that that should be presented.
type asToSort []githubAuthorStats

func (s asToSort) Len() int      { return len(s) }
func (s asToSort) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s asToSort) Less(i, j int) bool {
	return s[i].CommitCount > s[j].CommitCount
}

// sort branches in order that that should be presented.
type branchByID []githubBranch

func (s branchByID) Len() int      { return len(s) }
func (s branchByID) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s branchByID) Less(i, j int) bool {
	return s[i].ID < s[j].ID
}

const tagCommitsData = "commitsData"

func getCommits(client *gogithub.Client, config *githubConfig) ([]githubCommit, []githubAuthorStats, error) {

	if !config.ShowCommits {
		return nil, nil, nil
	}

	// first make sure we've got all the branches
	for _, orb := range config.Lists {
		if orb.Included {

			branches, _, err := client.Repositories.ListBranches(orb.Owner, orb.Repo,
				&gogithub.ListOptions{PerPage: 100})
			if err == nil {
				render := make([]githubBranch, len(branches))
				for kc, vb := range branches {
					for _, existing := range config.Lists {
						if orb.Owner == existing.Owner && orb.Repo == existing.Repo && orb.Name == *vb.Name {
							goto found
						}
					}
					render[kc] = githubBranch{
						Owner:    orb.Owner,
						Repo:     orb.Repo,
						Name:     *vb.Name,
						ID:       fmt.Sprintf("%s:%s:%s", orb.Owner, orb.Repo, *vb.Name),
						Included: true,
						URL:      "https://github.com/" + orb.Owner + "/" + orb.Repo + "/tree/" + *vb.Name,
					}
				found:
				}
				config.Lists = append(config.Lists, render...)
			}
		}
	}
	sort.Sort(branchByID(config.Lists))

	config.UserNames = make(map[string]string)

	authorStats := make(map[string]githubAuthorStats)

	contribBranch := make(map[string]map[string]struct{})

	overall := []githubCommit{}

	for _, orb := range config.Lists {
		if orb.Included {

			opts := &gogithub.CommitsListOptions{
				SHA:         orb.Name,
				ListOptions: gogithub.ListOptions{PerPage: config.BranchLines}}

			if config.SincePtr != nil {
				opts.Since = *config.SincePtr
			}

			guff, _, err := client.Repositories.ListCommits(orb.Owner, orb.Repo, opts)

			if err != nil {
				return nil, nil, err
			}

			thisBranch := fmt.Sprintf("%s:%s", orb.Repo, orb.Name)

			for _, v := range guff {

				var d, m, u string
				var bd time.Time
				if v.Commit != nil {
					if v.Commit.Committer.Date != nil {
						d = v.Commit.Committer.Date.Format(commitTimeFormat)
						bd = *v.Commit.Committer.Date
					}
					if v.Commit.Message != nil {
						m = *v.Commit.Message
					}
				}

				if v.HTMLURL != nil {
					u = *v.HTMLURL
				}

				// author commits
				al, an, aa := "", "", githubGravatar
				if v.Author != nil {
					if v.Author.Login != nil {
						al = *v.Author.Login
						an = getUserName(client, config, al)
					}

					if v.Author.AvatarURL != nil {
						aa = *v.Author.AvatarURL
					}
				}
				l := al // use author login

				overall = append(overall, githubCommit{
					Owner:   orb.Owner,
					Repo:    orb.Repo,
					Branch:  orb.Name,
					Name:    an,
					Login:   l,
					Message: m,
					Date:    d,
					BinDate: bd,
					Avatar:  aa,
					URL:     template.URL(u),
				})

				if _, ok := contribBranch[l]; !ok {
					contribBranch[l] = make(map[string]struct{})
				}
				contribBranch[l][thisBranch] = struct{}{}

				cum := authorStats[l]
				cum.Login = l
				cum.Author = an
				cum.Avatar = aa
				cum.CommitCount++
				// TODO review, this code removed as too slow
				//cmt, _, err := client.Repositories.GetCommit(orb.Owner, orb.Repo, *v.SHA)
				//if err == nil {
				//	if cmt.Stats != nil {
				//		if cmt.Stats.Total != nil {
				//			cum.TotalChanges += (*cmt.Stats.Total)
				//		}
				//	}
				//}
				//
				authorStats[l] = cum
			}
		}
	}

	sort.Sort(orderCommits(overall))

	for k := range overall {
		overall[k].ShowRepo = true
		overall[k].ShowBranch = true
		overall[k].ShowDate = true
		if k > 0 {
			if overall[k].Repo == overall[k-1].Repo {
				overall[k].ShowRepo = false
				if overall[k].Branch == overall[k-1].Branch {
					overall[k].ShowBranch = false
					if overall[k].Date == overall[k-1].Date {
						overall[k].ShowDate = false
					}
				}
			}
		}
	}

	retStats := make([]githubAuthorStats, 0, len(authorStats))
	for _, v := range authorStats {
		repos := contribBranch[v.Login]
		v.Repos = make([]string, 0, len(repos))
		for r := range repos {
			v.Repos = append(v.Repos, r)
		}
		sort.Strings(v.Repos)
		retStats = append(retStats, v)
	}
	sort.Sort(asToSort(retStats))

	return overall, retStats, nil

}

func refreshCommits(gr *githubRender, config *githubConfig, client *gogithub.Client) (err error) {
	if !config.ShowCommits {
		return nil
	}

	gr.BranchCommits, gr.AuthorStats, err = getCommits(client, config)
	if err != nil {
		return err
	}

	return nil
}

func renderCommits(payload *githubRender, c *githubConfig) error {
	if !c.ShowCommits {
		return nil
	}

	payload.CommitCount = 0
	for range payload.BranchCommits {
		payload.CommitCount++
	}
	payload.HasCommits = payload.CommitCount > 0

	for i := range payload.Issues {
		var author int
		for a := range payload.AuthorStats {
			if payload.AuthorStats[a].Login == payload.Issues[i].Name ||
				(payload.AuthorStats[a].Login == "" && payload.Issues[i].Name == unassignedIssue) {
				author = a
				goto found
			}
		}
		// no Author found for issue, so create one
		payload.AuthorStats = append(payload.AuthorStats, githubAuthorStats{
			Author: payload.Issues[i].Name,
			Avatar: payload.Issues[i].Avatar,
		})
		author = len(payload.AuthorStats) - 1
	found:
		if payload.Issues[i].IsOpen {
			payload.AuthorStats[author].OpenIssues++
		} else {
			payload.AuthorStats[author].ClosedIssues++
		}
	}
	payload.HasAuthorStats = len(payload.AuthorStats) > 0
	sort.Sort(asToSort(payload.AuthorStats))

	payload.NumContributors = len(payload.AuthorStats) - 1

	return nil
}

func init() {
	reports[tagCommitsData] = report{refreshCommits, renderCommits, commitsTemplate}
}
