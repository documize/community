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

package papertrail

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"io/ioutil"
	"net/http"
	"net/url"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain/section/provider"
	"github.com/documize/community/domain/store"
)

const me = "papertrail"

// Provider represents Papertrail
type Provider struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Meta describes us.
func (*Provider) Meta() provider.TypeMeta {
	section := provider.TypeMeta{}
	section.ID = "db0a3a0a-b5d4-4d00-bfac-ee28abba451d"
	section.Title = "Papertrail"
	section.Description = "Display log entries"
	section.ContentType = "papertrail"
	section.PageType = "tab"

	return section
}

// Render converts Papertrail data into HTML suitable for browser rendering.
func (p *Provider) Render(ctx *provider.Context, config, data string) string {
	var search papertrailSearch
	var events []papertrailEvent
	var payload = papertrailRender{}
	var c = papertrailConfig{}

	json.Unmarshal([]byte(data), &search)
	json.Unmarshal([]byte(config), &c)

	c.APIToken = ctx.GetSecrets("APIToken", p.Store)

	max := len(search.Events)
	if c.Max < max {
		max = c.Max
	}

	events = search.Events[:max]
	payload.Count = len(events)
	payload.HasData = payload.Count > 0

	payload.Events = events
	payload.Config = c
	payload.Authenticated = c.APIToken != ""

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
		provider.WriteMessage(w, me, "missing method name")
		return
	}

	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		provider.WriteMessage(w, me, "Bad payload")
		return
	}

	var config = papertrailConfig{}
	err = json.Unmarshal(body, &config)

	if err != nil {
		provider.WriteMessage(w, me, "Bad config")
		return
	}

	config.Clean()

	if config.APIToken == provider.SecretReplacement || config.APIToken == "" {
		config.APIToken = ctx.GetSecrets("APIToken", p.Store)
	}

	if len(config.APIToken) == 0 {
		provider.WriteMessage(w, me, "Missing API token")
		return
	}

	switch method {
	case "auth":
		auth(p.Runtime, p.Store, ctx, config, w, r)
	case "options":
		options(config, w, r)
	}
}

// Refresh just sends back data as-is.
func (p *Provider) Refresh(ctx *provider.Context, config, data string) (newData string) {
	var c = papertrailConfig{}
	err := json.Unmarshal([]byte(config), &c)

	if err != nil {
		p.Runtime.Log.Error("unable to read Papertrail config", err)
		return
	}

	c.Clean()

	c.APIToken = ctx.GetSecrets("APIToken", p.Store)

	if len(c.APIToken) == 0 {
		p.Runtime.Log.Error("missing API token", err)
		return
	}

	result, err := fetchEvents(p.Runtime, c)

	if err != nil {
		p.Runtime.Log.Error("Papertrail fetchEvents failed", err)
		return
	}

	j, err := json.Marshal(result)

	if err != nil {
		p.Runtime.Log.Error("unable to marshal Papaertrail events", err)
		return
	}

	newData = string(j)
	return
}

func auth(rt *env.Runtime, store *store.Store, ctx *provider.Context, config papertrailConfig, w http.ResponseWriter, r *http.Request) {
	result, err := fetchEvents(rt, config)

	if result == nil {
		err = errors.New("nil result of papertrail query")
	}

	if err != nil {

		ctx.SaveSecrets(`{"APIToken":""}`, store) // invalid token, so reset it

		if err.Error() == "forbidden" {
			provider.WriteForbidden(w)
		} else {
			provider.WriteError(w, me, err)
		}

		return
	}

	ctx.SaveSecrets(`{"APIToken":"`+config.APIToken+`"}`, store)

	provider.WriteJSON(w, result)
}

func options(config papertrailConfig, w http.ResponseWriter, r *http.Request) {
	// get systems
	req, err := http.NewRequest("GET", "https://papertrailapp.com/api/v1/systems.json", nil)
	req.Header.Set("X-Papertrail-Token", config.APIToken)

	client := &http.Client{}
	res, err := client.Do(req)

	if err != nil {
		fmt.Println(err)
		provider.WriteError(w, me, err)
		return
	}

	if res.StatusCode != http.StatusOK {
		provider.WriteForbidden(w)
		return
	}

	defer res.Body.Close()
	var systems []papertrailOption

	dec := json.NewDecoder(res.Body)
	err = dec.Decode(&systems)

	if err != nil {
		fmt.Println(err)
		provider.WriteError(w, me, err)
		return
	}

	// get groups
	req, err = http.NewRequest("GET", "https://papertrailapp.com/api/v1/groups.json", nil)
	req.Header.Set("X-Papertrail-Token", config.APIToken)

	client = &http.Client{}
	res, err = client.Do(req)

	if err != nil {
		fmt.Println(err)
		provider.WriteError(w, me, err)
		return
	}

	if res.StatusCode != http.StatusOK {
		provider.WriteForbidden(w)
		return
	}

	defer res.Body.Close()
	var groups []papertrailOption

	dec = json.NewDecoder(res.Body)
	err = dec.Decode(&groups)

	if err != nil {
		fmt.Println(err)
		provider.WriteError(w, me, err)
		return
	}

	var options = papertrailOptions{}
	options.Groups = groups
	options.Systems = systems

	provider.WriteJSON(w, options)
}

func fetchEvents(rt *env.Runtime, config papertrailConfig) (result interface{}, err error) {
	var filter string
	if len(config.Query) > 0 {
		filter = fmt.Sprintf("q=%s", url.QueryEscape(config.Query))
	}
	if config.Group.ID > 0 {
		prefix := ""
		if len(filter) > 0 {
			prefix = "&"
		}
		filter = fmt.Sprintf("%s%sgroup_id=%d", filter, prefix, config.Group.ID)
	}

	var req *http.Request
	req, err = http.NewRequest("GET", "https://papertrailapp.com/api/v1/events/search.json?"+filter, nil)
	if err != nil {
		rt.Log.Error("new request", err)
		return
	}
	req.Header.Set("X-Papertrail-Token", config.APIToken)

	client := &http.Client{}
	var res *http.Response
	res, err = client.Do(req)

	if err != nil {
		rt.Log.Error("message", err)
		return
	}

	if res.StatusCode != http.StatusOK {
		rt.Log.Error("forbidden", err)
		return
	}

	defer res.Body.Close()

	dec := json.NewDecoder(res.Body)
	err = dec.Decode(&result)

	if err != nil {
		rt.Log.Error("unable to read result", err)
	}

	return
}
