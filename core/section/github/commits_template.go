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
	<table>
	{{range $commit := .BranchCommits}}
		<tr>
			<td>
				{{if $commit.ShowRepo}}{{$commit.Repo}}{{end}} 
			</td>
			<td>
				{{if $commit.ShowBranch}}{{$commit.Branch}}{{end}}
			</td>
			<td>
				{{if $commit.ShowDate}}{{$commit.Date}}{{end}}
			</td>
			<td>
				{{if $commit.ShowUser}}
					<img alt="@{{$commit.Name}}" src="{{$commit.Avatar}}" height="36" width="36"> {{$commit.Name}}
				{{end}}
			</td>
			<td>
				<a class="link" href="{{$commit.URL}}">{{$commit.Message}}</a>
			</td>
		</tr>
	{{end}}
	</table>
</div>
`
