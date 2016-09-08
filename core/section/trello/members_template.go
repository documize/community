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
<h3>Member Stats</h3>
<p> There are {{len .MemberBoardAssign}} members assigned to ##9 cards across {{len .Boards}} boards.</p>

<div class="section-trello-render non-printable">
	<table class="trello-table" class="width-100">
		<tbody>

		{{range $m := .MemberBoardAssign}}
			<tr>
				<td class="width-15">
					<img class="trello-avatar" src="https://trello-avatars.s3.amazonaws.com/{{$m.AvatarHash}}/50.png" height="50" alt="Member Avatar">
				</td>
				<td class="width-85">
					<h6>{{$m.MemberName}}</h6>
					{{range $ac := $m.AssignCounts}}
						{{$ac.BoardName}} ({{$ac.Count}}),
					{{end}}
				</td>
			</tr>
		{{end}}
		</tbody>
	</table>
</div>

`
