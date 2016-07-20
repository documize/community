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

	"github.com/documize/community/core/api/entity"
)

// GetOrganizations returns the user's organizations.
func (c *Client) GetOrganizations() ([]entity.Organization, error) {
	ret := make([]entity.Organization, 0, len(c.Auth.User.Accounts))
	for orgNum := range c.Auth.User.Accounts {
		url := c.BaseURL + "/api/organizations/" + c.Auth.User.Accounts[orgNum].OrgID
		req, err := http.NewRequest("GET", url, nil)
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
		var m entity.Organization
		err = json.Unmarshal(b, &m)
		if err != nil {
			return nil, err
		}
		ret = append(ret, m)
	}
	return ret, nil
}

// UpdateOrganization returns the user's organization information.
func (c *Client) UpdateOrganization(org *entity.Organization) error {
	url := c.BaseURL + "/api/organizations/" + org.RefID
	bod, err := json.Marshal(org)
	if err != nil {
		return err
	}
	req, err := http.NewRequest("PUT", url, bytes.NewReader(bod))
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
