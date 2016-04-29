package documize

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"os"
	"path"

	"github.com/documize/community/documize/api/entity"
)

func (c *Client) upload(folderID, fileName string, fileReader io.Reader) (*entity.Document, error) {

	bodyBuf := &bytes.Buffer{}
	bodyWriter := multipart.NewWriter(bodyBuf)

	_, fn := path.Split(fileName)
	fileWriter, err := bodyWriter.CreateFormFile("attachment", fn)
	if err != nil {
		return nil, err
	}
	_, err = io.Copy(fileWriter, fileReader)
	if err != nil {
		return nil, err
	}
	contentType := bodyWriter.FormDataContentType()
	err = bodyWriter.Close()
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST",
		c.BaseURL+"/api/import/folder/"+folderID,
		bodyBuf)
	if err != nil {
		return nil, err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	req.Header.Set("Content-Type", contentType)
	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close() // ignore error

	var du entity.Document

	msg, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(msg, &du)
	if err != nil {
		return nil, errors.New(trimErrors(string(msg)))
	}

	return &du, nil
}

/*
func (c *Client) convert(folderID string, du *endpoint.DocumentUploadModel, cjr *api.ConversionJobRequest) (*endpoint.DocumentConversionModel, error) {

	if cjr == nil {
		cjr = &api.ConversionJobRequest{}
	}

	buf, err := json.Marshal(*cjr)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST",
		c.BaseURL+"/api/convert/folder/"+folderID+"/"+du.JobID,
		bytes.NewReader(buf))
	if err != nil {
		return nil, err
	}
	req.Header.Add(HeaderAuthTokenName, c.Auth.Token)
	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close() // ignore error

	var dc endpoint.DocumentConversionModel

	msg, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(msg, &dc)
	if err != nil {
		return nil, errors.New(trimErrors(string(msg)))
	}

	return &dc, nil
}
*/

// LoadFile uploads and converts a file into Documize, returning a fileID and error.
func (c *Client) LoadFile(folderID, targetFile string) (*entity.Document, error) {
	file, err := os.Open(targetFile) // For read access.
	if err != nil {
		return nil, err
	}
	cv, err := c.upload(folderID, targetFile, file)
	if err != nil {
		return nil, err
	}
	//cv, err := c.convert(folderID, job, nil)
	//if err != nil {
	//	return nil, err
	//}
	return cv, nil
}
