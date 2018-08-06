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

package jira

import (
	// "encoding/base64"
	"encoding/json"
	"fmt"
	// "io/ioutil"
	"net/http"
	// "bytes"
	// "html/template"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain"
	"github.com/documize/community/domain/section/provider"
	jira "gopkg.in/andygrunwald/go-jira.v1"
)

//
const (
	logID = "jira"
)

// Provider represents Gemini
type Provider struct {
	Runtime *env.Runtime
	Store   *domain.Store
}

// Meta describes us.
func (*Provider) Meta() provider.TypeMeta {
	section := provider.TypeMeta{}
	section.ID = "dca48000-8a60-438c-b6d1-e4160f3ac8e3"
	section.Title = "Jira"
	section.Description = "Issue tracking"
	section.ContentType = "jira"
	section.PageType = "tab"

	return section
}

// Render converts Jira data into HTML suitable for browser rendering.
func (*Provider) Render(ctx *provider.Context, config, data string) string {
	return "<p>Something</p>"
}

// Refresh fetches latest issues list.
func (p *Provider) Refresh(ctx *provider.Context, config, data string) (newData string) {
	// var c = geminiConfig{}
	// err := json.Unmarshal([]byte(config), &c)

	// if err != nil {
	// 	p.Runtime.Log.Error("Unable to read Gemini config", err)
	// 	return
	// }

	// c.Clean(ctx, p.Store)

	// if len(c.URL) == 0 {
	// 	p.Runtime.Log.Info("Gemini.Refresh received empty URL")
	// 	return
	// }

	// if len(c.Username) == 0 {
	// 	p.Runtime.Log.Info("Gemini.Refresh received empty username")
	// 	return
	// }

	// if len(c.APIKey) == 0 {
	// 	p.Runtime.Log.Info("Gemini.Refresh received empty API key")
	// 	return
	// }

	// req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/items/card/%d", c.URL, c.WorkspaceID), nil)
	// // req.Header.Set("Content-Type", "application/json")

	// creds := []byte(fmt.Sprintf("%s:%s", c.Username, c.APIKey))
	// req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString(creds))

	// client := &http.Client{}
	// res, err := client.Do(req)

	// if err != nil {
	// 	fmt.Println(err)
	// 	return
	// }

	// if res.StatusCode != http.StatusOK {
	// 	return
	// }

	// defer res.Body.Close()
	// var items []geminiItem

	// dec := json.NewDecoder(res.Body)
	// err = dec.Decode(&items)
	// if err != nil {
	// 	p.Runtime.Log.Error("unable to Decode gemini items", err)
	// 	return
	// }

	// j, err := json.Marshal(items)

	// if err != nil {
	// 	p.Runtime.Log.Error("unable to marshal gemini items", err)
	// 	return
	// }

	// newData = string(j)
	return
}

// Command handles authentication and issues list preview.
func (p *Provider) Command(ctx *provider.Context, w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	method := query.Get("method")

	if len(method) == 0 {
		provider.WriteMessage(w, logID, "missing method name")
		return
	}

	switch method {
	// case "secrets":
	// 	secs(ctx, p.Store, w, r)
	case "auth":
		auth(ctx, p.Store, w, r)
		// case "workspace":
		// 	workspace(ctx, p.Store, w, r)
		// case "items":
		// 	items(ctx, p.Store, w, r)
	}
}

func auth(ctx *provider.Context, store *domain.Store, w http.ResponseWriter, r *http.Request) {
	var login = jiraLogin{}
	creds, err := store.Setting.GetUser(ctx.OrgID, "", "jira", "")
	err = json.Unmarshal([]byte(creds), &login)
	if err != nil {
		provider.WriteForbidden(w)
		return
	}

	tp := jira.BasicAuthTransport{Username: login.Username, Password: login.Secret}
	client, err := jira.NewClient(tp.Client(), login.URL)

	u, _, err := client.User.Get(login.Username)
	fmt.Printf("\nEmail: %v\nSuccess!\n", u.EmailAddress)

	// req, err := http.NewRequest("GET", fmt.Sprintf("%s/", login.URL), nil)
	// header := []byte(fmt.Sprintf("%s:%s", login.Username, login.Secret))
	// req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString(header))

	// client := &http.Client{}
	// res, err := client.Do(req)

	// if err != nil {
	// 	provider.WriteError(w, logID, err)
	// 	return
	// }
	// if res.StatusCode != http.StatusOK {
	// 	provider.WriteForbidden(w)
	// 	return
	// }

	// defer res.Body.Close()
	// var g = geminiUser{}

	// dec := json.NewDecoder(res.Body)
	// err = dec.Decode(&g)

	// if err != nil {
	// 	provider.WriteError(w, logID, err)
	// 	return
	// }

	provider.WriteJSON(w, "OK")
}

