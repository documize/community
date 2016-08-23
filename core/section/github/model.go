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
	"strings"
	"time"

	"github.com/documize/community/core/log"

	gogithub "github.com/google/go-github/github"
)

type githubRender struct {
	Config           githubConfig        `json:"config"`
	Repo             githubRepo          `json:"repo"`
	List             []githubBranch      `json:"list"`
	ShowList         bool                `json:"showList"`
	ShowIssueNumbers bool                `json:"showIssueNumbers"`
	BranchCommits    []githubCommit      `json:"branchCommits"`
	HasCommits       bool                `json:"hasCommits"`
	CommitCount      int                 `json:"commitCount"`
	Issues           []githubIssue       `json:"issues"`
	HasIssues        bool                `json:"hasIssues"`
	SharedLabels     []githubSharedLabel `json:"sharedLabels"`
	HasSharedLabels  bool                `json:"hasSharedLabels"`
	OpenIssues       int                 `json:"openIssues"`
	ClosedIssues     int                 `json:"closedIssues"`
	Limit            int                 `json:"limit"`
	Milestones       []githubMilestone   `json:"milestones"`
	HasMilestones    bool                `json:"hasMilestones"`
	OpenMS           int                 `json:"openMS"`
	ClosedMS         int                 `json:"closedMS"`
	OpenPRs          int                 `json:"openPRs"`
	ClosedPRs        int                 `json:"closedPRs"`
	AuthorStats      []githubAuthorStats `json:"authorStats"`
	HasAuthorStats   bool                `json:"hasAuthorStats"`
	//PullRequests   []githubPullRequest   `json:"pullRequests"`
}

type report struct {
	refresh  func(*githubRender, *githubConfig, *gogithub.Client) error
	render   func(*githubRender, *githubConfig) error
	template string
}

var reports = make(map[string]report)

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
	Owner    string `json:"owner"`
	Repo     string `json:"repo"`
	Name     string `json:"name"`
	Included bool   `json:"included"`
	URL      string `json:"url"`
	Color    string `json:"color,omitempty"`
	Comma    bool   `json:"comma"`
}

type githubLabel struct {
	ID       string `json:"id"`
	Owner    string `json:"owner"`
	Repo     string `json:"repo"`
	Name     string `json:"name"`
	Included bool   `json:"included"`
	URL      string `json:"url"`
	Color    string `json:"color,omitempty"`
}

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
	Since       string         `json:"since"`
	BranchLines int            `json:"branchLines,omitempty,string"`
	OwnerInfo   githubOwner    `json:"owner"`
	RepoInfo    githubRepo     `json:"repo"`
	ReportInfo  githubReport   `json:"report"`
	ClientID    string         `json:"clientId"`
	CallbackURL string         `json:"callbackUrl"`
	Lists       []githubBranch `json:"lists,omitempty"`
	IssueState  githubReport   `json:"state,omitempty"`
	IssuesText  string         `json:"issues,omitempty"`
	ReportOrder []string       `json:"reportOrder,omitempty"`
	DateMessage string         `json:"dateMessage,omitempty"`
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
	if c.SincePtr == nil {
		c.DateMessage = " (the last 7 days)"
		since := time.Now().AddDate(0, 0, -7)
		c.SincePtr = &since
	} else {
		c.DateMessage = ""
	}
	c.Since = (*c.SincePtr).Format(issuesTimeFormat)

	// TEST DATA INSERTION DEBUG ONLY!
	debugList := map[string][]string{
		"community":  []string{"master"},
		"enterprise": []string{"master"},
		"test-data":  []string{"master"},
	}
	c.Lists = make([]githubBranch, 0, len(debugList)*3)
	for repo, branches := range debugList {
		render := make([]githubBranch, len(branches))
		for kc, vb := range branches {
			render[kc] = githubBranch{
				Owner:    "documize",
				Repo:     repo,
				Name:     vb,
				ID:       fmt.Sprintf("%s:%s:%s", "documize", repo, vb),
				Included: true,
				URL:      "https://github.com/" + "documize" + "/" + repo + "/tree/" + vb,
			}
		}
		c.Lists = append(c.Lists, render...)
	}
	c.Owner = "documize"
	c.ReportOrder = []string{tagSummaryData, tagMilestonesData, tagIssuesData /*, tagPullRequestData*/, tagCommitsData}
	c.BranchLines = 100 // overide js default of 30 with maximum allowable in one call

	sort.Stable(branchesToSort(c.Lists)) // get the configured branches in a sensible order for printing
	for i := range c.Lists {
		if i != len(c.Lists)-1 {
			c.Lists[i].Comma = true // put the commas in the right places
		}
	}

}

type githubCallbackT struct {
	AccessToken string `json:"access_token"`
}

func repoName(branchName string) string {
	bits := strings.Split(branchName, "/")
	if len(bits) != 2 {
		return branchName + "?repo"
	}
	pieces := strings.Split(bits[1], ":")
	if len(pieces) == 0 {
		return branchName + "?repo:?branch"
	}
	return pieces[0]
}
