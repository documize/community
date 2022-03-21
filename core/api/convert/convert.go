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

// Package convert provides the gateway to document conversion native and plugin functionality, both in and out of the system.
package convert

import (
	"errors"

	"github.com/documize/community/core/api/convert/html"
	"github.com/documize/community/core/api/plugins"
	api "github.com/documize/community/core/convapi"

	"context"
)

// Convert provides the entry-point into the document conversion process.
func Convert(ctx context.Context, xtn string, fileRequest *api.DocumentConversionRequest) (*api.DocumentConversionResponse, error) {
	fileResultI, err := plugins.Lib.Run(ctx, "Convert", xtn, fileRequest)
	if err != nil {
		return nil, err
	}
	fileResult, ok := fileResultI.(*api.DocumentConversionResponse)
	if !ok {
		return nil, errors.New("interface conversion: interface {} is nil, not *api.ConversionFileResponse")
	}
	if fileResult.Err != "" {
		return nil, errors.New(fileResult.Err)
	}

	err = html.SplitIfHTML(fileRequest, fileResult)
	if err != nil {
		return nil, err
	}

	/* TODO add title & body santization that keeps the images & table formatting
	for p, pg := range fileResult.Pages {
		fileResult.Pages[p].Title = titlePolicy.Sanitize(pg.Title)
		fileResult.Pages[p].Body = bodyPolicy.SanitizeBytes(pg.Body)
	}
	*/

	return fileResult, nil
}

/* TODO add sanitisation for body & title HTML
var titlePolicy, bodyPolicy *bluemonday.Policy

func xxx() {
	policy := bluemonday.UGCPolicy()
	policy.RequireNoFollowOnLinks(true)

	// URLs must be parseable by net/url.Parse()
	policy.RequireParseableURLs(true)
	policy.AllowRelativeURLs(false)
	policy.AllowURLSchemes("http", "https")

	// replacement below for:	policy.AllowDataURIImages()
	// Supply a function to validate images contained within data URI
	policy.AllowURLSchemeWithCustomPolicy(
		"data",
		func(url *url.URL) (allowUrl bool) {
			if url.RawQuery != "" || url.Fragment != "" {
				return false
			}

			//	matched := dataURIImagePrefix.FindString(url.Opaque)
			//	if matched == "" {
			//		return false
			//	}

			//	_, err := base64.StdEncoding.DecodeString(url.Opaque[len(matched):])
			//	if err != nil {
			//		return false
			//	}

			return true
		})
	policy.AllowImages()

	// TODO remove links to #tags
	// TODO allow DataURI of image/* for LibreOffice ppt output

	bodyPolicy = policy

	titlePolicy = bluemonday.StrictPolicy()
}
*/
