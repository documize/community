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

package github

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strings"

	"github.com/documize/community/core/api/request"

	gogithub "github.com/google/go-github/github"
	"golang.org/x/oauth2"
)

func clientID() string {
	return request.ConfigString(meta.ConfigHandle(), "clientID")
}

func clientSecret() string {
	return request.ConfigString(meta.ConfigHandle(), "clientSecret")
}

func authorizationCallbackURL() string {
	// NOTE: URL value must have the path and query "/api/public/validate?section=github"
	return request.ConfigString(meta.ConfigHandle(), "authorizationCallbackURL")
}

func validateToken(ptoken string) error {
	// Github authorization check
	authClient := gogithub.NewClient((&gogithub.BasicAuthTransport{
		Username: clientID(),
		Password: clientSecret(),
	}).Client())
	_, _, err := authClient.Authorizations.Check(clientID(), ptoken)
	return err
}

func (*Provider) githubClient(config *githubConfig) *gogithub.Client {
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: config.Token},
	)
	tc := oauth2.NewClient(oauth2.NoContext, ts)

	return gogithub.NewClient(tc)
}

// Callback is called by a browser redirect from Github, via the validation endpoint
func Callback(res http.ResponseWriter, req *http.Request) error {

	code := req.URL.Query().Get("code")
	state := req.URL.Query().Get("state")

	ghurl := "https://github.com/login/oauth/access_token"
	vals := "client_id=" + clientID()
	vals += "&client_secret=" + clientSecret()
	vals += "&code=" + code
	vals += "&state=" + state

	req2, err := http.NewRequest("POST", ghurl+"?"+vals, strings.NewReader(vals))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req2.Header.Set("Accept", "application/json")

	res2, err := http.DefaultClient.Do(req2)
	if err != nil {
		return err
	}

	var gt githubCallbackT

	err = json.NewDecoder(res2.Body).Decode(&gt)
	if err != nil {
		return err
	}

	err = res2.Body.Close()
	if err != nil {
		return err
	}

	returl, err := url.QueryUnescape(state)
	if err != nil {
		return err
	}

	up, err := url.Parse(returl)
	if err != nil {
		return err
	}

	target := up.Scheme + "://" + up.Host + up.Path + "?mode=edit&code=" + gt.AccessToken

	http.Redirect(res, req, target, http.StatusTemporaryRedirect)

	return nil
}
