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

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/documize/community/documize/api/request"
	"github.com/documize/community/documize/section/provider"
	"github.com/documize/community/wordsmith/log"

	gogithub "github.com/google/go-github/github"
	"golang.org/x/oauth2"
)

// TODO find a smaller image than the one below
const githubGravatar = "https://i2.wp.com/assets-cdn.github.com/images/gravatars/gravatar-user-420.png"

var meta provider.TypeMeta

func init() {
	meta = provider.TypeMeta{}

	meta.ID = "38c0e4c5-291c-415e-8a4d-262ee80ba5df"
	meta.Title = "GitHub"
	meta.Description = "Link code commits and issues"
	meta.ContentType = "github"
	meta.Callback = Callback
}

// Provider represents GitHub
type Provider struct {
}

// Meta describes us.
func (*Provider) Meta() provider.TypeMeta {
	return meta
}

func clientID() string {
	return request.ConfigString(meta.ConfigHandle(), "clientID")
}
func clientSecret() string {
	return request.ConfigString(meta.ConfigHandle(), "clientSecret")
}
func authorizationCallbackURL() string {
	// NOTE: URL value must have the path and query "/api/public/validate?section=github"
	return request.ConfigString(meta.ConfigHandle(), "authorizationCallbackURL")
}
func validateToken(ptoken string) error {
	// Github authorization check
	authClient := gogithub.NewClient((&gogithub.BasicAuthTransport{
		Username: clientID(),
		Password: clientSecret(),
	}).Client())
	_, _, err := authClient.Authorizations.Check(clientID(), ptoken)
	return err
}

func secretsJSON(token string) string {
	return `{"token":"` + strings.TrimSpace(token) + `"}`
}

