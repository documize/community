package documize

import (
	"bytes"
	"encoding/json"
	"errors"
	"strings"

	"github.com/documize/community/wordsmith/api"
	"github.com/documize/community/documize/api/entity"
)

// LoadData uploads and converts the raw data comprising a Documize document into Documize, returning a fileID and error.
func (c *Client) LoadData(folderID, docName string, docData *api.DocumentConversionResponse) (*entity.Document, error) {
	if len(docData.PagesHTML) == 0 && len(docData.Pages) == 0 {
		return nil, errors.New("no data to load") // NOTE attachements must have a base document
	}
	for _, att := range docData.EmbeddedFiles {
		if !strings.HasSuffix(strings.ToLower(att.Name), "."+strings.ToLower(att.Type)) {
			return nil, errors.New("attachment " + att.Name + " does not have the extention " + att.Type)
		}
	}
	buf, err := json.Marshal(*docData)
	if err != nil {
		return nil, err
	}
	cv, err := c.upload(folderID, docName+".documizeapi", bytes.NewReader(buf))
	if err != nil {
		return nil, err
	}
	//cv, err := c.convert(folderID, job, nil)
	//if err != nil {
	//	return nil, err
	//}
	return cv, nil
}
