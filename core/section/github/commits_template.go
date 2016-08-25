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

const commitsTemplate = `
<div class="section-github-render">

{{if .HasAuthorStats}}

	<h3>Contributor activity since {{.Config.Since}}{{.Config.DateMessage}}</h3>
	<table class="contributor-table" style="width: 100%;">
		<thead class="github">
			<tr>
				<th class="title">Contributor</th>
				<th class="title">Assigned/Closed</th>
				<th class="title">#Commits</th>
				<th class="title">Branches</th>
			</tr>
		</thead>

		<tbody class="github">
		{{range $stats := .AuthorStats}}
			<tr>
				<td style="width: 20%;">
					<div class="github-avatar">
						<img alt="@{{$stats.Author}}" src="{{$stats.Avatar}}" height="36" width="36">
					</div>
					{{$stats.Author}}
				</td>
				<td style="width: 15%;">{{$stats.OpenIssues}} / {{$stats.ClosedIssues}}</td>
				<td style="width: 15%;">{{$stats.CommitCount}}</td>
				<td style="width: 50%;">
					{{range $repo := $stats.Repos}}
						{{$repo}}<br>
					{{end}}
				</td>
			</tr>
		{{end}}
		</tbody>
	</table>
{{end}}

{{if .HasCommits}}
	<h3>Commits activity since {{.Config.Since}}{{.Config.DateMessage}}</h3>

	<table class="contributor-table" style="width: 100%;">
		<thead class="github">
			<tr>
				<th class="title">Repository:Branch</th>
				<th class="title">Date</th>
				<th class="title">Contributor</th>
				<th class="title">Commits</th>
			</tr>
		</thead>

		<tbody class="github">
		{{range $commit := .BranchCommits}}
			<tr>
				<td style="width: 20%;">{{if $commit.ShowBranch}}{{$commit.Repo}}:{{$commit.Branch}}{{end}}</td>
				<td style="width: 15%;">{{if $commit.ShowDate}}{{$commit.Date}}{{end}}</td>
				<td style="width: 15%;">
					{{if $commit.ShowUser}}
					<div class="github-avatar">
						<img alt="@{{$commit.Name}}" src="{{$commit.Avatar}}" height="36" width="36">
					</div>
					 {{$commit.Name}}
					{{end}}
				</td>
				<td style="width: 50%;"><a class="link" href="{{$commit.URL}}">{{$commit.Message}}</td>
			</tr>
		{{end}}
		</tbody>
	</table>

{{end}}

</div>
`
