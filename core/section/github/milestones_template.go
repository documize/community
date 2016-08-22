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
	<h3>Milestones: {{.ClosedMS}} closed, {{.OpenMS}} open</h3>
	<div class="github-board">
	<ul class="github-list">
		{{range $data := .Milestones}}
			<li class="github-commit-item">
				<a class="link" href="{{$data.URL}}">
					<div class="issue-avatar">
						{{if $data.IsOpen}}
							` + openMSsvg + `
						{{else}}
							` + closedMSsvg + `
						{{end}}
				  	</div>
					<div class="github-commit-body">
						<div class="github-commit-title"><span class="label-name">{{$data.Repo}} - {{$data.Name}}</span> 
						{{if $data.IsMilestone}}
							<progress value="{{$data.Progress}}" max="100">
						{{end}}
						</div>
						<div class="github-commit-meta">
						  {{$data.DueDate}} Last updated {{$data.UpdatedAt}}. 
						  {{$data.CompleteMsg}} complete {{$data.OpenIssues}} open {{$data.ClosedIssues}} closed
						</div>
					</div>
				</a>
				<div class="clearfix" />
			</li>
		{{end}}
	</ul>
	</div>
</div>
`
)
