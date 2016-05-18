package apidocumizecom

import (
	"crypto/tls"
	"errors"
	"net/http"

	"github.com/documize/community/documize/api/request"
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
