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
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/documize/community/wordsmith/log"
)

type trello struct {
}

func init() {
	sectionsMap["trello"] = &trello{}
}

func (*trello) Meta() TypeMeta {
	section := TypeMeta{}
	section.ID = "c455a552-202e-441c-ad79-397a8152920b"
	section.Title = "Trello"
	section.Description = "Trello boards"
	section.ContentType = "trello"
	section.IconFontLigature = "dashboard"

	return section
}

// Command stub.
func (*trello) Command(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	method := query.Get("method")

	if len(method) == 0 {
		writeMessage(w, "trello", "missing method name")
		return
	}

	switch method {
	case "cards":
		cards(w, r)
	}
}

// Render just sends back HMTL as-is.
func (*trello) Render(config, data string) string {
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
	t, _ = t.Parse(trelloTemplate)

	buffer := new(bytes.Buffer)
	t.Execute(buffer, payload)

	return buffer.String()
}

// Refresh just sends back data as-is.
func (*trello) Refresh(config, data string) string {
	var c = trelloConfig{}
	json.Unmarshal([]byte(config), &c)

	refreshed, err := getCards(c)

	if err != nil {
		return data
	}

	j, err := json.Marshal(refreshed)

	if err != nil {
		log.Error("unable to marshall trello cards", err)
		return data
	}

	return string(j)
}

// Helpers
func cards(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		writeMessage(w, "trello", "Bad body")
		return
	}

	var config = trelloConfig{}
	err = json.Unmarshal(body, &config)

	if err != nil {
		writeError(w, "trello", err)
		// writeMessage(w, "trello", "Bad payload")
		return
	}

	config.Clean()

	if len(config.AppKey) == 0 {
		writeMessage(w, "trello", "Missing appKey")
		return
	}

	if len(config.Token) == 0 {
		writeMessage(w, "trello", "Missing token")
		return
	}

	render, err := getCards(config)

	if err != nil {
		fmt.Println(err)
		writeError(w, "trello", err)
		return
	}

	writeJSON(w, render)
}

func getCards(config trelloConfig) (listCards []trelloListCards, err error) {
	for _, list := range config.Lists {

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

type trelloConfig struct {
	AppKey string       `json:"appKey"`
	Token  string       `json:"token"`
	Board  trelloBoard  `json:"board"`
	Lists  []trelloList `json:"lists"`
}

func (c *trelloConfig) Clean() {
	c.AppKey = strings.TrimSpace(c.AppKey)
	c.Token = strings.TrimSpace(c.Token)
}

type trelloBoard struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Desc     string `json:"desc"`
	DescData struct {
		Emoji struct{} `json:"emoji"`
	} `json:"descData"`
	Closed         bool   `json:"closed"`
	OrganizationID string `json:"idOrganization"`
	Pinned         bool   `json:"pinned"`
	URL            string `json:"url"`
	ShortURL       string `json:"shortUrl"`
	Prefs          struct {
		PermissionLevel       string                  `json:"permissionLevel"`
		Voting                string                  `json:"voting"`
		Comments              string                  `json:"comments"`
		Invitations           string                  `json:"invitations"`
		SelfJoin              bool                    `json:"selfjoin"`
		CardCovers            bool                    `json:"cardCovers"`
		CardAging             string                  `json:"cardAging"`
		CalendarFeedEnabled   bool                    `json:"calendarFeedEnabled"`
		Background            string                  `json:"background"`
		BackgroundColor       string                  `json:"backgroundColor"`
		BackgroundImage       string                  `json:"backgroundImage"`
		BackgroundImageScaled []trelloBoardBackground `json:"backgroundImageScaled"`
		BackgroundTile        bool                    `json:"backgroundTile"`
		BackgroundBrightness  string                  `json:"backgroundBrightness"`
		CanBePublic           bool                    `json:"canBePublic"`
		CanBeOrg              bool                    `json:"canBeOrg"`
		CanBePrivate          bool                    `json:"canBePrivate"`
		CanInvite             bool                    `json:"canInvite"`
	} `json:"prefs"`
	LabelNames struct {
		Red    string `json:"red"`
		Orange string `json:"orange"`
		Yellow string `json:"yellow"`
		Green  string `json:"green"`
		Blue   string `json:"blue"`
		Purple string `json:"purple"`
	} `json:"labelNames"`
}

type trelloBoardBackground struct {
	Width  int    `json:"width"`
	Height int    `json:"height"`
	URL    string `json:"url"`
}

type trelloList struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Closed   bool    `json:"closed"`
	BoardID  string  `json:"idBoard"`
	Pos      float32 `json:"pos"`
	Included bool    `json:"included"` // indicates whether we display cards from this list
}

