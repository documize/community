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

package github

const summaryTemplate = `
<div class="section-github-render">
	<h3>
		Activity since {{.Config.Since}}{{.Config.DateMessage}} for {{.Config.Owner}} repositories:
		{{range $data := .Config.Lists}}
			{{if $data.Included}}
					<a class="link" href="{{$data.URL}}">
						{{$data.Repo}}{{if $data.Comma}},{{end}}
					</a>
			{{end}}
		{{end}}
	</h3>
	<h3>
		Common Labels: <br>
		{{range $slabel := .SharedLabels}}
			{{$slabel.Name}} {{$slabel.Count}} {{$slabel.Repos}} <br>
		{{end}}
	</h3>
</div>
`
