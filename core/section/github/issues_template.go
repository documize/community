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

const (
	openIsvg = `
		<span title="Open issue">
			<svg height="16" version="1.1" viewBox="0 0 14 16" width="14" class="color:#6cc644;">
				<path d="M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"></path>
			</svg>
		</span>
	`
	closedIsvg = `
		<span title="Closed issue">
			<svg height="16" version="1.1" viewBox="0 0 16 16" width="16" class="color:#bd2c00;">
				<path d="M7 10h2v2H7v-2zm2-6H7v5h2V4zm1.5 1.5l-1 1L12 9l4-4.5-1-1L12 7l-1.5-1.5zM8 13.7A5.71 5.71 0 0 1 2.3 8c0-3.14 2.56-5.7 5.7-5.7 1.83 0 3.45.88 4.5 2.2l.92-.92A6.947 6.947 0 0 0 8 1C4.14 1 1 4.14 1 8s3.14 7 7 7 7-3.14 7-7l-1.52 1.52c-.66 2.41-2.86 4.19-5.48 4.19v-.01z"></path>
			</svg>
		</span>
		`
	issuesTemplate = `
<div class="section-github-render">
{{if .HasIssues}}
	<div class="heading">Issues</div>
	<p>
		There are {{.ClosedIssues}} closed
			{{if eq 1 .ClosedIssues}}issue{{else}}issues{{end}}
		 	and {{.OpenIssues}} open
		 	{{if eq 1 .OpenIssues}}issue{{else}}issues{{end}}
		 across {{.RepoCount}}
		{{if eq 1 .RepoCount}} repository. {{else}} repositories. {{end}}
	</p>

	<div class="margin-top-20"></div>
	<table class="github-table no-width">
		<tbody>
			{{range $data := .Issues}}
				<tr>
					<td class="no-width">
						<div class="issue-symbol">
							{{if $data.IsOpen}}
								` + openIsvg + `
							{{else}}
								` + closedIsvg + `
							{{end}}
						</div>
					</td>
					<td><div class="margin-left-10"></div></td>
					<td class="no-width">
						<div class="issue-name"><a href="{{$data.URL}}">{{$data.Message}} <span class="dataid"></span></a></div>
						<span class="milestone-meta">#{{$data.ID}} &middot; {{$data.Repo}} &middot; {{$data.Milestone}} &middot; {{$data.Creator}} opened on {{$data.Date}}</span>
						<div>{{$data.Labels}}</div>
					</td>
				</tr>
			{{end}}
		</tbody>
	</table>
{{end}}
</div>
`
)
