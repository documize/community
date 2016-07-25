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

// THIS TO KEEP UNUSED CODE FOR THIS POSSIBLE FUTURE FUNCITON

/*
type githubIssueActivity struct {
	Date    string        `json:"date"`
	Event   string        `json:"event"`
	Message template.HTML `json:"message"`
	URL     template.URL  `json:"url"`
	Name    string        `json:"name"`
	Avatar  string        `json:"avatar"`
}
*/

// FROM renderTemplates

/* "issuenum_data": `
   <div class="section-github-render">
   	<p>
   		Activity for issue #{{.IssueNum}} in repository <a href="{{ .Repo.URL }}/issues">{{.Repo.Name}}.</a>
   		Up to {{ .Limit }} items are shown{{ .DateMessage }}.
   	</p>
   	<div class="github-board">
   	<ul class="github-list">
   		{{range $data := .IssueNumActivity}}
   			<li class="github-commit-item">
   				<div class="github-avatar">
   					<img alt="@{{$data.Name}}" src="{{$data.Avatar}}" height="36" width="36">
   				</div>
   				<div class="github-commit-meta">
   					{{$data.Name}} <a class="link" href="{{$data.URL}}">{{$data.Event}}</a> {{$data.Date}}
   				</div>
   				<div class="github-commit-body">
   					<div class="github-commit-title">
   						{{$data.Message}}
   					</div>
   				</div>
   				<div class="clearfix" />
   			</li>
   		{{end}}
   	</ul>
   	</div>
   </div>
   `,*/

// FROM Command()
/*case "issuenum_data":

render, err := t.getIssueNum(client, config)
if err != nil {
	log.Error("github getIssueNum:", err)
	provider.WriteError(w, "github", err)
	return
}

provider.WriteJSON(w, render)*/

// FROM Refresh()
/*case "issuenum_data":
refreshed, err := t.getIssueNum(t.githubClient(c), c)
if err != nil {
	log.Error("unable to get github issue number activity", err)
	return data
}
j, err := json.Marshal(refreshed)
if err != nil {
	log.Error("unable to marshall github issue number activity", err)
	return data
}
return string(j)*/

// FROM Render()
/* case "issuenum_data":
payload.IssueNum = c.IssueNum
raw := []githubIssueActivity{}

if len(data) > 0 {
	err = json.Unmarshal([]byte(data), &raw)
	if err != nil {
		log.Error("unable to unmarshall github issue activity data", err)
		return "Documize internal github json umarshall issue activity data error: " + err.Error()
	}
}

opt := &gogithub.MarkdownOptions{Mode: "gfm", Context: c.Owner + "/" + c.Repo}
client := p.githubClient(c)
for k, v := range raw {
	if v.Event == "commented" {
		output, _, err := client.Markdown(string(v.Message), opt)
		if err != nil {
			log.Error("convert commented text to markdown", err)
		} else {
			raw[k].Message = template.HTML(output)
		}
	}
}
payload.IssueNumActivity = raw */

/*
func (*Provider) getIssueNum(client *gogithub.Client, config githubConfig) ([]githubIssueActivity, error) {

	ret := []githubIssueActivity{}

	issue, _, err := client.Issues.Get(config.Owner, config.Repo, config.IssueNum)

	if err == nil {
		n := ""
		a := ""
		p := issue.User
		if p != nil {
			if p.Login != nil {
				n = *p.Login
			}
			if p.AvatarURL != nil {
				a = *p.AvatarURL
			}
		}
		ret = append(ret, githubIssueActivity{
			Name:    n,
			Event:   "created",
			Message: template.HTML(*issue.Title),
			Date:    "on " + issue.UpdatedAt.Format("January 2 2006, 15:04"),
			Avatar:  a,
			URL:     template.URL(*issue.HTMLURL),
		})
		ret = append(ret, githubIssueActivity{
			Name:    n,
			Event:   "described",
			Message: template.HTML(*issue.Body),
			Date:    "on " + issue.UpdatedAt.Format("January 2 2006, 15:04"),
			Avatar:  a,
			URL:     template.URL(*issue.HTMLURL),
		})
		ret = append(ret, githubIssueActivity{
			Name:    "",
			Event:   "Note",
			Message: template.HTML("the issue timeline below is in reverse order"),
			Date:    "",
			Avatar:  githubGravatar,
			URL:     template.URL(*issue.HTMLURL),
		})
	} else {
		return ret, err
	}

	opts := &gogithub.ListOptions{PerPage: config.BranchLines}

	guff, _, err := client.Issues.ListIssueTimeline(config.Owner, config.Repo, config.IssueNum, opts)

	if err != nil {
		return ret, err
	}

	for _, v := range guff {
		if config.SincePtr == nil || v.CreatedAt.After(*config.SincePtr) {
			var n, a, m, u string

			p := v.Actor
			if p != nil {
				if p.Name != nil {
					n = *p.Name
				}
				if p.AvatarURL != nil {
					a = *p.AvatarURL
				}
			}

			u = fmt.Sprintf("https://github.com/%s/%s/issues/%d#event-%d",
				config.Owner, config.Repo, config.IssueNum, *v.ID)

			switch *v.Event {
			case "commented":
				ic, _, err := client.Issues.GetComment(config.Owner, config.Repo, *v.ID)
				if err != nil {
					log.ErrorString("github error fetching issue event comment: " + err.Error())
				} else {
					m = *ic.Body
					u = *ic.HTMLURL
					p := ic.User
					if p != nil {
						if p.Login != nil {
							n = *p.Login
						}
						if p.AvatarURL != nil {
							a = *p.AvatarURL
						}
					}
				}
			}

			ret = append(ret, githubIssueActivity{
				Name:    n,
				Event:   *v.Event,
				Message: template.HTML(m),
				Date:    "on " + v.CreatedAt.Format("January 2 2006, 15:04"),
				Avatar:  a,
				URL:     template.URL(u),
			})
		}
	}

	return ret, nil

}
*/
