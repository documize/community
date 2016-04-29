package apidocumizecom

import (
	"crypto/tls"
	"errors"
	"net/http"

	"github.com/documize/community/wordsmith/environment"
)

var endPoint = "https://api.documize.com"

var token string

func init() {
	environment.GetString(&endPoint, "endpoint", false, "Documize end-point", nil)
	environment.GetString(&token, "token", false, "Documize token", nil)
}

var transport = &http.Transport{
	TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, // TODO should be from -insecure flag
}

// CheckToken tests if the supplied token is valid.
func CheckToken() error {
	if token == "" {
		return errors.New("Documize token is empty")
	}
	// TODO validate against endPoint site
	return nil
}
