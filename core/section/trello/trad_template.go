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
		<div class="heading">
			<h3><a href="{{ .Detail.Board.URL }}">{{.Detail.Board.Name}} Board</a></h3>
			<p>There are {{ .Detail.CardCount }} cards across {{ .Detail.ListCount }} lists</p>
		</div>

		<p class="non-printable-message">Non-printable</p>
		<div class="section-trello-render non-printable">
			<div class="single-trello-board">
			<table class="trello-single-board" style="width: 100%;">
				{{range $data := .Detail.Data}}
				<thead>
					<tr>
						<th class="title">{{ $data.List.Name }} <span>{{len $data.Cards}} cards</span></th>
						<th></th>
					</tr>
				</thead>

				<tbody>
					{{range $card := $data.Cards}}
					<tr>
						<td>
						<a href="{{ $card.URL }}">
							<div class="trello-card">
								{{ $card.Name }}
							</div>
						</a>
						</td>
						<td style="text-align:right;">
							{{range $label := $card.Labels}}
								<span class="trello-label" style="background-color:{{$label.Color}}"> {{$label.Name}} </span>
							{{end}}
						</td>
					</tr>
					{{end}}
				</tbody>
				{{end}}
			</table>

			</div>
		</div>
	{{end}}
</div>

`
