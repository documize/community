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

package html

import (
	"bytes"
	"fmt"
	"strings"

	"context"
	api "github.com/documize/community/core/convapi"
	"github.com/documize/community/core/stringutil"
	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
)

const maxTitle = 2000   // NOTE: must be the same length as database page.title
const maxBody = 4000000 // NOTE: must be less than the mysql max_allowed_packet limit, amongst other values

type htmlToSplit struct {
	CFR       *api.DocumentConversionResponse
	thisSect  api.Page
	nodeCache map[*html.Node]bool
}

// Convert provides the standard interface for conversion of an HTML document.
// All the function does is return a pointer to api.DocumentConversionResponse with
// PagesHTML set to the given (*api.DocumentConversionRequest).Filedata - so effectively a no-op.
func Convert(ctx context.Context, in interface{}) (interface{}, error) {
	return &api.DocumentConversionResponse{
		PagesHTML: in.(*api.DocumentConversionRequest).Filedata}, nil
}

// SplitIfHTML splits HTML code into pages, if it exists.
func SplitIfHTML(req *api.DocumentConversionRequest, res *api.DocumentConversionResponse) error {
	if len(res.PagesHTML) == 0 {
		return nil
	}
	hd := &htmlToSplit{CFR: res, nodeCache: make(map[*html.Node]bool)}
	err := hd.testableSplit(req, res)
	/*
		for k, v := range hd.CFR.Pages {
			fmt.Printf("DEBUG hd.CFR.Pages[%d] = Level: %d Title: %s len(Body)=%d\n",
				k, v.Level, v.Title, len(v.Body))
		}
	*/
	return err
}

// testableSplit, NOTE pointer receiver so that test code can inspect generated datastructures.
func (h *htmlToSplit) testableSplit(request *api.DocumentConversionRequest,
	response *api.DocumentConversionResponse) error {
	doc, err := html.Parse(bytes.NewReader(response.PagesHTML))
	if err != nil {
		return err
	}
	if doc.Type != html.DocumentNode {
		return fmt.Errorf("no HTML document node")
	}
	for htm := doc.FirstChild; htm != nil; htm = htm.NextSibling {
		if htm.Type == html.ElementNode && htm.DataAtom == atom.Html {
			for bdy := htm.FirstChild; bdy != nil; bdy = bdy.NextSibling {
				if bdy.Type == html.ElementNode && bdy.DataAtom == atom.Body {
					h.thisSect = api.Page{
						Level: 1,
						Title: stringutil.BeautifyFilename(request.Filename),
						Body:  []byte(``)}
					err := h.processChildren(bdy)
					if err != nil {
						h.CFR.Err = err.Error()
					}
					h.CFR.Pages = append(h.CFR.Pages, h.thisSect)
				}
			}
		}
	}
	return nil
}

func getLevel(at atom.Atom) uint64 {
	level := uint64(1)
	switch at {
	case atom.H6:
		level++
		fallthrough
	case atom.H5:
		level++
		fallthrough
	case atom.H4:
		level++
		fallthrough
	case atom.H3:
		level++
		fallthrough
	case atom.H2:
		level++
		fallthrough
	case atom.H1:
		level++
	}
	return level
}

func (h *htmlToSplit) processChildren(bdy *html.Node) error {
	for c := bdy.FirstChild; c != nil; c = c.NextSibling {
		var err error
		if c.Type == html.ElementNode {
			if level := getLevel(c.DataAtom); level > 1 {
				err = h.renderHeading(c, level)
			} else {
				err = h.renderNonHeading(c)
			}
		} else {
			err = h.renderAppend(c)
		}
		if err != nil {
			return err
		}
	}
	return nil
}

func stripZeroWidthSpaces(str string) string {
	ret := ""
	for _, r := range str {
		if r != 0x200B { // zero width space
			ret += string(r) // stripped of zero-width spaces
		}
	}
	return ret
}

func (h *htmlToSplit) renderHeading(c *html.Node, level uint64) error {
	byt, err := byteRenderChildren(c) // get heading html
	if err != nil {
		return err
	}
	str, err := stringutil.HTML(string(byt)).Text(false) // heading text
	if err != nil {
		return err
	}
	str = stripZeroWidthSpaces(str)
	if strings.TrimSpace(str) != "" { // only put in non-empty headings
		h.newSect(str, level)
	}
	return nil
}

func (h *htmlToSplit) newSect(tstr string, level uint64) {
	h.CFR.Pages = append(h.CFR.Pages, h.thisSect)
	title := tstr //was: utility.EscapeHTMLcomplexChars(tstr) -- removed to avoid double-escaping
	body := ``
	if len(title) > maxTitle {
		body = title[maxTitle:]
		title = title[:maxTitle]
	}
	h.thisSect = api.Page{
		Level: level,
		Title: title,
		Body:  []byte(body)}
}

func (h *htmlToSplit) renderNonHeading(c *html.Node) error {
	if h.nodeContainsHeading(c) { // ignore this atom in order to get at the contents
		err := h.processChildren(c)
		if err != nil {
			return err
		}
	} else {
		if err := h.renderAppend(c); err != nil {
			return err
		}
	}
	return nil
}

func (h *htmlToSplit) renderAppend(c *html.Node) error {
	byt, err := byteRender(c)
	if err != nil {
		return err
	}
	ebyt := stringutil.EscapeHTMLcomplexCharsByte(byt)
	if len(ebyt) > maxBody {
		msg := fmt.Sprintf("(Documize warning: HTML render element ignored, size of %d exceeded maxBody of %d.)", len(ebyt), maxBody)
		ebyt = []byte("<p><b>" + msg + "</b></p>")
	}
	if len(h.thisSect.Body)+len(ebyt) > maxBody {
		h.newSect("-", h.thisSect.Level+1) // plus one so that the new "-" one is part of the previous
	}
	h.thisSect.Body = append(h.thisSect.Body, ebyt...)
	return nil
}

func byteRender(n *html.Node) ([]byte, error) {
	var b bytes.Buffer
	err := html.Render(&b, n)
	return b.Bytes(), err
}

func byteRenderChildren(n *html.Node) ([]byte, error) {
	var b bytes.Buffer
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		err := html.Render(&b, c)
		if err != nil {
			return nil, err
		}
	}
	return b.Bytes(), nil
}

func (h *htmlToSplit) nodeContainsHeading(n *html.Node) bool {
	val, ok := h.nodeCache[n]
	if ok {
		return val
	}
	switch n.DataAtom {
	case atom.H6, atom.H5, atom.H4, atom.H3, atom.H2, atom.H1:
		h.nodeCache[n] = true
		return true
	default:
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			if h.nodeContainsHeading(c) {
				h.nodeCache[n] = true
				h.nodeCache[c] = true
				return true
			}
		}
	}
	h.nodeCache[n] = false
	return false
}
