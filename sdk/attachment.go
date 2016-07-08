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
	"fmt"
	"io/ioutil"
	"mime/multipart"
	"net/http"

	"github.com/documize/community/documize/api/entity"
)

const emptyBraces = "{}"

// GetAttachmentData get the data of a file attachement.
func (c *Client) GetAttachmentData(att *entity.Attachment) error {
	url := fmt.Sprintf("%s/api/public/attachments/%s/%s/%s",
		c.BaseURL, att.OrgID, att.Job, att.FileID)
	req, err := http.NewRequest("GET", url, nil)
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
	att.Data = b
	return nil
}

// DeleteAttachment removes a file attachment.
func (c *Client) DeleteAttachment(att *entity.Attachment) error {
	url := fmt.Sprintf("%s/api/documents/%s/attachments/%s",
		c.BaseURL, att.DocumentID, att.RefID)
	req, err := http.NewRequest("DELETE", url, nil)
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
	if string(b) != emptyBraces {
		return errors.New(trimErrors(string(b)))
	}
	return nil
}

// GetAttachments gets a slice of the attachments for a document ID.
func (c *Client) GetAttachments(documentID string) (entAtts []entity.Attachment, err error) {
	url := fmt.Sprintf("%s/api/documents/%s/attachments",
		c.BaseURL, documentID)
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
	err = json.Unmarshal(b, &entAtts)
	if err != nil {
		return nil, err
	}
	return entAtts, nil
}

// AddAttachment adds a new attachement to a document
func (c *Client) AddAttachment(documentID, filename string, data []byte) error {
	url := fmt.Sprintf("%s/api/documents/%s/attachments",
		c.BaseURL, documentID)
	var buf bytes.Buffer
	w := multipart.NewWriter(&buf)

	writer, err := w.CreateFormFile("attachment", filename)
	if err != nil {
		return err
	}
	n, err := writer.Write(data)
	if err != nil {
		return err
	}
	if n != len(data) {
		return errors.New("incorrect length written")
	}
	err = w.Close()
	if err != nil {
		return err
	}
	req, err := http.NewRequest("POST", url, bytes.NewReader(buf.Bytes()))
	if err != nil {
		return err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	req.Header.Set("Content-Type",
		"multipart/form-data; boundary="+w.Boundary())
	resp, err := c.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close() // ignore error
	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if string(b) != emptyBraces {
		return errors.New(trimErrors(string(b)))
	}
	return nil
}
