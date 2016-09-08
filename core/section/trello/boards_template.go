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

<b>All Boards</b><br>
{{range $b := .Boards}}
	<div>
		<p>There are {{ len $b.Actions }} actions for board <a href="{{ $b.Board.URL }}">{{$b.Board.Name}}.</a></p>
		<div>
			{{range $act := $b.Actions}}
                {{$act.Date}} {{$act.Type}} {{$act.MemberCreator.FullName}} <br>
			{{end}}
		</div>
	</div>
{{end}}


<br>
`
