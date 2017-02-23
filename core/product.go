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

package core

import "fmt"
import "time"

// ProdInfo describes a product
type ProdInfo struct {
	Edition string
	Title   string
	Version string
	Major   string
	Minor   string
	Patch   string
	License License
}

// Product returns product edition details
func Product() (p ProdInfo) {
	p.Major = "0"
	p.Minor = "42"
	p.Patch = "0"
	p.Version = fmt.Sprintf("%s.%s.%s", p.Major, p.Minor, p.Patch)
	p.Edition = "Community"
	p.Title = fmt.Sprintf("%s Edition", p.Edition)
	p.License = License{}

	return
}

// License holds details of product license.
type License struct {
	Name    string    `json:"name"`
	Email   string    `json:"email"`
	Edition string    `json:"edition"`
	Start   time.Time `json:"start"`
	End     time.Time `json:"end"`
	Seats   int       `json:"seats"`
	Trial   bool      `json:"trial"`
}

// IsEmpty determines if we have a license.
func (l *License) IsEmpty() bool {
	return l.Seats == 0 && len(l.Name) == 0 && len(l.Email) == 0 && l.Start.Year() == 1 && l.End.Year() == 1
}

// IsValid determines if we have populated and valid license.
// An empty license is valid.
func (l *License) IsValid() bool {
	if l.IsEmpty() {
		return true
	}

	now := time.Now().UTC()
	return l.End.Day() <= now.Day() && l.End.Month() <= now.Month() && l.End.Year() <= now.Year()
}

// Status returns formatted message stating if license is empty/populated and invalid/valid.
func (l *License) Status() string {
	lp := "populated"
	if l.IsEmpty() {
		lp = "empty"
	}
	lv := "invalid"
	if l.IsValid() {
		lv = "valid"
	}

	return fmt.Sprintf("License is %s and %s", lp, lv)
}

// LicenseData holds encrypted data and is unpacked into License.
type LicenseData struct {
	Key       string `json:"key"`
	Signature string `json:"signature"`
}
