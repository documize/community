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
	"sort"
	"strings"

	"github.com/documize/community/wordsmith/log"

	// vendored locally
	gogithub "github.com/google/go-github/github"
	"golang.org/x/oauth2"
)

var ClientID, ClientSecret string

type GithubT struct {

	/* TODO use the shared functions in the "section" package
	WriteJSON func (w http.ResponseWriter, v interface{})
	WriteString func(w http.ResponseWriter, data string)
	WriteEmpty func (w http.ResponseWriter)
	WriteMarshalError func (w http.ResponseWriter, err error)
	WriteMessage func (w http.ResponseWriter, section, msg string)
	WriteError func (w http.ResponseWriter, section string, err error)
	WriteForbidden func (w http.ResponseWriter)
	*/
}

/* done at top level in the "section" package
func init() {
	sectionsMap["github"] = &GithubT{}
}

func (*GithubT) Meta() TypeMeta {
	section :=  TypeMeta{}

	section.ID = "38c0e4c5-291c-415e-8a4d-262ee80ba5df"
	section.Title = "GitHub"
	section.Description = "Code commits and branches"
	section.ContentType = "github"
	//section.Preview = true

	return section
}
*/

// Command to run the various functions required...
func (t *GithubT) Command(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	method := query.Get("method")

	if len(method) == 0 {
		writeMessage(w, "gitub", "missing method name")
		return
	}

	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writeMessage(w, "github", "Bad body")
		return
	}

	config := githubConfig{}
	err = json.Unmarshal(body, &config)

	if err != nil {
		writeError(w, "github", err)
		return
	}

	config.Clean()

	if len(config.Token) == 0 {
		writeMessage(w, "github", "Missing token")
		return
	}

	client := t.githubClient(config)

	switch method {

	case "commits":

		render, err := t.getCommits(client, config)
		if err != nil {
			//fmt.Println("Error:", err.Error())
			writeError(w, "github", err)
			// TODO log error
			return
		}

		writeJSON(w, render)

	case "repos":

		me, _, err := client.Users.Get("")
		if err != nil {
			//fmt.Println(err)
			// TODO log error
			writeError(w, "github", err)
			return
		}

		orgs, _, err := client.Organizations.List("", nil)
		if err != nil {
			//fmt.Println(err)
			// TODO log error
			writeError(w, "github", err)
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
				repos, _, err = client.Repositories.ListByOrg(vo, nil)
			}
			if err != nil {
				//fmt.Println(err)
				// TODO log error
				writeError(w, "github", err)
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

		if err != nil {
			//fmt.Println(err)
			// TODO log error
			writeError(w, "github", err)
			return
		}

		render = sortRepos(render)

		writeJSON(w, render)

	case "lists":
		if config.Owner == "" || config.Repo == "" {
			writeJSON(w, []githubBranch{}) // we have nothing to return
			return
		}
		branches, _, err := client.Repositories.ListBranches(config.Owner, config.Repo, nil)
		if err != nil {
			//fmt.Println(err)
			// TODO log error
			writeError(w, "github", err)
			return
		}
		render := make([]githubBranch, len(branches))
		for kc, vb := range branches {
			render[kc] = githubBranch{
				Name:     *vb.Name,
				ID:       fmt.Sprintf("%s:%s:%s:%d", config.Owner, config.Repo, *vb.Name, kc),
				Included: false,
			}
		}

		writeJSON(w, render)

	default:

		writeEmpty(w)
	}
}

func (*GithubT) githubClient(config githubConfig) *gogithub.Client {
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: config.Token},
	)
	tc := oauth2.NewClient(oauth2.NoContext, ts)

	return gogithub.NewClient(tc)
}

func (*GithubT) getCommits(client *gogithub.Client, config githubConfig) ([]githubBranchCommits, error) {

	guff, _, err := client.Repositories.ListCommits(config.Owner, config.Repo,
		&gogithub.CommitsListOptions{SHA: config.Branch})
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
				d = fmt.Sprintf("%v", *v.Commit.Committer.Date)
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
func (t *GithubT) Refresh(configJSON, data string) string {
	var c = githubConfig{}
	json.Unmarshal([]byte(configJSON), &c)
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

// Render ... just returns the data given
func (*GithubT) Render(config, data string) string {

	raw := []githubBranchCommits{}
	payload := githubRender{}
	var c = githubConfig{}

	json.Unmarshal([]byte(data), &raw)
	json.Unmarshal([]byte(config), &c)

	c.Clean()

	payload.Config = c
	payload.Repo = c.RepoInfo
	payload.Data = raw

	for _, list := range raw {
		payload.CommitCount += len(list.Commits)
	}

	t := template.New("github")
	var err error

	t, err = t.Parse(`
<p>There are {{ .CommitCount }} commits for branch <i>{{.Config.Branch}}</i> of repository <a href="{{ .Repo.URL }}">{{.Repo.Name}}.</a></p>

<div class="github-board">
	
	{{range $data := .Data}}
	
    	<div class="github-group-title">
       		Commits on {{ $data.Day }}
      	</div>
	  
		<ul class="github-list">  
	
			{{range $commit := $data.Commits}}

      			<li class="github-commit-item"> 
	  
      				<div class="github-avatar">
          				<img alt="@{{$commit.Name}}" src="{{$commit.Avatar}}" height="36" width="36">
      				</div>

      				<div class="github-commit-body">
        			
						<p class="github-commit-title">
         					<a href="{{$commit.URL}}">
 								{{$commit.Message}}
 							</a>
        				</p>

        				<p class="github-commit-meta">
         					{{$commit.Name}} committed on {{$commit.Date}}
        				</p>
      				</div>

      			</li>
				  
	  		{{end}}
			  
	  	</ul>
		  
	  {{end}}
	  
  </div>
`)

	if err != nil {
		// TODO log?
		return "Documize internal github template.Parse error: " + err.Error()
	}

	buffer := new(bytes.Buffer)
	err = t.Execute(buffer, payload)
	if err != nil {
		// TODO log?
		return "Documize internal github template.Execute error: " + err.Error()
	}

	return buffer.String()
}

type githubRepo struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Included bool   `json:"included"`
	Owner    string `json:"owner"`
	Repo     string `json:"repo"`
	Private  bool   `json:"private"` // TODO review field use
	URL      string `json:"url"`
}

// sort repos in order that that should be presented.
type reposToSort []githubRepo

func (s reposToSort) Len() int      { return len(s) }
func (s reposToSort) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s reposToSort) Less(i, j int) bool {
	return s[i].Name < s[j].Name
}

