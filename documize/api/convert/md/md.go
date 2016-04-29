package md

import (
	"github.com/documize/community/wordsmith/api"

	"github.com/documize/blackfriday"

	"golang.org/x/net/context"
)

// Convert provides the standard interface for conversion of a Markdown document.
// All the function does is return a pointer to api.DocumentConversionResponse with
// PagesHTML set to the given (*api.DocumentConversionRequest).Filedata converted by the blackfriday lib.
func Convert(ctx context.Context, in interface{}) (interface{}, error) {
	return &api.DocumentConversionResponse{
		PagesHTML: blackfriday.MarkdownCommon(in.(*api.DocumentConversionRequest).Filedata)}, nil
}
