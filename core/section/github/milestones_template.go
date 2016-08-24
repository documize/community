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
	<svg height="8" width="7" version="1.1" viewBox="0 0 14 16">
		` + rawMSsvg + `
	</svg>
</span>
`
	milestonesTemplate = `
<div class="section-github-render">

	{{if .HasMilestones}}
		<h3>Milestones: {{.ClosedMS}} closed, {{.OpenMS}} open</h3>
		<div class="github-board">
		<table class="milestone-table" style="width: 100%;">
		    <thead>
		        <tr>
		            <th class="title">Repository</th>
		            <th class="title">Milestone</th>
		            <th class="title">Issue Progress</th>
					<th class="title">X</th>
		        </tr>
		    </thead>

		    <tbody>
			{{range $data := .Milestones}}
		        <tr>
		            <td style="width: 25%;">{{$data.Repo}} </td>
		            <td style="width: 20%;">{{$data.Name}} <br>
						{{if $data.IsMilestone}}
							{{$data.DueDate}} Last updated {{$data.UpdatedAt}}.
						{{end}}
					</td>
		            <td style="width: 45%;">
						{{if $data.IsMilestone}}
							<progress value="{{$data.Progress}}" max="100"></progress> <br>
							{{$data.CompleteMsg}} complete {{$data.OpenIssues}} open {{$data.ClosedIssues}} closed
						{{else}}
							{{$data.OpenIssues}} open {{$data.ClosedIssues}} closed
						{{end}}
					</td>
					<td style="width: 10%;">
						{{if $data.IsOpen}}
							` + openMSsvg + `
						{{else}}
							` + closedMSsvg + `
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
