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
	"sort"
	"time"
	"unicode"

	"github.com/documize/community/core/api/request"
	"github.com/documize/community/core/log"
	"github.com/documize/community/core/section/provider"
)

var meta provider.TypeMeta

func init() {
	meta = provider.TypeMeta{}
	meta.ID = "c455a552-202e-441c-ad79-397a8152920b"
	meta.Title = "Trello"
	meta.Description = "Embed cards from boards and lists"
	meta.ContentType = "trello"
}

// Provider represents Trello
type Provider struct {
}

// Meta describes us
func (*Provider) Meta() provider.TypeMeta {
	return meta
}

// Command stub.
func (*Provider) Command(ctx *provider.Context, w http.ResponseWriter, r *http.Request) {
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
	config.AppKey = request.ConfigString(meta.ConfigHandle(), "appKey")

	if len(config.AppKey) == 0 {
		log.ErrorString("missing trello App Key")
		provider.WriteMessage(w, "trello", "Missing appKey")
		return
	}

	if len(config.Token) == 0 {
		config.Token = ctx.GetSecrets("token") // get a token, if we have one
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
			log.IfErr(err)
			provider.WriteError(w, "trello", err)
			log.IfErr(ctx.SaveSecrets("")) // failure means our secrets are invalid
			return
		}

		provider.WriteJSON(w, render)

	case "boards":
		render, err := getBoards(config)

		if err != nil {
			log.IfErr(err)
			provider.WriteError(w, "trello", err)
			log.IfErr(ctx.SaveSecrets("")) // failure means our secrets are invalid
			return
		}

		provider.WriteJSON(w, render)

	case "lists":
		render, err := getLists(config)

		if err != nil {
			log.IfErr(err)
			provider.WriteError(w, "trello", err)
			log.IfErr(ctx.SaveSecrets("")) // failure means our secrets are invalid
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
		log.ErrorString("trello unknown method name: " + method)
		provider.WriteMessage(w, "trello", "missing method name")
		return
	}

	// the token has just worked, so save it as our secret
	var s secrets
	s.Token = config.Token
	b, e := json.Marshal(s)
	log.IfErr(e)
	log.IfErr(ctx.SaveSecrets(string(b)))
}

// Render the payload using the template.
func (*Provider) Render(ctx *provider.Context, config, data string) string {
	var payload = trelloRender{}
	var c = trelloConfig{}

	json.Unmarshal([]byte(data), &payload)
	json.Unmarshal([]byte(config), &c)

	buildPayloadAnalysis(&c, &payload)

	t := template.New("trello")
	var err error
	t, err = t.Parse(renderTemplate)

	if err != nil {
		log.IfErr(err)
		return ""
	}

	buffer := new(bytes.Buffer)
	err = t.Execute(buffer, payload)

	if err != nil {
		log.IfErr(err)
		return ""
	}

	return buffer.String()
}

// Refresh just sends back data as-is.
func (*Provider) Refresh(ctx *provider.Context, config, data string) string {
	var c = trelloConfig{}
	json.Unmarshal([]byte(config), &c)

	save := trelloRender{}
	save.Boards = make([]trelloRenderBoard, 0, len(c.Boards))

	for _, board := range c.Boards {

		var payload = trelloRenderBoard{}

		c.Board = board
		c.AppKey = request.ConfigString(meta.ConfigHandle(), "appKey")

		lsts, err := getLists(c)
		log.IfErr(err)
		if err == nil {
			c.Lists = lsts
		}

		for l := range c.Lists {
			c.Lists[l].Included = true
		}

		refreshed, err := getCards(c)
		log.IfErr(err)

		payload.Board = c.Board
		payload.Data = refreshed
		payload.ListCount = len(refreshed)

		for _, list := range refreshed {
			payload.CardCount += len(list.Cards)
		}

		payload.Actions, payload.Archived = fetchBoardActions(&c, &save, board.ID, nil) // TODO pass in date

		save.Boards = append(save.Boards, payload)
	}

	save.Since = "# 1 Aug 2016 #"

	j, err := json.Marshal(save)

	if err != nil {
		log.Error("unable to marshall trello cards", err)
		return data
	}

	return string(j)
}

