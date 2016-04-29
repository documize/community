package documize

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"

	"github.com/documize/community/documize/api/entity"
)

// GetUsers returns the users in the user's organization.
func (c *Client) GetUsers() ([]entity.User, error) {
	req, err := http.NewRequest("GET", c.BaseURL+"/api/users", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close() // ignore error
	users := make([]entity.User, 0, 5)
	dec := json.NewDecoder(resp.Body)
	err = dec.Decode(&users)
	if err != nil {
		return nil, err
	}
	return users, nil
}

// GetUserInfo returns the user's information.
func (c *Client) GetUserInfo() (*entity.User, error) {
	req, err := http.NewRequest("GET", c.BaseURL+"/api/users/"+c.Auth.User.BaseEntity.RefID, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close() // ignore error
	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if isError(string(b)) {
		return nil, errors.New(trimErrors(string(b)))
	}
	user := new(entity.User)
	err = json.Unmarshal(b, user)
	if err != nil {
		return nil, err
	}
	return user, nil
}

// AddUser adds the given user to the system.
// The version of the user record written to the database
// is written into the referenced User record.
func (c *Client) AddUser(usrp *entity.User) error {
	b, err := json.Marshal(usrp)
	if err != nil {
		return err
	}
	req, err := http.NewRequest("POST", c.BaseURL+"/api/users", bytes.NewReader(b))
	if err != nil {
		return err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close() // ignore error
	b, err = ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if isError(string(b)) {
		return errors.New(trimErrors(string(b)))
	}
	err = json.Unmarshal(b, usrp)
	return err
}

// UpdateUser updates the given user, writing the changed version back into the given User structure.
func (c *Client) UpdateUser(usrp *entity.User) error {
	b, err := json.Marshal(usrp)
	if err != nil {
		return err
	}
	req, err := http.NewRequest("PUT", c.BaseURL+"/api/users/"+usrp.BaseEntity.RefID, bytes.NewReader(b))
	if err != nil {
		return err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close() // ignore error
	b, err = ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if isError(string(b)) {
		return errors.New(trimErrors(string(b)))
	}
	err = json.Unmarshal(b, usrp)
	return err
}

// DeleteUser deletes the given user.
func (c *Client) DeleteUser(userID string) error {
	req, err := http.NewRequest("DELETE", c.BaseURL+"/api/users/"+userID, nil)
	if err != nil {
		return err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close() // ignore error
	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if isError(string(b)) {
		return errors.New(trimErrors(string(b)))
	}
	return nil
}

// GetUserFolderPermissions gets the folder permissions for the current user.
func (c *Client) GetUserFolderPermissions() (*[]entity.LabelRole, error) {
	req, err := http.NewRequest("GET", c.BaseURL+"/api/users/"+c.Auth.User.RefID+"/permissions", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close() // ignore error
	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if isError(string(b)) {
		return nil, errors.New(trimErrors(string(b)))
	}
	perm := make([]entity.LabelRole, 0, 2)
	err = json.Unmarshal(b, &perm)
	return &perm, err
}
