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

	gogithub "github.com/google/go-github/github"
)

const (
	tagSummaryData = "summaryData"
)

// sort branches in order that that should be presented.

type branchesToSort []githubBranch

func (s branchesToSort) Len() int      { return len(s) }
func (s branchesToSort) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s branchesToSort) Less(i, j int) bool {
	return s[i].URL < s[j].URL
}

func init() {
	reports[tagSummaryData] = report{refreshSummary, renderSummary, `
<div class="section-github-render">
	<h3>Summary</h3>
	<div class="github-board">
		For repository branches:
		<ul>
			{{range $data := .Config.Lists}}
				{{if $data.Included}}
					<li>
						<a class="link" href="{{$data.URL}}">
							{{$data.Owner}}/{{$data.Repo}}:{{$data.Name}}
						</a>
					</li>
				{{end}}
			{{end}}
		</ul>
		<table style="width:80%">
			<tr>
				<th></th>
				<th colspan=2>Closed since {{.Config.Since}}{{.Config.DateMessage}}</th>
				<th colspan=2>Still Open</th>
	  		</tr>
			<tr>
				<td>Milestones</td>
				<th width=20>` + closedMSsvg + `</td>
				<td>{{.ClosedMS}}</td>
				<td width=20>` + openMSsvg + `</td>
				<td>{{.OpenMS}}</td>
			</tr>
			<tr>
				<td>Issues</td>
				<td>` + closedIsvg + `</td>
				<td>{{.ClosedIssues}}</td>
				<td>` + openIsvg + `</td>
				<td>{{.OpenIssues}}</td>
			</tr>
			<tr>
				<td>Pull requests</td>
				<td>` + closedPRsvg + `</td>
				<td>{{.ClosedPRs}}</td>
				<td>` + openPRsvg + `</td>
				<td>{{.OpenPRs}}</td>
			</tr>
		</table>
	</div>
</div>
`}
}

func refreshSummary(gr *githubRender, config *githubConfig, client *gogithub.Client) (err error) {
	return nil
}

func renderSummary(payload *githubRender, c *githubConfig) error {
	sort.Stable(branchesToSort(c.Lists)) // get the configured branches in a sensible order before printing
	return nil
}
