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
`
