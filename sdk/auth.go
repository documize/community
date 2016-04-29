package documize

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/documize/community/documize/api/endpoint/models"
	"github.com/documize/community/documize/api/entity"
)

// Client holds the data for a sustained connection to Documize.
type Client struct {
	BaseURL string
	Domain  string
	Client  *http.Client
	Auth    models.AuthenticationModel
}

// HeaderAuthTokenName is the name of the authorization token required in the http header
const HeaderAuthTokenName = "Authorization"

// NewClient authorizes the user on Documize and returns the Client type whose methods allow API access the Documize system.
func NewClient(baseurl, domainEmailPassword string) (*Client, error) {
	c := new(Client)
	c.Client = new(http.Client)
	c.BaseURL = strings.TrimSuffix(baseurl, "/")

	req, err := http.NewRequest("POST", c.BaseURL+"/api/public/authenticate", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add(HeaderAuthTokenName,
		"Basic "+base64.StdEncoding.EncodeToString([]byte(domainEmailPassword)))
	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close() // ignore error

	msg, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(msg, &c.Auth)
	if err != nil {
		return nil, errors.New(trimErrors(string(msg)) + " : " + err.Error())
	}

	if err = c.Validate(); err != nil {
		return nil, err
	}

	c.Domain = strings.Split(domainEmailPassword, ":")[0]

	return c, nil
}

// Validate the current user credentials.
func (c *Client) Validate() error {
	req, err := http.NewRequest("GET", c.BaseURL+"/api/public/validate", nil)
	if err != nil {
		return err
	}
	req.Header.Add("Authorization", c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close() // ignore error
	var um entity.User
	msg, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	err = json.Unmarshal(msg, &um)
	if err != nil {
		return errors.New(string(msg) + " : " + err.Error())
	}
	return nil
}
