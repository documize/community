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
