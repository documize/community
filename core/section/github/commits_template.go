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
<h3>Contributor activity since {{.Config.Since}}{{.Config.DateMessage}}</h3>
<div class="section-github-render">
	<table style="width:80%">
		<tr>
			<th></th>
    		<th>Author</th>
			<th>Open Issues</th>
			<th>Closed Issues</th>
    		<th>#commits</th>
    		<th>Branches</th>
  		</tr>
		{{range $stats := .AuthorStats}}
			<tr>
				<td>
					<div class="github-avatar">
						<img alt="@{{$stats.Author}}" src="{{$stats.Avatar}}" height="36" width="36">
					</div>
				</td>
				<td>{{$stats.Author}}</td>
				<td>{{$stats.OpenIssues}}</td>
				<td>{{$stats.ClosedIssues}}</td>
				<td>{{$stats.CommitCount}}</td>
				<td>
					{{range $repo := $stats.Repos}}
						{{$repo}}<br>
					{{end}}
				</td>
			</tr>
		{{end}}
	</table>
	{{range $branch := .BranchCommits}}
		<h4>
			There are {{ $branch.CommitCount }} commits for branch <a href="{{$branch.URL}}">{{$branch.Name}}</a>.
		</h4>
		<div class="github-board">
			{{range $data := $branch.Days}}
				<div class="github-group-title">
					Commits on {{ $data.Day }}
				</div>
				<ul class="github-list">
					{{range $commit := $data.Commits}}
						<li class="github-commit-item">
							<a class="link" href="{{$commit.URL}}">
								<div class="github-avatar">
									<img alt="@{{$commit.Name}}" src="{{$commit.Avatar}}" height="36" width="36">
								</div>
								<div class="github-commit-body">
									<div class="github-commit-title">{{$commit.Message}}</div>
									<div class="github-commit-meta">{{$commit.Name}} committed on {{$commit.Date}}</div>
								</div>
							</a>
							<div class="clearfix" />
						</li>
					{{end}}
				</ul>
			{{end}}
		</div>
	{{end}}
</div>
`
