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
	rawMSsvg  = `<path d="M8 2H6V0h2v2zm4 5H2c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h10l2 2-2 2zM8 4H6v2h2V4zM6 16h2V8H6v8z"></path>`
	openMSsvg = `
		<span title="Open milestone">
			<svg height="16" width="14" version="1.1" viewBox="0 0 14 16">
				` + rawMSsvg + `
			</svg>
		</span>
		`
	closedMSsvg = `
		<span title="Closed milestone">
			<svg aria-hidden="true" class="octicon octicon-check" height="16" version="1.1" viewBox="0 0 12 16" width="12">
				<path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path>
			</svg>
		</span>
		`
	milestonesTemplate = `

	<div class="section-github-render">
	{{if .HasMilestones}}
		<h3>Milestones</h3>
		<p>
			There are
			{{.ClosedMS}}
			{{if eq 1 .ClosedMS}} milestone {{else}} milestones {{end}}
			closed and {{.OpenMS}}
			{{if eq 1 .OpenMS}} milestone {{else}} milestones {{end}}
			open across {{.RepoCount}}
			{{if eq 1 .RepoCount}} repository. {{else}} repositories. {{end}}
		</p>
		<div class="github-board">
		<table class="milestone-table" style="width: 100%;">
		    <tbody class="github">
			{{range $data := .Milestones}}
		        <tr>
					<td style="width:5%;">
						{{if $data.IsMilestone}}
							{{if $data.IsOpen}}
								` + openMSsvg + `
							{{else}}
								` + closedMSsvg + `
							{{end}}
						{{end}}
					</td>
		            <td style="width:55%;">
					<h6>{{$data.Name}}</h6>
						{{if $data.IsMilestone}}
							<span class="date-meta">{{$data.DueDate}}</span>
						{{end}}<br>
						<span class="repo"><a class="link" href="{{$data.URL}}">{{$data.Repo}}</a></span>
					</td>
		            <td style="width:40%;">
						{{if $data.IsMilestone}}
							<progress value="{{$data.Progress}}" max="100"></progress> <br>
							{{$data.CompleteMsg}} complete {{$data.OpenIssues}} open {{$data.ClosedIssues}} closed
						{{else}}
							{{$data.OpenIssues}} open {{$data.ClosedIssues}} closed
						{{end}}
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
