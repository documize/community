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

// ProdInfo describes a product
type ProdInfo struct {
	Edition string
	Title   string
	Version string
	Major   string
	Minor   string
	Patch   string
}

// Product returns product edition details
func Product() (p ProdInfo) {
	p.Major = "0"
	p.Minor = "34"
	p.Patch = "0"
	p.Version = fmt.Sprintf("%s.%s.%s", p.Major, p.Minor, p.Patch)
	p.Edition = "Community"
	p.Title = fmt.Sprintf("%s Edition", p.Edition)

	return p
}
