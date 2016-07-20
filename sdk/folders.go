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

package documize

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"

	"github.com/documize/community/core/api/endpoint/models"
	"github.com/documize/community/core/api/entity"
)

// GetFolders returns the folders that the current user can see.
func (c *Client) GetFolders() ([]entity.Label, error) {

	req, err := http.NewRequest("GET", c.BaseURL+"/api/folders", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close() // ignore error

	var folders []entity.Label

	dec := json.NewDecoder(resp.Body)
	err = dec.Decode(&folders)
	if err != nil {
		return nil, err
	}

	return folders, nil
}

// GetNamedFolderIDs returns those folder IDs with the given name (folder names are not unique).
func (c *Client) GetNamedFolderIDs(name string) ([]string, error) {
	ret := make([]string, 0, 2)

	Folders, err := c.GetFolders()
	if err != nil {
		return nil, err
	}

	for _, f := range Folders {
		if name == f.Name {
			ret = append(ret, f.RefID)
		}
	}
	return ret, nil
}

// GetFoldersVisibility returns the visibility of folders that the current user can see.
func (c *Client) GetFoldersVisibility() ([]entity.Label, error) {

	req, err := http.NewRequest("GET", c.BaseURL+"/api/folders?filter=viewers", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close() // ignore error

	folders := make([]entity.Label, 0, 10)

	dec := json.NewDecoder(resp.Body)
	err = dec.Decode(&folders)
	if err != nil {
		return nil, err
	}

	return folders, nil
}

// GetFolder returns the documents in the given folder that the current user can see.
func (c *Client) GetFolder(folderID string) (*entity.Label, error) {

	req, err := http.NewRequest("GET", c.BaseURL+"/api/folders/"+folderID, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close() // ignore error

	var folder entity.Label
	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if isError(string(b)) {
		return nil, errors.New(trimErrors(string(b)))
	}
	err = json.Unmarshal(b, &folder)
	if err != nil {
		return nil, err
	}

	return &folder, nil
}

// GetFolderPermissions returns the given user's permissions.
func (c *Client) GetFolderPermissions(folderID string) (*[]entity.LabelRole, error) {

	req, err := http.NewRequest("GET", c.BaseURL+"/api/folders/"+folderID+"/permissions", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close() // ignore error

	folderPerm := make([]entity.LabelRole, 0, 6)

	dec := json.NewDecoder(resp.Body)
	err = dec.Decode(&folderPerm)
	if err != nil {
		return nil, err
	}

	return &folderPerm, nil
}

// SetFolderPermissions sets the given user's permissions.
func (c *Client) SetFolderPermissions(folderID, msg string, perms *[]entity.LabelRole) error {
	frm := new(models.FolderRolesModel)
	frm.Message = msg
	frm.Roles = *perms
	b, err := json.Marshal(frm)
	if err != nil {
		return err
	}
	req, err := http.NewRequest("PUT", c.BaseURL+"/api/folders/"+folderID+"/permissions", bytes.NewReader(b))
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
	return nil
}

// AddFolder adds the given folder for the current user.
// Fields added by the host are added to the folder structure referenced.
func (c *Client) AddFolder(fldr *entity.Label) error {
	b, err := json.Marshal(fldr)
	if err != nil {
		return err
	}
	req, err := http.NewRequest("POST", c.BaseURL+"/api/folders", bytes.NewReader(b))
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
	err = json.Unmarshal(b, fldr)
	return err
}

// UpdateFolder changes the folder info the given folder for the current user, returning the changed version in the referenced folder structure.
func (c *Client) UpdateFolder(fldr *entity.Label) error {
	b, err := json.Marshal(fldr)
	if err != nil {
		return err
	}
	req, err := http.NewRequest("PUT", c.BaseURL+"/api/folders/"+fldr.RefID, bytes.NewReader(b))
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
	err = json.Unmarshal(b, fldr)
	return err
}

// RemoveFolder removes the given folder and moves its contents to another.
func (c *Client) RemoveFolder(folderID, moveToID string) error {
	req, err := http.NewRequest("DELETE", c.BaseURL+"/api/folders/"+folderID+"/move/"+moveToID, nil)
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
