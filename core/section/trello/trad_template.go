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
<div class="section-trello-render">
	{{if ne .Detail.Board.ID ""}}
		<div class="heading">Board: {{.Detail.Board.Name}}</div>
		<p class="non-printable-message">Non-printable</p>
		<div class="section-trello-render non-printable">
			<p>There are {{ .Detail.CardCount }} cards across {{ .Detail.ListCount }} lists
			for board <a href="{{ .Detail.Board.URL }}">{{.Detail.Board.Name}}.</a></p>
			<div class="single-trello-board" style="background-color: {{.Detail.Board.Prefs.BackgroundColor}}">
				<a href="{{ .Detail.Board.URL }}"><div class="trello-board-title">{{.Detail.Board.Name}}</div></a>
				{{range $data := .Detail.Data}}
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
</div>
`
