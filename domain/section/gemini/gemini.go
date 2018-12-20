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

package gemini

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain/section/provider"
	"github.com/documize/community/domain/store"
)

// Provider represents Gemini
type Provider struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Meta describes us.
func (*Provider) Meta() provider.TypeMeta {
	section := provider.TypeMeta{}
	section.ID = "23b133f9-4020-4616-9291-a98fb939735f"
	section.Title = "Gemini"
	section.Description = "Work items and tickets"
	section.ContentType = "gemini"
	section.PageType = "tab"

	return section
}

// Render converts Gemini data into HTML suitable for browser rendering.
func (*Provider) Render(ctx *provider.Context, config, data string) string {
	var items []geminiItem
	var payload = geminiRender{}
	var c = geminiConfig{}

	json.Unmarshal([]byte(data), &items)
	json.Unmarshal([]byte(config), &c)

	c.ItemCount = len(items)

	payload.Items = items
	payload.Config = c
	payload.Authenticated = c.UserID > 0

	t := template.New("items")
	t, _ = t.Parse(renderTemplate)

	buffer := new(bytes.Buffer)
	t.Execute(buffer, payload)

	return buffer.String()
}

// Command handles authentication, workspace listing and items retrieval.
func (p *Provider) Command(ctx *provider.Context, w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	method := query.Get("method")

	if len(method) == 0 {
		provider.WriteMessage(w, "gemini", "missing method name")
		return
	}

	switch method {
	case "secrets":
		secs(ctx, p.Store, w, r)
	case "auth":
		auth(ctx, p.Store, w, r)
	case "workspace":
		workspace(ctx, p.Store, w, r)
	case "items":
		items(ctx, p.Store, w, r)
	}
}

// Refresh just sends back data as-is.
func (p *Provider) Refresh(ctx *provider.Context, config, data string) (newData string) {
	var c = geminiConfig{}
	err := json.Unmarshal([]byte(config), &c)

	if err != nil {
		p.Runtime.Log.Error("Unable to read Gemini config", err)
		return
	}

	c.Clean(ctx, p.Store)

	if len(c.URL) == 0 {
		p.Runtime.Log.Info("Gemini.Refresh received empty URL")
		return
	}

	if len(c.Username) == 0 {
		p.Runtime.Log.Info("Gemini.Refresh received empty username")
		return
	}

	if len(c.APIKey) == 0 {
		p.Runtime.Log.Info("Gemini.Refresh received empty API key")
		return
	}

	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/items/card/%d", c.URL, c.WorkspaceID), nil)
	// req.Header.Set("Content-Type", "application/json")

	creds := []byte(fmt.Sprintf("%s:%s", c.Username, c.APIKey))
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString(creds))

	client := &http.Client{}
	res, err := client.Do(req)

	if err != nil {
		fmt.Println(err)
		return
	}

	if res.StatusCode != http.StatusOK {
		return
	}

	defer res.Body.Close()
	var items []geminiItem

	dec := json.NewDecoder(res.Body)
	err = dec.Decode(&items)
	if err != nil {
		p.Runtime.Log.Error("unable to Decode gemini items", err)
		return
	}

	j, err := json.Marshal(items)
	if err != nil {
		p.Runtime.Log.Error("unable to marshal gemini items", err)
		return
	}

	newData = string(j)
	return
}

func auth(ctx *provider.Context, store *store.Store, w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		provider.WriteMessage(w, "gemini", "Bad payload")
		return
	}

	var config = geminiConfig{}
	err = json.Unmarshal(body, &config)
	if err != nil {
		provider.WriteMessage(w, "gemini", "Bad payload")
		return
	}

	config.Clean(nil, store) // don't look at the database for the parameters

	if len(config.URL) == 0 {
		provider.WriteMessage(w, "gemini", "Missing URL value")
		return
	}
	if len(config.Username) == 0 {
		provider.WriteMessage(w, "gemini", "Missing Username value")
		return
	}
	if len(config.APIKey) == 0 {
		provider.WriteMessage(w, "gemini", "Missing APIKey value")
		return
	}

	creds := []byte(fmt.Sprintf("%s:%s", config.Username, config.APIKey))
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/users/username/%s", config.URL, config.Username), nil)
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString(creds))

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		provider.WriteError(w, "gemini", err)
		fmt.Println(err)
		return
	}
	if res.StatusCode != http.StatusOK {
		provider.WriteForbidden(w)
		return
	}

	config.SaveSecrets(ctx, store)

	defer res.Body.Close()
	var g = geminiUser{}

	dec := json.NewDecoder(res.Body)
	err = dec.Decode(&g)
	if err != nil {
		provider.WriteError(w, "gemini", err)
		fmt.Println(err)
		return
	}

	provider.WriteJSON(w, g)
}

func workspace(ctx *provider.Context, store *store.Store, w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		provider.WriteMessage(w, "gemini", "Bad payload")
		return
	}

	var config = geminiConfig{}
	err = json.Unmarshal(body, &config)

	if err != nil {
		provider.WriteMessage(w, "gemini", "Bad payload")
		return
	}

	config.Clean(ctx, store)

	if len(config.URL) == 0 {
		provider.WriteMessage(w, "gemini", "Missing URL value")
		return
	}

	if len(config.Username) == 0 {
		provider.WriteMessage(w, "gemini", "Missing Username value")
		return
	}

	if len(config.APIKey) == 0 {
		provider.WriteMessage(w, "gemini", "Missing APIKey value")
		return
	}

	if config.UserID == 0 {
		provider.WriteMessage(w, "gemini", "Missing UserId value")
		return
	}

	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/navigationcards/users/%d", config.URL, config.UserID), nil)

	creds := []byte(fmt.Sprintf("%s:%s", config.Username, config.APIKey))
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString(creds))

	client := &http.Client{}
	res, err := client.Do(req)

	if err != nil {
		fmt.Println(err)
		provider.WriteError(w, "gemini", err)
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
		provider.WriteError(w, "gemini", err)
		return
	}

	provider.WriteJSON(w, workspace)
}

func items(ctx *provider.Context, store *store.Store, w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		provider.WriteMessage(w, "gemini", "Bad payload")
		return
	}

	var config = geminiConfig{}
	err = json.Unmarshal(body, &config)

	if err != nil {
		provider.WriteMessage(w, "gemini", "Bad payload")
		return
	}

	config.Clean(ctx, store)

	if len(config.URL) == 0 {
		provider.WriteMessage(w, "gemini", "Missing URL value")
		return
	}

	if len(config.Username) == 0 {
		provider.WriteMessage(w, "gemini", "Missing Username value")
		return
	}

	if len(config.APIKey) == 0 {
		provider.WriteMessage(w, "gemini", "Missing APIKey value")
		return
	}

	creds := []byte(fmt.Sprintf("%s:%s", config.Username, config.APIKey))

	filter, err := json.Marshal(config.Filter)
	if err != nil {
		provider.WriteError(w, "gemini", err)
		return
	}

	var jsonFilter = []byte(string(filter))
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/api/items/filtered", config.URL), bytes.NewBuffer(jsonFilter))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString(creds))

	client := &http.Client{}
	res, err := client.Do(req)

	if err != nil {
		provider.WriteError(w, "gemini", err)
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
		provider.WriteError(w, "gemini", err)
		return
	}

	provider.WriteJSON(w, items)
}

func secs(ctx *provider.Context, store *store.Store, w http.ResponseWriter, r *http.Request) {
	sec, _ := getSecrets(ctx, store)
	provider.WriteJSON(w, sec)
}