/*
func workspace(ctx *provider.Context, store *domain.Store, w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		provider.WriteMessage(w, logID, "Bad payload")
		return
	}

	var config = geminiConfig{}
	err = json.Unmarshal(body, &config)

	if err != nil {
		provider.WriteMessage(w, logID, "Bad payload")
		return
	}

	config.Clean(ctx, store)

	if len(config.URL) == 0 {
		provider.WriteMessage(w, logID, "Missing URL value")
		return
	}

	if len(config.Username) == 0 {
		provider.WriteMessage(w, logID, "Missing Username value")
		return
	}

	if len(config.APIKey) == 0 {
		provider.WriteMessage(w, logID, "Missing APIKey value")
		return
	}

	if config.UserID == 0 {
		provider.WriteMessage(w, logID, "Missing UserId value")
		return
	}

	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/navigationcards/users/%d", config.URL, config.UserID), nil)

	creds := []byte(fmt.Sprintf("%s:%s", config.Username, config.APIKey))
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString(creds))

	client := &http.Client{}
	res, err := client.Do(req)

	if err != nil {
		fmt.Println(err)
		provider.WriteError(w, logID, err)
		return
	}

	if res.StatusCode != http.StatusOK {
		provider.WriteForbidden(w)
		return
	}

	defer res.Body.Close()
	var workspace interface{}

	dec := json.NewDecoder(res.Body)
	err = dec.Decode(&workspace)

	if err != nil {
		provider.WriteError(w, logID, err)
		return
	}

	provider.WriteJSON(w, workspace)
}

func items(ctx *provider.Context, store *domain.Store, w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		provider.WriteMessage(w, logID, "Bad payload")
		return
	}

	var config = geminiConfig{}
	err = json.Unmarshal(body, &config)

	if err != nil {
		provider.WriteMessage(w, logID, "Bad payload")
		return
	}

	config.Clean(ctx, store)

	if len(config.URL) == 0 {
		provider.WriteMessage(w, logID, "Missing URL value")
		return
	}

	if len(config.Username) == 0 {
		provider.WriteMessage(w, logID, "Missing Username value")
		return
	}

	if len(config.APIKey) == 0 {
		provider.WriteMessage(w, logID, "Missing APIKey value")
		return
	}

	creds := []byte(fmt.Sprintf("%s:%s", config.Username, config.APIKey))

	filter, err := json.Marshal(config.Filter)
	if err != nil {
		provider.WriteError(w, logID, err)
		return
	}

	var jsonFilter = []byte(string(filter))
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/api/items/filtered", config.URL), bytes.NewBuffer(jsonFilter))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString(creds))

	client := &http.Client{}
	res, err := client.Do(req)

	if err != nil {
		provider.WriteError(w, logID, err)
		return
	}

	if res.StatusCode != http.StatusOK {
		provider.WriteForbidden(w)
		return
	}

	defer res.Body.Close()
	var items interface{}

	dec := json.NewDecoder(res.Body)
	err = dec.Decode(&items)

	if err != nil {
		fmt.Println(err)
		provider.WriteError(w, logID, err)
		return
	}

	provider.WriteJSON(w, items)
}

func secs(ctx *provider.Context, store *domain.Store, w http.ResponseWriter, r *http.Request) {
	sec, _ := getSecrets(ctx, store)
	provider.WriteJSON(w, sec)
}
*/

type jiraConfig struct {
	JQL       int64                  `json:"jql"`
	ItemCount int                    `json:"itemCount"`
	Filter    map[string]interface{} `json:"filter"`
}

type jiraLogin struct {
	URL      string `json:"url"`
	Username string `json:"username"`
	Secret   string `json:"secret"`
}