func sortRepos(in []githubRepo) []githubRepo {
	sts := reposToSort(in)
	sort.Sort(sts)
	return []githubRepo(sts)
}

type githubBranch struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Included bool   `json:"included"`
}

type githubBranchCommits struct {
	Name    string `json:"name"`
	Day     string `json:"day"`
	Commits []githubCommit
}

type githubCommit struct {
	Date    string `json:"date"`
	Message string `json:"message"`
	URL     string `json:"url"`
	Name    string `json:"name"`
	Avatar  string `json:"avatar"`
}

type githubConfig struct {
	AppKey      string       `json:"appKey"` // TODO keep?
	Token       string       `json:"token"`
	Owner       string       `json:"owner"`
	Repo        string       `json:"repo_name"`
	Branch      string       `json:"branch"`
	RepoInfo    githubRepo   `json:"repo"`
	ClientID    string       `json:"clientId"`
	CallbackURL string       `json:"callbackUrl"`
	Lists       []githubRepo `json:"lists"`
}

func (c *githubConfig) Clean() {
	c.AppKey = strings.TrimSpace(c.AppKey) // TODO keep?
	c.Token = strings.TrimSpace(c.Token)
	c.Owner = c.RepoInfo.Owner
	c.Repo = c.RepoInfo.Repo
	for _, l := range c.Lists {
		if l.Included {
			c.Branch = l.Name
			break
		}
	}
}

type githubCallbackT struct {
	AccessToken string `json:"access_token"`
}

// Callback is called by a browser redirect from Github, via the validation endpoint
func Callback(res http.ResponseWriter, req *http.Request) error {

	code := req.URL.Query().Get("code")
	state := req.URL.Query().Get("state")

	ghurl := "https://github.com/login/oauth/access_token"
	vals := "client_id=" + ClientID
	vals += "&client_secret=" + ClientSecret
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

	res2.Body.Close()

	returl, err := url.QueryUnescape(state)

	up, err := url.Parse(returl)

	target := up.Scheme + "://" + up.Host + up.Path + "?code=" + gt.AccessToken

	http.Redirect(res, req, target, http.StatusTemporaryRedirect)

	return nil
}

// TODO don't copy these functions... use the ones in the "section" package

// writeJSON writes data as JSON to HTTP response.
func writeJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)

	j, err := json.Marshal(v)

	if err != nil {
		writeMarshalError(w, err)
		return
	}

	_, err = w.Write(j)
	log.IfErr(err)
}

// writeString writes string tp HTTP response.
func writeString(w http.ResponseWriter, data string) {
	w.WriteHeader(http.StatusOK)
	_, err := w.Write([]byte(data))
	log.IfErr(err)
}

// writeEmpty returns just OK to HTTP response.
func writeEmpty(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, err := w.Write([]byte("{}"))
	log.IfErr(err)
}

// writeMarshalError write JSON marshalling error to HTTP response.
func writeMarshalError(w http.ResponseWriter, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err2 := w.Write([]byte("{Error: 'JSON marshal failed'}"))
	log.IfErr(err2)
	log.Error("JSON marshall failed", err)
}

func writeMessage(w http.ResponseWriter, section, msg string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err := w.Write([]byte("{Message: " + msg + "}"))
	log.IfErr(err)
	log.Info(fmt.Sprintf("Error for section %s: %s", section, msg))
}

func writeError(w http.ResponseWriter, section string, err error) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	_, err2 := w.Write([]byte("{Error: 'Internal server error'}"))
	log.IfErr(err2)
	log.Error(fmt.Sprintf("Error for section %s", section), err)
}

func writeForbidden(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusForbidden)
	_, err := w.Write([]byte("{Error: 'Unauthorized'}"))
	log.IfErr(err)
}
