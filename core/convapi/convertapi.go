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

// Package convapi provides the definitions of types used for file conversion communication between different components of the Documize system.
package convapi

// DocumentConversionRequest is what is passed to a Convert plugin.
type DocumentConversionRequest struct {
	Filename         string
	Filedata         []byte
	PageBreakLevel   uint
	LicenseKey       []byte
	LicenseSignature []byte
	ServiceEndpoint  string
}

// Page holds the contents of a Documize page,
// which is a Body of html with a Title and a Level,
type Page struct {
	Level uint64 // overall document is level 1, <H1> => level 2
	Title string
	Body  []byte
}

// EmbeddedFile holds the contents of an embedded file.
type EmbeddedFile struct {
	ID, Type, Name string // name must have the same extension as the type e.g. Type="txt" Name="foo.txt"
	Data           []byte
}

// DocumentConversionResponse is the response from a Convert plugin.
type DocumentConversionResponse struct {
	Err           string
	PagesHTML     []byte // If empty, use Pages
	Pages         []Page
	EmbeddedFiles []EmbeddedFile
	Excerpt       string
}
