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

// Package setting manages both global and user level settings
package setting

import "encoding/xml"

type licenseXML struct {
	XMLName   xml.Name `xml:"DocumizeLicense"`
	Key       string
	Signature string
}

type licenseJSON struct {
	Key       string `json:"key"`
	Signature string `json:"signature"`
}

type authData struct {
	AuthProvider string `json:"authProvider"`
	AuthConfig   string `json:"authConfig"`
}

/*
<DocumizeLicense>
  <Key>some key</Key>
  <Signature>some signature</Signature>
</DocumizeLicense>
*/
