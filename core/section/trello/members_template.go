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

const membersTemplate = `
{{if gt (len .Boards) 0}}
	<div class="heading">Member Stats</div>
	<p>
		There are {{len .MemberBoardAssign}} members assigned to {{.CardAssignTotal}} cards	of the total {{.CardTotal}} cards across {{len .Boards}} boards.
	</p>

	<div class="section-trello-render">
		<table class="trello-table" class="width-100">
			<tbody>

			{{range $m := .MemberBoardAssign}}
				<tr>
					<td>
						<img class="trello-avatar" src="https://trello-avatars.s3.amazonaws.com/{{$m.AvatarHash}}/50.png" height="50" alt="Member Avatar">
					</td>
					<td>
						<h6>{{$m.MemberName}}</h6>
						<p>
							{{range $idx, $ac := $m.AssignCounts}}{{if gt $idx 0}}, {{end}}{{$ac.BoardName}} ({{$ac.Count}}){{end}}.
						</p>
					</td>
				</tr>
			{{end}}
			</tbody>
		</table>
	</div>
{{end}}
`
