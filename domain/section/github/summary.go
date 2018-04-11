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

import gogithub "github.com/google/go-github/github"

const (
	tagSummaryData = "summaryData"
)

// sort branches in order that they should be presented.

type branchesToSort []githubBranch

func (s branchesToSort) Len() int      { return len(s) }
func (s branchesToSort) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s branchesToSort) Less(i, j int) bool {
	return s[i].URL < s[j].URL
}

func init() {
	reports[tagSummaryData] = report{refreshSummary, renderSummary, summaryTemplate}
}

func refreshSummary(gr *githubRender, config *githubConfig, client *gogithub.Client) (err error) {
	return nil
}

func renderSummary(payload *githubRender, c *githubConfig) error {
	return nil
}