// Helpers
func getBoards(config trelloConfig) (boards []trelloBoard, err error) {
	req, err := http.NewRequest("GET", fmt.Sprintf(
		"https://api.trello.com/1/members/me/boards?fields=id,name,url,closed,prefs,idOrganization&key=%s&token=%s",
		config.AppKey, config.Token), nil)
	log.IfErr(err)
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
		fmt.Println(err)
		return nil, err
	}

	return boards, nil
}

func getLists(config trelloConfig) (lists []trelloList, err error) {
	uri := fmt.Sprintf("https://api.trello.com/1/boards/%s/lists/open?key=%s&token=%s", config.Board.ID, config.AppKey, config.Token)
	req, err := http.NewRequest("GET", uri, nil)
	log.IfErr(err)
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
		fmt.Println(err)
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
		log.IfErr(err)
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

func fetchMember(config *trelloConfig, render *trelloRender, memberID string) (memberInfo trelloMember) {
	memberInfo.FullName = "(unknown)"

	if render.MembersByID == nil {
		render.MembersByID = make(map[string]trelloMember)
	}
	found := false
	if memberInfo, found = render.MembersByID[memberID]; found {
		return
	}
	render.MembersByID[memberID] = memberInfo // write unknown, so that we do not retry on errors

	if len(config.AppKey) == 0 {
		config.AppKey = request.ConfigString(meta.ConfigHandle(), "appKey")
	}
	uri := fmt.Sprintf("https://api.trello.com/1/members/%s?key=%s&token=%s", memberID, config.AppKey, config.Token)
	req, err := http.NewRequest("GET", uri, nil)
	if err != nil {
		log.IfErr(err)
		return
	}
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		log.IfErr(err)
		return
	}

	if res.StatusCode != http.StatusOK {
		log.ErrorString("Trello fetch member HTTP status not OK")
		return
	}

	defer res.Body.Close()

	dec := json.NewDecoder(res.Body)
	err = dec.Decode(&memberInfo)
	if err != nil {
		log.IfErr(err)
		return
	}

	render.MembersByID[memberID] = memberInfo

	return
}

func fetchBoardActions(config *trelloConfig, render *trelloRender, boardID string, since *time.Time) (actions []trelloAction, archived []trelloCard) {

	sinceString := "2016-08-01" // TODO

	if len(config.AppKey) == 0 {
		config.AppKey = request.ConfigString(meta.ConfigHandle(), "appKey")
	}

	{
		uri := fmt.Sprintf("https://api.trello.com/1/boards/%s/actions?limit=1000&since=%s&key=%s&token=%s", boardID, sinceString, config.AppKey, config.Token)

		req, err := http.NewRequest("GET", uri, nil)
		if err != nil {
			log.IfErr(err)
			return
		}
		client := &http.Client{}
		res, err := client.Do(req)
		if err != nil {
			log.IfErr(err)
			return
		}

		if res.StatusCode != http.StatusOK {
			log.ErrorString("Trello fetch board actions HTTP status not OK")
			return
		}

		defer res.Body.Close()

		dec := json.NewDecoder(res.Body)
		err = dec.Decode(&actions)
		if err != nil {
			log.IfErr(err)
			return
		}
	}

	{
		uri := fmt.Sprintf("https://api.trello.com/1/boards/%s/cards?filter=closed&since=%s&key=%s&token=%s",
			boardID, sinceString, config.AppKey, config.Token)
		req, err := http.NewRequest("GET", uri, nil)
		if err != nil {
			log.IfErr(err)
			return
		}
		client := &http.Client{}
		res, err := client.Do(req)
		if err != nil {
			log.IfErr(err)
			return
		}

		if res.StatusCode != http.StatusOK {
			msg := ""
			txt, err := ioutil.ReadAll(res.Body)
			if err == nil {
				msg = string(txt)
			} else {
				msg = err.Error()
			}
			log.ErrorString("Trello fetch board archived HTTP status not OK - " + msg)
			return
		}

		defer res.Body.Close()

		dec := json.NewDecoder(res.Body)
		err = dec.Decode(&archived)
		if err != nil {
			log.IfErr(err)
			return
		}
	}

	return
}

