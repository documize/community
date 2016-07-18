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
	"strings"

	"github.com/documize/community/documize/api/endpoint/models"
	"github.com/documize/community/documize/api/entity"
)

// GetDocumentPages returns all the pages in a document.
func (c *Client) GetDocumentPages(documentID string) ([]entity.Page, error) {
	req, err := http.NewRequest("GET", c.BaseURL+"/api/documents/"+documentID+"/pages", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close() // ignore error
	pages := make([]entity.Page, 0, 12)
	dec := json.NewDecoder(resp.Body)
	err = dec.Decode(&pages)
	if err != nil {
		return nil, err
	}
	return pages, nil
}

// GetDocumentPagesBatch returns those pages in a document whose RefIDs are in a comma-separated list.
func (c *Client) GetDocumentPagesBatch(documentID, pageIDlist string) ([]entity.Page, error) {

	req, err := http.NewRequest("POST", c.BaseURL+"/api/documents/"+documentID+"/pages/batch", strings.NewReader(pageIDlist))
	if err != nil {
		return nil, err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close() // ignore error
	pages := make([]entity.Page, 0, 12)
	dec := json.NewDecoder(resp.Body)
	err = dec.Decode(&pages)
	if err != nil {
		return nil, err
	}
	return pages, nil
}

// AddDocumentPage adds the given page into the indicated document.
func (c *Client) AddDocumentPage(documentID string, pg *entity.Page) (*entity.Page, error) {

	pageJSON, err := json.Marshal(pg)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", c.BaseURL+"/api/documents/"+documentID+"/pages", bytes.NewReader(pageJSON))
	if err != nil {
		return nil, err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close() // ignore error
	var page entity.Page
	dec := json.NewDecoder(resp.Body)
	err = dec.Decode(&page)
	if err != nil {
		return nil, err
	}
	return &page, nil
}

// DeleteDocumentPage deletes the given page from the indicated document.
func (c *Client) DeleteDocumentPage(documentID, pageID string) error {
	req, err := http.NewRequest("DELETE", c.BaseURL+"/api/documents/"+documentID+"/pages/"+pageID, nil)
	if err != nil {
		return err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close() // ignore error
	res, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if isError(string(res)) {
		return errors.New(trimErrors(string(res)))
	}
	return nil
}

// DeleteDocumentPages deletes the given pageIDs in a slice from the indicated document.
func (c *Client) DeleteDocumentPages(documentID string, pageIDlist []string) error {
	model := make([]models.PageLevelRequestModel, len(pageIDlist))
	for k := range pageIDlist {
		model[k].PageID = pageIDlist[k]
	}
	modelJSON, err := json.Marshal(&model)
	if err != nil {
		return err
	}
	req, err := http.NewRequest("POST", c.BaseURL+"/api/documents/"+documentID+"/pages/unused", bytes.NewReader(modelJSON))
	if err != nil {
		return err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close() // ignore error
	res, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if isError(string(res)) {
		return errors.New(trimErrors(string(res)))
	}
	return nil
}

// UpdateDocumentPage updates the given page from the indicated document.
func (c *Client) UpdateDocumentPage(pg *entity.Page) error {
	pgJSON, err := json.Marshal(pg)
	if err != nil {
		return err
	}
	req, err := http.NewRequest("PUT", c.BaseURL+"/api/documents/"+pg.DocumentID+"/pages/"+pg.RefID, bytes.NewReader(pgJSON))
	if err != nil {
		return err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close() // ignore error
	res, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if isError(string(res)) {
		return errors.New(trimErrors(string(res)))
	}
	return nil
}

// ChangeDocumentPageLevel sets the levels of the pages in the PageLevelRequestModel for the given document.
func (c *Client) ChangeDocumentPageLevel(documentID string, plrm *[]models.PageLevelRequestModel) error {
	b, err := json.Marshal(plrm)
	if err != nil {
		return err
	}
	req, err := http.NewRequest("POST", c.BaseURL+"/api/documents/"+documentID+"/pages/level", bytes.NewReader(b))
	if err != nil {
		return err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close() // ignore error
	diff, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if isError(string(diff)) {
		return errors.New(trimErrors(string(diff)))
	}
	return nil
}

// ChangeDocumentPageSequence sets the sequences of the pages in the PageSequenceRequestModel for the given document.
func (c *Client) ChangeDocumentPageSequence(documentID string, psrm *[]models.PageSequenceRequestModel) error {
	b, err := json.Marshal(psrm)
	if err != nil {
		return err
	}
	req, err := http.NewRequest("POST", c.BaseURL+"/api/documents/"+documentID+"/pages/sequence", bytes.NewReader(b))
	if err != nil {
		return err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close() // ignore error
	diff, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if isError(string(diff)) {
		return errors.New(trimErrors(string(diff)))
	}
	return nil
}
