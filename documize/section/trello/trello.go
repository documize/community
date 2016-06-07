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
	"strings"

	"github.com/documize/community/documize/section/provider"
	"github.com/documize/community/wordsmith/log"
)

// Provider represents Trello
type Provider struct {
}

// Meta describes us
func (*Provider) Meta() provider.TypeMeta {
	section := provider.TypeMeta{}
	section.ID = "c455a552-202e-441c-ad79-397a8152920b"
	section.Title = "Trello"
	section.Description = "Embed cards from boards and lists"
	section.ContentType = "trello"

	return section
}

// Command stub.
func (*Provider) Command(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	method := query.Get("method")

	if len(method) == 0 {
		provider.WriteMessage(w, "trello", "missing method name")
		return
	}

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

	if len(config.AppKey) == 0 {
		provider.WriteMessage(w, "trello", "Missing appKey")
		return
	}

	if len(config.Token) == 0 {
		provider.WriteMessage(w, "trello", "Missing token")
		return
	}

	switch method {
	case "cards":
		render, err := getCards(config)

		if err != nil {
			fmt.Println(err)
			provider.WriteError(w, "trello", err)
			return
		}

		provider.WriteJSON(w, render)

	case "boards":
		render, err := getBoards(config)

		if err != nil {
			fmt.Println(err)
			provider.WriteError(w, "trello", err)
			return
		}

		provider.WriteJSON(w, render)

	case "lists":
		render, err := getLists(config)

		if err != nil {
			fmt.Println(err)
			provider.WriteError(w, "trello", err)
			return
		}

		provider.WriteJSON(w, render)
	}
}

// Render just sends back HMTL as-is.
func (*Provider) Render(config, data string) string {
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
func (*Provider) Refresh(config, data string) string {
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
		fmt.Println(err)
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

// Trello objects based upon https://github.com/VojtechVitek/go-trello
type trelloMember struct {
	ID         string `json:"id"`
	AvatarHash string `json:"avatarHash"`
	Bio        string `json:"bio"`
	BioData    struct {
		Emoji interface{} `json:"emoji,omitempty"`
	} `json:"bioData"`
	Confirmed                bool     `json:"confirmed"`
	FullName                 string   `json:"fullName"`
	PremOrgsAdminID          []string `json:"idPremOrgsAdmin"`
	Initials                 string   `json:"initials"`
	MemberType               string   `json:"memberType"`
	Products                 []int    `json:"products"`
	Status                   string   `json:"status"`
	URL                      string   `json:"url"`
	Username                 string   `json:"username"`
	AvatarSource             string   `json:"avatarSource"`
	Email                    string   `json:"email"`
	GravatarHash             string   `json:"gravatarHash"`
	BoardsID                 []string `json:"idBoards"`
	BoardsPinnedID           []string `json:"idBoardsPinned"`
	OrganizationsID          []string `json:"idOrganizations"`
	LoginTypes               []string `json:"loginTypes"`
	NewEmail                 string   `json:"newEmail"`
	OneTimeMessagesDismissed []string `json:"oneTimeMessagesDismissed"`
	Prefs                    struct {
		SendSummaries                 bool   `json:"sendSummaries"`
		MinutesBetweenSummaries       int    `json:"minutesBetweenSummaries"`
		MinutesBeforeDeadlineToNotify int    `json:"minutesBeforeDeadlineToNotify"`
		ColorBlind                    bool   `json:"colorBlind"`
		Locale                        string `json:"locale"`
	} `json:"prefs"`
	Trophies           []string `json:"trophies"`
	UploadedAvatarHash string   `json:"uploadedAvatarHash"`
	PremiumFeatures    []string `json:"premiumFeatures"`
}

type trelloBoard struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	Closed         bool   `json:"closed"`
	OrganizationID string `json:"idOrganization"`
	Pinned         bool   `json:"pinned"`
	URL            string `json:"url"`
	ShortURL       string `json:"shortUrl"`
	Desc           string `json:"desc"`
	DescData       struct {
		Emoji struct{} `json:"emoji"`
	} `json:"descData"`
	Prefs struct {
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
<div class="section-trello-render">
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
</div>
`
