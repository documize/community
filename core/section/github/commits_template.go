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

	<h3>Contributors</h3>
	<p>
		There 
		{{if eq 1 (len .AuthorStats)}}is{{else}}are{{end}}
		{{len .AuthorStats}}
		{{if eq 1 (len .AuthorStats)}}contributor{{else}}contributors{{end}}
		across {{.RepoCount}} 
		{{if eq 1 .RepoCount}} repository. {{else}} repositories. {{end}}
	</p>
	<table class="contributor-table" style="width: 100%;">

		<tbody class="github">
		{{range $stats := .AuthorStats}}
			<tr>
				<td style="width: 5%;">
					<img alt="@{{$stats.Author}}" src="{{$stats.Avatar}}" height="36" width="36">
				</td>

				<td style="width:50%;">
					{{$stats.Author}} has been assigned {{$stats.OpenIssues}} issues, {{$stats.ClosedIssues}} are now closed, has made {{$stats.CommitCount}} commit on 6 branches.
					<br>
					{{range $repo := $stats.Repos}}	{{$repo}}, {{end}}
				</td>

			</tr>
		{{end}}
		</tbody>
	</table>
{{end}}

{{if .HasCommits}}
	<h3>Commits</h3>

	<table class="contributor-table" style="width: 100%;">
		<thead class="github">
			<tr>
				<th class="title">Contributor</th>
				<th class="title">Commits / Date</th>
				<th class="title">Repository:Branch</th>
			</tr>
		</thead>

		<tbody class="github">
		{{range $commit := .BranchCommits}}
			<tr>
				<td style="width: 20%;">
					{{if $commit.ShowUser}}
					<div class="github-avatar">
						<img alt="@{{$commit.Name}}" src="{{$commit.Avatar}}" height="36" width="36">
					</div>
					 {{$commit.Name}}
					{{end}}
				</td>
				<td style="width: 40%;">
					<a class="link" href="{{$commit.URL}}">{{$commit.Message}}</a><br>
					<span class="date-meta">{{if $commit.ShowDate}}{{$commit.Date}}{{end}}</span>
				</td>
				<td style="width: 30%;">{{if $commit.ShowBranch}}{{$commit.Repo}}:{{$commit.Branch}}{{end}}</td>
			</tr>
		{{end}}
		</tbody>
	</table>

{{end}}

</div>
`
