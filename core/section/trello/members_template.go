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
<div class="section-trello-render">
	{{if gt (len .Boards) 0}}
		<div class="heading">Member Stats</div>
		<p>
			There are {{len .MemberBoardAssign}} members assigned to {{.CardAssignTotal}} cards	of the total {{.CardTotal}} cards across {{len .Boards}} boards.
		</p>

		<div class="section-trello-render">
			<table class="trello-table no-width">
				<tbody>

				{{range $m := .MemberBoardAssign}}
					<tr>
						<td class="no-width">
							<img class="trello-avatar" src="https://trello-avatars.s3.amazonaws.com/{{$m.AvatarHash}}/50.png" alt="Member Avatar">
						</td>
						<td>
							<div class="member-name">{{$m.MemberName}}</div>
							<div class="member-meta">
								{{range $idx, $ac := $m.AssignCounts}}{{if gt $idx 0}}, {{end}}{{$ac.BoardName}} ({{$ac.Count}}){{end}}.
							</div>
						</td>
					</tr>
				{{end}}
				</tbody>
			</table>
		</div>
	{{end}}
</div>
`
