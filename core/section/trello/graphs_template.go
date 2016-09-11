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

const graphsTemplate = `
{{if false}}

	<div class="heading">Single Boards (graphs)</div>
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

{{end}}
`
