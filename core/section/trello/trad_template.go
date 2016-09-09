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

const tradTemplate = `
{{if false}}
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
{{end}}
`
