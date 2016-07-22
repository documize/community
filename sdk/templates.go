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
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/documize/community/core/api/entity"
)

// GetTemplates returns the available templates; from the stock templates if useStock is set.
func (c *Client) GetTemplates(useStock bool) (temps []entity.Template, err error) {
	url := fmt.Sprintf("%s/api/templates",
		c.BaseURL)
	if useStock {
		url += "/stock"
	}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, errDo := c.Client.Do(req)
	if errDo != nil {
		return nil, errDo
	}
	defer resp.Body.Close() // ignore error
	b, errRA := ioutil.ReadAll(resp.Body)
	if errRA != nil {
		return nil, errRA
	}
	if isError(string(b)) {
		return nil, errors.New(trimErrors(string(b)))
	}
	err = json.Unmarshal(b, &temps)
	if err != nil {
		return nil, err
	}
	return temps, nil
}

// StartDocumentFromTemplate returns the documentID created in the given folderID from the given templateID,
// using either a stock template if isStock==true or a saved template.
func (c *Client) StartDocumentFromTemplate(isStock bool, templateID, folderID string) (DocumentID string, err error) {
	url := fmt.Sprintf("%s/api/templates/%s/folder/%s?type=",
		c.BaseURL, templateID, folderID)
	if isStock {
		url += "stock"
	} else {
		url += "saved"
	}
	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return "", err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close() // ignore error
	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	if isError(string(b)) {
		return "", errors.New(trimErrors(string(b)))
	}
	var model entity.Document
	err = json.Unmarshal(b, &model)
	if err != nil {
		return "", err
	}
	if model.RefID == "" {
		return "", errors.New("empty DocumentID returned")
	}
	return model.RefID, nil
}
