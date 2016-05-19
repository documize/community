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
	"io/ioutil"
	"net/http"
)

// GetSiteMeta returns the site information based on the sub-domain of the URL called.
/* TODO - cant get sub-domain easily in test environment
func (c *Client) GetSiteMeta() (*entity.SiteMeta, error) {
	tgt := c.BaseURL + "/api/public/meta"
	req, err := http.NewRequest("GET", tgt, nil)
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
	var sm entity.SiteMeta
	err = json.Unmarshal(b, &sm)
	if err != nil {
		return nil, errors.New(trimErrors(string(b)))
	}
	return &sm, nil
}
*/

// GetSitemap returns the site map information based on the domain supplied in the URL called.
func (c *Client) GetSitemap() ([]byte, error) {
	tgt := c.BaseURL + "/sitemap.xml"
	return c.getFile(tgt)
}

// GetRobots returns the site map information based on the domain supplied in the URL called.
func (c *Client) GetRobots() ([]byte, error) {
	tgt := c.BaseURL + "/robots.txt"
	return c.getFile(tgt)
}

// getFile is an internal function to avoid code duplication when fetching the plain output of the GET.
func (c *Client) getFile(tgt string) ([]byte, error) {
	req, err := http.NewRequest("GET", tgt, nil)
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
	return b, nil
}
