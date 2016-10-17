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

package apidocumizecom

import (
	"crypto/tls"
	"errors"
	"net/http"

	"github.com/documize/community/core/api/request"
)

func endPoint() string {
	r := request.ConfigString("LICENSE", "endpoint")
	if r != "" {
		return r
	}
	return "https://api.documize.com"
}

func token() (string, error) {
	r := request.ConfigString("LICENSE", "token")
	if r == "" {
		return "", errors.New("Documize token is empty")
	}
	// TODO more validation here
	return r, nil
}

var transport = &http.Transport{
	TLSClientConfig: &tls.Config{
		InsecureSkipVerify: true, // TODO should be glick.InsecureSkipVerifyTLS (from -insecure flag) but get error: x509: certificate signed by unknown authority
	}}

// CheckToken returns an error if the Documize LICENSE token is invalid.
func CheckToken() error {
	_, err := token()
	return err
}
