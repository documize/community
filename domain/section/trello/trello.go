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

package trello

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain/section/provider"
	"github.com/documize/community/domain/store"
)

var meta provider.TypeMeta

func init() {
	meta = provider.TypeMeta{}

	meta.ID = "c455a552-202e-441c-ad79-397a8152920b"
	meta.Title = "Trello"
	meta.Description = "Embed cards from boards and lists"
	meta.ContentType = "trello"
	meta.PageType = "tab"
}

// Provider represents Trello
type Provider struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Meta describes us.
func (*Provider) Meta() provider.TypeMeta {
	return meta
}

// Command stub.
func (p *Provider) Command(ctx *provider.Context, w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	method := query.Get("method")

	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		provider.WriteMessage(w, "trello", "Bad body")
		return
	}

	var config = trelloConfig{}
	err = json.Unmarshal(body, &config)

	if err != nil {
		provider.WriteError(w, "trello", err)
		return
	}

	config.Clean()
	config.AppKey, _ = p.Store.Setting.Get(meta.ConfigHandle(), "appKey")

	if len(config.AppKey) == 0 {
		p.Runtime.Log.Info("missing trello App Key")
		provider.WriteMessage(w, "trello", "Missing appKey")
		return
	}

	if len(config.Token) == 0 {
		config.Token = ctx.GetSecrets("token", p.Store) // get a token, if we have one
	}

	if method != "config" {
		if len(config.Token) == 0 {
			provider.WriteMessage(w, "trello", "Missing token")
			return
		}
	}

	switch method {
	case "cards":
		render, err := getCards(config)

		if err != nil {
			p.Runtime.Log.Error("failed to render cards", err)
			provider.WriteError(w, "trello", err)
			ctx.SaveSecrets("", p.Store) // failure means our secrets are invalid
			return
		}

		provider.WriteJSON(w, render)

	case "boards":
		render, err := getBoards(config)

		if err != nil {
			p.Runtime.Log.Error("failed to render board", err)
			provider.WriteError(w, "trello", err)
			ctx.SaveSecrets("", p.Store) // failure means our secrets are invalid
			return
		}

		provider.WriteJSON(w, render)

	case "lists":
		render, err := getLists(config)

		if err != nil {
			p.Runtime.Log.Error("failed to get Trello lists", err)
			provider.WriteError(w, "trello", err)
			ctx.SaveSecrets("", p.Store) // failure means our secrets are invalid
			return
		}

		provider.WriteJSON(w, render)

	case "config":
		var ret struct {
			AppKey string `json:"appKey"`
			Token  string `json:"token"`
		}
		ret.AppKey = config.AppKey
		if config.Token != "" {
			ret.Token = provider.SecretReplacement
		}
		provider.WriteJSON(w, ret)
		return

	default:
		p.Runtime.Log.Info("unknown trello method called: " + method)
		provider.WriteMessage(w, "trello", "missing method name")
		return
	}

	// the token has just worked, so save it as our secret
	var s secrets
	s.Token = config.Token
	b, e := json.Marshal(s)
	if err != nil {
		p.Runtime.Log.Error("failed save Trello secrets", e)
	}

	ctx.SaveSecrets(string(b), p.Store)
}

// Render just sends back HMTL as-is.
func (*Provider) Render(ctx *provider.Context, config, data string) string {
	raw := []trelloListCards{}
	payload := trelloRender{}
	var c = trelloConfig{}

	json.Unmarshal([]byte(data), &raw)
	json.Unmarshal([]byte(config), &c)

	payload.Board = c.Board
	payload.Data = raw
	payload.ListCount = len(raw)

	for _, list := range raw {
		payload.CardCount += len(list.Cards)
	}

	t := template.New("trello")
	t, _ = t.Parse(renderTemplate)

	buffer := new(bytes.Buffer)
	t.Execute(buffer, payload)

	return buffer.String()
}

// Refresh just sends back data as-is.
func (p *Provider) Refresh(ctx *provider.Context, config, data string) string {
	var c = trelloConfig{}
	json.Unmarshal([]byte(config), &c)

	refreshed, err := getCards(c)

	if err != nil {
		return data
	}

	j, err := json.Marshal(refreshed)

	if err != nil {
		p.Runtime.Log.Error("failed to marshal trello data", err)
		return data
	}

	return string(j)
}

// Helpers
func getBoards(config trelloConfig) (boards []trelloBoard, err error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("https://api.trello.com/1/members/me/boards?fields=id,name,url,closed,prefs,idOrganization&key=%s&token=%s", config.AppKey, config.Token), nil)
	client := &http.Client{}
	res, err := client.Do(req)

	if err != nil {
		return nil, err
	}

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error: HTTP status code %d", res.StatusCode)
	}

	b := []trelloBoard{}

	defer res.Body.Close()
	dec := json.NewDecoder(res.Body)
	err = dec.Decode(&b)

	// we only show open, team boards (not personal)
	for _, b := range b {
		if !b.Closed && len(b.OrganizationID) > 0 {
			boards = append(boards, b)
		}
	}

	if err != nil {
		return nil, err
	}

	return boards, nil
}

func getLists(config trelloConfig) (lists []trelloList, err error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("https://api.trello.com/1/boards/%s/lists/open?key=%s&token=%s", config.Board.ID, config.AppKey, config.Token), nil)
	client := &http.Client{}
	res, err := client.Do(req)

	if err != nil {
		return nil, err
	}

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error: HTTP status code %d", res.StatusCode)
	}

	defer res.Body.Close()

	dec := json.NewDecoder(res.Body)
	err = dec.Decode(&lists)

	if err != nil {
		return nil, err
	}

	return lists, nil
}

func getCards(config trelloConfig) (listCards []trelloListCards, err error) {
	for _, list := range config.Lists {

		// don't process lists that user excluded from rendering
		if !list.Included {
			continue
		}

		req, err := http.NewRequest("GET", fmt.Sprintf("https://api.trello.com/1/lists/%s/cards?key=%s&token=%s", list.ID, config.AppKey, config.Token), nil)
		client := &http.Client{}
		res, err := client.Do(req)

		if err != nil {
			return nil, err
		}

		if res.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("error: HTTP status code %d", res.StatusCode)
		}

		defer res.Body.Close()
		var cards []trelloCard

		dec := json.NewDecoder(res.Body)
		err = dec.Decode(&cards)

		if err != nil {
			return nil, err
		}

		data := trelloListCards{}
		data.Cards = cards
		data.List = list

		listCards = append(listCards, data)
	}

	return listCards, nil
}