type trelloCard struct {
	ID                    string   `json:"id"`
	Name                  string   `json:"name"`
	Email                 string   `json:"email"`
	ShortID               int      `json:"idShort"`
	AttachmentCoverID     string   `json:"idAttachmentCover"`
	CheckListsID          []string `json:"idCheckLists"`
	BoardID               string   `json:"idBoard"`
	ListID                string   `json:"idList"`
	MembersID             []string `json:"idMembers"`
	MembersVotedID        []string `json:"idMembersVoted"`
	ManualCoverAttachment bool     `json:"manualCoverAttachment"`
	Closed                bool     `json:"closed"`
	Pos                   float32  `json:"pos"`
	ShortLink             string   `json:"shortLink"`
	DateLastActivity      string   `json:"dateLastActivity"`
	ShortURL              string   `json:"shortUrl"`
	Subscribed            bool     `json:"subscribed"`
	URL                   string   `json:"url"`
	Due                   string   `json:"due"`
	Desc                  string   `json:"desc"`
	DescData              struct {
		Emoji struct{} `json:"emoji"`
	} `json:"descData"`
	CheckItemStates []struct {
		CheckItemID string `json:"idCheckItem"`
		State       string `json:"state"`
	} `json:"checkItemStates"`
	Badges struct {
		Votes              int    `json:"votes"`
		ViewingMemberVoted bool   `json:"viewingMemberVoted"`
		Subscribed         bool   `json:"subscribed"`
		Fogbugz            string `json:"fogbugz"`
		CheckItems         int    `json:"checkItems"`
		CheckItemsChecked  int    `json:"checkItemsChecked"`
		Comments           int    `json:"comments"`
		Attachments        int    `json:"attachments"`
		Description        bool   `json:"description"`
		Due                string `json:"due"`
	} `json:"badges"`
	Labels []struct {
		Color string `json:"color"`
		Name  string `json:"name"`
	} `json:"labels"`
}

type trelloListCards struct {
	List  trelloList
	Cards []trelloCard
}

type trelloRender struct {
	Board     trelloBoard
	Data      []trelloListCards
	CardCount int
	ListCount int
}

// the HTML that is rendered by this section
const trelloTemplate = `
<p>There are {{ .CardCount }} cards across {{ .ListCount }} lists for board <a href="{{ .Board.URL }}">{{.Board.Name}}.</a></p>
<div class="trello-board" style="background-color: {{.Board.Prefs.BackgroundColor}}">
	<a href="{{ .Board.URL }}"><div class="trello-board-title">{{.Board.Name}}</div></a>
	{{range $data := .Data}}
		<div class="trello-list">
			<div class="trello-list-title">{{ $data.List.Name }}</div>
			{{range $card := $data.Cards}}
				<a href="{{ $card.URL }}">
					<div class="trello-card">
						{{ $card.Name }}
					</div>
				</a>
			{{end}}	
		</div>
	{{end}}
</div>
`

/*
does server side load up all data? YES!!??
owner read-only control?

is appKey is global?
		- where stored?
		- how access?
		- does section.go ask config to give us saved json
*/
