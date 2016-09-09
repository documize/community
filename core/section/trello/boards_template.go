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

<h3>All Boards</h3>
Changes since ###1 Aug 2016###.

<p>{{len .Boards}} Boards, ###30 Lists, {{.CardTotal}} Cards, {{len .MemberBoardAssign}} Members, #10 Archived</p>

{{range $b := .Boards}}
	<div>
		<p>There are {{ len $b.Actions }} actions for board
			<a href="{{ $b.Board.URL }}">
				<span style="background-color: {{$b.Board.Prefs.BackgroundColor}}">{{$b.Board.Name}}</span>
			</a>
		</p>
		<div>
			{{range $idx, $act := $b.ActionSummary}}
				{{$act}} {{$idx}},
			{{end}}
			{{if gt (len $b.Archived) 0}}
				archiveCard
				{{len $b.Archived}}.
				<br>
			{{end}}
		</div>
	</div>
{{end}}


<br>
`
