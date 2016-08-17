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
	"time"

	"github.com/documize/community/core/log"

	gogithub "github.com/google/go-github/github"
)

type githubRender struct {
	Config           githubConfig          `json:"config"`
	Repo             githubRepo            `json:"repo"`
	List             []githubBranch        `json:"list"`
	ShowList         bool                  `json:"showList"`
	ShowIssueNumbers bool                  `json:"showIssueNumbers"`
	BranchCommits    []githubBranchCommits `json:"branchCommits"`
	CommitCount      int                   `json:"commitCount"`
	Issues           []githubIssue         `json:"issues"`
	SharedLabels     []template.HTML       `json:"sharedLabels"`
	OpenIssues       int                   `json:"openIssues"`
	ClosedIssues     int                   `json:"closedIssues"`
	Limit            int                   `json:"limit"`
	Milestones       []githubMilestone     `json:"milestones"`
	OpenMS           int                   `json:"openMS"`
	ClosedMS         int                   `json:"closedMS"`
	PullRequests     []githubPullRequest   `json:"pullRequests"`
	OpenPRs          int                   `json:"openPRs"`
	ClosedPRs        int                   `json:"closedPRs"`
	AuthorStats      []githubAuthorStats   `json:"authorStats"`
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
	debugList := []string{"community", "enterprise", "test-data"}
	c.Lists = make([]githubBranch, 0, len(debugList))
	for rid, repo := range debugList {
		c.Lists = append(c.Lists, githubBranch{
			ID:       fmt.Sprintf("%d", rid+1),
			Owner:    "documize",
			Repo:     repo,
			Name:     "master",
			Included: true,
			URL:      "https://github.com/documize/" + repo + "/tree/master",
			Color:    "",
		})
	}
	c.ReportOrder = []string{tagSummaryData, tagMilestonesData, tagIssuesData, tagPullRequestData, tagCommitsData}
	c.BranchLines = 100 // overide js default of 30 with maximum allowable in one call

}

type githubCallbackT struct {
	AccessToken string `json:"access_token"`
}
