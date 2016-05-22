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

package section

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/documize/community/wordsmith/log"
)

// the HTML that is rendered by this section.
const renderTemplate = `
{{if .Authenticated}}
<p class="margin-left-20">The Gemini workspace <a href="{{.Config.URL}}/workspace/{{.Config.WorkspaceID}}/items">{{.Config.WorkspaceName}}</a> contains {{.Config.ItemCount}} items.</p>
<table class="basic-table gemini-table">
	<thead>
		<tr>
			<th class="bordered no-width">Item Key</th>
			<th class="bordered">Title</th>
			<th class="bordered no-width">Type</th>
			<th class="bordered no-width">Status</th>
		</tr>
	</thead>
	<tbody>
		{{$wid := .Config.WorkspaceID}}
		{{$app := .Config.URL}}
		{{range $item := .Items}}
		<tr>
			<td class="bordered no-width"><a href="{{ $app }}/workspace/{{ $wid }}/item/{{ $item.ID }}">{{ $item.IssueKey }}</a></td>
			<td class="bordered">{{ $item.Title }}</td>
			<td class="bordered no-width"><img src='{{ $item.TypeImage }}' />&nbsp;{{ $item.Type }}</td>
			<td class="bordered no-width"><img src='{{ $item.StatusImage }}' />&nbsp;{{ $item.Status }}</td>
		</tr>
		{{end}}
	</tbody>
</table>
{{else}}
<p>Authenticate with Gemini to see items.</p>
{{end}}
`

type gemini struct {
}

// Register ourselves.
func init() {
	sectionsMap["gemini"] = &gemini{}
}

// Meta describes this section type.
func (*gemini) Meta() TypeMeta {
	section := TypeMeta{}
	section.ID = "23b133f9-4020-4616-9291-a98fb939735f"
	section.Title = "Gemini"
	section.Description = "Display work items and tickets from workspaces"
	section.ContentType = "gemini"

	return section
}

// Render converts Gemini data into HTML suitable for browser rendering.
func (*gemini) Render(config, data string) string {
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
func (*gemini) Command(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	method := query.Get("method")

	if len(method) == 0 {
		writeMessage(w, "gemini", "missing method name")
		return
	}

	switch method {
	case "auth":
		auth(w, r)
	case "workspace":
		workspace(w, r)
	case "items":
		items(w, r)
	}
}

// Refresh just sends back data as-is.
func (*gemini) Refresh(config, data string) (newData string) {
	var c = geminiConfig{}
	err := json.Unmarshal([]byte(config), &c)

	if err != nil {
		log.Error("Unable to read Gemini config", err)
		return
	}

	c.Clean()

	if len(c.URL) == 0 {
		log.Info("Gemini.Refresh received empty URL")
		return
	}

	if len(c.Username) == 0 {
		log.Info("Gemini.Refresh received empty username")
		return
	}

	if len(c.APIKey) == 0 {
		log.Info("Gemini.Refresh received empty API key")
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
		fmt.Println(err)
		return
	}

	j, err := json.Marshal(items)

	if err != nil {
		log.Error("unable to marshall gemini items", err)
		return
	}

	newData = string(j)
	return
}

// Gemini helpers
type geminiRender struct {
	Config        geminiConfig
	Items         []geminiItem
	Authenticated bool
}

type geminiItem struct {
	ID          int64
	IssueKey    string
	Title       string
	Type        string
	TypeImage   string
	Status      string
	StatusImage string
}

type geminiUser struct {
	BaseEntity struct {
		ID        int    `json:"id"`
		Username  string `json:"username"`
		Firstname string `json:"firstname"`
		Surname   string `json:"surname"`
		Email     string `json:"email"`
	}
}

type geminiConfig struct {
	URL           string                 `json:"url"`
	Username      string                 `json:"username"`
	APIKey        string                 `json:"apikey"`
	UserID        int64                  `json:"userId"`
	WorkspaceID   int64                  `json:"workspaceId"`
	WorkspaceName string                 `json:"workspaceName"`
	ItemCount     int                    `json:"itemCount"`
	Filter        map[string]interface{} `json:"filter"`
}

func (c *geminiConfig) Clean() {
	c.APIKey = strings.TrimSpace(c.APIKey)
	c.Username = strings.TrimSpace(c.Username)
	c.URL = strings.TrimSpace(c.URL)
}

func auth(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writeMessage(w, "gemini", "Bad payload")
		return
	}

	var config = geminiConfig{}
	err = json.Unmarshal(body, &config)

	if err != nil {
		writeMessage(w, "gemini", "Bad payload")
		return
	}

	config.Clean()

	if len(config.URL) == 0 {
		writeMessage(w, "gemini", "Missing URL value")
		return
	}

	if len(config.Username) == 0 {
		writeMessage(w, "gemini", "Missing Username value")
		return
	}

	if len(config.APIKey) == 0 {
		writeMessage(w, "gemini", "Missing APIKey value")
		return
	}

	creds := []byte(fmt.Sprintf("%s:%s", config.Username, config.APIKey))

	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/users/username/%s", config.URL, config.Username), nil)
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString(creds))

	client := &http.Client{}
	res, err := client.Do(req)

	if err != nil {
		fmt.Println(err)
		writeError(w, "gemini", err)
		return
	}

	if res.StatusCode != http.StatusOK {
		writeForbidden(w)
		return
	}

	defer res.Body.Close()
	var g = geminiUser{}

	dec := json.NewDecoder(res.Body)
	err = dec.Decode(&g)

	if err != nil {
		fmt.Println(err)
		writeError(w, "gemini", err)
		return
	}

	writeJSON(w, g)
}

