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

const boardsTemplate = `

<h3>Boards</h3>
<p>Changes since {{.Since}}.</p>
<div class="section-trello-render">
	<table class="trello-table" class="width-100">
		<tbody class="board-stats">
			<tr>
				<td>
					<span class="stat-number">{{len .Boards}}</span> Boards
				</td>
				<td>
					<span class="stat-number">{{.ListTotal}}</span> Lists
				</td>
				<td>
					<span class="stat-number">{{.CardTotal}}</span> Cards
				</td>
				<td>
					<span class="stat-number">{{len .MemberBoardAssign}}</span> Members
				</td>
			</tr>
		</tbody>
	</table>
	<table class="trello-table" class="width-100">
		<tbody class="trello">
		{{range $b := .Boards}}
			<tr>
				<td>
					<a href="{{ $b.Board.URL }}">
						<span class="trello-board" style="background-color: {{$b.Board.Prefs.BackgroundColor}}">{{$b.Board.Name}}</span>
					</a>
				</td>
				<td>
					<h6>There are {{ len $b.Actions }} actions for this board.</h6>
					<p>
						{{range $act, $tot := $b.ActionSummary}}
							{{$act}} ({{$tot}}),
						{{end}}
						{{if gt (len $b.Archived) 0}}
							archive card ({{len $b.Archived}}).
							<br>
						{{end}}
					</p>
				</td>
			</tr>
		{{end}}
		</tbody>
	</table>
</div>
`
