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

const renderTemplate = `
<h3>Header for Trello Multi-Board Test (in master_template.go)</h3>
` + labelsTemplate +
	boardsTemplate +
	graphsTemplate +
	membersTemplate +
	archiveTemplate +
	tradTemplate +
	``

const oldSave = `
<b>Labels</b><br>
{{range $l := .SharedLabels}}
	<span style="background-color: {{ $l.Color }}">{{ $l.Name }}</span>
	{{range $brd := $l.Boards}}
		{{ $brd }},
	{{end}}
	<br>
{{end}}
<br>
All Boards<br>
<br>
<b>Single Boards (graphs)</b><br>
{{range $b := .Boards}}
	<div>
		<p>There are {{ $b.CardCount }} cards across {{ $b.ListCount }} lists for board <a href="{{ $b.Board.URL }}">{{$b.Board.Name}}.</a></p>
		<div>
			{{range $data := $b.Data}}
				<div style="background-color: {{$b.Board.Prefs.BackgroundColor}}">
					<progress value="{{len $data.Cards}}" max="{{ $b.CardCount }}"></progress> {{ $data.List.Name }}
				</div>
			{{end}}
		</div>
	</div>
{{end}}

<br>
<b>Member Stats</b><br>
{{range $m := .MemberBoardAssign}}
	<img src="https://trello-avatars.s3.amazonaws.com/{{$m.AvatarHash}}/50.png">
	{{$m.MemberName}} : 
	{{range $ac := $m.AssignCounts}}
		{{$ac.BoardName}} ({{$ac.Count}}),
	{{end}}
	<br>
{{end}}
<br>
Archive?<br>
<br>

<b>Previous version</b>

{{range $b := .Boards}}
	<p class="non-printable-message">Non-printable</p>
	<div class="section-trello-render non-printable">
		<p>There are {{ $b.CardCount }} cards across {{ $b.ListCount }} lists for board <a href="{{ $b.Board.URL }}">{{$b.Board.Name}}.</a></p>
		<div class="trello-board" style="background-color: {{$b.Board.Prefs.BackgroundColor}}">
			<a href="{{ $b.Board.URL }}"><div class="trello-board-title">{{$b.Board.Name}}</div></a>
			{{range $data := $b.Data}}
				<div class="trello-list">
					<div class="trello-list-title">{{ $data.List.Name }}</div>
					{{range $card := $data.Cards}}
						<a href="{{ $card.URL }}">
							<div class="trello-card">
								{{ $card.Name }}
							</div>
						</a>
					{{end}}
				</div>
			{{end}}
		</div>
	</div>
{{end}}
`
