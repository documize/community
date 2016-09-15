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
	"strings"
	"time"
)

type secrets struct {
	Token string `json:"token"`
}

type trelloConfig struct {
	AppKey   string        `json:"appKey"`
	Token    string        `json:"token"`
	Board    trelloBoard   `json:"board"`
	Lists    []trelloList  `json:"lists"`
	Boards   []trelloBoard `json:"boards"`
	Since    string        `json:"since,omitempty"`
	SincePtr *time.Time    `json:"-"`

	OrgByID map[string]trelloOrganization `json:"-"`
}

func (c *trelloConfig) Clean() {
	c.AppKey = strings.TrimSpace(c.AppKey)
	c.Token = strings.TrimSpace(c.Token)
}

// Trello objects based upon https://github.com/VojtechVitek/go-trello

type trelloOrganization struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	DisplayName string   `json:"displayName"`
	Desc        string   `json:"desc"`
	DescData    string   `json:"descData"`
	URL         string   `json:"url"`
	Website     string   `json:"website"`
	LogoHash    string   `json:"logoHash"`
	Products    []string `json:"products"`
	PowerUps    []string `json:"powerUps"`
}

type trelloAction struct {
	ID              string `json:"id"`
	IDMemberCreator string `json:"idMemberCreator"`
	Data            struct {
		DateLastEdited string `json:"dateLastEdited"`
		ListBefore     struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} `json:"listBefore"`
		ListAfter struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} `json:"listAfter"`
		CheckItem struct {
			ID    string `json:"id"`
			State string `json:"state"`
			Name  string `json:"name"`
		} `json:"checkItem"`
		CheckList struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} `json:"checklist"`
		List struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} `json:"list"`
		TextData struct {
			Emoji struct{} `json:"emoji"`
		} `json:"textData"`
		Board struct {
			ID        string `json:"id"`
			Name      string `json:"name"`
			ShortLink string `json:"shortLink"`
		} `json:"board"`
		Card struct {
			ID        string `json:"id"`
			Name      string `json:"name"`
			ShortLink string `json:"shortLink"`
			IDShort   int    `json:"idShort"`
		} `json:"card"`
		Text string `json:"text"`
	} `json:"data"`
	Type          string `json:"type"`
	Date          string `json:"date"`
	MemberCreator struct {
		ID         string `json:"id"`
		AvatarHash string `json:"avatarHash"`
		FullName   string `json:"fullName"`
		Initials   string `json:"initials"`
		Username   string `json:"username"`
	} `json:"memberCreator"`
}

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
	OrgName        string `json:"orgName"`
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
	Included bool   `json:"included"` // indicates whether we display this board
	NamePath string `json:"namePath"` // the "team / board" form
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

type trelloActionSummaryEntry struct {
	Name  string
	Count int
}

type trelloRenderBoard struct {
	Board         trelloBoard
	Data          []trelloListCards
	CardCount     int
	ListCount     int
	Actions       []trelloAction
	ActionSummary []trelloActionSummaryEntry
	Archived      []trelloCard
}

type trelloSharedLabel struct {
	Name   string
	Color  string
	Boards []trelloBoard
}

type trelloBoardAssignCount struct {
	BoardName string
	Count     int
}

type trelloBoardAssign struct {
	AvatarHash   string
	MemberName   string
	AssignCounts []trelloBoardAssignCount
}

type trelloRender struct {
	Boards []trelloRenderBoard
	Since  string
	Detail trelloRenderBoard

	// items below are generated during the render phase
	SharedLabels      []trelloSharedLabel
	MembersByID       map[string]trelloMember
	MemberBoardAssign []trelloBoardAssign
	CardAssignTotal   int
	CardTotal         int
	ListTotal         int
}
