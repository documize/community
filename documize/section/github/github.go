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
	"fmt"
	"html/template"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/documize/community/documize/api/request"
	"github.com/documize/community/documize/section/provider"
	"github.com/documize/community/wordsmith/log"

	gogithub "github.com/google/go-github/github"
	"golang.org/x/oauth2"
)

var meta provider.TypeMeta

func init() {
	meta = provider.TypeMeta{}

	meta.ID = "38c0e4c5-291c-415e-8a4d-262ee80ba5df"
	meta.Title = "GitHub"
	meta.Description = "Code commits and branches"
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

// Command to run the various functions required...
func (t *Provider) Command(w http.ResponseWriter, r *http.Request) {
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

	config := githubConfig{}
	err = json.Unmarshal(body, &config)

	if err != nil {
		log.Error("github Command Unmarshal", err)
		provider.WriteError(w, "github", err)
		return
	}

	config.Clean()

	if len(config.Token) == 0 {
		msg := "Missing token"
		log.ErrorString("github: " + msg)
		provider.WriteMessage(w, "gitub", msg)
		return
	}

	client := t.githubClient(config)

	switch method {

	case "commits":

		render, err := t.getCommits(client, config)
		if err != nil {
			log.Error("github getCommits:", err)
			provider.WriteError(w, "github", err)
			return
		}

		provider.WriteJSON(w, render)

	case "repos":

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

		owners := make([]string, 1+len(orgs))
		owners[0] = *me.Login
		for ko, vo := range orgs {
			owners[1+ko] = *vo.Login
		}

		var render []githubRepo
		for ko, vo := range owners {
			var repos []gogithub.Repository
			if vo == *me.Login {
				repos, _, err = client.Repositories.List(vo, nil)
			} else {
				opt := &gogithub.RepositoryListByOrgOptions{
					ListOptions: gogithub.ListOptions{PerPage: 100},
				}
				repos, _, err = client.Repositories.ListByOrg(vo, opt)
			}
			if err != nil {
				log.Error("github get user/org repositories:", err)
				provider.WriteError(w, "github", err)
				return
			}
			for kr, vr := range repos {
				private := ""
				if *vr.Private {
					private = " (private)"
				}
				render = append(render,
					githubRepo{
						Name:    vo + "/" + *vr.Name + private,
						ID:      fmt.Sprintf("%s:%d:%s:%d", vo, ko, *vr.Name, kr),
						Owner:   vo,
						Repo:    *vr.Name,
						Private: *vr.Private,
						URL:     *vr.HTMLURL,
					})
			}
		}

		render = sortRepos(render)

		provider.WriteJSON(w, render)

	case "lists":
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
				ID:       fmt.Sprintf("%s:%s:%s:%d", config.Owner, config.Repo, *vb.Name, kc),
				Included: false,
				URL:      "https://github.com/" + config.Owner + "/" + config.Repo + "/tree/" + *vb.Name,
			}
		}

		provider.WriteJSON(w, render)

	default:
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

func (*Provider) getCommits(client *gogithub.Client, config githubConfig) ([]githubBranchCommits, error) {

	opts := &gogithub.CommitsListOptions{
		SHA:         config.Branch,
		ListOptions: gogithub.ListOptions{PerPage: config.BranchLines}}

	var since time.Time

	err := since.UnmarshalText([]byte(config.BranchSince)) // TODO date Picker format
	if err == nil {
		opts.Since = since
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
			// TODO find a smaller image than the one below
			a = "https://i2.wp.com/assets-cdn.github.com/images/gravatars/gravatar-user-420.png"
		}
		if v.HTMLURL != nil {
			u = *v.HTMLURL
		}
		ret[len(ret)-1].Commits = append(ret[len(ret)-1].Commits, githubCommit{
			Name:    l,
			Message: m,
			Date:    d,
			Avatar:  a,
			URL:     u,
		})
	}

	return ret, nil

}

// Refresh ... gets the latest version
func (t *Provider) Refresh(configJSON, data string) string {
	var c = githubConfig{}

	err := json.Unmarshal([]byte(configJSON), &c)

	if err != nil {
		log.Error("unable to unmarshall github config", err)
		return data
	}

	c.Clean()

	refreshed, err := t.getCommits(t.githubClient(c), c)

	if err != nil {
		return data
	}

	j, err := json.Marshal(refreshed)

	if err != nil {
		log.Error("unable to marshall github commits", err)
		return data
	}

	return string(j)
}

type githubRender struct {
	Config      githubConfig
	Repo        githubRepo
	Data        []githubBranchCommits
	CommitCount int
}

// Render ... just returns the data given, suitably formatted
func (*Provider) Render(config, data string) string {
	var err error

	raw := []githubBranchCommits{}
	payload := githubRender{}
	var c = githubConfig{}

	err = json.Unmarshal([]byte(data), &raw)

	if err != nil {
		log.Error("unable to unmarshall github data", err)
		return "Documize internal github json umarshall data error: " + err.Error()
	}

	err = json.Unmarshal([]byte(config), &c)

	if err != nil {
		log.Error("unable to unmarshall github config", err)
		return "Documize internal github json umarshall config error: " + err.Error()
	}

	c.Clean()

	payload.Config = c
	payload.Repo = c.RepoInfo
	payload.Data = raw

	for _, list := range raw {
		payload.CommitCount += len(list.Commits)
	}

	t := template.New("github")

	t, err = t.Parse(renderTemplate)

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
