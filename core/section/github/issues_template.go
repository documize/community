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
		<svg height="16" version="1.1" viewBox="0 0 14 16" width="14" class="color: #6cc644;">
			<path d="M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"></path>
		</svg>
	</span>
`
	closedIsvg = `
	<span title="Closed issue">
		<svg height="16" version="1.1" viewBox="0 0 16 16" width="16" class="color: #bd2c00;">
			<path d="M7 10h2v2H7v-2zm2-6H7v5h2V4zm1.5 1.5l-1 1L12 9l4-4.5-1-1L12 7l-1.5-1.5zM8 13.7A5.71 5.71 0 0 1 2.3 8c0-3.14 2.56-5.7 5.7-5.7 1.83 0 3.45.88 4.5 2.2l.92-.92A6.947 6.947 0 0 0 8 1C4.14 1 1 4.14 1 8s3.14 7 7 7 7-3.14 7-7l-1.52 1.52c-.66 2.41-2.86 4.19-5.48 4.19v-.01z"></path>
		</svg>
	</span>
	`
	issuesTemplate = `
<div class="section-github-render">
{{if .HasIssues}}
	<h3>Issues</h3>
	<p>There are {{.ClosedIssues}} closed and {{.OpenIssues}} open</p>
	<p>
		{{if .ShowList}}
			Including issues labelled
			{{range $label := .List}}
				{{if $label.Included}}
					<span class="github-issue-label" style="background-color:#{{$label.Color}}">{{$label.Name}}</span>
				{{end}}
			{{end}}
		{{end}}
	</p>
	<div class="github-board">



	<table class="issue-table" style="width: 100%;">
	    <thead class="github">
	        <tr>
				<th class="title">Repository / Milestone</th>
				<th class="title">Issues</th>
	        </tr>
	    </thead>

	    <tbody class="github">
		{{range $data := .Issues}}
	        <tr>
	            <td style="width: 30%;">
					<span><a class="link" href="{{$data.URL}}">{{$data.Repo}}</a></span>{{if $data.Private}}<span class="label-private">Private</span>{{end}}</br>
					<span class="milestone">{{$data.Milestone}}</span>
				</td>
				<td style="width: 70%;">
					<li class="github-commit-item">
					<a class="link" href="{{$data.URL}}">
						<div class="issue-avatar">
							{{if $data.IsOpen}}
								` + openIsvg + `
							{{else}}
								` + closedIsvg + `
							{{end}}
						</div>
						<div class="github-commit-body">
							<div class="github-commit-title"><span class="label-name">{{$data.Message}}</span> {{$data.Labels}}</div>
							<div class="github-commit-meta">
								#{{$data.ID}} opened on {{$data.Date}} by {{$data.Name}}, last updated {{$data.Updated}}
							</div>
						</div>
					</a>
					</li>
				</td>
	        </tr>
		{{end}}
	    </tbody>

	</table>
	</div>
{{end}}
</div>
`
)
