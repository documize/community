package apidocumizecom

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"

	"github.com/documize/community/wordsmith/api"

	"golang.org/x/net/context"
)

// Msword type provides a peg to hang the Convert method on.
type Msword struct{}

// Convert converts a file into the Countersoft Documize format.
func (file *Msword) Convert(r api.DocumentConversionRequest, reply *api.DocumentConversionResponse) error {
	byts, err := json.Marshal(r)
	if err != nil {
		return err
	}
	base := filepath.Base(r.Filename)
	fmt.Println("Starting conversion of document: ", base)

	client := &http.Client{Transport: transport}

	resp, err := client.Post(endPoint+"/api/word?token="+token, "application/json", bytes.NewReader(byts))
	if err != nil {
		return err
	}
	defer func() {
		if e := resp.Body.Close(); e != nil {
			fmt.Println("resp.Body.Close error: " + e.Error())
		}
	}()

	fmt.Println("Finished converting document: ", base)

	dec := json.NewDecoder(resp.Body)
	err = dec.Decode(reply)

	return err
}

// MSwordConvert provides the standard interface for conversion of a MS-Word document.
// All the function does is return a pointer to api.DocumentConversionResponse with
// PagesHTML set to the given (*api.DocumentConversionRequest).Filedata converted by the Documize server.
func MSwordConvert(ctx context.Context, in interface{}) (interface{}, error) {
	var msw Msword
	dcr := in.(*api.DocumentConversionRequest)
	rep := new(api.DocumentConversionResponse)
	err := msw.Convert(*dcr, rep)
	return rep, err
}
