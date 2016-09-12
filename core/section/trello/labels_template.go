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

package trello

const labelsTemplate = `
<div class="section-trello-render">
	{{if gt (len .SharedLabels) 0}}
		<div class="heading">Labels</div>
		<p>There are {{len .SharedLabels}} common labels across the boards.</p>
		<div class="section-trello-render">
			<table class="trello-table" class="width-100">
				<tbody class="trello">
				{{range $l := .SharedLabels}}
					<tr>
						<td class="no-width">
							<span class="trello-label" style="background-color: {{ $l.Color }}">{{ $l.Name }} ({{len $l.Boards}})</span>
						</td>
						<td>
							{{range $idx, $brd := $l.Boards}}{{if gt $idx 0}}, {{end}}<a class="link" href="{{$brd.URL}}">{{$brd.OrgName}}::{{$brd.Name}}</a>{{end}}.
						</td>
					</tr>
				{{end}}
				</tbody>
			</table>
		</div>
	{{end}}
</div>
`