func buildPayloadAnalysis(config *trelloConfig, render *trelloRender) {

	//totals
	render.CardTotal = 0
	render.CardAssignTotal = 0
	render.ListTotal = 0

	// pre-process labels
	type labT struct {
		color  string
		boards map[string]bool
	}
	labels := make(map[string]labT)

	// pre-process member stats
	memberBoardCount := make(map[string]map[string]int)

	// main loop
	for brdIdx, brd := range render.Boards {
		for _, lst := range brd.Data {
			render.ListTotal++
			for _, crd := range lst.Cards {
				render.CardTotal++
				if len(crd.MembersID) > 0 {
					render.CardAssignTotal++
				}

				// process labels
				for _, lab := range crd.Labels {
					if _, exists := labels[lab.Name]; !exists {
						labels[lab.Name] = labT{color: lab.Color, boards: make(map[string]bool)}
					}
					labels[lab.Name].boards[brd.Board.Name] = true
				}

				// process member stats
				for _, mem := range crd.MembersID {
					if _, exists := memberBoardCount[mem]; !exists {
						memberBoardCount[mem] = make(map[string]int)
					}
					memberBoardCount[mem][brd.Board.ID]++
				}
			}
		}

		// ActionSummary
		if render.Boards[brdIdx].ActionSummary == nil {
			render.Boards[brdIdx].ActionSummary = make(map[string]int)
		}
		for _, act := range brd.Actions {
			englishType := ""
			for _, c := range act.Type {
				if unicode.IsUpper(c) {
					englishType += " "
					englishType += string(unicode.ToLower(c))
				} else {
					englishType += string(c)
				}
			}
			render.Boards[brdIdx].ActionSummary[englishType]++
		}
	}

	//post-process labels
	labs := make([]string, 0, len(labels))
	for lname := range labels {
		labs = append(labs, lname)
	}
	sort.Strings(labs)
	for _, lname := range labs {
		thisLabel := labels[lname].boards
		if l := len(thisLabel); l > 1 {
			brds := make([]string, 0, l)
			for bname := range thisLabel {
				brds = append(brds, bname)
			}
			sort.Strings(brds)
			render.SharedLabels = append(render.SharedLabels, trelloSharedLabel{
				Name: lname, Color: labels[lname].color, Boards: brds,
			})
		}
	}

	//post-process member stats
	mNames := make([]string, 0, len(memberBoardCount))
	for mID := range memberBoardCount {
		memInfo := fetchMember(config, render, mID)
		mNames = append(mNames, memInfo.FullName)
	}
	sort.Strings(mNames)
	for _, mNam := range mNames {
		for mem, brdCounts := range memberBoardCount {
			memInfo := fetchMember(config, render, mem)
			if mNam == memInfo.FullName {
				render.MemberBoardAssign = append(render.MemberBoardAssign, trelloBoardAssign{MemberName: mNam, AvatarHash: memInfo.AvatarHash})
				for _, b := range render.Boards { // these are already in order
					if count, ok := brdCounts[b.Board.ID]; ok {
						render.MemberBoardAssign[len(render.MemberBoardAssign)-1].AssignCounts =
							append(render.MemberBoardAssign[len(render.MemberBoardAssign)-1].AssignCounts,
								trelloBoardAssignCount{BoardName: b.Board.Name, Count: count})
					}
				}
				goto found
			}
		}
	found:
	}
}
