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
	"fmt"
	"html/template"
	"io/ioutil"
	"net/http"
	"net/url"

	"github.com/documize/community/documize/section/provider"
)

const me = "papertrail"

// Provider represents Gemini
type Provider struct {
}

// Meta describes us.
func (*Provider) Meta() provider.TypeMeta {
	section := provider.TypeMeta{}
	section.ID = "db0a3a0a-b5d4-4d00-bfac-ee28abba451d"
	section.Title = "Papertrail"
	section.Description = "Display log entries"
	section.ContentType = "papertrail"

	return section
}

// Render converts Papertrail data into HTML suitable for browser rendering.
func (*Provider) Render(config, data string) string {

	var search papertrailSearch
	var events []papertrailEvent
	var payload = papertrailRender{}
	var c = papertrailConfig{}

	json.Unmarshal([]byte(data), &search)
	json.Unmarshal([]byte(config), &c)

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
func (p *Provider) Command(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	method := query.Get("method")

	if len(method) == 0 {
		provider.WriteMessage(w, me, "missing method name")
		return
	}

	switch method {
	case "auth":
		auth(w, r)
		// case "items":
		// 	items(w, r)
	}
}

// Refresh just sends back data as-is.
func (*Provider) Refresh(config, data string) (newData string) {

	return data
	// var c = geminiConfig{}
	// err := json.Unmarshal([]byte(config), &c)
	//
	// if err != nil {
	// 	log.Error("Unable to read Gemini config", err)
	// 	return
	// }
	//
	// c.Clean()
	//
	// if len(c.URL) == 0 {
	// 	log.Info("Gemini.Refresh received empty URL")
	// 	return
	// }
	//
	// if len(c.Username) == 0 {
	// 	log.Info("Gemini.Refresh received empty username")
	// 	return
	// }
	//
	// if len(c.APIKey) == 0 {
	// 	log.Info("Gemini.Refresh received empty API key")
	// 	return
	// }
	//
	// req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/items/card/%d", c.URL, c.WorkspaceID), nil)
	// // req.Header.Set("Content-Type", "application/json")
	//
	// creds := []byte(fmt.Sprintf("%s:%s", c.Username, c.APIKey))
	// req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString(creds))
	//
	// client := &http.Client{}
	// res, err := client.Do(req)
	//
	// if err != nil {
	// 	fmt.Println(err)
	// 	return
	// }
	//
	// if res.StatusCode != http.StatusOK {
	// 	return
	// }
	//
	// defer res.Body.Close()
	// var items []geminiItem
	//
	// dec := json.NewDecoder(res.Body)
	// err = dec.Decode(&items)
	//
	// if err != nil {
	// 	fmt.Println(err)
	// 	return
	// }
	//
	// j, err := json.Marshal(items)
	//
	// if err != nil {
	// 	log.Error("unable to marshall gemini items", err)
	// 	return
	// }
	//
	// newData = string(j)
	// return
}

func auth(w http.ResponseWriter, r *http.Request) {
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

	if len(config.APIToken) == 0 {
		provider.WriteMessage(w, me, "Missing API token")
		return
	}

	var search string
	if len(config.Query) > 0 {
		search = "q=" + url.QueryEscape(config.Query)
	}
	req, err := http.NewRequest("GET", "https://papertrailapp.com/api/v1/events/search.json?"+search, nil)
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
	var result interface{}

	dec := json.NewDecoder(res.Body)
	err = dec.Decode(&result)

	if err != nil {
		fmt.Println(err)
		provider.WriteError(w, me, err)
		return
	}

	provider.WriteJSON(w, result)
}

//
// func workspace(w http.ResponseWriter, r *http.Request) {
// 	defer r.Body.Close()
// 	body, err := ioutil.ReadAll(r.Body)
//
// 	if err != nil {
// 		provider.WriteMessage(w, "gemini", "Bad payload")
// 		return
// 	}
//
// 	var config = geminiConfig{}
// 	err = json.Unmarshal(body, &config)
//
// 	if err != nil {
// 		provider.WriteMessage(w, "gemini", "Bad payload")
// 		return
// 	}
//
// 	config.Clean()
//
// 	if len(config.URL) == 0 {
// 		provider.WriteMessage(w, "gemini", "Missing URL value")
// 		return
// 	}
//
// 	if len(config.Username) == 0 {
// 		provider.WriteMessage(w, "gemini", "Missing Username value")
// 		return
// 	}
//
// 	if len(config.APIKey) == 0 {
// 		provider.WriteMessage(w, "gemini", "Missing APIKey value")
// 		return
// 	}
//
// 	if config.UserID == 0 {
// 		provider.WriteMessage(w, "gemini", "Missing UserId value")
// 		return
// 	}
//
// 	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/navigationcards/users/%d", config.URL, config.UserID), nil)
//
// 	creds := []byte(fmt.Sprintf("%s:%s", config.Username, config.APIKey))
// 	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString(creds))
//
// 	client := &http.Client{}
// 	res, err := client.Do(req)
//
// 	if err != nil {
// 		fmt.Println(err)
// 		provider.WriteError(w, "gemini", err)
// 		return
// 	}
//
// 	if res.StatusCode != http.StatusOK {
// 		provider.WriteForbidden(w)
// 		return
// 	}
//
// 	defer res.Body.Close()
// 	var workspace interface{}
//
// 	dec := json.NewDecoder(res.Body)
// 	err = dec.Decode(&workspace)
//
// 	if err != nil {
// 		fmt.Println(err)
// 		provider.WriteError(w, "gemini", err)
// 		return
// 	}
//
// 	provider.WriteJSON(w, workspace)
// }
//
// func items(w http.ResponseWriter, r *http.Request) {
// 	defer r.Body.Close()
// 	body, err := ioutil.ReadAll(r.Body)
//
// 	if err != nil {
// 		provider.WriteMessage(w, "gemini", "Bad payload")
// 		return
// 	}
//
// 	var config = geminiConfig{}
// 	err = json.Unmarshal(body, &config)
//
// 	if err != nil {
// 		provider.WriteMessage(w, "gemini", "Bad payload")
// 		return
// 	}
//
// 	config.Clean()
//
// 	if len(config.URL) == 0 {
// 		provider.WriteMessage(w, "gemini", "Missing URL value")
// 		return
// 	}
//
// 	if len(config.Username) == 0 {
// 		provider.WriteMessage(w, "gemini", "Missing Username value")
// 		return
// 	}
//
// 	if len(config.APIKey) == 0 {
// 		provider.WriteMessage(w, "gemini", "Missing APIKey value")
// 		return
// 	}
//
// 	creds := []byte(fmt.Sprintf("%s:%s", config.Username, config.APIKey))
//
// 	filter, err := json.Marshal(config.Filter)
// 	if err != nil {
// 		fmt.Println(err)
// 		provider.WriteError(w, "gemini", err)
// 		return
// 	}
//
// 	var jsonFilter = []byte(string(filter))
// 	req, err := http.NewRequest("POST", fmt.Sprintf("%s/api/items/filtered", config.URL), bytes.NewBuffer(jsonFilter))
// 	req.Header.Set("Content-Type", "application/json")
// 	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString(creds))
//
// 	client := &http.Client{}
// 	res, err := client.Do(req)
//
// 	if err != nil {
// 		fmt.Println(err)
// 		provider.WriteError(w, "gemini", err)
// 		return
// 	}
//
// 	if res.StatusCode != http.StatusOK {
// 		provider.WriteForbidden(w)
// 		return
// 	}
//
// 	defer res.Body.Close()
// 	var items interface{}
//
// 	dec := json.NewDecoder(res.Body)
// 	err = dec.Decode(&items)
//
// 	if err != nil {
// 		fmt.Println(err)
// 		provider.WriteError(w, "gemini", err)
// 		return
// 	}
//
// 	provider.WriteJSON(w, items)
// }
