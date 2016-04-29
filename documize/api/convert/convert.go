// Package convert provides the gateway to document conversion native and plugin functionality, both in and out of the system.
package convert

import (
	"github.com/documize/community/documize/api/convert/excerpt"
	"github.com/documize/community/documize/api/convert/html"
	"github.com/documize/community/documize/api/plugins"
	"github.com/documize/community/wordsmith/api"
	"github.com/documize/community/wordsmith/utility"
	"errors"

	"golang.org/x/net/context"
)

// Convert provides the entry-point into the document conversion process.
func Convert(ctx context.Context, xtn string, fileRequest *api.DocumentConversionRequest) (*api.DocumentConversionResponse, error) {
	fileRequest.Token = plugins.Lib.Token("Convert", xtn)
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

	if fileResult.Excerpt != "" {
		//fmt.Println("DEBUG supplied excerpt: " + fileResult.Excerpt)
	} else {
		titleWds := []string{}
		bodyWds := []string{}
		for p := range fileResult.Pages {
			var wds []string
			var err error
			if p > 0 { // title 0 is already the title of the document
				wds, _, err = utility.Words(utility.HTML(fileResult.Pages[p].Title), 0, false)
				if err != nil {
					return nil, err
				}
				titleWds = append(titleWds, wds...)
				titleWds = append(titleWds, ".")
			}
			wds, _, err = utility.Words(utility.HTML(string(fileResult.Pages[p].Body)), 0, false)
			if err != nil {
				return nil, err
			}
			bodyWds = append(bodyWds, wds...)
			bodyWds = append(bodyWds, ".")
		}
		fileResult.Excerpt = excerpt.Excerpt(titleWds, bodyWds)
	}

	return fileResult, nil
}

/* TODO add sanitisation for body & title HTML
var titlePolicy, bodyPolicy *bluemonday.Policy

func init() {
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
