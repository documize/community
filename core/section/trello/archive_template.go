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

const archiveTemplate = `
<h3>Deleted and Archived Cards</h3>
<p>Changes since {{.Since}}.</p>
<div class="section-trello-render">
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
					{{range $act := $b.Actions}}
						{{if eq $act.Type "deleteCard" }}
						Deleted:
							{{$act.Data.List.Name}} : {{$act.Data.Card.Name}} - {{$act.Data.Text}}
						{{end}}
					{{end}}
					{{range $arch := $b.Archived}}
						Archived:
							{{$arch.Name}} - {{$arch.Desc}}
						<br>
					{{end}}
				</td>
			</tr>
		{{end}}
		</tbody>
	</table>
</div>
`