// Command to run the various functions required...
func (p *Provider) Command(ctx *provider.Context, w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	method := query.Get("method")

	if len(method) == 0 {
		msg := "missing method name"
		log.ErrorString("github: " + msg)
		provider.WriteMessage(w, "gitub", msg)
		return
	}

	if method == "config" {
		var ret struct {
			CID string `json:"clientID"`
			URL string `json:"authorizationCallbackURL"`
		}
		ret.CID = clientID()
		ret.URL = authorizationCallbackURL()
		provider.WriteJSON(w, ret)
		return
	}

	defer r.Body.Close() // ignore error

	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		msg := "Bad body"
		log.ErrorString("github: " + msg)
		provider.WriteMessage(w, "gitub", msg)
		return
	}

	// get the secret token in the database
	ptoken := ctx.GetSecrets("token")

	switch method {

	case "saveSecret": // secret Token update code

		// write the new one, direct from JS
		if err = ctx.SaveSecrets(string(body)); err != nil {
			log.Error("github settoken configuration", err)
			provider.WriteError(w, "github", err)
			return
		}
		provider.WriteEmpty(w)
		return

	}

	// load the config from the client-side
	config := githubConfig{}
	err = json.Unmarshal(body, &config)

	if err != nil {
		log.Error("github Command Unmarshal", err)
		provider.WriteError(w, "github", err)
		return
	}

	config.Clean()
	// always use DB version of the token
	config.Token = ptoken

	client := p.githubClient(config)

	switch method { // the main data handling switch

	case "checkAuth":

		if len(ptoken) == 0 {
			err = errors.New("empty github token")
		} else {
			err = validateToken(ptoken)
		}
		if err != nil {
			// token now invalid, so wipe it
			ctx.SaveSecrets("") // ignore error, already in an error state
			log.Error("github check token validation", err)
			provider.WriteError(w, "github", err)
			return
		}
		provider.WriteEmpty(w)
		return

	case tagCommitsData:

		render, err := p.getCommits(client, config)
		if err != nil {
			log.Error("github getCommits:", err)
			provider.WriteError(w, "github", err)
			return
		}

		provider.WriteJSON(w, render)

	case tagIssuesData:

		render, err := p.getIssues(client, config)
		if err != nil {
			log.Error("github getIssues:", err)
			provider.WriteError(w, "github", err)
			return
		}

		provider.WriteJSON(w, render)

	/*case "issuenum_data":

	render, err := t.getIssueNum(client, config)
	if err != nil {
		log.Error("github getIssueNum:", err)
		provider.WriteError(w, "github", err)
		return
	}

	provider.WriteJSON(w, render)*/

	case "owners":

		me, _, err := client.Users.Get("")
		if err != nil {
			log.Error("github get user details:", err)
			provider.WriteError(w, "github", err)
			return
		}

		orgs, _, err := client.Organizations.List("", nil)
		if err != nil {
			log.Error("github get user's organisations:", err)
			provider.WriteError(w, "github", err)
			return
		}

		owners := make([]githubOwner, 1+len(orgs))
		owners[0] = githubOwner{ID: *me.Login, Name: *me.Login}
		for ko, vo := range orgs {
			id := 1 + ko
			owners[id].ID = *vo.Login
			owners[id].Name = *vo.Login
		}

		owners = sortOwners(owners)

		provider.WriteJSON(w, owners)

	case "repos":

		var render []githubRepo
		if config.Owner != "" {

			me, _, err := client.Users.Get("")
			if err != nil {
				log.Error("github get user details:", err)
				provider.WriteError(w, "github", err)
				return
			}

			var repos []*gogithub.Repository
			if config.Owner == *me.Login {
				repos, _, err = client.Repositories.List(config.Owner, nil)
			} else {
				opt := &gogithub.RepositoryListByOrgOptions{
					ListOptions: gogithub.ListOptions{PerPage: 100},
				}
				repos, _, err = client.Repositories.ListByOrg(config.Owner, opt)
			}
			if err != nil {
				log.Error("github get user/org repositories:", err)
				provider.WriteError(w, "github", err)
				return
			}
			for _, vr := range repos {
				private := ""
				if *vr.Private {
					private = " (private)"
				}
				render = append(render,
					githubRepo{
						Name:    config.Owner + "/" + *vr.Name + private,
						ID:      fmt.Sprintf("%s:%s", config.Owner, *vr.Name),
						Owner:   config.Owner,
						Repo:    *vr.Name,
						Private: *vr.Private,
						URL:     *vr.HTMLURL,
					})
			}
		}
		render = sortRepos(render)

		provider.WriteJSON(w, render)

	case "branches":

		if config.Owner == "" || config.Repo == "" {
			provider.WriteJSON(w, []githubBranch{}) // we have nothing to return
			return
		}
		branches, _, err := client.Repositories.ListBranches(config.Owner, config.Repo,
			&gogithub.ListOptions{PerPage: 100})
		if err != nil {
			log.Error("github get branch details:", err)
			provider.WriteError(w, "github", err)
			return
		}
		render := make([]githubBranch, len(branches))
		for kc, vb := range branches {
			render[kc] = githubBranch{
				Name:     *vb.Name,
				ID:       fmt.Sprintf("%s:%s:%s", config.Owner, config.Repo, *vb.Name),
				Included: false,
				URL:      "https://github.com/" + config.Owner + "/" + config.Repo + "/tree/" + *vb.Name,
			}
		}

		provider.WriteJSON(w, render)

	case "labels":

		if config.Owner == "" || config.Repo == "" {
			provider.WriteJSON(w, []githubBranch{}) // we have nothing to return
			return
		}
		labels, _, err := client.Issues.ListLabels(config.Owner, config.Repo,
			&gogithub.ListOptions{PerPage: 100})
		if err != nil {
			log.Error("github get labels:", err)
			provider.WriteError(w, "github", err)
			return
		}
		render := make([]githubBranch, len(labels))
		for kc, vb := range labels {
			render[kc] = githubBranch{
				Name:     *vb.Name,
				ID:       fmt.Sprintf("%s:%s:%s", config.Owner, config.Repo, *vb.Name),
				Included: false,
				Color:    *vb.Color,
			}
		}

		provider.WriteJSON(w, render)

	default:

		log.ErrorString("Github connector unknown method: " + method)
		provider.WriteEmpty(w)
	}
}

func (*Provider) githubClient(config githubConfig) *gogithub.Client {
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: config.Token},
	)
	tc := oauth2.NewClient(oauth2.NoContext, ts)

	return gogithub.NewClient(tc)
}

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

func wrapLabels(labels []gogithub.Label) string {
	l := ""
	for _, ll := range labels {
		l += `<span class="github-issue-label" style="background-color:#` + *ll.Color + `">` + *ll.Name + `</span> `
	}
	return l
}