func workspace(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writeMessage(w, "gemini", "Bad payload")
		return
	}

	var config = geminiConfig{}
	err = json.Unmarshal(body, &config)

	if err != nil {
		writeMessage(w, "gemini", "Bad payload")
		return
	}

	config.Clean()

	if len(config.URL) == 0 {
		writeMessage(w, "gemini", "Missing URL value")
		return
	}

	if len(config.Username) == 0 {
		writeMessage(w, "gemini", "Missing Username value")
		return
	}

	if len(config.APIKey) == 0 {
		writeMessage(w, "gemini", "Missing APIKey value")
		return
	}

	if config.UserID == 0 {
		writeMessage(w, "gemini", "Missing UserId value")
		return
	}

	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/navigationcards/users/%d", config.URL, config.UserID), nil)

	creds := []byte(fmt.Sprintf("%s:%s", config.Username, config.APIKey))
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString(creds))

	client := &http.Client{}
	res, err := client.Do(req)

	if err != nil {
		fmt.Println(err)
		writeError(w, "gemini", err)
		return
	}

	if res.StatusCode != http.StatusOK {
		writeForbidden(w)
		return
	}

	defer res.Body.Close()
	var workspace interface{}

	dec := json.NewDecoder(res.Body)
	err = dec.Decode(&workspace)

	if err != nil {
		fmt.Println(err)
		writeError(w, "gemini", err)
		return
	}

	writeJSON(w, workspace)
}

func items(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writeMessage(w, "gemini", "Bad payload")
		return
	}

	var config = geminiConfig{}
	err = json.Unmarshal(body, &config)

	if err != nil {
		writeMessage(w, "gemini", "Bad payload")
		return
	}

	config.Clean()

	if len(config.URL) == 0 {
		writeMessage(w, "gemini", "Missing URL value")
		return
	}

	if len(config.Username) == 0 {
		writeMessage(w, "gemini", "Missing Username value")
		return
	}

	if len(config.APIKey) == 0 {
		writeMessage(w, "gemini", "Missing APIKey value")
		return
	}

	creds := []byte(fmt.Sprintf("%s:%s", config.Username, config.APIKey))

	filter, err := json.Marshal(config.Filter)
	if err != nil {
		fmt.Println(err)
		writeError(w, "gemini", err)
		return
	}

	var jsonFilter = []byte(string(filter))
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/api/items/filtered", config.URL), bytes.NewBuffer(jsonFilter))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString(creds))

	client := &http.Client{}
	res, err := client.Do(req)

	if err != nil {
		fmt.Println(err)
		writeError(w, "gemini", err)
		return
	}

	if res.StatusCode != http.StatusOK {
		writeForbidden(w)
		return
	}

	defer res.Body.Close()
	var items interface{}

	dec := json.NewDecoder(res.Body)
	err = dec.Decode(&items)

	if err != nil {
		fmt.Println(err)
		writeError(w, "gemini", err)
		return
	}

	writeJSON(w, items)
}
