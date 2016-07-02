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
	"net/url"
	"strings"

	"github.com/documize/community/documize/api/entity"
)

// DeleteDocument removes the given document from the Documize database.
func (c *Client) DeleteDocument(documentID string) error {
	req, err := http.NewRequest("DELETE",
		c.BaseURL+"/api/documents/"+documentID,
		nil)
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
	if string(b) == emptyBraces {
		return nil
	}

	return errors.New(string(b))
}

// GetDocument gets the document information.
func (c *Client) GetDocument(documentID string) (*entity.Document, error) {
	req, err := http.NewRequest("GET",
		c.BaseURL+"/api/documents/"+documentID,
		nil)
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
	var dm entity.Document
	err = json.Unmarshal(b, &dm)
	if err != nil {
		return nil, errors.New(trimErrors(string(b)))
	}
	return &dm, nil
}

// UpdateDocument updates document information obtained from GetDocument.
func (c *Client) UpdateDocument(document *entity.Document) error {
	if document == nil {
		return errors.New("nil document passed to UpdateDocument")
	}
	req, err := http.NewRequest("PUT",
		c.BaseURL+"/api/documents/"+document.RefID,
		nil)
	if err != nil {
		return err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	buf, err := json.Marshal(document)
	if err != nil {
		return err
	}
	req.Body = ioutil.NopCloser(bytes.NewReader(buf))
	resp, err := c.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close() // ignore error
	_, err = ioutil.ReadAll(resp.Body)
	return err
}

// GetDocumentMeta gets the metadata for a document.
func (c *Client) GetDocumentMeta(documentID string) (*entity.DocumentMeta, error) {
	req, err := http.NewRequest("GET",
		c.BaseURL+"/api/documents/"+documentID+"/meta",
		nil)
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
	var dm entity.DocumentMeta
	err = json.Unmarshal(b, &dm)
	if err != nil {
		return nil, errors.New(trimErrors(string(b)))
	}
	return &dm, nil
}

// GetDocumentsByFolder returns a slice of document information for a given folder.
func (c *Client) GetDocumentsByFolder(folderID string) ([]entity.Document, error) {
	req, err := http.NewRequest("GET",
		c.BaseURL+"/api/documents?folder="+folderID,
		nil)
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
	var dm []entity.Document
	err = json.Unmarshal(b, &dm)
	if err != nil {
		return nil, errors.New(trimErrors(string(b)))
	}
	return dm, nil
}

// SearchDocuments returns a list of documements which contain the supplied keywords.
// TODO explain the format of the keywords string (when not just the single word sought).
func (c *Client) SearchDocuments(keywords string) ([]entity.DocumentSearch, error) {
	req, err := http.NewRequest("GET",
		c.BaseURL+"/api/search?keywords="+url.QueryEscape(keywords),
		nil)
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
	var ds []entity.DocumentSearch
	err = json.Unmarshal(b, &ds)
	if err != nil {
		return nil, errors.New(trimErrors(string(b)))
	}
	return ds, nil
}

// GetDocumentAsDocx returns a file-name and content for the given documentID.
// TODO allow the selection of either HTML or DOCX format.
func (c *Client) GetDocumentAsDocx(documentID string) (string, []byte, error) {
	req, err := http.NewRequest("GET",
		c.BaseURL+"/api/documents/"+documentID+"/export",
		nil)
	if err != nil {
		return "", nil, err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return "", nil, err
	}
	defer resp.Body.Close() // ignore error
	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", nil, err
	}

	filename := resp.Header.Get("Content-Disposition")
	filename = strings.TrimSpace(strings.TrimPrefix(filename, "attachment; filename="))
	if len(filename) == 0 {
		return "", nil, errors.New("Unknown document to download")
	}

	return filename, b, nil
}