func (*Provider) getIssues(client *gogithub.Client, config githubConfig) ([]githubIssue, error) {

	ret := []githubIssue{}

	isRequired := make([]int, 0, 10)
	for _, s := range strings.Split(strings.Replace(config.IssuesText, "#", "", -1), ",") {
		i, err := strconv.Atoi(strings.TrimSpace(s))
		if err == nil {
			isRequired = append(isRequired, i)
		}
	}
	if len(isRequired) > 0 {

		for _, i := range isRequired {

			issue, _, err := client.Issues.Get(config.Owner, config.Repo, i)

			if err == nil {
				n := ""
				p := issue.User
				if p != nil {
					if p.Login != nil {
						n = *p.Login
					}
				}
				l := wrapLabels(issue.Labels)
				ret = append(ret, githubIssue{
					Name:    n,
					Message: *issue.Title,
					Date:    issue.CreatedAt.Format("January 2 2006, 15:04"),
					Updated: issue.UpdatedAt.Format("January 2 2006, 15:04"),
					URL:     template.URL(*issue.HTMLURL),
					Labels:  template.HTML(l),
					ID:      *issue.Number,
					IsOpen:  *issue.State == "open",
				})
			}
		}

	} else {

		opts := &gogithub.IssueListByRepoOptions{
			Sort:        "updated",
			State:       config.IssueState.ID,
			ListOptions: gogithub.ListOptions{PerPage: config.BranchLines}}

		if config.SincePtr != nil {
			opts.Since = *config.SincePtr
		}

		for _, lab := range config.Lists {
			if lab.Included {
				opts.Labels = append(opts.Labels, lab.Name)
			}
		}

		guff, _, err := client.Issues.ListByRepo(config.Owner, config.Repo, opts)

		if err != nil {
			return ret, err
		}

		for _, v := range guff {
			n := ""
			ptr := v.User
			if ptr != nil {
				if ptr.Login != nil {
					n = *ptr.Login
				}
			}
			l := wrapLabels(v.Labels)
			ret = append(ret, githubIssue{
				Name:    n,
				Message: *v.Title,
				Date:    v.CreatedAt.Format("January 2 2006, 15:04"),
				Updated: v.UpdatedAt.Format("January 2 2006, 15:04"),
				URL:     template.URL(*v.HTMLURL),
				Labels:  template.HTML(l),
				ID:      *v.Number,
				IsOpen:  *v.State == "open",
			})
		}
	}

	return ret, nil

}

func (*Provider) getCommits(client *gogithub.Client, config githubConfig) ([]githubBranchCommits, error) {

	opts := &gogithub.CommitsListOptions{
		SHA:         config.Branch,
		ListOptions: gogithub.ListOptions{PerPage: config.BranchLines}}

	if config.SincePtr != nil {
		opts.Since = *config.SincePtr
	}

	guff, _, err := client.Repositories.ListCommits(config.Owner, config.Repo, opts)

	if err != nil {
		return nil, err
	}

	if len(guff) == 0 {
		return []githubBranchCommits{}, nil
	}

	day := ""
	newDay := ""
	ret := []githubBranchCommits{}

	for k, v := range guff {

		if guff[k].Commit != nil {
			if guff[k].Commit.Committer.Date != nil {
				y, m, d := (*guff[k].Commit.Committer.Date).Date()
				newDay = fmt.Sprintf("%s %d, %d", m.String(), d, y)
			}
		}
		if day != newDay {
			day = newDay
			ret = append(ret, githubBranchCommits{
				Name: fmt.Sprintf("%s/%s:%s", config.Owner, config.Repo, config.Branch),
				Day:  day,
			})
		}

		var a, d, l, m, u string
		if v.Commit != nil {
			if v.Commit.Committer.Date != nil {
				// d = fmt.Sprintf("%v", *v.Commit.Committer.Date)
				d = v.Commit.Committer.Date.Format("January 2 2006, 15:04")
			}
			if v.Commit.Message != nil {
				m = *v.Commit.Message
			}
		}
		if v.Committer != nil {
			if v.Committer.Login != nil {
				l = *v.Committer.Login
			}
			if v.Committer.AvatarURL != nil {
				a = *v.Committer.AvatarURL
			}
		}
		if a == "" {
			a = githubGravatar
		}
		if v.HTMLURL != nil {
			u = *v.HTMLURL
		}
		ret[len(ret)-1].Commits = append(ret[len(ret)-1].Commits, githubCommit{
			Name:    l,
			Message: m,
			Date:    d,
			Avatar:  a,
			URL:     template.URL(u),
		})
	}

	return ret, nil

}

