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

package convapi

// ConversionJobRequest is the information used to set-up a conversion job.
type ConversionJobRequest struct {
	Job              string
	IndexDepth       uint
	OrgID            string
	LicenseKey       []byte
	LicenseSignature []byte
	ServiceEndpoint  string
}

// DocumentExport is the type used by a document export plugin.
type DocumentExport struct {
	Filename string
	Format   string
	File     []byte
}
