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

package template

import "time"

// Template is used to create a new document.
// Template can consist of content, attachments and
// have associated meta data indentifying author, version
// contact details and more.
type Template struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Author      string    `json:"author"`
	Type        Type      `json:"type"`
	Dated       time.Time `json:"dated"`
}

// Type determines who can see a template.
type Type int

const (
	// TypePublic means anyone can see the template.
	TypePublic Type = 1
	// TypePrivate means only the owner can see the template.
	TypePrivate Type = 2
	// TypeRestricted means selected users can see the template.
	TypeRestricted Type = 3
)

// IsPublic means anyone can see the template.
func (t *Template) IsPublic() bool {
	return t.Type == TypePublic
}

// IsPrivate means only the owner can see the template.
func (t *Template) IsPrivate() bool {
	return t.Type == TypePrivate
}

// IsRestricted means selected users can see the template.
func (t *Template) IsRestricted() bool {
	return t.Type == TypeRestricted
}