// Refresh ... gets the latest version
func (p *Provider) Refresh(ctx *provider.Context, configJSON, data string) string {
	var c = githubConfig{}

	err := json.Unmarshal([]byte(configJSON), &c)

	if err != nil {
		log.Error("unable to unmarshall github config", err)
		return "internal configuration error '" + err.Error() + "'"
	}

	c.Clean()
	c.Token = ctx.GetSecrets("token")

	switch c.ReportInfo.ID {
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

	case tagIssuesData:
		refreshed, err := p.getIssues(p.githubClient(c), c)
		if err != nil {
			log.Error("unable to get github issues", err)
			return data
		}
		j, err := json.Marshal(refreshed)
		if err != nil {
			log.Error("unable to marshall github issues", err)
			return data
		}
		return string(j)

	case tagCommitsData:
		refreshed, err := p.getCommits(p.githubClient(c), c)
		if err != nil {
			log.Error("unable to get github commits", err)
			return data
		}
		j, err := json.Marshal(refreshed)
		if err != nil {
			log.Error("unable to marshall github commits", err)
			return data
		}
		return string(j)

	default:
		msg := "unknown data format: " + c.ReportInfo.ID
		log.ErrorString(msg)
		return "internal configuration error, " + msg
	}

}

// Render ... just returns the data given, suitably formatted
func (p *Provider) Render(ctx *provider.Context, config, data string) string {
	var err error

	payload := githubRender{}
	var c = githubConfig{}

	err = json.Unmarshal([]byte(config), &c)

	if err != nil {
		log.Error("unable to unmarshall github config", err)
		return "Please delete and recreate this Github section."
	}

	c.Clean()
	c.Token = ctx.GetSecrets("token")

	payload.Config = c
	payload.Repo = c.RepoInfo
	payload.Limit = c.BranchLines
	if len(c.BranchSince) > 0 {
		payload.DateMessage = "created after " + c.BranchSince
	}

	switch c.ReportInfo.ID {
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

	case tagIssuesData:
		raw := []githubIssue{}

		if len(data) > 0 {
			err = json.Unmarshal([]byte(data), &raw)
			if err != nil {
				log.Error("unable to unmarshall github issue data", err)
				return "Documize internal github json umarshall open data error: " + err.Error() + "<BR>" + data
			}
		}
		payload.Issues = raw
		if strings.TrimSpace(c.IssuesText) != "" {
			payload.ShowIssueNumbers = true
			payload.DateMessage = c.IssuesText
		} else {
			if len(c.Lists) > 0 {
				for _, v := range c.Lists {
					if v.Included {
						payload.ShowList = true
						break
					}
				}
				payload.List = c.Lists
			}
		}

	case tagCommitsData:
		raw := []githubBranchCommits{}
		err = json.Unmarshal([]byte(data), &raw)

		if err != nil {
			log.Error("unable to unmarshall github commit data", err)
			return "Documize internal github json umarshall data error: " + err.Error() + "<BR>" + data
		}
		c.ReportInfo.ID = tagCommitsData
		payload.BranchCommits = raw
		for _, list := range raw {
			payload.CommitCount += len(list.Commits)
		}

	default:
		msg := "unknown data format: " + c.ReportInfo.ID
		log.ErrorString(msg)
		return "internal configuration error, " + msg

	}

	t := template.New("github")

	tmpl, ok := renderTemplates[c.ReportInfo.ID]
	if !ok {
		msg := "github render template not found for: " + c.ReportInfo.ID
		log.ErrorString(msg)
		return "Documize internal error: " + msg
	}

	t, err = t.Parse(tmpl)

	if err != nil {
		log.Error("github render template.Parse error:", err)
		return "Documize internal github template.Parse error: " + err.Error()
	}

	buffer := new(bytes.Buffer)
	err = t.Execute(buffer, payload)
	if err != nil {
		log.Error("github render template.Execute error:", err)
		return "Documize internal github template.Execute error: " + err.Error()
	}

	return buffer.String()
}

// Callback is called by a browser redirect from Github, via the validation endpoint
func Callback(res http.ResponseWriter, req *http.Request) error {

	code := req.URL.Query().Get("code")
	state := req.URL.Query().Get("state")

	ghurl := "https://github.com/login/oauth/access_token"
	vals := "client_id=" + clientID()
	vals += "&client_secret=" + clientSecret()
	vals += "&code=" + code
	vals += "&state=" + state

	req2, err := http.NewRequest("POST", ghurl+"?"+vals, strings.NewReader(vals))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req2.Header.Set("Accept", "application/json")

	res2, err := http.DefaultClient.Do(req2)
	if err != nil {
		return err
	}

	var gt githubCallbackT

	err = json.NewDecoder(res2.Body).Decode(&gt)
	if err != nil {
		return err
	}

	err = res2.Body.Close()
	if err != nil {
		return err
	}

	returl, err := url.QueryUnescape(state)
	if err != nil {
		return err
	}

	up, err := url.Parse(returl)
	if err != nil {
		return err
	}

	target := up.Scheme + "://" + up.Host + up.Path + "?code=" + gt.AccessToken

	http.Redirect(res, req, target, http.StatusTemporaryRedirect)

	return nil
}
